export enum EquosLocale {
  EN = 'en',
  FR = 'fr',
  ES = 'es',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  NL = 'nl',
  RU = 'ru',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  AR = 'ar',
  HI = 'hi',
}

export class CopyUtils {
  static talkToCopy(locale: EquosLocale, name?: string): string {
    const assistant =
      name ||
      {
        [EquosLocale.FR]: 'votre assistant',
        [EquosLocale.ES]: 'tu asistente',
        [EquosLocale.DE]: 'Ihrem Assistenten',
        [EquosLocale.IT]: 'il tuo assistente',
        [EquosLocale.PT]: 'seu assistente',
        [EquosLocale.NL]: 'je assistent',
        [EquosLocale.RU]: 'вашим помощником',
        [EquosLocale.ZH]: '您的助手',
        [EquosLocale.JA]: 'あなたのアシスタント',
        [EquosLocale.KO]: '귀하의 어시스턴트',
        [EquosLocale.EN]: 'your assistant',
        [EquosLocale.AR]: 'مساعدك',
        [EquosLocale.HI]: 'आपका सहायक',
      }[locale] ||
      'your assistant';

    switch (locale) {
      case EquosLocale.FR:
        return `Parler à ${assistant}`;
      case EquosLocale.ES:
        return `Habla con ${assistant}`;
      case EquosLocale.DE:
        return `Chatten mit ${assistant}`;
      case EquosLocale.IT:
        return `Parla con ${assistant}`;
      case EquosLocale.PT:
        return `Fale com ${assistant}`;
      case EquosLocale.NL:
        return `Chat met ${assistant}`;
      case EquosLocale.RU:
        return `Пообщайтесь с ${assistant}`;
      case EquosLocale.ZH:
        return `与${assistant}聊天`;
      case EquosLocale.JA:
        return `${assistant}と話す`;
      case EquosLocale.KO:
        return `${assistant}와 대화`;
      case EquosLocale.AR:
        return `تكلم مع ${assistant}`;
      case EquosLocale.HI:
        return `${assistant} से बात करें`;
      case EquosLocale.EN:
      default:
        return `Chat with ${assistant}`;
    }
  }

  static availableNowCopy(locale: string): string {
    switch (locale) {
      case EquosLocale.FR:
        return `Disponible`;
      case EquosLocale.ES:
        return `Disponible`;
      case EquosLocale.DE:
        return `Verfügbar`;
      case EquosLocale.IT:
        return `Disponibile`;
      case EquosLocale.PT:
        return `Disponível`;
      case EquosLocale.NL:
        return `Beschikbaar`;
      case EquosLocale.RU:
        return `Доступно`;
      case EquosLocale.ZH:
        return `可用`;
      case EquosLocale.JA:
        return `利用可能`;
      case EquosLocale.KO:
        return `사용 가능`;
      case EquosLocale.AR:
        return `متاح`;
      case EquosLocale.HI:
        return `ऑनलाइन है`;
      case EquosLocale.EN:
      default:
        return `Available`;
    }
  }

  static timeLeftCopy(locale: string, remaining: number): string {
    const hours = Math.floor(remaining / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((remaining % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (remaining % 60).toString().padStart(2, '0');

    let timeString = '';
    if (remaining > 3600) {
      timeString += `${hours}h`;
    } else if (remaining > 60) {
      timeString = `${minutes}m`;
    } else {
      timeString = `${seconds}s`;
    }

    switch (locale) {
      case EquosLocale.FR:
        return `${timeString} restantes`;
      case EquosLocale.ES:
        return `${timeString} restantes`;
      case EquosLocale.DE:
        return `${timeString} verbleibend`;
      case EquosLocale.IT:
        return `${timeString} rimanenti`;
      case EquosLocale.PT:
        return `${timeString} restantes`;
      case EquosLocale.NL:
        return `${timeString} resterend`;
      case EquosLocale.RU:
        return `Осталось ${timeString}`;
      case EquosLocale.ZH:
        return `剩余 ${timeString}`;
      case EquosLocale.JA:
        return `残り ${timeString}`;
      case EquosLocale.KO:
        return `남은 시간 ${timeString}`;
      case EquosLocale.AR:
        return `متبقي ${timeString}`;
      case EquosLocale.HI:
        return `${timeString} बाकी`;
      case EquosLocale.EN:
      default:
        return `${timeString} left`;
    }
  }
}
