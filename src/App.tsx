import { useEffect, useState } from "react";
import {
  Activity, CloudRain, LayoutDashboard, Map, Waves,
  Cpu, Settings, Bell, Droplets, AlertTriangle,
  Zap, Gauge,
} from "lucide-react";
import CityScene from "./CityScene";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [rainfall, setRainfall] = useState(45);
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([
  "HYDROSHIELD AI monitoring system initialized."
]); 
  // DYNAMIC FLOOD MONITORING VALUES
  const waterLevel = (rainfall / 200) * 2.5;

  const floodRisk =
  rainfall <= 30 ? "LOW" :
  rainfall <= 80 ? "MODERATE" :
  rainfall <= 140 ? "HIGH" :
  "SEVERE";

  // DEMONSTRATION FORECAST
const forecast30Min = Math.min(200, rainfall * 1.15);
const forecast60Min = Math.min(200, rainfall * 1.30);

const predictedWaterLevel30 =
  (forecast30Min / 200) * 2.5;

const predictedWaterLevel60 =
  (forecast60Min / 200) * 2.5;
const predictedRisk =
  forecast60Min <= 30 ? "LOW" :
  forecast60Min <= 80 ? "MODERATE" :
  forecast60Min <= 140 ? "HIGH" :
  "SEVERE";


const warningMessage =
  predictedRisk === "LOW"
    ? "No immediate flood warning"
    : predictedRisk === "MODERATE"
    ? "Monitor drainage conditions"
    : predictedRisk === "HIGH"
    ? "Flood warning: Prepare drainage systems"
    : "Critical warning: Immediate response required";

// EMERGENCY FLOOD ALERT
const emergencyAlert = predictedRisk === "SEVERE";

const emergencyMessage = emergencyAlert
  ? "🚨 EMERGENCY: Critical flood risk detected! Activate emergency response immediately."
  : "No emergency alert. Monitoring flood conditions.";

// SIMULATED SMART DRAINAGE CONTROL
const pumpStatus =
  predictedRisk === "HIGH" || predictedRisk === "SEVERE"
    ? "ACTIVE"
    : "STANDBY";

const pumpPower =
  pumpStatus === "ACTIVE"
    ? Math.min(100, Math.round(forecast60Min / 2))
    : 0;

    // SIMULATED AUTOMATIC DRAINAGE GATE
const gateOpening =
  predictedRisk === "SEVERE" ? 100 :
  predictedRisk === "HIGH" ? 75 :
  predictedRisk === "MODERATE" ? 40 :
  15;


const drainageStatus =
  gateOpening >= 75 ? "FULLY OPEN" :
  gateOpening >= 40 ? "PARTIALLY OPEN" :
  "MINIMALLY OPEN";

// LIVE SYSTEM EVENT
const currentEvent =
  predictedRisk === "SEVERE"
    ? "🚨 Critical flood warning activated"
    : predictedRisk === "HIGH"
    ? "⚠️ High flood risk detected"
    : predictedRisk === "MODERATE"
    ? "🌧️ Moderate rainfall detected"
    : "✅ Normal monitoring conditions";

  
  // AUTOMATIC EVENT LOGGER
useEffect(() => {
  setEventLog((previous) => [
    `${new Date().toLocaleTimeString()} — ${currentEvent}`,
    ...previous,
  ].slice(0, 8));
}, [currentEvent]);

const virtualSensors = Array.from({ length: 12 }, (_, index) => {
  const zones = ["North", "South", "East", "West"];

  const variation = ((index % 5) - 2) * 0.04;

  return {
    id: `SN-${String(index + 1).padStart(2, "0")}`,
    zone: zones[index % 4],
    rainfall: Math.max(0, rainfall + (index % 5 - 2) * 3),
    waterLevel: Math.max(0, waterLevel + variation),
    status: "ONLINE",
  };
});

