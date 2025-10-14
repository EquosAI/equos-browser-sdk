import { EquosBrowserSessionApi } from './apis/session.api';
import {
  EquosBrowserControlEvent,
  EquosBrowserConversationTriggerConfig,
  EquosBrowserEvent,
  EquosBrowserOptions,
  EquosLocale,
  EquosUserProfile,
} from './types/equos.types';
import { ConstantsUtils } from './utils/constants.utils';
import { HttpUtils } from './utils/http.utils';

class EquosBrowser {
  private readonly _endpoint: string;
  private readonly _version: string;

  private readonly _http: HttpUtils;

  private readonly _sessionsApi: EquosBrowserSessionApi;

  private readonly _triggers: Map<
    string,
    EquosBrowserConversationTriggerConfig
  > = new Map();

  private readonly _profile: EquosUserProfile = {
    name: 'Guest',
    identity: 'guest',
  };

  // EventTarget to handle events
  readonly _inward: EventTarget = new EventTarget();
  readonly _outward: EventTarget = new EventTarget();

  constructor(
    private readonly _clientKey: string,
    readonly opts?: EquosBrowserOptions,
  ) {
    this._endpoint = opts?.endpoint || ConstantsUtils.DEFAULT_ENDPOINT;
    this._version = opts?.version || ConstantsUtils.DEFAULT_VERSION;

    this._http = new HttpUtils(this._endpoint, this._version, this._clientKey);
    this._sessionsApi = new EquosBrowserSessionApi(this._http);
  }

  get profile(): EquosUserProfile {
    return this._profile;
  }

  get sessions(): EquosBrowserSessionApi {
    return this._sessionsApi;
  }

  get triggers(): Map<string, EquosBrowserConversationTriggerConfig> {
    return this._triggers;
  }

  setUser(user: string): void {
    this._profile.name = user;
  }

  setClient(client: string): void {
    this._profile.client = client;
  }

  setIdentity(identity: string): void {
    this._profile.identity = identity;
  }

  setPreferredLanguage(locale: EquosLocale): void {
    this._profile.preferredLanguage = locale;
  }

  _registerTrigger(
    id: string,
    trigger: EquosBrowserConversationTriggerConfig,
  ): boolean {
    if (this._triggers.has(id)) {
      console.warn(`Trigger with same id already registered.`);
      return false;
    }

    this._triggers.set(id, trigger);

    return this._outward.dispatchEvent(
      new CustomEvent(EquosBrowserEvent.registered, { detail: trigger }),
    );
  }

  _unregisterTrigger(triggerId: string): boolean {
    const trigger = this._triggers.get(triggerId);

    if (!trigger) {
      console.error(`Trigger with id ${triggerId} not found.`);
      return false;
    }

    this._triggers.delete(triggerId);

    return this._outward.dispatchEvent(
      new CustomEvent(EquosBrowserEvent.unregistered, { detail: trigger }),
    );
  }

  on(
    event: EquosBrowserEvent,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    return this._outward.addEventListener(event, callback, options);
  }

  off(
    event: EquosBrowserEvent,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    return this._outward.removeEventListener(event, callback, options);
  }

  start(triggerId: string): boolean {
    if (!this._triggers.has(triggerId)) {
      this._outward.dispatchEvent(
        new CustomEvent(EquosBrowserEvent.error, {
          detail: `[CANNOT_START] Trigger with id ${triggerId} not found.`,
        }),
      );
      return;
    }

    return this._inward.dispatchEvent(
      new CustomEvent(EquosBrowserControlEvent.start, { detail: triggerId }),
    );
  }

  stop(triggerId: string): boolean {
    if (!this._triggers.has(triggerId)) {
      this._outward.dispatchEvent(
        new CustomEvent(EquosBrowserEvent.error, {
          detail: `[CANNOT_STOP] Trigger with id ${triggerId} not found.`,
        }),
      );
      return;
    }

    return this._inward.dispatchEvent(
      new CustomEvent(EquosBrowserControlEvent.stop, { detail: triggerId }),
    );
  }
}

// Singleton instance

let browserSdkInstance: EquosBrowser | null = null;

export const initEquosBrowser = (
  clientKey: string,
  opts?: EquosBrowserOptions,
): EquosBrowser => {
  if (!browserSdkInstance) {
    browserSdkInstance = new EquosBrowser(clientKey, opts);
  }
  return browserSdkInstance;
};

export const getEquosBrowser = (): EquosBrowser => {
  if (!browserSdkInstance) {
    throw new Error('EquosBrowser SDK not initialized. Call initEquosBrowser.');
  }
  return browserSdkInstance;
};
