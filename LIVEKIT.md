# LiveKit Room Protocol

This document describes how the LiveKit connector exchanges data and media with a LiveKit room, intended for building a browser-side wrapper around `livekit-client`.

## Participants

A room has up to three participant roles. Identities come from the `Conversation` object.

| Role | Identity field | Description |
|------|---------------|-------------|
| **Character** (local) | `conversation.character.livekitIdentity` | The avatar/agent. Publishes audio + video, sends outbound data messages. |
| **Consumer** (remote) | `conversation.consumerIdentity` | The end-user / browser client. Sends audio, camera, screen share, and inbound data messages. If set, the connector only subscribes to this participant's tracks. |
| **Remote Agent** (remote) | `conversation.remoteAgentIdentity` | Optional delegated agent. When present, audio is received via LiveKit data stream instead of room audio tracks. |

## Connection

```
serverUrl:  conversation.serverUrl
token:      conversation.characterAccessToken   (character)
            conversation.consumerAccessToken    (consumer)
            conversation.remoteAgentAccessToken (remote agent)
room name:  conversation.room
```

## Published Tracks (Character -> Room)

Track names follow the pattern `equos_character_{livekitIdentity}_{type}`.

| Track | Source | Codec | Details |
|-------|--------|-------|---------|
| `{base}_audio` | `SOURCE_MICROPHONE` | Opus (default) | 16 kHz, mono, 2 bytes/sample |
| `{base}_video` | `SOURCE_CAMERA` | H264 | 1920x1080, 25 FPS, max 8 Mbps, RGB24 buffer format |

Audio is sent in frames of **1280 bytes** (`1/25 * 16000 * 1 * 2`), one per video frame tick.
When no video is being generated, silence frames are sent and the last video frame is repeated.

## Subscribed Tracks (Room -> Character)

Subscriptions are filtered to `consumerIdentity` when set, otherwise all remote participants.

| Track kind | Source | Queue | Format |
|------------|--------|-------|--------|
| Audio | `SOURCE_MICROPHONE` | `usr_a_queue` | 16 kHz, mono, raw PCM bytes |
| Video (camera) | `SOURCE_CAMERA` | `usr_c_queue` | RGB24, `((height, width), data)` tuples |
| Video (screen) | `SOURCE_SCREENSHARE` | `usr_s_queue` | RGB24, `((height, width), data)` tuples |

When the consumer's audio track ends or the consumer disconnects, the session terminates.

## Data Channel Protocol

All data messages are JSON, sent reliably on topic `"equos_event"`.

```
publish_data(payload_json, reliable=True, topic="equos_event")
```

### Inbound Messages (Consumer -> Character)

Discriminated by `type` field.

#### `context`

Injects context into the agent's prompt.

```json
{
  "type": "context",
  "content": "<string>"
}
```

#### `usr.txt`

Sends user text input (as opposed to speech).

```json
{
  "type": "usr.txt",
  "text": "<string>"
}
```

### Outbound Messages (Character -> Consumer)

#### `interrupt`

Signals the agent was interrupted (user started speaking).

```json
{
  "type": "interrupt"
}
```

#### `utterance`

A completed utterance from either party, for transcript display.

```json
{
  "type": "utterance",
  "utterance": {
    "author": "agent" | "user",
    "content": "<string>",
    "recordedAt": "<ISO 8601 datetime>"
  }
}
```

#### `expire_soon`

Warns the consumer the session is about to end.

```json
{
  "type": "expire_soon",
  "seconds_remaining": 30
}
```

#### `error`

Reports an error to the consumer.

```json
{
  "type": "error",
  "code": "<string>"
}
```

## Audio Delegation Mode

When `remoteAgentIdentity` is set, the connector does **not** subscribe to room audio tracks. Instead, it receives audio via a LiveKit `DataStreamAudioReceiver` from the remote agent. This allows a separate agent process to generate audio that the avatar lip-syncs to.

In this mode:
- `track_subscribed` events are ignored (no media track subscriptions).
- Audio frames arrive through the data stream and are placed into `usr_a_queue`.
- When the data stream ends, the session terminates.

## Session Lifecycle

1. Register room event handlers (`connection_state_changed`, `participant_disconnected`, `data_received`, optionally `track_subscribed`).
2. Connect to room with `serverUrl` and `characterAccessToken`.
3. Publish audio + video tracks.
4. Start the 25 FPS send loop and (if delegated) the audio receiver.
5. Session ends when any of these occur:
   - Consumer's audio track stream ends.
   - `consumerIdentity` participant disconnects.
   - Room connection state becomes `CONN_DISCONNECTED`.
   - Delegated audio stream ends.
6. On teardown: disconnect from room, close all streams, release track/source references.

## Browser Wrapper Mapping

For a `livekit-client` wrapper, the mapping would be:

```
wrapper.on("context",      fn)  // consumer sends context to agent
wrapper.on("usr.txt",      fn)  // consumer sends text to agent
wrapper.on("interrupt",    fn)  // agent interrupted
wrapper.on("utterance",    fn)  // transcript entry
wrapper.on("expire_soon",  fn) // session expiring
wrapper.on("error",        fn)  // agent error

wrapper.sendContext(content)    // publish ContextMessage
wrapper.sendText(text)          // publish UsrTextMessage
```

Media is handled by subscribing/publishing tracks through `livekit-client`'s `Room` object directly:
- Publish the consumer's microphone as `SOURCE_MICROPHONE`.
- Optionally publish camera (`SOURCE_CAMERA`) and screen share (`SOURCE_SCREENSHARE`).
- Subscribe to the character's audio and video tracks for playback.

## Audio/Video Constants

| Constant | Value |
|----------|-------|
| `AUDIO_SAMPLE_RATE` | 16,000 Hz |
| `AUDIO_CHANNELS` | 1 (mono) |
| `AUDIO_BYTES_PER_SAMPLE` | 2 |
| `VIDEO_FPS` | 25 |
| `VIDEO_FORMAT` | RGB24 |
| `BROADCAST_IMG_WIDTH` | 1,920 px |
| `BROADCAST_IMG_HEIGHT` | 1,080 px |
| `BROADCAST_FRAME_SIZE` | 1,280 bytes (audio per frame) |
| `INFERENCE_FRAME_DURATION` | 0.2 s (200 ms) |
