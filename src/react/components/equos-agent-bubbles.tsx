import { useEffect, useMemo, useState } from 'react';
import { getEquosBrowser } from '../../core/equos';
import { EquosBrowserConversationTriggerConfig } from '../../core/types/equos.types';
import {
  CreateEquosBrowserSessionResponse,
  EquosBrowserSession,
} from '../../core/types/session.types';
import { EquosConversation } from './equos-conversation';

import { CopyUtils, EquosLocale } from '../../core/utils/copy.utils';

import '../styles/reset.css';
import '../styles/base.css';
import '../styles/agent-bubbles.css';

export function EquosAgentBubbles({
  direction = 'row',
  dark = false,
  allowAudio = true,
  allowVideo = false,
  allowScreenShare = false,
  alignX = 'right',
  agents = [],
}: {
  direction: 'row' | 'column';
  dark?: boolean;
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  alignX: 'left' | 'center' | 'right';
  agents: EquosBrowserConversationTriggerConfig[];
}) {
  const equos = useMemo(() => getEquosBrowser(), []);

  const [expanded, setExpanded] =
    useState<EquosBrowserConversationTriggerConfig | null>(null);

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

    if (direction === 'row' || agents.length === 1) {
      setExpanded(agents[0]);
    }
  }, []);

  const locale: EquosLocale = useMemo(() => {
    if (equos.profile.preferredLanguage) {
      return equos.profile.preferredLanguage;
    }

    let lang: string = 'en';

    if (navigator.languages && navigator.languages.length) {
      lang = navigator.languages[0].split('-')[0];
    } else if (navigator.language) {
      lang = navigator.language.split('-')[0];
    }

    if (Object.values(EquosLocale).includes(lang as EquosLocale)) {
      return lang as EquosLocale;
    }

    return EquosLocale.EN;
  }, []);

  const containerClasses = useMemo(() => {
    let classes = 'equos-agent-bubble';

    if (dark) {
      classes += ' equos-dark';
    } else {
      classes += ' equos-light';
    }

    return classes;
  }, [dark]);

  const verticalAlign = useMemo(() => {
    if (alignX === 'left') {
      return 'flex-start';
    } else if (alignX === 'center') {
      return 'center';
    } else if (alignX === 'right') {
      return 'flex-end';
    }
  }, [alignX]);

  const style = {
    '--equos-align-y': verticalAlign,
    '--equos-direction': direction,
  } as React.CSSProperties;

  const onClickBubble = (agent: EquosBrowserConversationTriggerConfig) => {
    const id = agent.agentId + '-' + agent.avatarId;
    const expandedId = expanded?.agentId + '-' + expanded?.avatarId;

    if (id !== expandedId) {
      setExpanded(agent);
      return;
    }

    // Start a session

    setSession({
      consumerAccessToken: '',
      session: { id: 'id' } as EquosBrowserSession,
    });
  };

  return (
    <>
      <div className="equos equos-agent-bubbles" style={style}>
        {agents.map((agent) => {
          return (
            <>
              <button
                type="button"
                className={containerClasses}
                onClick={() => setExpanded(agent)}
              >
                <img
                  key={agent.agentId + agent.avatarId}
                  src={agent.thumbnailUrl}
                  alt={agent.name}
                  title={agent.name}
                />

                <div
                  className={
                    expanded?.agentId === agent.agentId
                      ? 'equos-agent-bubble-expanded'
                      : 'equos-agent-bubble-collapsed'
                  }
                >
                  <span className="equos-agent-bubble-label">
                    {CopyUtils.talkToCopy(locale, agent.name)}
                  </span>
                  <span className="equos-agent-bubble-status">
                    {CopyUtils.availableNowCopy(locale)}
                  </span>
                </div>
              </button>
            </>
          );
        })}
      </div>

      {/* {session && <EquosConversation session={session} />} */}
    </>
  );
}
