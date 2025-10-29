import { useEffect, useState, useLayoutEffect} from "react";
import { createRoot } from "react-dom/client";
import { PanelExtensionContext } from "@foxglove/extension";
import * as ROSLIB from "roslib";

export function Camera3DPanel({ context }: { context: PanelExtensionContext }) {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [altitude, setAltitude] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [odometer, setOdometer] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);

  useEffect(() => {
    const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

    // Camera topic
    const cameraTopic = new ROSLIB.Topic({
      ros,
      name: "/camera/image_raw",
      messageType: "sensor_msgs/CompressedImage",
    });
    cameraTopic.subscribe((msg: any) => {
      setCameraImage(`data:image/jpeg;base64,${msg.data}`);
    });

    // Telemetry topic
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
      cameraTopic.unsubscribe();
      telemetryTopic.unsubscribe();
      ros.close();
    };
  }, []);

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
      {/* Left Side */}
      <div
        style={{
          flex: 1.2,
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid #333",
          padding: "0.5rem",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {cameraImage ? (
            <img
              src={cameraImage}
              alt="Camera Feed"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>Waiting for camera feed...</span>
          )}
        </div>

        <div
          style={{
            marginTop: "0.5rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "8px",
            padding: "0.8rem",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            textAlign: "center",
            color: "#fff",
            fontFamily: "monospace",
          }}
        >
          {/* --- Row 1: Labels --- */}
          <div>
            <strong>Altitude</strong>
          </div>
          <div>
            <strong>Heading</strong>
          </div>
          <div>
            <strong>Odometer</strong>
          </div>
          <div>
            <strong>Speed</strong>
          </div>

          {/* --- Row 2: Values --- */}
          <div style={{ marginTop: "0.3rem" }}>{altitude.toFixed(2)} m</div>
          <div style={{ marginTop: "0.3rem" }}>{heading.toFixed(1)} dmg</div>
          <div style={{ marginTop: "0.3rem" }}>{odometer.toFixed(1)} m</div>
          <div style={{ marginTop: "0.3rem" }}>{speed.toFixed(2)} m/s</div>
        </div>
      </div>

      {/* Right Side */}     
      <div
        style={{
          flex: 1.8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#181818",
          borderRadius: "8px",
          margin: "0.5rem",
        }}
      >
        <span style={{ color: "#aaa" }}>3D Map View</span>
      </div>
    </div>
  );
}

export function initCamera3DPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
root.render(<Camera3DPanel context={context} />);
  return () => root.unmount();
}
