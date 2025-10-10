import { useEffect, useRef } from 'react';
import { initEquosBrowser } from './src/core/equos';
import { EquosLocale } from './src/core/utils/copy.utils';
import {
  EquosBubbleList,
  EquosPlaceholderTrigger,
  EquosPopup,
} from './src/react';
import { EquosBrowserEvent } from './src/core/types/equos.types';

const equos = initEquosBrowser('');

equos.setPreferredLanguage(EquosLocale.EN);

function App() {
  useEffect(() => {
    equos.on(EquosBrowserEvent.started, (event: Event) => {
      console.log(event);
      console.log((event as CustomEvent).detail);
    });

    equos.on(EquosBrowserEvent.ended, (event: Event) => {
      console.log(event);
      console.log((event as CustomEvent).detail);
    });
  }, []);

  const agent = useRef({
    agentId: '',
    avatarId: '',
    name: 'Agent',
    thumbnailUrl: '',
  });
  const agents = useRef([agent.current, agent.current]);

  const dark = false;
  const modal = true;
  const ghost = false;
  const size = 512;

  const direction = 'row';

  const overrideWidth = 1024;
  const overrideHeight = 600;

  const alignX = 'right';
  const alignY = 'bottom';

  return (
    <>
      <div
        style={{
          backgroundColor: 'white',
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            height: `${overrideHeight || size}px`,
            width: `${overrideWidth || size}px`,
          }}
        >
          <EquosPlaceholderTrigger
            agent={agent.current}
            dark={dark}
            modal={modal}
            ghost={ghost}
          />
        </div>
      </div>

      <EquosPopup alignX={alignX} alignY={alignY}>
        <EquosBubbleList
          agents={agents.current}
          alignX={alignX}
          windowSizeInPixels={size}
          direction={direction}
          dark={dark}
        />
      </EquosPopup>
    </>
  );
}

export default App;
