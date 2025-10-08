import { CreateEquosBrowserSessionResponse } from '../../core/types/session.types';

import { LiveKitRoom } from '@livekit/components-react';

import EquosRoomRenderer from './equos-room-renderer';
import EquosPoweredBy from './equos-powered-by';

import '@livekit/components-styles';
import '../styles/reset.css';
import '../styles/base.css';
import '../styles/conversation.css';

export default function EquosConversation({
  allowAudio = true,
  allowVideo = false,
  allowScreenShare = false,
  session,
}: {
  allowAudio?: boolean;
  allowVideo?: boolean;
  allowScreenShare?: boolean;
  session: CreateEquosBrowserSessionResponse;
}) {
  return (
    <>
      <div className="equos-conversation">
        <LiveKitRoom
          serverUrl={session.session.host.serverUrl}
          token={session.consumerAccessToken}
          audio={allowAudio}
          video={allowVideo}
          screen={allowScreenShare}
        >
          <EquosRoomRenderer
            allowAudio={allowAudio}
            allowVideo={allowVideo}
            allowScreenShare={allowScreenShare}
            session={session}
          />
        </LiveKitRoom>
      </div>
      <EquosPoweredBy />
    </>
  );
}