const selectedSensorData =
  selectedSensor !== null
    ? virtualSensors[selectedSensor]
    : null;

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "3D City Twin", icon: Map },
    { name: "Sensor Network", icon: Cpu },
    { name: "Flood Simulation", icon: Waves },
    { name: "AI Prediction", icon: Activity },
    { name: "Automation", icon: Zap },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Droplets size={25} /></div>
          <div>
            <h2>HYDROSHIELD</h2>
            <span>AI DIGITAL TWIN</span>
          </div>
        </div>

        <div className="nav-label">MAIN MENU</div>
        {navigation.map(({ name, icon: Icon }) => (
  <button
    key={name}
    className={`nav-item ${activeTab === name ? "active" : ""}`}
    onClick={() => setActiveTab(name)}
    title={name}
  >
    <Icon size={18} />
    <span className="nav-label">{name}</span>
  </button>
))}

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            SYSTEM ONLINE
            <small>Digital simulation mode</small>
          </div>
          <p>HYDROSHIELD AI · v0.1</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">HYDROSHIELD / </span>
            <strong>{activeTab}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-tag">● SIMULATION MODE</span>
            <button className="icon-button"><Bell size={19} /></button>
            <div className="avatar">HS</div>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <p className="eyebrow">INTELLIGENT FLOOD MANAGEMENT SYSTEM</p>
              <h1>{activeTab === "Overview" ? "City Monitoring Centre" : activeTab}</h1>
              <p className="subtitle">
                Monitor, simulate and predict urban flooding through a connected digital twin.
              </p>
            </div>
            <div className="live-indicator">
              <span className="status-dot" /> DIGITAL TWIN ACTIVE
            </div>
          </div>

          <div className="metrics">
            <Metric icon={<CloudRain />} title="Rainfall" value={`${rainfall} mm/hr`} note="Simulated input" />
            <Metric
  icon={<Droplets />}
  title="Water Level"
  value={`${waterLevel.toFixed(2)} m`}
  note="Simulated water level"
/>
            <Metric
  icon={<Activity />}
  title="Flood Risk"
  value={floodRisk}
  note="Dynamic risk assessment"
/>
            <Metric icon={<Cpu />} title="Virtual Sensors" value="12 / 12" note="All devices simulated" />
          </div>

          <div className="workspace">
            <section className="city-panel">
              <div className="panel-heading">
                <div>
                  <h3>3D CITY DIGITAL TWIN</h3>
                  <p>Urban environment visualization</p>
                </div>
                <span className="view-tag">3D VIEW · COMING NEXT</span>
              </div>

              <div className="city-3d">
                <CityScene
  rainfall={rainfall}
  onSelectSensor={setSelectedSensor}
  selectedSensor={selectedSensor}
/> 
</div>
            </section>

            <section className="control-panel">
              <div className="panel-heading">
                <div>
                  <h3>ENVIRONMENT CONTROL</h3>
                  <p>Change simulation conditions</p>
                </div>
                <Settings size={18} />
              </div>

              <label className="control-label">
                Rainfall intensity
                <strong>{rainfall} mm/hr</strong>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>0 mm/hr</span><span>200 mm/hr</span>
              </div>

              <div className="scenario-list">
                <h4>QUICK SCENARIOS</h4>
                <button onClick={() => setRainfall(10)}>☀️ Normal weather</button>
                <button onClick={() => setRainfall(45)}>🌧️ Moderate rain</button>
                <button onClick={() => setRainfall(100)}>⛈️ Heavy rainfall</button>
                <button onClick={() => setRainfall(180)}>🌊 Extreme rainfall</button>
              </div>

              <div className="notice">
                <AlertTriangle size={17} />
                <span>All readings are illustrative demo values, not real sensor measurements.</span>
              </div>
              <div className="notice">
  <AlertTriangle size={20} />
  <div>
    <strong>FLOOD EARLY-WARNING SYSTEM</strong>
    <p>{predictedRisk} RISK</p>
    <span>{warningMessage}</span>
  </div>
</div>
{emergencyAlert && (
  <div className="emergency-alert">
    <AlertTriangle size={24} />
    <div>
      <h3>EMERGENCY FLOOD ALERT</h3>
      <p>{emergencyMessage}</p>
    </div>
  </div>
)}
<div className="metric-card" style={{ marginTop: "20px", padding: "24px" }}>
  <h3>RAINFALL FORECAST TREND</h3>
  <p>Projected rainfall intensity</p>

  <div style={{ marginTop: "24px" }}>
    <div className="sensor-reading">
      <span>Current</span>
      <strong>{rainfall} mm/hr</strong>
    </div>
    <div style={{ height: "12px", background: "#1e293b", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ width: `${rainfall / 200 * 100}%`, height: "100%", background: "#38bdf8", borderRadius: "10px" }} />
    </div>
  </div>

  <div style={{ marginTop: "20px" }}>
    <div className="sensor-reading">
      <span>Next 30 minutes</span>
      <strong>{forecast30Min.toFixed(1)} mm/hr</strong>
    </div>
    <div style={{ height: "12px", background: "#1e293b", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ width: `${forecast30Min / 200 * 100}%`, height: "100%", background: "#eab308", borderRadius: "10px" }} />
    </div>
  </div>

  <div style={{ marginTop: "20px" }}>
    <div className="sensor-reading">
      <span>Next 60 minutes</span>
      <strong>{forecast60Min.toFixed(1)} mm/hr</strong>
    </div>
    <div style={{ height: "12px", background: "#1e293b", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ width: `${forecast60Min / 200 * 100}%`, height: "100%", background: "#ef4444", borderRadius: "10px" }} />
    </div>
  </div>
</div>

            </section>
          </div>

