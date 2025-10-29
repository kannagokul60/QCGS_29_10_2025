import React, { ReactElement, useEffect, useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { PanelExtensionContext } from "@foxglove/extension";
import * as ROSLIB from "roslib";
import {
  FaClipboardList,
  FaLock,
  FaUnlock,
  FaRocket,
  FaPlaneArrival,
  FaCompass,
} from "react-icons/fa";

// Common button style
const buttonStyle: React.CSSProperties = {
  padding: "10px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "0.2s ease-in-out",
};

const droneImg =
  "data:image/png;base64,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";

export function ExamplePanel({ context }: { context: PanelExtensionContext }): ReactElement {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [connected, setConnected] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [flightTime, setFlightTime] = useState(0); // in seconds
  const [rackLayout, setRackLayout] = useState<{ rows: number; cols: number }>({
    rows: 3,
    cols: 8,
  });
  const [selectedRack, setSelectedRack] = useState("Rack 1");
  const [racks, setRacks] = useState<Record<string, { rows: number; cols: number }>>({
    "Rack 1": { rows: 3, cols: 8 },
    "Rack 2": { rows: 5, cols: 10 },
  });

  // ---------------------- ROS CONNECTION --------------------------
  useEffect(() => {
    const rosConnection = new ROSLIB.Ros({
      url: "ws://192.168.0.162:9090", // change to your ROSBridge IP
    });

    rosConnection.on("connection", () => {
      console.log("Connected to ROSBridge");
      setConnected(true);
    });
    rosConnection.on("error", (error) => {
      console.error("ROSBridge Error:", error);
      setConnected(false);
    });
    rosConnection.on("close", () => {
      console.warn("ROSBridge connection closed");
      setConnected(false);
    });

    setRos(rosConnection);
    return () => rosConnection.close();
  }, []);

  // Foxglove panel lifecycle
  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => setRenderDone(() => done);
    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  // Flight timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFlying) {
      timer = setInterval(() => setFlightTime((t) => t + 1), 1000);
    } else {
      setFlightTime(0);
    }
    return () => clearInterval(timer);
  }, [isFlying]);

  useEffect(() => {
    if (!ros) return;

    const listener = new ROSLIB.Topic({
      ros,
      name: "/camera/rack_scan",
      messageType: "std_msgs/String",
    });

    listener.subscribe((msg) => {
      // Example: msg.data = "10x2" or "3x12"
      const [rows, cols] = msg.data.split("x").map(Number);
      if (!isNaN(rows) && !isNaN(cols)) {
        setRackLayout({ rows, cols });
        setRacks((prev) => ({
          ...prev,
          [selectedRack]: { rows, cols },
        }));
      }
    });

    return () => listener.unsubscribe();
  }, [ros, selectedRack]);

  // ---------------------- ROS SERVICES --------------------------
  const armService = ros
    ? new ROSLIB.Service({
        ros,
        name: "/mavros/cmd/arming",
        serviceType: "mavros_msgs/CommandBool",
      })
    : null;

  const takeoffService = ros
    ? new ROSLIB.Service({
        ros,
        name: "/mavros/cmd/takeoff",
        serviceType: "mavros_msgs/CommandTOL",
      })
    : null;

  const landService = ros
    ? new ROSLIB.Service({
        ros,
        name: "/mavros/cmd/land",
        serviceType: "mavros_msgs/CommandTOL",
      })
    : null;

    // ---------------------- TELEMETRY LISTENERS --------------------------
