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
  additionalCtx?: string;
  templateVars?: Record<string, string>;
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

  remoteAgentIdentity?: string;

  maxDuration?: number;
  additionalCtx?: string;
  templateVars?: Record<string, string>;

  startedAt: Date;
  endedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEquosBrowserSessionResponse {
  session: EquosBrowserSession;
  consumerAccessToken: string;
}
