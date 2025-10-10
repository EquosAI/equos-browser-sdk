import {
  RoomAudioRenderer,
  TrackReference,
  useParticipants,
  useTrackToggle,
  VideoTrack,
} from '@livekit/components-react';
import { Track, TrackPublication } from 'livekit-client';
import { useEffect, useMemo, useState } from 'react';
import { getEquosBrowser } from '../../core/equos';
import { CopyUtils } from '../../core/utils/copy.utils';
import { CreateEquosBrowserSessionResponse } from '../../core/types/session.types';
import { EquosLocale } from '../../core/types/equos.types';
import { Loader2, Mic, MicOff, PhoneMissed } from 'lucide-react';

export function EquosRoomRenderer({
  allowAudio = true,
  allowVideo = true,
  allowScreenShare = true,
  session,
  onHangUp,
}: {
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  session: CreateEquosBrowserSessionResponse;
  onHangUp: () => Promise<void>;
}) {
  const waitForAvatarToJoin = 20;

  const equos = useMemo(() => getEquosBrowser(), []);

  const [hangingUp, setHangingUp] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarJoined, setAvatarJoined] = useState(false);
  const [avatarLeft, setAvatarLeft] = useState(false);

  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const participants = useParticipants();

  const micToggle = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const avatarHasTroubleJoining = useMemo(() => {
    return !avatarJoined && duration > waitForAvatarToJoin - 10;
  }, [avatarJoined, duration]);

  const avatartrackRef: TrackReference | null = useMemo(() => {
    const avatar = participants.find(
      (p) => p.identity === session.session.avatar.identity,
    );

    if (!avatar || !avatar.trackPublications) {
      return null;
    }

    const publication = Array.from(
      avatar.trackPublications.values() as MapIterator<TrackPublication>,
    ).find((pub) => pub.source === 'camera');

    if (!publication) {
      return null;
    }

    return {
      participant: avatar,
      publication,
      source: publication.source,
    };
  }, [participants, session.session.avatar.identity]);

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

  const errorClasses = useMemo(() => {
    let classes = 'equos-room-renderer-error';

    if (error) {
      classes += ' equos-visible';
    } else {
      classes += ' equos-hidden';
    }

    return classes;
  }, [error]);

  useEffect(() => {
    if (!avatarJoined && duration > waitForAvatarToJoin) {
      hangUp();
    }
  }, [avatarJoined, duration, waitForAvatarToJoin]);

  useEffect(() => {
    const i = setInterval(() => {
      if (session.session.maxDuration) {
        const elapsedTime =
          new Date().getTime() - new Date(session.session.startedAt).getTime();

        const remainingSeconds = Math.round(
          Math.max(0, session.session.maxDuration! * 1000 - elapsedTime) / 1000,
        );

        setRemainingTime(CopyUtils.timeLeftCopy(locale, remainingSeconds));
      }

      setDuration((duration) => duration + 1);
    }, 1000);

    return () => clearInterval(i);
  }, [session.session.startedAt, session.session.maxDuration]);

  useEffect(() => {
    if (avatarJoined) {
      const avatar = participants.find(
        (p) => p.identity === session.session.avatar.identity,
      );

      if (!avatar) {
        setAvatarLeft(true);
      }
    } else {
      const avatar = participants.find(
        (p) => p.identity === session.session.avatar.identity,
      );

      if (avatar) {
        setAvatarJoined(true);
      }
    }
  }, [session.session.avatar.identity, avatarJoined, participants]);

  useEffect(() => {
    if (avatarLeft) {
      hangUp();
    }
  }, [avatarLeft]);

  const hangUp = async () => {
    if (hangingUp) {
      return;
    }

    setHangingUp(true);

    let success = false;
    let tries = 0;

    while (!success && tries < 3) {
      try {
        await equos.sessions.stop(session.session.id);
        success = true;
      } catch (e) {
        console.error(e);
        tries++;
      }
    }

    if (!success) {
      showError(CopyUtils.failedToHangupCopy(locale));
      return;
    }

    if (onHangUp) {
      await onHangUp().catch();
    }

    setHangingUp(false);
  };

  const showError = (error: string, duration: number = 2000) => {
    setError(error);
    setTimeout(() => {
      setError(null);
    }, duration);
  };

  return (
    <div className="equos-room-renderer">
      {/* Error MSG */}
      <span className={errorClasses}>{error}</span>

      {/* Remaining Time */}
      {remainingTime && (
        <span className="equos-room-renderer-countdown">{remainingTime}</span>
      )}

      {/* Avatar joining */}
      {!avatarJoined && !avatarHasTroubleJoining && (
        <span className="equos-room-renderer-text">
          {CopyUtils.avatarJoiningCopy(locale, session.session.avatar.name)}
        </span>
      )}

      {/* Avatar not joining count down */}
      {!avatarJoined && avatarHasTroubleJoining && (
        <span className="equos-room-renderer-column">
          <span className="equos-room-renderer-text">
            {CopyUtils.avatarNotJoiningCopy(
              locale,
              session.session.avatar.name,
            )}
          </span>
          <span className="equos-room-renderer-subtext">
            {CopyUtils.endingSessionCopy(
              locale,
              Math.max(waitForAvatarToJoin - duration, 0),
            )}
          </span>
        </span>
      )}

      {/* Avatar Audio & Video */}
      {avatartrackRef && (
        <VideoTrack
          trackRef={avatartrackRef}
          className="equos-room-renderer-participant-tile"
        />
      )}

      <RoomAudioRenderer />

      {/* Bottom Buttons */}
      <div className="equos-room-renderer-bottom-actions">
        {allowAudio && (
          <button
            className="equos-room-renderer-button"
            type="button"
            onClick={() => micToggle.toggle()}
          >
            {micToggle.enabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        )}
        <button
          type="button"
          className="equos-room-renderer-hangup"
          onClick={hangUp}
        >
          {hangingUp ? (
            <Loader2 size={18} className="equos-spinner" />
          ) : (
            <PhoneMissed size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