{selectedSensorData && (
  <section className="sensor-section">
    <div className="panel-heading">
      <div>
        <h3>SELECTED SENSOR DETAILS</h3>
        <p>3D City Twin sensor inspection</p>
      </div>
      <button onClick={() => setSelectedSensor(null)}>
        Close
      </button>
    </div>

    <div className="metric-card sensor-card">
      <div className="metric-icon">
        <Cpu size={22} />
      </div>

      <p>{selectedSensorData.id}</p>
      <h2>{selectedSensorData.zone} Zone</h2>

      <div className="sensor-reading">
        <span>Rainfall</span>
        <strong>{selectedSensorData.rainfall.toFixed(1)} mm/hr</strong>
      </div>

      <div className="sensor-reading">
        <span>Water Level</span>
        <strong>{selectedSensorData.waterLevel.toFixed(2)} m</strong>
      </div>

      <span className="sensor-status">
        ● {selectedSensorData.status}
      </span>
    </div>
  </section>
)}

{activeTab === "AI Prediction" && (
  <section className="sensor-section">
    <div className="panel-heading">
      <div>
        <h3>HYDROSHIELD FLOOD FORECAST</h3>
        <p>Simulated future rainfall and water-level outlook</p>
      </div>
      <span className="view-tag">FORECAST ACTIVE</span>
    </div>
 <div className="sensor-grid">
      <div className="metric-card sensor-card">
  <div className="metric-icon">
    <Waves size={22} />
  </div>
  <p>DRAINAGE GATE</p>
  <h2>{drainageStatus}</h2>
  <span>{gateOpening}% open</span>
</div>
      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <CloudRain size={22} />
        </div>
        <p>30-MIN FORECAST</p>
        <h2>{forecast30Min.toFixed(1)} mm/hr</h2>
        <span>Predicted rainfall</span>
      </div>

      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <CloudRain size={22} />
        </div>
        <p>60-MIN FORECAST</p>
        <h2>{forecast60Min.toFixed(1)} mm/hr</h2>
        <span>Predicted rainfall</span>
      </div>

      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <Waves size={22} />
        </div>
        <p>30-MIN WATER LEVEL</p>
        <h2>{predictedWaterLevel30.toFixed(2)} m</h2>
        <span>Estimated level</span>
      </div>

      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <Waves size={22} />
        </div>
        <p>60-MIN WATER LEVEL</p>
        <h2>{predictedWaterLevel60.toFixed(2)} m</h2>
        <span>Estimated level</span>
      </div>
    </div>

    <div className="notice">
      <AlertTriangle size={17} />
      <span>
        Demonstration forecast using illustrative mathematical projections.
        A trained AI prediction model is not connected yet.
      </span>
    </div>
  </section>
)}

{activeTab === "Automation" && (
  <section className="sensor-section">
    <div className="panel-heading">
      <div>
        <h3>SMART DRAINAGE CONTROL CENTRE</h3>
        <p>Automatic floodwater management simulation</p>
      </div>
      <span className="view-tag">AUTOMATION ACTIVE</span>
    </div>

    <div className="sensor-grid">
      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <Waves size={22} />
        </div>
        <p>DRAINAGE PUMP</p>
        <h2>{pumpStatus}</h2>
        <span>Automatic pump control</span>
      </div>

      <div className="metric-card sensor-card">
        <div className="metric-icon">
          <Gauge size={22} />
        </div>
        <p>PUMP POWER</p>
        <h2>{pumpPower}%</h2>
        <span>Simulated operating power</span>
      </div>
    </div>

    <div className="notice">
      <Zap size={18} />
      <span>
        {pumpStatus === "ACTIVE"
          ? "High flood risk detected. Drainage pump activated automatically."
          : "Flood risk is currently manageable. Drainage pump is on standby."}
      </span>
    </div>
    <div className="sensor-section">
  <div className="panel-heading">
    <div>
      <h3>LIVE SYSTEM EVENT LOG</h3>
      <p>Recent HYDROSHIELD AI activities</p>
    </div>
    <span className="view-tag">LIVE</span>
  </div>

  <div className="event-log">
    {eventLog.map((event, index) => (
      <div className="event-log-item" key={index}>
        <span className="event-dot"></span>
        <p>{event}</p>
      </div>
    ))}
  </div>
</div>
  </section>
)}

          <div className="bottom-grid">
            <div className="info-card">
              <Activity size={20} />
              <div><strong>AI MONITORING</strong><p>Prediction engine not connected yet</p></div>
              <span className="pending">PENDING</span>
            </div>
            <div className="info-card">
              <Zap size={20} />
              <div><strong>SMART DRAINAGE</strong><p>Virtual pump and gate controls coming next</p></div>
              <span className="pending">PENDING</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ icon, title, value, note }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
      <span>{note}</span>
    </div>
  );
}

export default App;