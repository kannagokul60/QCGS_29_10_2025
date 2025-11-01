import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PanelExtensionContext } from "@foxglove/extension";
import { RackPanel } from "./RackPanel";
import { Camera3DPanel } from "./Camera_3DPanel";
import { AisleWarehousePanel } from "./AisleWarehousePanel";
import ROSLIB from "roslib";
import { FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty } from "react-icons/fa";

function MainPanel({ context }: { context: PanelExtensionContext }) {
  const [activeTab, setActiveTab] = useState("camera");
  const [battery, setBattery] = useState<number>(0);
  const [connected, setConnected] = useState(false);

  const ROS_SERVER_URL = "ws://192.168.0.162:9090";

  useEffect(() => {
    const ros = new ROSLIB.Ros({ url: ROS_SERVER_URL });

    ros.on("connection", () => {
      console.log("Connected to ROS");
      setConnected(true);
    });

    ros.on("close", () => {
      console.log("Disconnected from ROS");
      setConnected(false);
      setBattery(0);
    });

    //Subscribe to battery topic
    const batteryListener = new ROSLIB.Topic({
      ros,
      name: "/mavros/battery", // change to your topic if needed
      messageType: "sensor_msgs/BatteryState",
    });

    batteryListener.subscribe((msg) => {
      if (msg.percentage !== undefined) {
        setBattery(Math.round(msg.percentage * 100)); // convert 0–1 → %
      }
    });

    return () => {
      batteryListener.unsubscribe();
      ros.close();
    };
  }, []);

  const tabButton = (label: string, key: string) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        backgroundColor: activeTab === key ? "#747474ff" : "#3f3f3fff",
        border: "none",
        color: "#fff",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        cursor: "pointer",
        marginRight: "0.5rem",
        transition: "background 0.2s ease",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#101010",
        fontFamily: "sans-serif",
      }}
    >
      {/* ---------- NAVBAR ---------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 1rem",
          backgroundColor: "#181818",
          borderBottom: "2px solid #333",
        }}
      >
        <div>
          {tabButton("Camera Feed", "camera")}
          {tabButton("Rack", "rack")}
          {tabButton("Aisle View", "aisle")}
        </div>

        {/* Battery Status */}
        <div
          style={{
            backgroundColor: "#2b2b2b",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            border: "1px solid #444",
            minWidth: "140px",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ color: "#aaa", fontSize: "15px" }}>Battery:</span>

          {/* Battery Icon + Percentage */}
          {(() => {
            let BatteryIcon = FaBatteryEmpty;
            if (connected && battery > 75) BatteryIcon = FaBatteryFull;
            else if (connected && battery > 40) BatteryIcon = FaBatteryHalf;
            else if (connected && battery > 15) BatteryIcon = FaBatteryQuarter;
            else BatteryIcon = FaBatteryEmpty;

            const iconColor = connected ? (battery > 30 ? "#4caf50" : "#f8c756ff") : "#ff5252";

            return (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BatteryIcon size={20} color={iconColor} />
                <span
                  style={{
                    color: iconColor,
                    fontWeight: 600,
                    fontSize: "11px",
                  }}
                >
                  {connected ? (
                    `${battery}%`
                  ) : (
                    <span
                      title="Drone is not connected"
                      style={{ cursor: "pointer", fontSize: "15px" }}
                    >
                      !%
                    </span>
                  )}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ---------- PANEL CONTENT ---------- */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "rack" && <RackPanel context={context} rosUrl={ROS_SERVER_URL} />}
        {activeTab === "camera" && <Camera3DPanel context={context} rosUrl={ROS_SERVER_URL} />}
        {activeTab === "aisle" && <AisleWarehousePanel context={context} rosUrl={ROS_SERVER_URL} />}
      </div>
    </div>
  );
}

export function initMainPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<MainPanel context={context} />);
  return () => root.unmount();
}
