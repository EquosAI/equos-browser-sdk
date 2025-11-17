import {
  RoomAudioRenderer,
  TrackReference,
  useParticipants,
  useTrackToggle,
  VideoTrack,
} from '@livekit/components-react';
import { Track, TrackPublication } from 'livekit-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getEquosBrowser,
  CopyUtils,
  EquosLocale,
  CreateEquosBrowserSessionResponse,
} from '@equos/browser-sdk';
import {
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneMissed,
  ScreenShare,
  ScreenShareOff,
  Video,
  VideoOff,
} from 'lucide-react';

export function EquosRoomRenderer({
  allowAudio = true,
  allowVideo = true,
  allowScreenShare = true,
  allowHangUp = true,
  showMicBtn = true,
  showCamBtn = true,
  showScreenShareBtn = true,
  showHangUpBtn = true,
  showTimeLeft = true,
  allowedRecoveryTimeInSeconds = 3,
  session,
  onHangUp,
}: {
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  allowHangUp?: boolean;
  showMicBtn?: boolean;
  showCamBtn?: boolean;
  showScreenShareBtn?: boolean;
  showHangUpBtn?: boolean;
  showTimeLeft?: boolean;
  allowedRecoveryTimeInSeconds?: number;
  session: CreateEquosBrowserSessionResponse;
  onHangUp: () => Promise<void>;
}) {
  const waitForAvatarToJoin = 20;

  const equos = useMemo(() => getEquosBrowser(), []);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const userTileRef = useRef<HTMLDivElement | null>(null);
  const screenTileRef = useRef<HTMLDivElement | null>(null);

  const [hangingUp, setHangingUp] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarJoined, setAvatarJoined] = useState(false);
  const [avatarLeftTimeout, setAvatarLeftTimeout] = useState<number | null>(
    null,
  );

  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [userTilePos, setUserTilePos] = useState<{ x: number; y: number }>({
    x: 8,
    y: 8,
  });
  const [userTileDragOffset, setUserTileDragOffset] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [userTileDragging, setUserTileDragging] = useState<boolean>(false);
  const [userTileExpanded, setUserTileExpanded] = useState<boolean>(false);

  const [screenTilePos, setScreenTilePos] = useState<{ x: number; y: number }>({
    x: 8,
    y: 112,
  });
  const [screenTileDragOffset, setScreenTileDragOffset] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [screenTileDragging, setScreenTileDragging] = useState<boolean>(false);
  const [screenTileExpanded, setScreenTileExpanded] = useState<boolean>(false);

  const participants = useParticipants();

  const micToggle = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const camToggle = useTrackToggle({
    source: Track.Source.Camera,
  });

  const screenToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  const avatarHasTroubleJoining = useMemo(() => {
    return !avatarJoined && duration > waitForAvatarToJoin - 10;
  }, [avatarJoined, duration]);

  const trackRefs: Record<string, TrackReference | null> = useMemo(() => {
    const avatar = participants.find(
      (p) => p.identity === session.session.avatar.identity,
    );

    const user = participants.find((p) => p.isLocal);

    const refs: Record<string, TrackReference | null> = {};

    if (user && user.trackPublications) {
      const userVideoPub = Array.from(
        user.trackPublications.values() as MapIterator<TrackPublication>,
      ).find((pub) => pub.source === Track.Source.Camera);

      refs.userVideo = {
        participant: user,
        publication: userVideoPub,
        source: userVideoPub?.source,
      };

      const userScreenPub = Array.from(
        user.trackPublications.values() as MapIterator<TrackPublication>,
      ).find((pub) => pub.source === Track.Source.ScreenShare);

      if (userScreenPub) {
        refs.userScreen = {
          participant: user,
          publication: userScreenPub,
          source: userScreenPub?.source,
        };
      }
    }

    if (avatar && avatar.trackPublications) {
      const avatarVideoPub = Array.from(
        avatar.trackPublications.values() as MapIterator<TrackPublication>,
      ).find((pub) => pub.source === Track.Source.Camera);

      refs.avatar = {
        participant: avatar,
        publication: avatarVideoPub,
        source: avatarVideoPub?.source,
      };
    }

    return refs;
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

      if (!avatar && allowHangUp && !avatarLeftTimeout) {
        setAvatarLeftTimeout(
          setTimeout(() => {
            hangUp();
          }, allowedRecoveryTimeInSeconds * 1000),
        );
      }
    } else {
      const avatar = participants.find(
        (p) => p.identity === session.session.avatar.identity,
      );

      if (avatar) {
        setAvatarJoined(true);

        if (avatarLeftTimeout) {
          clearTimeout(avatarLeftTimeout);
        }
      }
    }

    return () => {
      if (avatarLeftTimeout) {
        clearTimeout(avatarLeftTimeout);
      }
    };
  }, [session.session.avatar.identity, avatarJoined, participants]);

  const hangUp = async () => {
    if (hangingUp || !allowHangUp) {
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

  const onUserTileMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setUserTileDragging(true);
    setScreenTileDragging(false);

    setUserTileDragOffset({
      x: e.clientX - userTilePos.x,
      y: e.clientY - userTilePos.y,
    });
  };

  const onScreenTileMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setScreenTileDragging(true);
    setUserTileDragging(false);

    setScreenTileDragOffset({
      x: e.clientX - screenTilePos.x,
      y: e.clientY - screenTilePos.y,
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (userTileDragging || screenTileDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();

      if (screenTileDragging) {
        const newX = e.clientX - screenTileDragOffset.x;
        const newY = e.clientY - screenTileDragOffset.y;

        const screenRect = screenTileRef.current.getBoundingClientRect();

        // Clamp to container bounds
        const clampedX = Math.min(
          Math.max(newX, 0),
          containerRect.width - screenRect.width,
        );
        const clampedY = Math.min(
          Math.max(newY, 0),
          containerRect.height - screenRect.height,
        );

        setScreenTilePos({
          x: clampedX,
          y: clampedY,
        });
      }

      if (userTileDragging) {
        const newX = e.clientX - userTileDragOffset.x;
        const newY = e.clientY - userTileDragOffset.y;

        const userRect = userTileRef.current.getBoundingClientRect();

        // Clamp to container bounds
        const clampedX = Math.min(
          Math.max(newX, 0),
          containerRect.width - userRect.width,
        );
        const clampedY = Math.min(
          Math.max(newY, 0),
          containerRect.height - userRect.height,
        );

        setUserTilePos({
          x: clampedX,
          y: clampedY,
        });
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setUserTileDragging(false);
    setScreenTileDragging(false);
  };

  const onToggleUserTileSize = () => {
    if (!userTileDragging) {
      setUserTileExpanded((expanded) => !expanded);
    }
  };

  const onToggleScreenTileSize = () => {
    if (!screenTileDragging) {
      setScreenTileExpanded((expanded) => !expanded);
    }
  };

  const showError = (error: string, duration: number = 2000) => {
    setError(error);
    setTimeout(() => {
      setError(null);
    }, duration);
  };

  return (
    <div
      className="equos-room-renderer"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Error MSG */}
      <span className={errorClasses}>{error}</span>

      {/* Remaining Time */}
      {remainingTime && showTimeLeft && (
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

      {/* Avatar Video */}
      {trackRefs.avatar?.source && (
        <VideoTrack
          trackRef={trackRefs.avatar}
          className="equos-room-renderer-avatar-tile"
        />
      )}

      {/* User Video */}
      {trackRefs.userVideo?.source && camToggle.enabled && (
        <div
          ref={userTileRef}
          onMouseDown={onUserTileMouseDown}
          style={{
            position: 'absolute',
            zIndex: 1000,
            top: userTilePos.y,
            left: userTilePos.x,
            cursor: userTileDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            borderRadius: '8px',
            transition: 'width 0.3s, height 0.3s',
            ...(userTileExpanded
              ? { width: '60%', height: 'auto' }
              : { width: '33%', height: 'auto' }),
          }}
        >
          <button
            className="equos-room-renderer-user-tile-btn"
            onClick={onToggleUserTileSize}
          >
            {userTileExpanded ? (
              <Minimize2 size={12} />
            ) : (
              <Maximize2 size={12} />
            )}
          </button>
          <VideoTrack
            trackRef={trackRefs.userVideo}
            className="equos-room-renderer-user-tile"
          />
        </div>
      )}

      {/* User Screen */}
      {trackRefs.userScreen?.source && screenToggle.enabled && (
        <div
          ref={screenTileRef}
          onMouseDown={onScreenTileMouseDown}
          style={{
            position: 'absolute',
            zIndex: 1000,
            top: screenTilePos.y,
            left: screenTilePos.x,
            cursor: screenTileDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            borderRadius: '8px',
            transition: 'width 0.3s, height 0.3s',
            ...(screenTileExpanded
              ? { width: '60%', height: 'auto' }
              : { width: '33%', height: 'auto' }),
          }}
        >
          <button
            className="equos-room-renderer-user-tile-btn"
            onClick={onToggleScreenTileSize}
          >
            {screenTileExpanded ? (
              <Minimize2 size={12} />
            ) : (
              <Maximize2 size={12} />
            )}
          </button>
          <VideoTrack
            trackRef={trackRefs.userScreen}
            className="equos-room-renderer-user-tile"
          />
        </div>
      )}

      {/* Room Audio */}
      <RoomAudioRenderer />

      {/* Bottom Buttons */}
      <div className="equos-room-renderer-bottom-actions">
        {allowAudio && showMicBtn && (
          <button
            className="equos-room-renderer-button"
            type="button"
            onClick={() => micToggle.toggle()}
          >
            {micToggle.enabled ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
        )}
        {showHangUpBtn && (
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
        )}
        {allowVideo && showCamBtn && (
          <button
            className="equos-room-renderer-button"
            type="button"
            onClick={() => camToggle.toggle()}
          >
            {camToggle.enabled ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
        )}

        {allowScreenShare && showScreenShareBtn && (
          <button
            className="equos-room-renderer-button"
            type="button"
            onClick={() => screenToggle.toggle()}
          >
            {screenToggle.enabled ? (
              <ScreenShare size={18} />
            ) : (
              <ScreenShareOff size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
