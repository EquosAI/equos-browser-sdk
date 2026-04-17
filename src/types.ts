import type {
  EquosConnectionState as ConnectionStateObj,
  EquosEvent as EventObj,
  EquosInboundMessageType as InboundObj,
  EquosOutboundMessageType as OutboundObj,
} from './contract';

// --- Configuration ---

export interface EquosConversationConfig {
  /** LiveKit WebSocket endpoint (e.g. wss://lk.example.com) */
  wsUrl: string;
  /** Room access token */
  token: string;
  /** Identity of the agent participant (to filter tracks/events) */
  agentIdentity?: string;
}

export interface EquosConversationOptions {
  config: EquosConversationConfig;
  /** If true, automatically enable mic on connect. Default: true */
  autoPublishMic?: boolean;
}

// --- Inbound messages (SDK -> agent) ---

export interface EquosContextMessage {
  type: typeof InboundObj.Context;
  content: string;
}

export interface EquosUsrTextMessage {
  type: typeof InboundObj.UsrText;
  text: string;
}

export type EquosInboundMessage = EquosContextMessage | EquosUsrTextMessage;

// --- Outbound messages (agent -> SDK) ---

export interface EquosInterruptMessage {
  type: typeof OutboundObj.Interrupt;
}

export interface EquosUtterance {
  author: 'agent' | 'user';
  content: string;
  recordedAt: string;
}

export interface EquosUtteranceMessage {
  type: typeof OutboundObj.Utterance;
  utterance: EquosUtterance;
}

export interface EquosExpireSoonMessage {
  type: typeof OutboundObj.ExpireSoon;
  seconds_remaining: number;
}

export interface EquosErrorMessage {
  type: typeof OutboundObj.Error;
  code: string;
}

export type EquosOutboundMessage =
  | EquosInterruptMessage
  | EquosUtteranceMessage
  | EquosExpireSoonMessage
  | EquosErrorMessage;

// --- Connection state ---

export type EquosConnectionState =
  (typeof ConnectionStateObj)[keyof typeof ConnectionStateObj];

// --- Event map ---

export interface EquosEventMap {
  [EventObj.Utterance]: (msg: EquosUtteranceMessage) => void;
  [EventObj.Interrupt]: (msg: EquosInterruptMessage) => void;
  [EventObj.ExpireSoon]: (msg: EquosExpireSoonMessage) => void;
  [EventObj.Error]: (msg: EquosErrorMessage) => void;
  [EventObj.ConnectionStateChanged]: (state: EquosConnectionState) => void;
  [EventObj.AgentConnected]: () => void;
  [EventObj.AgentDisconnected]: () => void;
  [EventObj.DataReceived]: (msg: EquosOutboundMessage) => void;
}
