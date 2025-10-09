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

  static failedToHangupCopy(locale: string): string {
    switch (locale) {
      case EquosLocale.FR:
        return `Nous n'avons pas réussi à raccrocher.`;
      case EquosLocale.ES:
        return `No pudimos colgar.`;
      case EquosLocale.DE:
        return `Auflegen fehlgeschlagen.`;
      case EquosLocale.IT:
        return `Non siamo riusciti a riagganciare.`;
      case EquosLocale.PT:
        return `Não conseguimos desligar.`;
      case EquosLocale.NL:
        return `We konden niet ophangen.`;
      case EquosLocale.RU:
        return `Не удалось завершить звонок.`;
      case EquosLocale.ZH:
        return `我们无法挂断。`;
      case EquosLocale.JA:
        return `通話を終了できませんでした。`;
      case EquosLocale.KO:
        return `전화를 끊지 못했습니다.`;
      case EquosLocale.AR:
        return `لم نتمكن من إنهاء المكالمة.`;
      case EquosLocale.HI:
        return `हम कॉल समाप्त नहीं कर सके।`;
      case EquosLocale.EN:
      default:
        return `We failed to hang up.`;
    }
  }

  static avatarNotJoiningCopy(locale: string, name: string): string {
    switch (locale) {
      case EquosLocale.FR:
        return `${name} à du mal à se connecter.`;
      case EquosLocale.ES:
        return `${name} tiene problemas para unirse.`;
      case EquosLocale.DE:
        return `${name} Probleme beim Beitreten hat.`;
      case EquosLocale.IT:
        return `${name} abbia difficoltà a connettersi.`;
      case EquosLocale.PT:
        return `${name} está com dificuldades para entrar.`;
      case EquosLocale.NL:
        return `${name} moeite heeft om deel te nemen.`;
      case EquosLocale.RU:
        return `${name} испытывает трудности с подключением.`;
      case EquosLocale.ZH:
        return `${name}加入时遇到困难。`;
      case EquosLocale.JA:
        return `${name}が参加できないようです。`;
      case EquosLocale.KO:
        return `${name}(이)가 참여하는 데 어려움을 겪고 있습니다.`;
      case EquosLocale.AR:
        return `${name} يواجه صعوبة في الانضمام.`;
      case EquosLocale.HI:
        return `${name} जुड़ने में परेशानी हो रही है।`;
      case EquosLocale.EN:
      default:
        return `${name} is having trouble joining.`;
    }
  }

  static avatarJoiningCopy(locale: string, name: string): string {
    switch (locale) {
      case EquosLocale.FR:
        return `${name} se connecte...`;
      case EquosLocale.ES:
        return `${name} se está uniendo...`;
      case EquosLocale.DE:
        return `${name} tritt bei...`;
      case EquosLocale.IT:
        return `${name} si sta connettendo...`;
      case EquosLocale.PT:
        return `${name} está entrando...`;
      case EquosLocale.NL:
        return `${name} doet mee...`;
      case EquosLocale.RU:
        return `${name} присоединяется...`;
      case EquosLocale.ZH:
        return `${name}正在加入...`;
      case EquosLocale.JA:
        return `${name}が参加しています...`;
      case EquosLocale.KO:
        return `${name}(이)가 참여 중입니다...`;
      case EquosLocale.AR:
        return `${name} ينضم...`;
      case EquosLocale.HI:
        return `${name} जुड़ रहा है...`;
      case EquosLocale.EN:
      default:
        return `${name} is joining...`;
    }
  }

  static endingSessionCopy(locale: string, countdown: number): string {
    switch (locale) {
      case EquosLocale.FR:
        return `Fin automatique dans ${countdown}s...`;
      case EquosLocale.ES:
        return `Finalización automática en ${countdown}s...`;
      case EquosLocale.DE:
        return `Automatisches Beenden in ${countdown}s...`;
      case EquosLocale.IT:
        return `Chiusura automatica tra ${countdown}s...`;
      case EquosLocale.PT:
        return `Encerramento automático em ${countdown}s...`;
      case EquosLocale.NL:
        return `Automatisch afsluiten over ${countdown}s...`;
      case EquosLocale.RU:
        return `Автоматическое завершение через ${countdown}с...`;
      case EquosLocale.ZH:
        return `${countdown}秒后自动结束...`;
      case EquosLocale.JA:
        return `${countdown}秒で自動終了します...`;
      case EquosLocale.KO:
        return `${countdown}초 후 자동 종료...`;
      case EquosLocale.AR:
        return `إنهاء تلقائي في ${countdown} ثوان...`;
      case EquosLocale.HI:
        return `${countdown} सेकंड में स्वचालित समाप्ति...`;
      case EquosLocale.EN:
      default:
        return `Auto ending in ${countdown}s...`;
    }
  }
}