useEffect(() => {
  if (!ros) return;

  // Altitude from MAVROS
  const altitudeTopic = new ROSLIB.Topic({
    ros,
    name: "/mavros/altitude",
    messageType: "mavros_msgs/Altitude",
  });
  altitudeTopic.subscribe((msg) => {
    setAltitude(msg.relative ?? 0);
  });

  // Speed (computed from velocity)
  const velocityTopic = new ROSLIB.Topic({
    ros,
    name: "/mavros/local_position/velocity",
    messageType: "geometry_msgs/TwistStamped",
  });
  velocityTopic.subscribe((msg) => {
    const { x, y, z } = msg.twist.linear;
    const totalSpeed = Math.sqrt(x * x + y * y + z * z);
    setSpeed(totalSpeed);
  });

  return () => {
    altitudeTopic.unsubscribe();
    velocityTopic.unsubscribe();
  };
}, [ros]);


  const handleArmDisarmToggle = () => {
    if (!ros || !connected || !armService) return alert("ROS not connected!");

    const newState = !isArmed;
    const req = new ROSLIB.ServiceRequest({ value: newState });

    armService.callService(req, (res) => {
      if (res.success) {
        setIsArmed(newState);
        if (!newState) {
          setIsFlying(false);
          setSpeed(0);
          setAltitude(0);
        } else {
          setSpeed(5.5); // default starting speed when armed
        }
        alert(newState ? "Drone Armed" : "Drone Disarmed");
      } else {
        alert(newState ? "Failed to Arm" : "Failed to Disarm");
      }
    });
  };

  const handleTakeoff = () => {
    if (!ros || !connected || !takeoffService) return alert("ROS not connected!");
    if (!isArmed) return alert("Please arm the drone first!");

    const req = new ROSLIB.ServiceRequest({
      altitude: 10,
      latitude: 0,
      longitude: 0,
      min_pitch: 0,
      yaw: 0,
    });

    takeoffService.callService(req, (res) => {
      if (res.success) {
        setIsFlying(true);
        setAltitude(10); // example: target altitude
        alert("Drone Taking Off...");
      } else {
        alert("Takeoff Failed");
      }
    });
  };

  const handleLand = () => {
    if (!ros || !connected || !landService) return alert("ROS not connected!");
    if (!isFlying) return alert("Drone is not flying!");

    const req = new ROSLIB.ServiceRequest({
      altitude: 0,
      latitude: 0,
      longitude: 0,
      min_pitch: 0,
      yaw: 0,
    });

    landService.callService(req, (res) => {
      if (res.success) {
        alert("Drone Landing...");
        setIsFlying(false);
        setAltitude(0);
        setSpeed(5); // maybe taxiing speed
      } else {
        alert("Landing Failed");
      }
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ---------------------- UI --------------------------
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* ---------- Sidebar ---------- */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#ffffff",
          padding: "1.2rem",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "1rem",
          borderRadius: "0 12px 12px 0",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            marginBottom: "1rem",
            textAlign: "center",
            color: "#333 !important",
            letterSpacing: "1px",
          }}
        >
          QGCS
        </h2>

        {/* Rack Selector */}
        <select
          value={selectedRack}
          onChange={(e) => {
            const rackName = e.target.value;
            setSelectedRack(rackName);

            const rack = racks[rackName];
            if (rack) {
              setRackLayout(rack);
            }
          }}
          onClick={(e) => {
            // This ensures even clicking the same rack again updates layout
            const rackName = (e.target as HTMLSelectElement).value;
            const rack = racks[rackName];
            if (rack) {
              setRackLayout(rack);
            }
          }}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontWeight: 600,
            marginBottom: "1rem",
            cursor: "pointer",
          }}
        >
          {Object.keys(racks).map((rackName) => (
            <option key={rackName} value={rackName}>
              {rackName}
            </option>
          ))}
        </select>

        {/* ---------- Arm/Disarm Toggle ---------- */}
        <div
          style={{
            position: "relative",
            width: "150px",
            height: "50px",
            borderRadius: "12px",
            background: isArmed ? "#616161ff" : "#c0c0c0ff",
            cursor: "pointer",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            transition: "background 0.3s",
          }}
          onClick={handleArmDisarmToggle}
        >
          <span
            style={{
              flex: 1,
              textAlign: "left",
              paddingLeft: "10px",
              color: "#fff",
              fontWeight: 600,
              userSelect: "none",
            }}
          >
            Arm
          </span>
          <span
            style={{
              flex: 1,
              textAlign: "right",
              paddingRight: "10px",
              color: "#fff",
              fontWeight: 600,
              userSelect: "none",
            }}
          >
            Disarm
          </span>

          <div
            style={{
              position: "absolute",
              top: "5px",
              left: isArmed ? "80px" : "5px",
              width: "60px",
              height: "40px",
              borderRadius: "10px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "left 0.3s",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            {isArmed ? (
              <FaLock size={18} color="#616161ff" />
            ) : (
              <FaUnlock size={18} color="#c0c0c0ff" />
            )}
          </div>
        </div>

        {/* Takeoff */}
        <button
          onClick={handleTakeoff}
          disabled={!isArmed || isFlying}
          style={{
            ...buttonStyle,
            background: "#919191ff",
            boxShadow: "0 4px 10px rgba(39, 39, 39, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            padding: "10px 15px",
            borderRadius: "10px",
            opacity: !isArmed || isFlying ? 0.6 : 1,
          }}
        >
          <FaRocket size={18} />
          <span style={{ fontWeight: "600" }}>Take Off</span>
        </button>

        {/* Land */}
        <button
          onClick={handleLand}
          disabled={!isFlying}
          style={{
            ...buttonStyle,
            background: "#919191ff",
            boxShadow: "0 4px 10px rgba(39, 39, 39, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            padding: "10px 15px",
            borderRadius: "10px",
            opacity: !isFlying ? 0.6 : 1,
          }}
        >
          <FaPlaneArrival size={18} />
          <span style={{ fontWeight: "600" }}>Land</span>
        </button>

        {/* Flight Logs */}
        <button
          style={{
            ...buttonStyle,
            background: "#b8b8b8ff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "10px",
            padding: "10px 15px",
            borderRadius: "10px",
            marginTop: "0.8rem",
          }}
        >
          <FaClipboardList size={18} />
          <span style={{ fontWeight: "600" }}>Flight Logs</span>
        </button>
      </div>

      {/* ---------- Main Content ---------- */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        {/* --- Top Status Bar --- */}
        <div
          style={{
            backgroundColor: "#c5c5c5ff",
            borderRadius: "8px",
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={{ fontWeight: "600" }}>
            QGCS Live Status ({connected ? "Connected" : "Disconnected"})
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "14px" }}>
            <div>Altitude: {isFlying ? `${altitude.toFixed(1)} ft` : "—"}</div>
            <div>↕ Speed: {isArmed ? `${speed.toFixed(1)} mph` : "—"}</div>
            <div>⏱ Time: {isFlying ? formatTime(flightTime) : "00:00:00"}</div>

            <FaCompass size={20} />
          </div>
        </div>

        {/* --- Racks Grid --- */}
        <div style={{ backgroundColor: "#e5e5e5", padding: "1rem", borderRadius: "8px",  marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.8rem" }}>{selectedRack}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${rackLayout.cols}, 1fr)`,
              gap: "10px",
              justifyItems: "center",
            }}
          >
            {Array.from({ length: rackLayout.rows * rackLayout.cols }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: idx === 0 ? "#b0b0b0" : "#6c6c6c",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {idx === 0 && (
                  <img src={droneImg} alt="Drone" style={{ width: "40px", height: "40px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Scan Results Table --- */}
        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "1rem" }}>
          <h3 style={{ marginBottom: "0.8rem" }}>Scan Results</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "8px" }}>Rack_id</th>
                <th style={{ padding: "8px" }}>SKU</th>
                <th style={{ padding: "8px" }}>Counted_qty</th>
                <th style={{ padding: "8px" }}>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px" }}>—</td>
                <td style={{ padding: "8px" }}>—</td>
                <td style={{ padding: "8px" }}>—</td>
                <td style={{ padding: "8px" }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Initialize panel
export function initExamplePanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<ExamplePanel context={context} />);
  return () => root.unmount();
}
