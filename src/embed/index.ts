import { initEquosBrowser, EncodeUtils } from '@equos/browser-sdk';

// Register web components.
import '../web';

import { injectStyles } from './inject-styles';
import { EquosBrowserPlaceholderConfig } from './types';

import { injectPlaceholders } from './inject-placeholders';
import { injectBubbles } from './inject-bubbles';

(function (script) {
  function runEquos() {
    if (!script) {
      console.warn(
        '[Equos] No script tag found. Please make sure to include the Equos script tag in your HTML.',
      );
      return;
    }

    // 1. init equos sdk global state.
    const publicKey: string = script.getAttribute('data-equos-public-key');

    if (!publicKey) {
      console.warn(
        '[Equos] No public key found. Please make sure to set the "equos-public-key" attribute on the script tag.',
      );
      return;
    }

    const endpoint: string | null =
      script.getAttribute('data-equos-endpoint') || null;
    const version: string | null =
      script.getAttribute('data-equos-version') || null;

    initEquosBrowser(publicKey, { endpoint, version });

    // TODO: expose equos to window?
    // Maybe it is a param when initializing the sdk, so it works for react, web and embed.

    // 2. inject styles
    // TODO: determine style sheet URL (based on version in script url).
    injectStyles(
      (script as HTMLScriptElement).src.replace(
        'embed.iife.js',
        'browser-sdk.css',
      ),
    );

    // 3. Get common properties.
    const dark: boolean = Boolean(
      script.getAttribute('data-equos-dark') === 'true',
    );

    const windowSizeInPixels: number | null =
      parseInt(script.getAttribute('data-equos-window-size-in-pixels')) || null;

    const windowMaxViewportWidthPercent: number | null =
      parseInt(
        script.getAttribute('data-equos-window-max-viewport-width-percent'),
      ) || null;

    // 4. Get placeholder specific config.
    const placeholderConfig: EquosBrowserPlaceholderConfig = EncodeUtils.decode(
      script.getAttribute('data-equos-placeholders'),
    );

    // 4. Inject placeholders if configured.
    injectPlaceholders(
      placeholderConfig,
      dark,
      windowSizeInPixels,
      windowMaxViewportWidthPercent,
    );

    // 5. Inject bubble if configured.
    const bubblesConfig = EncodeUtils.decode(
      script.getAttribute('data-equos-bubbles'),
    );
    injectBubbles(
      bubblesConfig,
      dark,
      windowSizeInPixels,
      windowMaxViewportWidthPercent,
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEquos);
  } else {
    runEquos();
  }
})(document.currentScript);
