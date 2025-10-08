import { useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import { getEquosBrowser } from '../../core/equos';
import { CopyUtils, EquosLocale } from '../../core/utils/copy.utils';
import { CreateEquosBrowserSessionResponse } from '../../core/types/session.types';
import { Mic, MicOff, PhoneMissed } from 'lucide-react';

export function EquosRoomRenderer({
  allowAudio = true,
  allowVideo = true,
  allowScreenShare = true,
  session,
}: {
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  session: CreateEquosBrowserSessionResponse;
}) {
  const equos = useMemo(() => getEquosBrowser(), []);

  const micToggle = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const videoToggle = useTrackToggle({
    source: Track.Source.Camera,
  });

  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  const locale: EquosLocale = useMemo(() => {
    if (equos.profile.preferredLanguage) {
      return equos.profile.preferredLanguage;
    }

    let lang: string = 'en';

    if (navigator.languages && navigator.languages.length) {
      lang = navigator.languages[0].split('-')[0];
    } else if (navigator.language) {
      lang = navigator.language.split('-')[0];
    }

    if (Object.values(EquosLocale).includes(lang as EquosLocale)) {
      return lang as EquosLocale;
    }

    return EquosLocale.EN;
  }, []);

  useEffect(() => {
    if (!session.session.maxDuration) {
      return;
    }
    const i = setInterval(() => {
      const elapsedTime =
        new Date().getTime() - new Date(session.session.startedAt).getTime();

      const remainingSeconds = Math.round(
        Math.max(0, session.session.maxDuration! * 1000 - elapsedTime) / 1000,
      );

      setRemainingTime(CopyUtils.timeLeftCopy(locale, remainingSeconds));
    }, 1000);

    return () => clearInterval(i);
  }, [session.session.startedAt, session.session.maxDuration]);

  return (
    <div className="equos-conversation-mask">
      <div className="equos-conversation-ai-avatar">
        <span className="equos-conversation-ai-avatar-badge">AI</span>
        <span className="equos-conversation-ai-avatar-label">Avatar</span>
      </div>
      {remainingTime && (
        <span className="equos-conversation-countdown">{remainingTime}</span>
      )}

      <div className="equos-conversation-bottom-actions">
        {allowAudio && (
          <button className="equos-conversation-button">
            {micToggle.enabled ? (
              <Mic className="size-7" />
            ) : (
              <MicOff className="size-7" />
            )}
          </button>
        )}
        <button className="equos-conversation-hangup">
          <PhoneMissed />
        </button>
        {allowVideo && (
          <button className="equos-conversation-button">video</button>
        )}
        {allowVideo && (
          <button className="equos-conversation-button">video</button>
        )}
      </div>
    </div>
  );
}
