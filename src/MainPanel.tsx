import { useState } from "react";
import { createRoot } from "react-dom/client";
import { PanelExtensionContext } from "@foxglove/extension";
import { RackPanel } from "./RackPanel";
import { Camera3DPanel } from "./Camera_3DPanel";
import { AisleWarehousePanel } from "./AisleWarehousePanel"; // ✅ New import

function MainPanel({ context }: { context: PanelExtensionContext }) {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "rack" | "aisle"

  // Common ROS server link
  const ROS_SERVER_URL = "ws://192.168.0.162:9090";

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
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "0.6rem 1rem",
          backgroundColor: "#181818",
          borderBottom: "2px solid #333",
        }}
      >
        {tabButton("Camera Feed", "camera")}
        {tabButton("Rack", "rack")}
        {tabButton("Aisle View", "aisle")}
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
