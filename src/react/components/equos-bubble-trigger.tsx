import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getEquosBrowser } from '../../core/equos';
import {
  EquosBrowserControlEvent,
  EquosBrowserConversationTriggerConfig,
  EquosBrowserEvent,
  EquosLocale,
} from '../../core/types/equos.types';
import { CreateEquosBrowserSessionResponse } from '../../core/types/session.types';
import { EquosConversation } from './equos-conversation';

import { CopyUtils } from '../../core/utils/copy.utils';

import { UserCircle } from 'lucide-react';

export type EquosBubbleTriggerHandle = {
  toggle: (expanded: boolean) => void;
};

export interface EquosBubbleTriggerProps {
  id?: string;
  initiallyExpanded?: boolean;
  dark?: boolean;
  windowSizeInPixels?: number;
  windowMaxViewportWidthPercent?: number;
  agent: EquosBrowserConversationTriggerConfig;
  onToggle?: (expanded: boolean) => void;
}

export const EquosBubbleTrigger = forwardRef<
  EquosBubbleTriggerHandle,
  EquosBubbleTriggerProps
>(
  (
    {
      id,
      initiallyExpanded = true,
      dark = false,
      windowSizeInPixels = 512,
      windowMaxViewportWidthPercent = 95,
      agent,
      onToggle,
    },
    ref,
  ) => {
    const idRef = useRef(id || crypto.randomUUID());

    const equos = useMemo(() => getEquosBrowser(), []);

    const [registered, setRegistered] = useState<boolean>(false);
    const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);

    const [starting, setStarting] = useState<boolean>(false);

    const [session, setSession] =
      useState<CreateEquosBrowserSessionResponse | null>(null);

    const [conversationLeft, setConversationLeft] = useState<number>(0);
    const [conversationTop, setConversationTop] = useState<number>(0);

    useImperativeHandle(ref, () => ({
      toggle(val: boolean) {
        setExpanded(val);
      },
    }));

    const triggerRef = useRef<HTMLDivElement>(null);

    const start = async (): Promise<void> => {
      if (session) {
        console.warn(`Session ${session.session.id} already running...`);
        toggleExpanded(false);
        return;
      }

      if (starting) {
        console.warn('A session is starting...');
        toggleExpanded(false);
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

    const toggleExpanded = (newExpanded: boolean) => {
      setExpanded(newExpanded);

      if (onToggle) {
        onToggle(newExpanded);
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
      equos._inward.addEventListener(
        EquosBrowserControlEvent.stop,
        onStopEvent,
      );

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

    // Cmpute position of conversation window
    useEffect(() => {
      const elt = triggerRef.current;

      if (!elt) {
        return;
      }

      const computePosition = () => {
        const boundingRect = elt.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // width of "conversationSize" with max width of "windowMaxViewportWidthPercent" vw
        // apsect ration of 1 / 1 so height = width
        let modalSize = Math.floor(
          Math.min(
            windowSizeInPixels,
            (windowMaxViewportWidthPercent * vw) / 100,
            512,
          ),
        );

        const modalSpace = 24; // space between trigger and modal

        const canBeAboveTrigger = modalSize + modalSpace <= boundingRect.top;
        const canBeBelowTrigger =
          modalSize + modalSpace <= vh - boundingRect.bottom;

        let top: number = 0;

        if (canBeAboveTrigger) {
          top = boundingRect.top - modalSize - modalSpace;
        } else if (canBeBelowTrigger) {
          top = boundingRect.bottom + modalSpace;
        } else {
          if (boundingRect.top > vh / 2) {
            // Trigger is lower than middle of viewport, so put modal at bottom of viewport
            top = vh - modalSize - modalSpace;
          } else {
            top = modalSpace;
          }
        }

        // Test if there is space for the window starting on the left, and ending at the right edge of the trigger.
        const canEndAtRightOfTrigger =
          boundingRect.right - modalSize - modalSpace >= 0;

        // Test if there is space for the window starting on the right, and ending at the left edge of the trigger.
        const canEndAtLeftOfTrigger =
          vw - boundingRect.left >= modalSize + modalSpace;

        let left: number = 0;

        if (canEndAtRightOfTrigger) {
          left = boundingRect.right - modalSize;
        } else if (canEndAtLeftOfTrigger) {
          left = boundingRect.left;
        } else {
          // center in viewport
          left = Math.max(modalSpace, vw / 2 - modalSize / 2);
        }

        setConversationLeft(Math.floor(left));
        setConversationTop(Math.floor(top));
      };

      const resizeObserver = new ResizeObserver(() => {
        computePosition();
      });

      resizeObserver.observe(elt);

      // Also recompute when the viewport changes
      window.addEventListener('resize', computePosition);
      window.addEventListener('scroll', computePosition, true);

      // Optionally, observe intersection if parent layout changes
      const intersectionObserver = new IntersectionObserver(() =>
        computePosition(),
      );
      intersectionObserver.observe(elt);

      const interval = setInterval(() => {
        computePosition();
      }, 500);

      computePosition();

      return () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        window.removeEventListener('resize', computePosition);
        window.removeEventListener('scroll', computePosition, true);

        clearInterval(interval);
      };
    }, [windowSizeInPixels, windowMaxViewportWidthPercent]);

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
      let classes = 'equos-bubble-trigger-button';

      if (dark) {
        classes += ' equos-dark';
      } else {
        classes += ' equos-light';
      }

      return classes;
    }, [dark]);

    const convContainerClasses = useMemo(() => {
      let classes = 'equos-bubble-trigger-conversation';

      if (expanded) {
        classes += ' equos-visible';
      } else {
        classes += ' equos-hidden';
      }
      return classes;
    }, [expanded]);

    const windowStyle = {
      left: conversationLeft,
      top: conversationTop,
    } as React.CSSProperties;

    const onClickBubble = async () => {
      if (!expanded) {
        toggleExpanded(true);
        return;
      }

      await start();
    };

    const onHangUp = async () => {
      setSession(null);
    };

    return (
      <div className="equos equos-bubble-trigger" ref={triggerRef}>
        <button
          key={agent.agentId + agent.avatarId}
          type="button"
          className={containerClasses}
          onClick={() => onClickBubble()}
        >
          {agent.thumbnailUrl && (
            <img
              key={agent.agentId + agent.avatarId}
              src={agent.thumbnailUrl}
              alt={agent.name}
              title={agent.name}
            />
          )}

          {!agent.thumbnailUrl && <UserCircle size={48} />}

          <div
            className={
              expanded
                ? 'equos-bubble-trigger-button-expanded'
                : 'equos-bubble-trigger-button-collapsed'
            }
          >
            <span className="equos-bubble-trigger-button-label">
              {CopyUtils.talkToCopy(locale, agent.name)}
            </span>
            <span className="equos-bubble-trigger-button-status">
              {CopyUtils.availableNowCopy(locale)}
            </span>
          </div>

          {session && (
            <aside className="equos-bubble-trigger-session-callout"></aside>
          )}
        </button>

        {(starting || session) && (
          <aside className={convContainerClasses} style={windowStyle}>
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
  },
);
