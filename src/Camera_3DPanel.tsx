import { useEffect, useState, useLayoutEffect } from "react";
import { PanelExtensionContext } from "@foxglove/extension";
import * as ROSLIB from "roslib";

interface Camera3DPanelProps {
  context: PanelExtensionContext;
  rosUrl: string; // URL passed from MainPanel
}

type CameraKey = "front" | "back" | "left" | "right" | "down";

const cameraNames: CameraKey[] = ["front", "back", "left", "right", "down"];

export function Camera3DPanel({ context, rosUrl }: Camera3DPanelProps) {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

 const [cameraFeeds, setCameraFeeds] = useState<Record<CameraKey, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    down: null,
  });

  const [selectedCamera, setSelectedCamera] = useState<CameraKey>("front");

  // Telemetry states
  const [altitude, setAltitude] = useState(0);
  const [heading, setHeading] = useState(0);
  const [odometer, setOdometer] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    if (!rosUrl) return;

    console.log("🔗 Connecting to ROS:", rosUrl);
    const ros = new ROSLIB.Ros({ url: rosUrl });

    ros.on("connection", () => console.log("✅ Connected to ROS at", rosUrl));
    ros.on("error", (err) => console.error("❌ ROS connection error:", err));
    ros.on("close", () => console.warn("⚠️ ROS connection closed"));

    const cameraTopics = [
      { key: "front", name: "/camera_front/camera_front/color/image_raw" },
      { key: "back", name: "/camera_back/camera_back/color/image_raw" },
      { key: "left", name: "/camera_left/camera_left/color/image_raw" },
      { key: "right", name: "/camera_right/camera_right/color/image_raw" },
      { key: "down", name: "/camera_down/camera_down/color/image_raw" },
    ];

    const topics = cameraTopics.map((t) => {
      const topic = new ROSLIB.Topic({
        ros,
        name: t.name,
        messageType: "sensor_msgs/CompressedImage",
      });
      topic.subscribe((msg: any) => {
        setCameraFeeds((prev) => ({
          ...prev,
          [t.key]: `data:image/jpeg;base64,${msg.data}`,
        }));
      });
      return topic;
    });

    const telemetryTopic = new ROSLIB.Topic({
      ros,
      name: "/drone/telemetry",
      messageType: "std_msgs/Float32MultiArray",
    });

    telemetryTopic.subscribe((msg: any) => {
      setAltitude(msg.data[0]);
      setHeading(msg.data[1]);
      setOdometer(msg.data[2]);
      setSpeed(msg.data[3]);
    });

    return () => {
      console.log("🧹 Cleaning up ROS connections");
      topics.forEach((t) => t.unsubscribe());
      telemetryTopic.unsubscribe();
      ros.close();
    };
  }, [rosUrl]);

  // Foxglove sync
  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => setRenderDone(() => done);
    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);


return (
  <div
    style={{
      display: "flex",
      height: "100%",
      width: "100%",
      backgroundColor: "#101010",
      color: "#fff",
      fontFamily: "sans-serif",
    }}
  >
    {/* Left Section: Thumbnails and Main Camera */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRight: "2px solid #333",
        padding: "0.5rem",
      }}
    >
      {/* Thumbnail Grid (Bigger Squares) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.6rem",
          marginBottom: "0.8rem",
        }}
      >
        {cameraNames.map((name) => (
          <div
            key={name}
            onClick={() => setSelectedCamera(name as CameraKey)}
            style={{
              backgroundColor: selectedCamera === name ? "#333" : "#000",
              border:
                selectedCamera === name
                  ? "2px solid #00adee"
                  : "1px solid #222",
              borderRadius: "8px",
              cursor: "pointer",
              overflow: "hidden",
              aspectRatio: "1 / 1", // Makes them square
              position: "relative",
            }}
          >
            {cameraFeeds[name as CameraKey] ? (
              <img
                src={cameraFeeds[name as CameraKey]!}
                alt={`${name} feed`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: selectedCamera === name ? 0.8 : 1,
                }}
              />
            ) : (
              <span
                style={{
                  color: "#666",
                  fontSize: "0.8rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {name.toUpperCase()}
              </span>
            )}
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "4px",
                background: "#000a",
                color: "#fff",
                padding: "1px 4px",
                 paddingTop:"3px",
                fontSize: "0.75rem",
                borderRadius: "3px",
              }}
            >
              {name.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Large Selected Camera View */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#000",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {cameraFeeds[selectedCamera] ? (
          <img
            src={cameraFeeds[selectedCamera]!}
            alt={`${selectedCamera} view`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#888" }}>
            Waiting for {selectedCamera} feed...
          </span>
        )}
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "10px",
            background: "#000a",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          {selectedCamera.toUpperCase()} VIEW
        </div>
      </div>
    </div>

    {/* Right Section: 3D Map + Telemetry Below */}
    <div
      style={{
        flex: 1.5,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#181818",
        borderRadius: "8px",
        margin: "0.5rem",
        padding: "0.8rem",
      }}
    >
      {/* 3D Map View */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111",
          borderRadius: "8px",
          marginBottom: "0.8rem",
        }}
      >
        <span style={{ color: "#aaa", fontSize: "1rem" }}>3D Map View</span>
      </div>

      {/* Telemetry (Now Below the 3D Map) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          textAlign: "center",
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          padding: "0.8rem",
          fontSize: "0.9rem",
        }}
      >
        <div><strong>Altitude</strong></div>
        <div><strong>Heading</strong></div>
        <div><strong>Odometer</strong></div>
        <div><strong>Speed</strong></div>

        <div style={{ marginTop: "0.3rem" }}>{altitude.toFixed(2)} m</div>
        <div style={{ marginTop: "0.3rem" }}>{heading.toFixed(1)} dmg</div>
        <div style={{ marginTop: "0.3rem" }}>{odometer.toFixed(1)} m</div>
        <div style={{ marginTop: "0.3rem" }}>{speed.toFixed(2)} m/s</div>
      </div>
    </div>
  </div>
);

}
