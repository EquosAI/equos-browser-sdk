import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  ConnectionState as LKConnectionState,
} from 'livekit-client';
import type {
  EquosConversationOptions,
  EquosConversationConfig,
  EquosEventMap,
  EquosConnectionState,
  EquosOutboundMessage,
} from './types';
import {
  EquosDataTopic,
  EquosInboundMessageType,
  EquosOutboundMessageType,
  EquosEvent,
  EquosConnectionState as ConnectionStates,
} from './contract';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class EquosConversation {
  private readonly config: EquosConversationConfig;
  private readonly autoPublishMic: boolean;
  private room: Room | null = null;
  private connectionState: EquosConnectionState = ConnectionStates.Disconnected;
  private attachedElements = new Set<HTMLMediaElement>();
  private listeners = new Map<
    keyof EquosEventMap,
    Set<(...args: unknown[]) => void>
  >();

  constructor(options: EquosConversationOptions) {
    this.config = options.config;
    this.autoPublishMic = options.autoPublishMic ?? true;
  }

  // --- Event emitter ---

  on<K extends keyof EquosEventMap>(
    event: K,
    listener: EquosEventMap[K],
  ): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof EquosEventMap>(
    event: K,
    listener: EquosEventMap[K],
  ): this {
    this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
    return this;
  }

  private emit<K extends keyof EquosEventMap>(
    event: K,
    ...args: Parameters<EquosEventMap[K]>
  ): void {
    console.log(`[equos] ${event}`, ...args);
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      listener(...args);
    }
  }

  // --- Connection ---

  get state(): EquosConnectionState {
    return this.connectionState;
  }

  async connect(): Promise<void> {
    if (this.connectionState !== ConnectionStates.Disconnected) {
      throw new Error(
        `Cannot connect: conversation is ${this.connectionState}`,
      );
    }

    this.setConnectionState(ConnectionStates.Connecting);

    const room = new Room();
    this.room = room;

    this.registerRoomHandlers(room);

    try {
      await room.connect(this.config.wsUrl, this.config.token);
    } catch (err) {
      this.room = null;
      this.setConnectionState(ConnectionStates.Disconnected);
      throw err;
    }

    this.setConnectionState(ConnectionStates.Connected);

    if (this.autoPublishMic) {
      await room.localParticipant.setMicrophoneEnabled(true);
    }

    // Check if agent is already in the room
    for (const [, participant] of room.remoteParticipants) {
      if (this.isAgent(participant)) {
        this.emit(EquosEvent.AgentConnected);
        this.attachAgentTracks(participant);
        break;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (!this.room) return;

    this.detachAllElements();
    await this.room.disconnect();
    this.room = null;
    this.setConnectionState(ConnectionStates.Disconnected);
  }

  // --- Send methods ---

  sendText(text: string): void {
    this.publishData({ type: EquosInboundMessageType.UsrText, text });
  }

  sendContext(content: string): void {
    this.publishData({ type: EquosInboundMessageType.Context, content });
  }

  // --- Media controls ---

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    this.requireRoom().localParticipant.setMicrophoneEnabled(enabled);
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    this.requireRoom().localParticipant.setCameraEnabled(enabled);
  }

  async setScreenShareEnabled(enabled: boolean): Promise<void> {
    this.requireRoom().localParticipant.setScreenShareEnabled(enabled);
  }

  // --- Track attachment ---

  attach(element: HTMLMediaElement): void {
    this.attachedElements.add(element);

    if (!this.room) return;

    for (const [, participant] of this.room.remoteParticipants) {
      if (this.isAgent(participant)) {
        this.attachAgentTracks(participant);
      }
    }
  }

  detach(element: HTMLMediaElement): void {
    this.attachedElements.delete(element);

    if (!this.room) return;

    for (const [, participant] of this.room.remoteParticipants) {
      if (this.isAgent(participant)) {
        for (const [, pub] of participant.trackPublications) {
          if (pub.track) {
            pub.track.detach(element);
          }
        }
      }
    }
  }

  // --- Internal ---

  private setConnectionState(state: EquosConnectionState): void {
    if (this.connectionState === state) return;
    this.connectionState = state;
    this.emit(EquosEvent.ConnectionStateChanged, state);
  }

  private requireRoom(): Room {
    if (!this.room) {
      throw new Error('Not connected');
    }
    return this.room;
  }

  private publishData(message: Record<string, unknown>): void {
    const room = this.requireRoom();
    const payload = encoder.encode(JSON.stringify(message));
    room.localParticipant.publishData(payload, {
      reliable: true,
      topic: EquosDataTopic,
    });
  }

  private isAgent(participant: RemoteParticipant): boolean {
    // When agentIdentity is not set, treat all remote participants as agents
    if (!this.config.agentIdentity) return true;
    return participant.identity === this.config.agentIdentity;
  }

  private attachAgentTracks(participant: RemoteParticipant): void {
    for (const [, pub] of participant.trackPublications) {
      if (pub.track) {
        for (const el of this.attachedElements) {
          pub.track.attach(el);
        }
      }
    }
  }

  private detachAllElements(): void {
    if (!this.room) return;

    for (const [, participant] of this.room.remoteParticipants) {
      if (this.isAgent(participant)) {
        for (const [, pub] of participant.trackPublications) {
          if (pub.track) {
            for (const el of this.attachedElements) {
              pub.track.detach(el);
            }
          }
        }
      }
    }
    this.attachedElements.clear();
  }

  private registerRoomHandlers(room: Room): void {
    room.on(
      RoomEvent.DataReceived,
      (
        payload: Uint8Array,
        participant?: RemoteParticipant,
        _kind?: unknown,
        topic?: string,
      ) => {
        if (topic !== EquosDataTopic) return;

        let msg: EquosOutboundMessage;
        try {
          msg = JSON.parse(decoder.decode(payload));
        } catch {
          return;
        }

        this.emit(EquosEvent.DataReceived, msg);

        switch (msg.type) {
          case EquosOutboundMessageType.Utterance:
            this.emit(EquosEvent.Utterance, msg);
            break;
          case EquosOutboundMessageType.Interrupt:
            this.emit(EquosEvent.Interrupt, msg);
            break;
          case EquosOutboundMessageType.ExpireSoon:
            this.emit(EquosEvent.ExpireSoon, msg);
            break;
          case EquosOutboundMessageType.Error:
            this.emit(EquosEvent.Error, msg);
            break;
        }
      },
    );

    room.on(
      RoomEvent.ConnectionStateChanged,
      (state: LKConnectionState) => {
        switch (state) {
          case LKConnectionState.Connected:
            this.setConnectionState(ConnectionStates.Connected);
            break;
          case LKConnectionState.Reconnecting:
            this.setConnectionState(ConnectionStates.Reconnecting);
            break;
          case LKConnectionState.Disconnected:
            this.room = null;
            this.setConnectionState(ConnectionStates.Disconnected);
            break;
        }
      },
    );

    room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        console.log(`[equos:lk] participantConnected`, participant.identity);
        if (this.isAgent(participant)) {
          this.emit(EquosEvent.AgentConnected);
        }
      },
    );

    room.on(
      RoomEvent.ParticipantDisconnected,
      (participant: RemoteParticipant) => {
        console.log(`[equos:lk] participantDisconnected`, participant.identity);
        if (this.isAgent(participant)) {
          this.emit(EquosEvent.AgentDisconnected);
        }
      },
    );

    room.on(
      RoomEvent.TrackSubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        console.log(
          `[equos:lk] trackSubscribed`,
          participant.identity,
          track.kind,
          track.source,
          `isAgent=${this.isAgent(participant)}`,
          `attachedElements=${this.attachedElements.size}`,
        );
        if (this.isAgent(participant)) {
          for (const el of this.attachedElements) {
            track.attach(el);
          }
        }
      },
    );

    room.on(
      RoomEvent.TrackUnsubscribed,
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        console.log(
          `[equos:lk] trackUnsubscribed`,
          participant.identity,
          track.kind,
        );
        if (this.isAgent(participant)) {
          for (const el of this.attachedElements) {
            track.detach(el);
          }
        }
      },
    );
  }
}
