import { useMemo, useRef } from 'react';
import { EquosBrowserConversationTriggerConfig } from '../../core/types/equos.types';

import {
  EquosBubbleTrigger,
  EquosBubbleTriggerHandle,
} from './equos-bubble-trigger';

import * as React from 'react';

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

  const ids = useMemo(() => {
    // Deterministic way to generate unique ids based on agent info.
    const seen: string[] = [];
    return agents.map((agent) => {
      const base = btoa(JSON.stringify(agent));

      let index = 0;

      while (seen.includes(`${base}_${index}`)) {
        index += 1;
      }

      const id = `${base}_${index}`;
      seen.push(id);

      return id;
    });
  }, [agents]);

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
          bubblesRef.current[key]?.current?.toggle(false);
        }
      });
    }
  };

  return (
    <>
      <div className="equos equos-bubble-list" style={style}>
        {agents.map((agent, i) => {
          if (!bubblesRef.current[ids[i]]) {
            bubblesRef.current[ids[i]] =
              React.createRef<EquosBubbleTriggerHandle>();
          }

          return (
            <EquosBubbleTrigger
              ref={bubblesRef.current[ids[i]]}
              id={ids[i]}
              key={ids[i]}
              agent={agent}
              initiallyExpanded={i === 0}
              dark={dark}
              windowSizeInPixels={windowSizeInPixels}
              windowMaxViewportWidthPercent={windowMaxViewportWidthPercent}
              onToggle={(expanded) => onToggle(ids[i], expanded)}
            />
          );
        })}
      </div>
    </>
  );
}
