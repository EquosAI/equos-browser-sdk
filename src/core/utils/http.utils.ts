export class HttpUtils {
  constructor(
    private readonly baseUrl: string,
    private readonly version: string,
    private readonly clientKey: string,
  ) {}

  private getPath(path: string): string {
    return `${this.baseUrl}/${this.version}${path}`;
  }

  async post<T, U>(path: string, data: T): Promise<U> {
    return fetch(this.getPath(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.clientKey}`,
      },
      body: JSON.stringify(data),
    }).then((res: Response) => res.json());
  }

  async patch<T, U>(path: string, data: T): Promise<U> {
    return fetch(this.getPath(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.clientKey}`,
      },
      body: JSON.stringify(data),
    }).then((res: Response) => res.json());
  }
}
