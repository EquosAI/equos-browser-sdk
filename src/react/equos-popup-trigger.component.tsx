import { useEffect, useMemo, useState } from 'react';
import { getEquosBrowser } from '../core/equos';
import { EquosBrowserConversationTriggerConfig } from '../core/types/equos.types';
import {
  CreateEquosBrowserSessionResponse,
  EquosBrowserSession,
} from '../core/types/session.types';
import EquosConversation from './equos-conversation.component';

export default function EquosPopupTrigger({
  alignX = 'right',
  alignY = 'bottom',
  shape = 'circle',
  color,
  sharp = false,
  allowAudio = true,
  allowVideo = false,
  allowScreenShare = false,
  agents = [],
}: {
  alignY?: 'top' | 'center' | 'bottom';
  alignX?: 'left' | 'center' | 'right';
  shape?: 'circle' | 'square';
  color?: string;
  sharp?: boolean;
  allowAudio: boolean;
  allowVideo: boolean;
  allowScreenShare: boolean;
  agents: EquosBrowserConversationTriggerConfig[];
}) {
  const equos = useMemo(() => getEquosBrowser(), []);

  const [session, setSession] =
    useState<CreateEquosBrowserSessionResponse | null>(null);

  const onStart = async (
    agent: EquosBrowserConversationTriggerConfig,
  ): Promise<EquosBrowserSession> => {
    return equos.sessions
      .start({
        name: `Chat with ${equos.profile.name} - ${new Date().toISOString()}`,
        agent: { id: agent.agentId },
        avatar: { id: agent.avatarId },
        maxDuration: agent.maxDuration,
        client: equos.profile.client,
        consumerIdentity: {
          identity: equos.profile.identity,
          name: equos.profile.name,
        },
      })
      .then((res) => {
        setSession(res);
        return res.session;
      });
  };

  const onStop = async (): Promise<EquosBrowserSession> => {
    if (!session?.session.id) {
      throw new Error('No active session to stop.');
    }
    return equos.sessions.stop(session?.session.id);
  };

  useEffect(() => {
    if (agents.length === 0) {
      console.warn('No agents provided for EquosPopupTrigger.');
      return;
    }

    for (const agent of agents) {
      equos.registerTrigger({
        id: `${agent.agentId}-${agent.avatarId}`,
        agent: agent,
        start: () => onStart(agent),
        stop: () => onStop(),
      });
    }
  }, []);

  return (
    <aside>
      EquosPopup Component
      {session && <EquosConversation session={session} />}
      <span>
        Powered by{' '}
        <a href="https://equos.ai" target="_blank">
          Equos.ai
        </a>
      </span>
    </aside>
  );
}
