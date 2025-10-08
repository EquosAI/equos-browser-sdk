import { useMemo } from 'react';
import { EquosBrowserConversationTriggerConfig } from '../../core/types/equos.types';

import '../styles/reset.css';
import '../styles/popup-trigger.css';

import { EquosAgentBubbles } from './equos-agent-bubbles';
import { EquosPoweredBy } from './equos-powered-by';

export function EquosPopupTrigger({
  alignX = 'right',
  alignY = 'bottom',
  direction = 'row',
  dark = false,
  allowAudio = true,
  allowVideo = false,
  allowScreenShare = false,
  agents = [],
}: {
  alignY?: 'top' | 'bottom';
  alignX?: 'left' | 'center' | 'right';
  direction: 'row' | 'column';
  dark?: boolean;
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  agents: EquosBrowserConversationTriggerConfig[];
}) {
  const position = useMemo(() => {
    const distanceFromEdgeInPx = 24;

    let left: string = 'initial';
    let top: string = 'initial';
    let right: string = 'initial';
    let bottom: string = 'initial';

    if (alignX === 'left') {
      left = `${distanceFromEdgeInPx}px`;
    } else if (alignX === 'center') {
      left = '50%';
    } else if (alignX === 'right') {
      right = `${distanceFromEdgeInPx}px`;
    }

    if (alignY === 'top') {
      top = `${distanceFromEdgeInPx}px`;
    } else if (alignY === 'bottom') {
      bottom = `${distanceFromEdgeInPx}px`;
    }

    return { left, top, right, bottom };
  }, [alignX, alignY]);

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
    '--equos-popup-left': position.left,
    '--equos-popup-right': position.right,
    '--equos-popup-top': position.top,
    '--equos-popup-bottom': position.bottom,
    '--equos-popup-translate-x': alignX === 'center' ? '-50%' : '0',
    '--equos-popup-align': verticalAlign,
  } as React.CSSProperties;

  return (
    <aside className="equos equos-popup-trigger" style={style}>
      <EquosAgentBubbles
        agents={agents}
        dark={dark}
        direction={direction}
        allowAudio={allowAudio}
        allowScreenShare={allowScreenShare}
        allowVideo={allowVideo}
        alignX={alignX}
      />
      <EquosPoweredBy />
    </aside>
  );
}
