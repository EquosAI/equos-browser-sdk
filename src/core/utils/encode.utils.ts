export class EncodeUtils {
  static encode(triggers: any): string {
    return btoa(JSON.stringify(triggers));
  }

  static decode(encodedTriggers?: string | null): any {
    if (!encodedTriggers) {
      console.warn('[Equos] No triggers found to decode.');
      return [];
    }

    try {
      return JSON.parse(atob(encodedTriggers));
    } catch (e) {
      console.error('[Equos] Failed to decode triggers.', e);
      return [];
    }
  }
}
