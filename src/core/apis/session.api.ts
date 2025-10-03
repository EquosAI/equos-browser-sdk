import {
  CreateEquosBrowserSessionRequest,
  CreateEquosBrowserSessionResponse,
  EquosBrowserSession,
} from '../types/session.types';
import { HttpUtils } from '../utils/http.utils';

export class EquosBrowserSessionApi {
  constructor(private readonly http: HttpUtils) {}

  async start(
    data: CreateEquosBrowserSessionRequest,
  ): Promise<CreateEquosBrowserSessionResponse> {
    return this.http.post<
      CreateEquosBrowserSessionRequest,
      CreateEquosBrowserSessionResponse
    >('/session-passes', data);
  }

  async stop(id: string): Promise<EquosBrowserSession> {
    return this.http.patch<{}, EquosBrowserSession>(
      `/session-passes/${id}/stop`,
      {},
    );
  }
}
