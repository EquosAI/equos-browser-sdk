import { useMemo } from 'react';

import '../styles/reset.css';
import '../styles/base.css';
import '../styles/popup.css';

import { EquosPoweredBy } from './equos-powered-by';

export function EquosPopup({
  alignX = 'right',
  alignY = 'bottom',
  children,
}: {
  alignY?: 'top' | 'bottom';
  alignX?: 'left' | 'right';
  children: React.ReactNode;
}) {
  const position = useMemo(() => {
    const distanceFromEdgeInPx = 24;

    const positions: Record<string, string> = {};

    if (alignX === 'left') {
      positions.left = `${distanceFromEdgeInPx}px`;
    } else if (alignX === 'right') {
      positions.right = `${distanceFromEdgeInPx}px`;
    }

    if (alignY === 'top') {
      positions.top = `${distanceFromEdgeInPx}px`;
    } else if (alignY === 'bottom') {
      positions.bottom = `${distanceFromEdgeInPx}px`;
    }

    return positions;
  }, [alignX, alignY]);

  const verticalAlign = useMemo(() => {
    if (alignX === 'left') {
      return 'flex-start';
    } else if (alignX === 'right') {
      return 'flex-end';
    }
  }, [alignX]);

  const style = {
    ...position,
    '--equos-popup-align': verticalAlign,
  } as React.CSSProperties;

  return (
    <aside className="equos equos-popup" style={style}>
      {children}
      <EquosPoweredBy />
    </aside>
  );
}
