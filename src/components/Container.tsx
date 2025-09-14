import {AppShell, Button, Drawer, Group, TextInput} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import useGetSensorsValues from '../hooks/useGetSensorsValues';
import SensorDraw from './SensorDraw';

export default function Container() {
  const [opened, {open, close}] = useDisclosure();

  const {
    endpoint,
    status,
    connect,
    disconnect,
    sensorNodes,
    buildSemiRingFrontBack,
    buildSemiRingRearBack,
  } = useGetSensorsValues();

  return (
    <>
      <AppShell
        header={{height: 60}}
        navbar={{width: 300, breakpoint: 'sm', collapsed: {desktop: true, mobile: !opened}}}
        padding="md"
      >
        <AppShell.Header>
          <Group justify="space-between" style={{flex: 1, padding: '0.5rem', height: '100%'}}>
            Radar Ultrassom — ESP32
            <Button onClick={open}>Open Drawer</Button>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <section className="canvas-wrap">
            <div className="wrap">
              <SensorDraw
                sensorNodes={sensorNodes}
                buildSemiRingFrontBack={buildSemiRingFrontBack}
                buildSemiRingRearBack={buildSemiRingRearBack}
              />
            </div>
            <div className="legend">
              <span className="dot longe"></span>
              <span>Longe (&gt; 60cm)</span>
              <span className="dot medio"></span>
              <span>Médio (35–60cm)</span>
              <span className="dot perto"></span>
              <span>Perto (20–35cm)</span>
              <span className="dot muito-perto"></span>
              <span>Muito perto (&le; 20cm)</span>
            </div>
          </section>
          <section className="panels">
            <div className="panel">
              <h3>Frente</h3>
              <div className="vals" id="frontVals">
                {sensorNodes.frontSectors.map((node, index) => (
                  <div className="tile" key={index}>
                    <div className="cm" style={{color: node.path.fill}}>
                      {node.distance ?? '—'}
                    </div>
                    <div className="lbl">S{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h3>Traseira</h3>
              <div className="vals" id="rearVals">
                {sensorNodes.rearSectors.map((node, index) => (
                  <div className="tile" key={index}>
                    <div className="cm" style={{color: node.path.fill}}>
                      {node.distance ?? '—'}
                    </div>
                    <div className="lbl">S{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AppShell.Main>
        <AppShell.Footer>
          <span>Funciona offline (PWA). Dados ao vivo via SSE.</span>
        </AppShell.Footer>
      </AppShell>

      <Drawer
        opened={opened}
        onClose={close}
        title="Authentication"
        position="right"
        overlayProps={{center: true}}
        withinPortal={false}
      >
        <TextInput
          id="endpoint"
          type="text"
          placeholder="http://localhost:8182/stream"
          value={endpoint.value}
          onChange={(e) => endpoint.setValue(e.target.value)}
        />
        <Button id="btnConnect" onClick={connect}>
          Conectar
        </Button>
        <Button id="btnDisconnect" className="ghost" onClick={disconnect}>
          Desconectar
        </Button>
        <span id="status" className="status">
          {status}
        </span>
      </Drawer>
    </>
  );
}
