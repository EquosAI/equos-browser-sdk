import { EquosBrowserSession } from './session.types';

export interface EquosBrowserOptions {
  /**
   * API version to use (default: v1)
   */
  version?: string;
  /**
   * API endpoint to use (default: https://api.equos.ai)
   * Can leave blank to use the default endpoint.
   */
  endpoint?: string;
}

export interface EquosBrowserConversationTriggerConfig {
  agentId: string;
  avatarId: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  maxDuration?: number;
}

export interface EquosUserProfile {
  name: string;
  identity: string;

  client?: string;
}

export interface EquosBrowserConversationTrigger {
  id: string;
  agent: EquosBrowserConversationTriggerConfig;

  start(): Promise<EquosBrowserSession>;
  stop(): Promise<EquosBrowserSession>;
}
