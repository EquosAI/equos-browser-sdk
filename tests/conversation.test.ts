import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EquosConversation } from '../src/conversation';
import type {
  EquosConversationOptions,
  EquosUtteranceMessage,
  EquosInterruptMessage,
  EquosExpireSoonMessage,
  EquosErrorMessage,
  EquosConnectionState,
} from '../src/types';

// --- Mock livekit-client ---

type EventCallback = (...args: unknown[]) => void;

const {
  mockPublishData,
  mockSetMicrophoneEnabled,
  mockSetCameraEnabled,
  mockSetScreenShareEnabled,
  mockConnect,
  mockDisconnect,
  mockRemoteParticipants,
  roomEventHandlersRef,
} = vi.hoisted(() => {
  const roomEventHandlersRef: { current: Map<string, EventCallback[]> } = {
    current: new Map(),
  };
  return {
    mockPublishData: vi.fn(),
    mockSetMicrophoneEnabled: vi.fn().mockResolvedValue(undefined),
    mockSetCameraEnabled: vi.fn().mockResolvedValue(undefined),
    mockSetScreenShareEnabled: vi.fn().mockResolvedValue(undefined),
    mockConnect: vi.fn().mockResolvedValue(undefined),
    mockDisconnect: vi.fn().mockResolvedValue(undefined),
    mockRemoteParticipants: new Map(),
    roomEventHandlersRef,
  };
});

vi.mock('livekit-client', () => ({
  Room: vi.fn().mockImplementation(() => {
    roomEventHandlersRef.current = new Map();
    return {
      connect: mockConnect,
      disconnect: mockDisconnect,
      localParticipant: {
        publishData: mockPublishData,
        setMicrophoneEnabled: mockSetMicrophoneEnabled,
        setCameraEnabled: mockSetCameraEnabled,
        setScreenShareEnabled: mockSetScreenShareEnabled,
      },
      remoteParticipants: mockRemoteParticipants,
      on: vi.fn((event: string, callback: EventCallback) => {
        if (!roomEventHandlersRef.current.has(event)) {
          roomEventHandlersRef.current.set(event, []);
        }
        roomEventHandlersRef.current.get(event)!.push(callback);
      }),
    };
  }),
  RoomEvent: {
    DataReceived: 'dataReceived',
    ConnectionStateChanged: 'connectionStateChanged',
    ParticipantConnected: 'participantConnected',
    ParticipantDisconnected: 'participantDisconnected',
    TrackSubscribed: 'trackSubscribed',
    TrackUnsubscribed: 'trackUnsubscribed',
  },
  ConnectionState: {
    Connected: 'connected',
    Disconnected: 'disconnected',
    Reconnecting: 'reconnecting',
    Connecting: 'connecting',
  },
}));

// --- Helpers ---

const encoder = new TextEncoder();

function fireRoomEvent(event: string, ...args: unknown[]) {
  const handlers = roomEventHandlersRef.current.get(event) ?? [];
  for (const handler of handlers) {
    handler(...args);
  }
}

function makePayload(msg: Record<string, unknown>): Uint8Array {
  return encoder.encode(JSON.stringify(msg));
}

function defaultOptions(): EquosConversationOptions {
  return {
    config: {
      wsUrl: 'wss://lk.example.com',
      token: 'test-token',
      agentIdentity: 'agent-001',
    },
    autoPublishMic: false,
  };
}

async function createConnected(): Promise<EquosConversation> {
  const conv = new EquosConversation(defaultOptions());
  await conv.connect();
  return conv;
}

// --- Tests ---

