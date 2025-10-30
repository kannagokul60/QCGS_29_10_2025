import { useState } from "react";
import { createRoot } from "react-dom/client";
import { PanelExtensionContext } from "@foxglove/extension";
import { RackPanel } from "./RackPanel";
import { Camera3DPanel } from "./Camera_3DPanel";

function MainPanel({ context }: { context: PanelExtensionContext }) {
  const [activeTab, setActiveTab] = useState("camera"); // "rack" or "camera"

  // Common ROS server link (EDIT HERE)
  const ROS_SERVER_URL = "ws://192.168.0.162:9090";

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
        <button
          onClick={() => setActiveTab("camera")}
          style={{
            backgroundColor: activeTab === "camera" ? "#747474ff" : "#3f3f3fff",
            border: "none",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          Camera Feed
        </button>

        <button
          onClick={() => setActiveTab("rack")}
          style={{
            backgroundColor: activeTab === "rack" ? "#747474ff" : "#3f3f3fff",
            border: "none",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Rack
        </button>
      </div>

      {/* ---------- PANEL CONTENT ---------- */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "rack" ? (
          <RackPanel context={context} rosUrl={ROS_SERVER_URL} />
        ) : (
          <Camera3DPanel context={context} rosUrl={ROS_SERVER_URL} />
        )}
      </div>
    </div>
  );
}

export function initMainPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<MainPanel context={context} />);
  return () => root.unmount();
}
