import { EquosBrowserPlaceholderConfig } from './types';

export const injectPlaceholders = (
  config: EquosBrowserPlaceholderConfig,
  dark?: boolean,
  windowSizeInPixels?: number | null,
  windowMaxViewportWidthPercent?: number | null,
) => {
  for (const placeholder of config) {
    const { selector, modal, agent } = placeholder;

    if (!selector) {
      console.warn('[Equos] No selector found for placeholder. Skipping.');
      continue;
    }

    const containerElt: Element = document.querySelector(selector);

    if (!containerElt) {
      console.warn(
        `[Equos] No element found for selector "${selector}". Skipping.`,
      );
      continue;
    }

    if (!agent) {
      console.warn('[Equos] No agent found for placeholder. Skipping.');
      continue;
    }

    const elt = document.createElement('equos-placeholder-trigger');
    (elt as any).agent = agent; // TODO: create proper types for web components props.

    if (dark !== undefined && dark !== null) {
      elt.setAttribute('dark', `${dark}`);
    }
    if (modal !== undefined && modal !== null) {
      elt.setAttribute('modal', `${modal}`);
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

    containerElt.appendChild(elt);
  }
};
