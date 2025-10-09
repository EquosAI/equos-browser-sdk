import { useMemo, useRef } from 'react';
import { EquosBrowserConversationTriggerConfig } from '../../core/types/equos.types';

import {
  EquosBubbleTrigger,
  EquosBubbleTriggerHandle,
} from './equos-bubble-trigger';

import '../styles/reset.css';
import '../styles/base.css';
import '../styles/bubble-list.css';
import * as React from 'react';

type EquosBubbleRef = React.RefObject<EquosBubbleTriggerHandle>;

export function EquosBubbleList({
  direction = 'row',
  alignX = 'right',
  dark = false,
  windowSizeInPixels = 512,
  windowMaxViewportWidthPercent = 95,
  agents = [],
}: {
  alignX?: 'left' | 'center' | 'right';
  dark?: boolean;
  direction: 'row' | 'column';
  windowSizeInPixels?: number;
  windowMaxViewportWidthPercent?: number;
  agents: EquosBrowserConversationTriggerConfig[];
}) {
  const bubblesRef = useRef<
    Record<string, React.RefObject<EquosBubbleTriggerHandle>>
  >({});

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

  const onToggle = (id: string, expanded: boolean) => {
    if (expanded) {
      // Close all other bubbles
      Object.keys(bubblesRef.current).forEach((key) => {
        if (key !== id) {
          bubblesRef.current[key]?.current.toggle(false);
        }
      });
    }
  };

  return (
    <>
      <div className="equos equos-bubble-list" style={style}>
        {agents.map((agent, i) => {
          // TODO: find unique id...
          const id = agent.agentId + agent.avatarId;

          if (!bubblesRef.current[id]) {
            bubblesRef.current[id] =
              React.createRef<EquosBubbleTriggerHandle>();
          }

          return (
            <EquosBubbleTrigger
              ref={bubblesRef.current[id]}
              key={agent.agentId + agent.avatarId}
              agent={agent}
              initiallyExpanded={i === 0}
              dark={dark}
              windowSizeInPixels={windowSizeInPixels}
              windowMaxViewportWidthPercent={windowMaxViewportWidthPercent}
              onToggle={(expanded) => onToggle(id, expanded)}
            />
          );
        })}
      </div>
    </>
  );
}
