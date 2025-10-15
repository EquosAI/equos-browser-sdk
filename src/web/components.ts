import r2wc from '@r2wc/react-to-web-component';

import {
  EquosBubbleList,
  EquosConversation,
  EquosPlaceholderTrigger,
  EquosBubbleTrigger,
  EquosPoweredBy,
} from '../react';

// Define Powered By Web Component
const EquosPoweredByWebComponent = r2wc(EquosPoweredBy, {
  props: {},
});
customElements.define('equos-powered-by', EquosPoweredByWebComponent);

// Define Bubble List Web Component
const EquosBubbleListWebComponent = r2wc(EquosBubbleList, {
  props: {
    alignX: 'string',
    dark: 'boolean',
    direction: 'string',
    windowSizeInPixels: 'number',
    windowMaxViewportWidthPercent: 'number',
    agents: 'json',
  },
});
customElements.define('equos-bubble-list', EquosBubbleListWebComponent);

// Define Conversation Web Component
const EquosConversationWebComponent = r2wc(EquosConversation, {
  props: {
    allowAudio: 'boolean',
    windowSizeInPixels: 'number',
    windowMaxViewportWidthPercent: 'number',
    session: 'json',
    onHangUp: 'function',
  },
});
customElements.define('equos-conversation', EquosConversationWebComponent);

// Define Placeholder Trigger Web Component
const EquosPlaceholderTriggerWebComponent = r2wc(EquosPlaceholderTrigger, {
  props: {
    dark: 'boolean',
    ghost: 'boolean',
    modal: 'boolean',
    windowSizeInPixels: 'number',
    windowMaxViewportWidthPercent: 'number',
    agent: 'json',
  },
});
customElements.define(
  'equos-placeholder-trigger',
  EquosPlaceholderTriggerWebComponent,
);

// Define Bubble Trigger Web Component
const EquosBubbleTriggerWebComponent = r2wc(EquosBubbleTrigger, {
  props: {
    id: 'string',
    initiallyExpanded: 'boolean',
    dark: 'boolean',
    windowSizeInPixels: 'number',
    windowMaxViewportWidthPercent: 'number',
    agent: 'json',
    onToggle: 'function',
  },
});
customElements.define('equos-bubble-trigger', EquosBubbleTriggerWebComponent);
