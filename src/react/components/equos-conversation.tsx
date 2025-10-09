import { CreateEquosBrowserSessionResponse } from '../../core/types/session.types';

import { LiveKitRoom } from '@livekit/components-react';

import { EquosRoomRenderer } from './equos-room-renderer';

import '@livekit/components-styles';
import '../styles/reset.css';
import '../styles/base.css';
import '../styles/conversation.css';
import { useMemo } from 'react';
import EquosLogo from './equos-logo';

export function EquosConversation({
  allowAudio = true,
  windowSizeInPixels = 512,
  windowMaxViewportWidthPercent = 95,
  session,
  onHangUp,
}: {
  allowAudio?: boolean;
  windowSizeInPixels?: number;
  windowMaxViewportWidthPercent?: number;
  session?: CreateEquosBrowserSessionResponse;
  onHangUp?: () => Promise<void>;
}) {
  const resolvedWindowSize = useMemo(() => {
    if (windowSizeInPixels > 512) {
      console.warn(
        '[EquosConversation] windowSizeInPixels reduced to max of 512px.',
      );
      return 512;
    }

    if (windowSizeInPixels < 256) {
      console.warn(
        '[EquosConversation] windowSizeInPixels increased to min of 256px.',
      );
      return 256;
    }

    return Math.round(windowSizeInPixels);
  }, [windowSizeInPixels]);

  const resolvedWindowMaxViewportWidthPercent = useMemo(() => {
    if (windowMaxViewportWidthPercent > 100) {
      console.warn(
        '[EquosConversation] windowMaxViewportWidthPercent reduced to max of 100% of screen width.',
      );
      return 100;
    }

    if (windowMaxViewportWidthPercent < 50) {
      console.warn(
        '[EquosConversation] windowMaxViewportWidthPercent increased to min of 50%.',
      );
      return 50;
    }

    return Math.round(windowMaxViewportWidthPercent);
  }, [windowMaxViewportWidthPercent]);

  const styles = {
    '--equos-conversation-size': `${resolvedWindowSize}px`,
    '--equos-conversation-max-width': `${resolvedWindowMaxViewportWidthPercent}vw`,
  } as React.CSSProperties;

  return (
    <>
      <div className="equos equos-conversation" style={styles}>
        {session && (
          <div className="equos-conversation-room-container">
            <LiveKitRoom
              serverUrl={session.session.host.serverUrl}
              token={session.consumerAccessToken}
              audio={allowAudio}
              video={false}
              screen={false}
            >
              <EquosRoomRenderer
                allowAudio={allowAudio}
                allowVideo={false}
                allowScreenShare={false}
                session={session}
                onHangUp={onHangUp}
              />
            </LiveKitRoom>
          </div>
        )}

        <div className="equos-conversation-placeholder">
          <EquosLogo radius={8} size={48} animate={true} />
        </div>
      </div>
    </>
  );
}
