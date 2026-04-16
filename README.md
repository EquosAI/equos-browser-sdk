# @equos/browser-sdk

[Equos.ai](https://www.equos.ai) official Browser SDK for real-time conversations with Equos AI agents.

Wraps [livekit-client](https://www.npmjs.com/package/livekit-client) into a simple, typed, event-driven API.

## Prerequisites

- Go to [Equos Studio](https://studio.equos.ai).
- Create an organization.
- Create a Character.

## Installation

```bash
npm install @equos/browser-sdk
```

## Quick Start

```typescript
import { EquosConversation, EquosEvent, EquosMode } from '@equos/browser-sdk';

// Create a conversation (wsUrl and token come from your backend via @equos/node-sdk)
const conversation = new EquosConversation({
  config: {
    wsUrl: 'wss://your-livekit-server.example.com',
    token: 'your-consumer-access-token',
    agentIdentity: 'character-livekit-identity', // optional, filters tracks to this participant
  },
});

// Attach a video element to render the agent's audio + video
const videoEl = document.querySelector('video');
conversation.attach(videoEl);

// Listen to events
conversation.on(EquosEvent.Utterance, (msg) => {
  console.log(`${msg.utterance.author}: ${msg.utterance.content}`);
});

conversation.on(EquosEvent.AgentConnected, () => {
  console.log('Agent joined the room');
});

// Connect
await conversation.connect();

// Send a text message to the agent
conversation.sendText('Hello!');

// Disconnect when done
await conversation.disconnect();
```

## Obtaining Connection Credentials

> **WARNING:** `@equos/node-sdk` must only be used server-side (Node.js backend, API route, serverless function). Never expose your API key in client-side code — it would allow anyone to create conversations and consume credits on your behalf.

Use `@equos/node-sdk` on your backend to create a conversation, then pass the connection credentials to the browser:

```typescript
import { EquosClient } from '@equos/node-sdk';

const client = EquosClient.create('your-api-key', {
  endpoint: 'https://api.equos.ai',
});

const response = await client.conversations.startConversation({
  createEquosConversationRequest: {
    name: 'my-conversation',
    characterId: 'your-character-id',
    consumer: {
      name: 'User',
      identity: 'user-1',
    },
  },
});

// Pass these to the browser SDK
const { serverUrl, character } = response.conversation;
const { consumerAccessToken } = response;
const agentIdentity = character.livekitIdentity;
```

## API

### `new EquosConversation(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `config.wsUrl` | `string` | *required* | LiveKit WebSocket endpoint |
| `config.token` | `string` | *required* | Room access token |
| `config.agentIdentity` | `string?` | `undefined` | Agent participant identity (if omitted, all remote participants are treated as agents) |
| `autoPublishMic` | `boolean` | `true` | Automatically enable microphone on connect |
| `mode` | `EquosMode` | `'video'` | Initial conversation mode |

### Methods

| Method | Description |
|--------|-------------|
| `connect()` | Connect to the LiveKit room |
| `disconnect()` | Disconnect and clean up |
| `sendText(text)` | Send a text message to the agent |
| `sendContext(content)` | Inject context into the agent's prompt |
| `setMode(mode)` | Switch conversation mode (`'text'`, `'audio'`, `'video'`) |
| `setMicrophoneEnabled(enabled)` | Toggle microphone |
| `setCameraEnabled(enabled)` | Toggle camera |
| `setScreenShareEnabled(enabled)` | Toggle screen sharing |
| `attach(element)` | Attach agent tracks to a `<video>` element |
| `detach(element)` | Detach agent tracks from an element |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `EquosConnectionState` | Current connection state |
| `mode` | `EquosMode` | Current conversation mode |

### Events

Listen to events with `conversation.on(event, callback)` and remove with `conversation.off(event, callback)`.

| Event | Payload | Description |
|-------|---------|-------------|
| `EquosEvent.Utterance` | `{ utterance: { author, content, recordedAt } }` | Transcript entry from agent or user |
| `EquosEvent.Interrupt` | `{}` | Agent was interrupted |
| `EquosEvent.ExpireSoon` | `{ seconds_remaining }` | Session is about to expire |
| `EquosEvent.Error` | `{ code }` | Agent error |
| `EquosEvent.ConnectionStateChanged` | `state` | Connection state changed |
| `EquosEvent.AgentConnected` | - | Agent joined the room |
| `EquosEvent.AgentDisconnected` | - | Agent left the room |
| `EquosEvent.ModeChanged` | `mode` | Conversation mode changed |
| `EquosEvent.DataReceived` | `message` | Raw catch-all for any data message |

### Conversation Modes

| Mode | Audio | Video | Description |
|------|-------|-------|-------------|
| `EquosMode.Text` | - | - | Text only, no media playback |
| `EquosMode.Audio` | Yes | - | Audio only |
| `EquosMode.Video` | Yes | Yes | Full audio + video (default) |

```typescript
// Start in text mode
const conversation = new EquosConversation({
  config: { wsUrl, token },
  mode: EquosMode.Text,
});

// Switch to video during conversation
conversation.setMode(EquosMode.Video);
```

## Equos SDKs

| SDK | Platform | Package |
|-----|----------|---------|
| **@equos/browser-sdk** | Browser (vanilla JS/TS) | [npm](https://www.npmjs.com/package/@equos/browser-sdk) |
| **@equos/react** | Browser (React) | [npm](https://www.npmjs.com/package/@equos/react) |
| **@equos/node-sdk** | Node.js (server-side only) | [npm](https://www.npmjs.com/package/@equos/node-sdk) |
| **equos** | Python (server-side only) | [PyPI](https://pypi.org/project/equos/) |

## Reach Us

- Equos Slack Community: [Join Equos Community Slack](https://join.slack.com/t/equosaicommunity/shared_invite/zt-3d8oy19au-jZpsJB0i~gdL0jbDswdzzQ)
- Support: [Support Form](https://docs.google.com/forms/d/e/1FAIpQLSdoK7LvORdQf7KOQKvhhlESStJcKc3bDB9HPsEet6LuOmVUfQ/viewform)

## Documentation

- Official Documentation: [https://docs.equos.ai](https://docs.equos.ai)
- Equos NodeJS Examples: [https://github.com/EquosAI/equos-examples/tree/main/examples/equos-nextjs-integration](https://github.com/EquosAI/equos-examples/tree/main/examples/equos-nextjs-integration)
- Equos React Examples: [https://github.com/EquosAI/equos-examples/blob/main/examples/equos-react-integration/README.md](https://github.com/EquosAI/equos-examples/blob/main/examples/equos-react-integration/README.md)

## Authors

- [Loïc Combis](https://www.linkedin.com/in/lo%C3%AFc-combis-a211a813a/)
