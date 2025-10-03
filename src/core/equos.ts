import { EquosBrowserSessionApi } from './apis/session.api';
import { EquosBrowserOptions } from './types/equos.types';
import { ConstantsUtils } from './utils/constants.utils';
import { HttpUtils } from './utils/http.utils';

export class EquosBrowser {
  private readonly endpoint: string;
  private readonly version: string;

  private readonly http: HttpUtils;

  private readonly sessionsApi: EquosBrowserSessionApi;

  private constructor(
    private readonly clientKey: string,
    readonly opts?: EquosBrowserOptions,
  ) {
    this.endpoint = opts?.endpoint || ConstantsUtils.DEFAULT_ENDPOINT;
    this.version = opts?.version || ConstantsUtils.DEFAULT_VERSION;

    this.http = new HttpUtils(this.endpoint, this.version, this.clientKey);
    this.sessionsApi = new EquosBrowserSessionApi(this.http);
  }

  static client(apiKey: string, opts?: EquosBrowserOptions): EquosBrowser {
    return new EquosBrowser(apiKey, opts);
  }

  get sessions(): EquosBrowserSessionApi {
    return this.sessionsApi;
  }
}
