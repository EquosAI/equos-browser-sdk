export enum EquosLocale {
  EN = 'en',
  FR = 'fr',
  ES = 'es',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  NL = 'nl',
  RU = 'ru',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  AR = 'ar',
  HI = 'hi',
}

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
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
}

export interface EquosUserProfile {
  name: string;
  identity: string;

  preferredLanguage?: EquosLocale;
  client?: string;
}

export enum EquosBrowserEvent {
  registered = 'registered',
  unregistered = 'unregistered',
  started = 'started',
  ended = 'ended',
  error = 'error',
}

export enum EquosBrowserControlEvent {
  start = 'start',
  stop = 'stop',
}
