import { EquosClient } from '@equos/node-sdk';
import { EquosConversation } from './index';

// --- Config from .env ---

const API_KEY = import.meta.env.VITE_EQUOS_API_KEY as string;
const CHARACTER_ID = import.meta.env.VITE_EQUOS_CHARACTER_ID as string;

// --- DOM elements ---

const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
const disconnectBtn = document.getElementById(
  'disconnect-btn',
) as HTMLButtonElement;
const connStateEl = document.getElementById('conn-state') as HTMLSpanElement;
const agentStateEl = document.getElementById('agent-state') as HTMLSpanElement;
const videoEl = document.getElementById('agent-video') as HTMLVideoElement;
const micBtn = document.getElementById('mic-btn') as HTMLButtonElement;
const cameraBtn = document.getElementById('camera-btn') as HTMLButtonElement;
const screenBtn = document.getElementById('screen-btn') as HTMLButtonElement;
const transcriptEl = document.getElementById('transcript') as HTMLDivElement;
const textInput = document.getElementById('text-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const textForm = document.getElementById('text-form') as HTMLFormElement;
const contextInput = document.getElementById(
  'context-input',
) as HTMLInputElement;
const contextBtn = document.getElementById('context-btn') as HTMLButtonElement;
const contextForm = document.getElementById('context-form') as HTMLFormElement;
const expireWarning = document.getElementById(
  'expire-warning',
) as HTMLDivElement;

// --- State ---

let conversation: EquosConversation | null = null;
let micEnabled = false;
let cameraEnabled = false;
let screenEnabled = false;

// --- Helpers ---

function appendMessage(
  author: string,
  content: string,
  className: string = '',
  time?: string,
) {
  const div = document.createElement('div');
  div.className = `msg ${className}`;

  if (className === 'system' || className === 'error') {
    div.textContent = content;
  } else {
    const authorSpan = document.createElement('span');
    authorSpan.className = `author ${author}`;
    authorSpan.textContent = author;

    const text = document.createTextNode(`: ${content}`);
    div.appendChild(authorSpan);
    div.appendChild(text);

    if (time) {
      const timeSpan = document.createElement('span');
      timeSpan.className = 'time';
      timeSpan.textContent = new Date(time).toLocaleTimeString();
      div.appendChild(timeSpan);
    }
  }

  transcriptEl.appendChild(div);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function setControlsEnabled(enabled: boolean) {
  disconnectBtn.disabled = !enabled;
  micBtn.disabled = !enabled;
  cameraBtn.disabled = !enabled;
  screenBtn.disabled = !enabled;
  textInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  contextInput.disabled = !enabled;
  contextBtn.disabled = !enabled;
  connectBtn.disabled = enabled;
}

function updateMediaButton(
  btn: HTMLButtonElement,
  label: string,
  enabled: boolean,
) {
  btn.textContent = `${label}: ${enabled ? 'ON' : 'OFF'}`;
  btn.className = enabled ? 'active' : '';
}

// --- Connect ---

connectBtn.addEventListener('click', async () => {
  if (!API_KEY || !CHARACTER_ID) {
    appendMessage(
      '',
      'Missing VITE_EQUOS_API_KEY or VITE_EQUOS_CHARACTER_ID in .env',
      'error',
    );
    return;
  }

  connectBtn.disabled = true;
  appendMessage('', 'Creating conversation...', 'system');

  const client = EquosClient.create(API_KEY, {
    // endpoint: 'http://localhost:3001',
    endpoint: 'https://develop-api.equos.ai',
  });

  try {
    const response = await client.conversations.startConversation({
      createEquosConversationRequest: {
        name: `demo-${Date.now()}`,
        characterId: CHARACTER_ID,
        consumer: {
          name: 'Test User',
          identity: 'test-user',
        },
      },
    });

    const { conversation: conv, consumerAccessToken } = response;

    if (!consumerAccessToken) {
      throw new Error('No consumer access token returned');
    }

    conversation = new EquosConversation({
      config: {
        wsUrl: conv.serverUrl,
        token: consumerAccessToken,
        agentIdentity: conv.character.livekitIdentity,
      },
    });

    // -- Register events --

    conversation.on('connectionStateChanged', (state) => {
      connStateEl.textContent = state;
      connStateEl.className = state;

      if (state === 'disconnected') {
        setControlsEnabled(false);
        agentStateEl.textContent = '-';
        micEnabled = false;
        cameraEnabled = false;
        screenEnabled = false;
        updateMediaButton(micBtn, 'Mic', false);
        updateMediaButton(cameraBtn, 'Camera', false);
        updateMediaButton(screenBtn, 'Screen', false);
      }
    });

    conversation.on('agentConnected', () => {
      agentStateEl.textContent = 'connected';
      agentStateEl.style.color = '#4caf50';
      appendMessage('', 'Agent connected', 'system');
      conversation!.attach(videoEl);
    });

    conversation.on('agentDisconnected', () => {
      agentStateEl.textContent = 'disconnected';
      agentStateEl.style.color = '#f44336';
      appendMessage('', 'Agent disconnected', 'system');
      conversation!.detach(videoEl);
    });

    conversation.on('utterance', (msg) => {
      appendMessage(
        msg.utterance.author,
        msg.utterance.content,
        '',
        msg.utterance.recordedAt,
      );
    });

    conversation.on('interrupt', () => {
      appendMessage('', '[interrupted]', 'system');
    });

    conversation.on('expire_soon', (msg) => {
      expireWarning.textContent = `Session expires in ${msg.seconds_remaining} seconds`;
      expireWarning.style.display = 'block';
    });

    conversation.on('error', (msg) => {
      appendMessage('', `Error: ${msg.code}`, 'error');
    });

    // -- Connect --

    await conversation.connect();
    setControlsEnabled(true);
    appendMessage('', `Connected to room: ${conv.room}`, 'system');
  } catch (err) {
    console.error(err);
    appendMessage('', `Failed: ${(err as Error).message}`, 'error');
    conversation = null;
    connectBtn.disabled = false;
  }
});

// --- Disconnect ---

disconnectBtn.addEventListener('click', async () => {
  if (!conversation) return;
  await conversation.disconnect();
  conversation = null;
  expireWarning.style.display = 'none';
  appendMessage('', 'Disconnected', 'system');
});

// --- Send text ---

textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  if (!text || !conversation) return;
  conversation.sendText(text);
  appendMessage('you', text);
  textInput.value = '';
});

// --- Send context ---

contextForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = contextInput.value.trim();
  if (!content || !conversation) return;
  conversation.sendContext(content);
  appendMessage('', `Context sent: ${content}`, 'system');
  contextInput.value = '';
});

// --- Media toggles ---

micBtn.addEventListener('click', async () => {
  if (!conversation) return;
  micEnabled = !micEnabled;
  await conversation.setMicrophoneEnabled(micEnabled);
  updateMediaButton(micBtn, 'Mic', micEnabled);
});

cameraBtn.addEventListener('click', async () => {
  if (!conversation) return;
  cameraEnabled = !cameraEnabled;
  await conversation.setCameraEnabled(cameraEnabled);
  updateMediaButton(cameraBtn, 'Camera', cameraEnabled);
});

screenBtn.addEventListener('click', async () => {
  if (!conversation) return;
  screenEnabled = !screenEnabled;
  await conversation.setScreenShareEnabled(screenEnabled);
  updateMediaButton(screenBtn, 'Screen', screenEnabled);
});
