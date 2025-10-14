import { EquosBrowserConversationTriggerConfig } from '../core/types/equos.types';

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
