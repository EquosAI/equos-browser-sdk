import { EquosBrowserBubblesConfig } from './types';

export const injectBubbles = (
  config: EquosBrowserBubblesConfig,
  dark?: boolean,
  windowSizeInPixels?: number | null,
  windowMaxViewportWidthPercent?: number | null,
) => {
  const { alignX, alignY, direction, agents } = config;

  if (!agents || agents.length === 0) {
    console.warn('[Equos] No agents found for bubble triggers. Skipping.');
    return;
  }

  const containerElt = document.createElement('div');

  containerElt.style.position = 'fixed';
  containerElt.style[alignX || 'right'] = '16px';
  containerElt.style[alignY || 'bottom'] = '16px';
  containerElt.style.zIndex = '9999';
  containerElt.style.display = 'flex';
  containerElt.style.flexDirection = 'column';
  containerElt.style.gap = '8px';
  containerElt.style.alignItems = alignX === 'left' ? 'flex-start' : 'flex-end';

  const elt = document.createElement('equos-bubble-list');

  (elt as any).agents = agents; // TODO: create proper types for web components props.

  if (dark !== undefined && dark !== null) {
    elt.setAttribute('dark', `${dark}`);
  }

  if (windowSizeInPixels) {
    elt.setAttribute('windowSizeInPixels', `${windowSizeInPixels}`);
  }
  if (windowMaxViewportWidthPercent) {
    elt.setAttribute(
      'windowMaxViewportWidthPercent',
      `${windowMaxViewportWidthPercent}`,
    );
  }

  elt.setAttribute('direction', direction || 'horizontal');
  elt.setAttribute('alignX', alignX || 'right');

  const poweredBy = document.createElement('equos-powered-by');

  containerElt.appendChild(elt);
  containerElt.appendChild(poweredBy);

  document.body.appendChild(containerElt);
};