describe('EquosConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoteParticipants.clear();
  });

  // -- Connection state --

  describe('connection lifecycle', () => {
    it('should start in disconnected state', () => {
      const conv = new EquosConversation(defaultOptions());
      expect(conv.state).toBe('disconnected');
    });

    it('should transition to connected after connect()', async () => {
      const states: EquosConnectionState[] = [];
      const conv = new EquosConversation(defaultOptions());
      conv.on('connectionStateChanged', (s) => states.push(s));

      await conv.connect();

      expect(conv.state).toBe('connected');
      expect(states).toEqual(['connecting', 'connected']);
    });

    it('should transition to disconnected after disconnect()', async () => {
      const conv = await createConnected();
      const states: EquosConnectionState[] = [];
      conv.on('connectionStateChanged', (s) => states.push(s));

      await conv.disconnect();

      expect(conv.state).toBe('disconnected');
      expect(states).toEqual(['disconnected']);
    });

    it('should throw if connect() called while not disconnected', async () => {
      const conv = await createConnected();
      await expect(conv.connect()).rejects.toThrow('Cannot connect');
    });

    it('should reset state if connect() fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('fail'));
      const conv = new EquosConversation(defaultOptions());

      await expect(conv.connect()).rejects.toThrow('fail');
      expect(conv.state).toBe('disconnected');
    });

    it('should enable mic by default on connect', async () => {
      const conv = new EquosConversation({
        config: {
          wsUrl: 'wss://lk.example.com',
          token: 'test-token',
        },
      });
      await conv.connect();
      expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(true);
    });

    it('should not enable mic when autoPublishMic is false', async () => {
      await createConnected();
      expect(mockSetMicrophoneEnabled).not.toHaveBeenCalled();
    });
  });

  // -- Event routing --

  describe('event routing', () => {
    it('should emit utterance events', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('utterance', handler);

      const msg: EquosUtteranceMessage = {
        type: 'utterance',
        utterance: {
          author: 'agent',
          content: 'Hello!',
          recordedAt: '2024-01-01T00:00:00Z',
        },
      };

      fireRoomEvent(
        'dataReceived',
        makePayload(msg),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(msg);
    });

    it('should emit interrupt events', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('interrupt', handler);

      const msg: EquosInterruptMessage = { type: 'interrupt' };
      fireRoomEvent(
        'dataReceived',
        makePayload(msg),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(msg);
    });

    it('should emit expire_soon events', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('expire_soon', handler);

      const msg: EquosExpireSoonMessage = {
        type: 'expire_soon',
        seconds_remaining: 30,
      };
      fireRoomEvent(
        'dataReceived',
        makePayload(msg),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(msg);
    });

    it('should emit error events', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('error', handler);

      const msg: EquosErrorMessage = { type: 'error', code: 'TIMEOUT' };
      fireRoomEvent(
        'dataReceived',
        makePayload(msg),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(msg);
    });

    it('should emit dataReceived for all message types', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('dataReceived', handler);

      const msg = {
        type: 'utterance',
        utterance: { author: 'user', content: 'Hi', recordedAt: '' },
      };
      fireRoomEvent(
        'dataReceived',
        makePayload(msg),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).toHaveBeenCalledOnce();
    });

    it('should not emit for unknown message types', async () => {
      const conv = await createConnected();
      const utteranceHandler = vi.fn();
      const dataHandler = vi.fn();
      conv.on('utterance', utteranceHandler);
      conv.on('dataReceived', dataHandler);

      fireRoomEvent(
        'dataReceived',
        makePayload({ type: 'unknown_type' }),
        undefined,
        undefined,
        'equos_event',
      );

      expect(utteranceHandler).not.toHaveBeenCalled();
      expect(dataHandler).toHaveBeenCalledOnce();
    });

    it('should ignore messages with wrong topic', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('dataReceived', handler);

      fireRoomEvent(
        'dataReceived',
        makePayload({ type: 'interrupt' }),
        undefined,
        undefined,
        'other_topic',
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it('should ignore malformed JSON', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('dataReceived', handler);

      fireRoomEvent(
        'dataReceived',
        encoder.encode('not json{'),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // -- Agent presence --

  describe('agent presence', () => {
    it('should emit agentConnected when agent joins', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('agentConnected', handler);

      fireRoomEvent('participantConnected', { identity: 'agent-001' });

      expect(handler).toHaveBeenCalledOnce();
    });

    it('should emit agentDisconnected when agent leaves', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('agentDisconnected', handler);

      fireRoomEvent('participantDisconnected', { identity: 'agent-001' });

      expect(handler).toHaveBeenCalledOnce();
    });

    it('should not emit agentConnected for non-agent participants', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('agentConnected', handler);

      fireRoomEvent('participantConnected', { identity: 'user-123' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should treat all participants as agents when agentIdentity is not set', async () => {
      const conv = new EquosConversation({
        config: { wsUrl: 'wss://lk.example.com', token: 'test-token' },
        autoPublishMic: false,
      });
      const handler = vi.fn();
      conv.on('agentConnected', handler);
      await conv.connect();

      fireRoomEvent('participantConnected', { identity: 'any-identity' });

      expect(handler).toHaveBeenCalledOnce();
    });

    it('should attach tracks from any participant when agentIdentity is not set', async () => {
      const conv = new EquosConversation({
        config: { wsUrl: 'wss://lk.example.com', token: 'test-token' },
        autoPublishMic: false,
      });
      await conv.connect();
      const videoEl = document.createElement('video') as HTMLVideoElement;
      conv.attach(videoEl);

      const mockTrack = { attach: vi.fn(), detach: vi.fn() };
      fireRoomEvent('trackSubscribed', mockTrack, {}, { identity: 'whoever' });

      expect(mockTrack.attach).toHaveBeenCalledWith(videoEl);
    });

    it('should detect agent already in room on connect', async () => {
      mockRemoteParticipants.set('agent-001', {
        identity: 'agent-001',
        trackPublications: new Map(),
      });

      const handler = vi.fn();
      const conv = new EquosConversation(defaultOptions());
      conv.on('agentConnected', handler);
      await conv.connect();

      expect(handler).toHaveBeenCalledOnce();
    });
  });

  // -- Send methods --

  describe('send methods', () => {
    it('should send text messages', async () => {
      const conv = await createConnected();
      conv.sendText('Hello agent');

      expect(mockPublishData).toHaveBeenCalledOnce();
      const [payload, opts] = mockPublishData.mock.calls[0];
      expect(JSON.parse(new TextDecoder().decode(payload))).toEqual({
        type: 'usr.txt',
        text: 'Hello agent',
      });
      expect(opts).toEqual({ reliable: true, topic: 'equos_event' });
    });

    it('should send context messages', async () => {
      const conv = await createConnected();
      conv.sendContext('You are a helpful agent');

      expect(mockPublishData).toHaveBeenCalledOnce();
      const [payload, opts] = mockPublishData.mock.calls[0];
      expect(JSON.parse(new TextDecoder().decode(payload))).toEqual({
        type: 'context',
        content: 'You are a helpful agent',
      });
      expect(opts).toEqual({ reliable: true, topic: 'equos_event' });
    });

    it('should throw when sending while disconnected', () => {
      const conv = new EquosConversation(defaultOptions());
      expect(() => conv.sendText('Hi')).toThrow('Not connected');
      expect(() => conv.sendContext('ctx')).toThrow('Not connected');
    });
  });

  // -- Media controls --

  describe('media controls', () => {
    it('should delegate setMicrophoneEnabled', async () => {
      const conv = await createConnected();
      await conv.setMicrophoneEnabled(true);
      expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(true);
    });

    it('should delegate setCameraEnabled', async () => {
      const conv = await createConnected();
      await conv.setCameraEnabled(true);
      expect(mockSetCameraEnabled).toHaveBeenCalledWith(true);
    });

    it('should delegate setScreenShareEnabled', async () => {
      const conv = await createConnected();
      await conv.setScreenShareEnabled(true);
      expect(mockSetScreenShareEnabled).toHaveBeenCalledWith(true);
    });

    it('should throw when controlling media while disconnected', async () => {
      const conv = new EquosConversation(defaultOptions());
      await expect(conv.setMicrophoneEnabled(true)).rejects.toThrow(
        'Not connected',
      );
    });
  });

  // -- Event emitter (on/off) --

  describe('on/off', () => {
    it('should remove listener with off()', async () => {
      const conv = await createConnected();
      const handler = vi.fn();
      conv.on('interrupt', handler);
      conv.off('interrupt', handler);

      fireRoomEvent(
        'dataReceived',
        makePayload({ type: 'interrupt' }),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple listeners for the same event', async () => {
      const conv = await createConnected();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      conv.on('interrupt', handler1);
      conv.on('interrupt', handler2);

      fireRoomEvent(
        'dataReceived',
        makePayload({ type: 'interrupt' }),
        undefined,
        undefined,
        'equos_event',
      );

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('should return this for chaining', () => {
      const conv = new EquosConversation(defaultOptions());
      const result = conv.on('interrupt', () => {});
      expect(result).toBe(conv);
    });
  });

  // -- Track attachment --

  describe('track attachment', () => {
    it('should attach tracks when TrackSubscribed fires for agent', async () => {
      const conv = await createConnected();
      const videoEl = document.createElement('video') as HTMLVideoElement;
      conv.attach(videoEl);

      const mockTrack = {
        attach: vi.fn(),
        detach: vi.fn(),
      };

      fireRoomEvent(
        'trackSubscribed',
        mockTrack,
        {},
        { identity: 'agent-001' },
      );

      expect(mockTrack.attach).toHaveBeenCalledWith(videoEl);
    });

    it('should not attach tracks for non-agent participants', async () => {
      const conv = await createConnected();
      const videoEl = document.createElement('video') as HTMLVideoElement;
      conv.attach(videoEl);

      const mockTrack = {
        attach: vi.fn(),
        detach: vi.fn(),
      };

      fireRoomEvent(
        'trackSubscribed',
        mockTrack,
        {},
        { identity: 'user-123' },
      );

      expect(mockTrack.attach).not.toHaveBeenCalled();
    });

    it('should detach tracks when TrackUnsubscribed fires', async () => {
      const conv = await createConnected();
      const videoEl = document.createElement('video') as HTMLVideoElement;
      conv.attach(videoEl);

      const mockTrack = {
        attach: vi.fn(),
        detach: vi.fn(),
      };

      fireRoomEvent(
        'trackUnsubscribed',
        mockTrack,
        {},
        { identity: 'agent-001' },
      );

      expect(mockTrack.detach).toHaveBeenCalledWith(videoEl);
    });

    it('should stop attaching after detach()', async () => {
      const conv = await createConnected();
      const videoEl = document.createElement('video') as HTMLVideoElement;
      conv.attach(videoEl);
      conv.detach(videoEl);

      const mockTrack = {
        attach: vi.fn(),
        detach: vi.fn(),
      };

      fireRoomEvent(
        'trackSubscribed',
        mockTrack,
        {},
        { identity: 'agent-001' },
      );

      expect(mockTrack.attach).not.toHaveBeenCalled();
    });
  });
});
