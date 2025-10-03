import { EquosBrowserAgent } from './agent.types';
import { EquosBrowserAvatar } from './avatar.types';

export interface EquosBrowserParticipantIdentity {
  identity: string;
  name: string;
}

export interface CreateEquosBrowserSessionRequest {
  name: string;
  client?: string;
  agent: { id: string };
  avatar: { id: string };
  consumerIdentity: EquosBrowserParticipantIdentity;
  maxDuration?: number;
}

export interface EquosBrowserSession {
  id: string;
  organizationId: string;
  freemium: boolean;
  name: string;
  provider: string;
  client?: string;
  status: string;
  host: {
    serverUrl: string;
  };
  avatarId: string;
  avatar: EquosBrowserAvatar;
  agentId: string;
  agent: EquosBrowserAgent;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquosBrowserSessionResponse {
  session: EquosBrowserSession;
  consumerAccessToken: string;
}
