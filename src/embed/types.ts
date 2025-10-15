import { EquosBrowserConversationTriggerConfig } from '@equos/browser-sdk';

export type EquosBrowserPlaceholderConfig = {
  selector: string;
  modal: boolean;
  agent: EquosBrowserConversationTriggerConfig;
}[];

export type EquosBrowserBubblesConfig = {
  alignX: 'left' | 'right';
  alignY: 'top' | 'bottom';
  direction: 'vertical' | 'horizontal';
  agents: EquosBrowserConversationTriggerConfig[];
};
