export class HttpUtils {
  constructor(
    private readonly baseUrl: string,
    private readonly version: string,
    private readonly clientKey: string,
  ) {}

  private getPath(path: string): string {
    return `${this.baseUrl}/${this.version}${path}`;
  }

  private async fetchWithRetry<T>(
    input: RequestInfo,
    init?: RequestInit,
    retries = 2,
  ): Promise<T> {
    let attempts = 0;
    let success = false;

    while (!success && attempts < retries) {
      if (attempts > 0) {
        console.warn(`Retrying request... Attempt ${attempts + 1}`);
      }

      try {
        const response = await fetch(input, init);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: T = await response.json();
        success = true;
        return data;
      } catch (error) {
        attempts++;
        if (attempts >= retries) {
          throw error;
        }
      }
    }
  }

  async post<T, U>(path: string, data: T, retries: number = 2): Promise<U> {
    return this.fetchWithRetry<U>(
      this.getPath(path),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.clientKey}`,
        },
        body: JSON.stringify(data),
      },
      retries,
    );
  }

  async patch<T, U>(path: string, data: T, retries: number = 2): Promise<U> {
    return this.fetchWithRetry<U>(
      this.getPath(path),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.clientKey}`,
        },
        body: JSON.stringify(data),
      },
      retries,
    );
  }
}
