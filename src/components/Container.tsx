import useGetSensorsValues from '../hooks/useGetSensorsValues';
import SensorDraw from './SensorDraw';

export default function Container() {
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
      <header>
        <h1>Radar Ultrassom — ESP32</h1>
        <div className="conn">
          <label>Endpoint SSE:</label>
          <input
            id="endpoint"
            type="text"
            placeholder="http://localhost:8182/stream"
            value={endpoint.value}
            onChange={(e) => endpoint.setValue(e.target.value)}
          />
          <button id="btnConnect" onClick={connect}>
            Conectar
          </button>
          <button id="btnDisconnect" className="ghost" onClick={disconnect}>
            Desconectar
          </button>
          <span id="status" className="status">
            {status}
          </span>
        </div>
      </header>
      <main>
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
      </main>
      <footer>
        <span>Funciona offline (PWA). Dados ao vivo via SSE.</span>
      </footer>
    </>
  );
}
