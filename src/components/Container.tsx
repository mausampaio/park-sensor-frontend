import {
  AppShell,
  Box,
  Button,
  Drawer,
  Grid,
  Group,
  Stack,
  TextInput,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import useGetSensorsValues from '../hooks/useGetSensorsValues';
import DotLegend from './DotLegend';
import SensorDraw from './SensorDraw';

export default function Container() {
  const [opened, {open, close}] = useDisclosure();
  const {toggleColorScheme} = useMantineColorScheme();
  const theme = useMantineTheme();

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
      <AppShell header={{height: 70}} footer={{height: 60}}>
        <AppShell.Header>
          <Group justify="space-between" p="md" h="100%" flex={1}>
            Radar Ultrassom — ESP32
            <Button onClick={open}>Configurações</Button>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <Grid p="md">
            <Grid.Col span={8}></Grid.Col>
            <Grid.Col span={4}>
              <Grid>
                <Grid.Col span={12}>
                  <SensorDraw
                    sensorNodes={sensorNodes}
                    buildSemiRingFrontBack={buildSemiRingFrontBack}
                    buildSemiRingRearBack={buildSemiRingRearBack}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <DotLegend label="Longe (&gt; 60cm)" bgColor={theme.colors.green[5]} />
                    <DotLegend label="Médio (35–60cm)" bgColor={theme.colors.yellow[5]} />
                    <DotLegend label="Perto (20–35cm)" bgColor={theme.colors.orange[5]} />
                    <DotLegend label="Muito perto (&le; 20cm)" bgColor={theme.colors.red[5]} />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12}>
                  <h3>Frente</h3>
                  <Box>
                    {sensorNodes.frontSectors.map((node, index) => (
                      <div className="tile" key={index}>
                        <div className="cm" style={{color: node.path.fill}}>
                          {node.distance ?? '—'}
                        </div>
                        <div className="lbl">S{index + 1}</div>
                      </div>
                    ))}
                  </Box>
                </Grid.Col>
                <Grid.Col span={12}>
                  <h3>Traseira</h3>
                  <Box>
                    {sensorNodes.rearSectors.map((node, index) => (
                      <div className="tile" key={index}>
                        <div className="cm" style={{color: node.path.fill}}>
                          {node.distance ?? '—'}
                        </div>
                        <div className="lbl">S{index + 1}</div>
                      </div>
                    ))}
                  </Box>
                </Grid.Col>
              </Grid>
            </Grid.Col>
          </Grid>
        </AppShell.Main>
        <AppShell.Footer p="md">
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
        <Button onClick={toggleColorScheme}>Trocar Tema</Button>
      </Drawer>
    </>
  );
}
