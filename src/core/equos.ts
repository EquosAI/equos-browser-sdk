import { EquosBrowserSessionApi } from './apis/session.api';
import {
  EquosBrowserConversationTrigger,
  EquosBrowserOptions,
  EquosUserProfile,
} from './types/equos.types';
import { ConstantsUtils } from './utils/constants.utils';
import { EquosLocale } from './utils/copy.utils';
import { HttpUtils } from './utils/http.utils';

class EquosBrowser {
  private readonly endpoint: string;
  private readonly version: string;

  private readonly http: HttpUtils;

  private readonly sessionsApi: EquosBrowserSessionApi;

  private readonly triggers: Map<string, EquosBrowserConversationTrigger> =
    new Map();

  private readonly _profile: EquosUserProfile = {
    name: 'Guest',
    identity: 'guest',
  };

  constructor(
    private readonly clientKey: string,
    readonly opts?: EquosBrowserOptions,
  ) {
    this.endpoint = opts?.endpoint || ConstantsUtils.DEFAULT_ENDPOINT;
    this.version = opts?.version || ConstantsUtils.DEFAULT_VERSION;

    this.http = new HttpUtils(this.endpoint, this.version, this.clientKey);
    this.sessionsApi = new EquosBrowserSessionApi(this.http);
  }

  get profile(): EquosUserProfile {
    return this._profile;
  }

  get sessions(): EquosBrowserSessionApi {
    return this.sessionsApi;
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

  async registerTrigger(
    trigger: EquosBrowserConversationTrigger,
  ): Promise<void> {
    if (this.triggers.has(trigger.id)) {
      console.error(`Trigger with id ${trigger.id} already registered.`);
      return;
    }

    this.triggers.set(trigger.id, trigger);
  }

  async unregisterTrigger(triggerId: string): Promise<void> {
    const trigger = this.triggers.get(triggerId);

    if (!trigger) {
      console.error(`Trigger with id ${triggerId} not found.`);
      return;
    }

    this.triggers.delete(triggerId);
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
