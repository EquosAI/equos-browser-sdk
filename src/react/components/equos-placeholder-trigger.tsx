import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getEquosBrowser,
  CopyUtils,
  EquosBrowserControlEvent,
  EquosBrowserConversationTriggerConfig,
  EquosBrowserEvent,
  EquosLocale,
  CreateEquosBrowserSessionResponse,
} from '@equos/browser-sdk';
import { EquosConversation } from './equos-conversation';

export function EquosPlaceholderTrigger({
  agent,
  dark = false,
  modal = true,
  ghost = false,
  windowSizeInPixels = 512,
  windowMaxViewportWidthPercent = 95,
}: {
  dark?: boolean;
  modal?: boolean;
  ghost?: boolean;
  windowSizeInPixels?: number;
  windowMaxViewportWidthPercent?: number;
  agent: EquosBrowserConversationTriggerConfig;
}) {
  const idRef = useRef(crypto.randomUUID());

  const equos = useMemo(() => getEquosBrowser(), []);

  const [registered, setRegistered] = useState<boolean>(false);
  const [starting, setStarting] = useState<boolean>(false);

  const [session, setSession] =
    useState<CreateEquosBrowserSessionResponse | null>(null);

  const start = async (): Promise<void> => {
    if (session) {
      console.warn(`Session ${session.session.id} already running...`);
      return;
    }

    if (starting) {
      console.warn('A session is starting...');
      return;
    }

    setStarting(true);

    const res = await equos.sessions
      .start({
        agent: { id: agent.agentId },
        avatar: { id: agent.avatarId },
        client: equos.profile.client,
        consumerIdentity: {
          identity: equos.profile.identity,
          name: equos.profile.name,
        },
        maxDuration: agent.maxDuration,
        name: `Chat with ${equos.profile.name} - ${new Date().toISOString()}`,
      })
      .catch((e) => {
        equos._outward.dispatchEvent(
          new CustomEvent(EquosBrowserEvent.error, {
            detail: { agent, error: e },
          }),
        );

        return null;
      });

    if (res) {
      setSession(res);
      equos._outward.dispatchEvent(
        new CustomEvent(EquosBrowserEvent.started, { detail: res }),
      );
    }

    setTimeout(() => {
      setStarting(false);
    }, 1000);
  };

  const stop = async (): Promise<void> => {
    if (!session?.session.id) {
      console.warn(`No session to stop...`);
      return;
    }

    const res = await equos.sessions.stop(session?.session.id).catch((e) => {
      equos._outward.dispatchEvent(
        new CustomEvent(EquosBrowserEvent.error, {
          detail: { error: e },
        }),
      );

      return null;
    });

    if (res) {
      equos._outward.dispatchEvent(
        new CustomEvent(EquosBrowserEvent.ended, { detail: session }),
      );
      setSession(null);
    }
  };

  // Register trigger on mount
  useEffect(() => {
    if (!registered) {
      equos._registerTrigger(idRef.current, agent);
      setRegistered(true);
    }

    return () => {
      equos._unregisterTrigger(idRef.current);
      setRegistered(false);
    };
  }, []);

  // listen to sdk events
  useEffect(() => {
    const id = agent.agentId + agent.avatarId;

    const onStartEvent = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail === id) {
        start();
      }
    };

    const onStopEvent = (event: Event) => {
      const customEvent = event as CustomEvent;

      if (customEvent.detail === id) {
        stop();
      }
    };

    equos._inward.addEventListener(
      EquosBrowserControlEvent.start,
      onStartEvent,
    );
    equos._inward.addEventListener(EquosBrowserControlEvent.stop, onStopEvent);

    return () => {
      equos._inward.removeEventListener(
        EquosBrowserControlEvent.start,
        onStartEvent,
      );
      equos._inward.removeEventListener(
        EquosBrowserControlEvent.stop,
        onStopEvent,
      );
    };
  });

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

  const placeholderClasses = useMemo(() => {
    let classes = 'equos equos-placeholder-trigger-placeholder';

    if (dark) {
      classes += ' equos-dark';
    } else {
      classes += ' equos-light';
    }

    return classes;
  }, [dark]);

  const convContainerClasses = useMemo(() => {
    let classes = 'equos-placeholder-trigger-conversation';

    if (modal) {
      classes += ' equos-modal';
    } else {
      classes += ' equos-flat';
    }
    return classes;
  }, [modal]);

  const onHangUp = async () => {
    setSession(null);
  };

  const styles = {
    '--equos-placeholder-size': ghost ? '0px' : '100%',
  } as React.CSSProperties;

  return (
    <div className="equos equos-placeholder-trigger" style={styles}>
      {!ghost && (
        <div className={placeholderClasses}>
          {agent.thumbnailUrl && (
            <img
              key={agent.agentId + agent.avatarId}
              src={agent.thumbnailUrl}
              alt={agent.name}
              title={agent.name}
            />
          )}
          <button
            type="button"
            className="equos-placeholder-trigger-button"
            onClick={() => start()}
          >
            <span className="equos-placeholder-trigger-button-label">
              {CopyUtils.talkToCopy(locale, agent.name)}
            </span>
          </button>
        </div>
      )}

      {(starting || session) && (
        <aside className={convContainerClasses}>
          <EquosConversation
            session={session}
            windowSizeInPixels={windowSizeInPixels}
            windowMaxViewportWidthPercent={windowMaxViewportWidthPercent}
            allowAudio={agent.allowAudio}
            onHangUp={onHangUp}
          />
        </aside>
      )}
    </div>
  );
}
