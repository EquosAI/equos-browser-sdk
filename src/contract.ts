// -------------------------------------------------------
// Internal: LiveKit data channel protocol constants
// -------------------------------------------------------

export const EquosDataTopic = 'equos_event' as const;

/** Message types sent FROM the SDK TO the agent (inbound to agent). */
export const EquosInboundMessageType = {
  Context: 'context',
  UsrText: 'usr.txt',
} as const;

/** Message types sent FROM the agent TO the SDK (outbound from agent). */
export const EquosOutboundMessageType = {
  Interrupt: 'interrupt',
  Utterance: 'utterance',
  ExpireSoon: 'expire_soon',
  Error: 'error',
} as const;

// -------------------------------------------------------
// External: SDK events available to consumers
// -------------------------------------------------------

/** Events emitted by EquosConversation. */
export const EquosEvent = {
  Utterance: 'utterance',
  Interrupt: 'interrupt',
  ExpireSoon: 'expire_soon',
  Error: 'error',
  ConnectionStateChanged: 'connectionStateChanged',
  AgentConnected: 'agentConnected',
  AgentDisconnected: 'agentDisconnected',
  ModeChanged: 'modeChanged',
  DataReceived: 'dataReceived',
} as const;

/** Conversation modes controlling which agent media is played. */
export const EquosMode = {
  Text: 'text',
  Audio: 'audio',
  Video: 'video',
} as const;

/** Connection states exposed by the SDK. */
export const EquosConnectionState = {
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  Connected: 'connected',
  Reconnecting: 'reconnecting',
} as const;
