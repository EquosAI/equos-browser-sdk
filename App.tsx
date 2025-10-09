import { initEquosBrowser } from './src/core/equos';
import { EquosLocale } from './src/core/utils/copy.utils';
import { EquosBubbleList, EquosPopup } from './src/react';

const equos = initEquosBrowser('pk_qA6Tf1I8ARfyfWMVuJFXgGmjOmejqFy', {
  endpoint: 'http://localhost:3001',
});

equos.setPreferredLanguage(EquosLocale.RU);

function App() {
  return (
    <>
      <div
        style={{ backgroundColor: 'white', height: '100vh', width: '100vw' }}
      >
        <EquosPopup alignX="right" alignY="bottom">
          <EquosBubbleList
            agents={[
              {
                agentId: 'cmggqeksr0029k10jl32pfbgb',
                avatarId: 'cmggqdjsy0027k10jfgy6y3mt',
                name: 'Antoine',
                thumbnailUrl:
                  'https://equos-staging-bucket.s3.fr-par.scw.cloud/organizations/cmf5opqel0001msbua2i7a8k1/avatars/avatar-tY6fMA.png',
              },
            ]}
            direction="row"
            dark={false}
            windowSizeInPixels={512}
            windowMaxViewportWidthPercent={90}
          />
        </EquosPopup>
      </div>
    </>
  );
}

export default App;
