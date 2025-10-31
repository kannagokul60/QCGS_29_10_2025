import { useEffect, useState, useLayoutEffect } from "react";
import { PanelExtensionContext } from "@foxglove/extension";
import * as ROSLIB from "roslib";
import { FaLock, FaUnlock } from "react-icons/fa";

interface Camera3DPanelProps {
  context: PanelExtensionContext;
  rosUrl: string;
}
const takeOff =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjM3NzYgMC42MTIxMzdDMjQuMjA3NSAxLjQ0MjM5IDI0LjIwNzUgMi43NzkyNCAyMy4zNzc2IDMuNTk1NDNMMTcuOTA1OSA5LjA2OTQ4TDIwLjg4NzkgMjIuMDAxOEwxOC45MDQ2IDI0TDEzLjQ0NyAxMy41NDQ0TDcuOTYxMzIgMTkuMDMyNUw4LjQ2NzY5IDIyLjUwODRMNi45NjI2NCAyNEw0LjQ4NzAzIDE5LjUyNTFMMCAxNy4wMzQzTDEuNDkwOTkgMTUuNTE0NUw1LjAwNzQ3IDE2LjAzNTJMMTAuNDUxIDEwLjU4OTNMMCA1LjA4NzA3TDEuOTk3MzYgMy4xMDI5TDE0LjkyNCA2LjA4NjE5TDIwLjM5NTYgMC42MTIxMzdDMjEuMTgzMyAtMC4yMDQwNDYgMjIuNTg5OSAtMC4yMDQwNDYgMjMuMzc3NiAwLjYxMjEzN1oiIGZpbGw9IiNFNkU2RTYiLz4KPC9zdmc+Cg==";

const land = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjM4NzkgMjMuMzc3NkMyMi41NTc2IDI0LjIwNzUgMjEuMjIwOCAyNC4yMDc1IDIwLjQwNDYgMjMuMzc3NkwxNC45MzA1IDE3LjkwNTlMMS45OTgyNCAyMC44ODc5TDYuMjAxOTFlLTA3IDE4LjkwNDZMMTAuNDU1NiAxMy40NDdMNC45Njc0NiA3Ljk2MTMyTDEuNDkxNjUgOC40Njc2OUw2LjIwMTkxZS0wNyA2Ljk2MjY0TDQuNDc0OTMgNC40ODcwM0w2Ljk2NTcgMEw4LjQ4NTQ5IDEuNDkwOTlMNy45NjQ4MiA1LjAwNzQ3TDEzLjQxMDcgMTAuNDUxTDE4LjkxMjkgMEwyMC44OTcxIDEuOTk3MzZMMTcuOTEzOCAxNC45MjRMMjMuMzg3OSAyMC4zOTU2QzI0LjIwNCAyMS4xODMzIDI0LjIwNCAyMi41ODk5IDIzLjM4NzkgMjMuMzc3NloiIGZpbGw9IiNFNkU2RTYiLz4KPC9zdmc+Cg==";

type CameraKey = "front" | "back" | "left" | "right" | "down";

const cameraNames: CameraKey[] = ["front", "back", "left", "right", "down"];

export function Camera3DPanel({ context, rosUrl }: Camera3DPanelProps) {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [connected, setConnected] = useState(false);

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

  // Drone control states
  const [isArmed, setIsArmed] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  // ROS connection
  useEffect(() => {
    if (!rosUrl) return;
    console.log("🔗 Connecting to ROS:", rosUrl);

    const rosConn = new ROSLIB.Ros({ url: rosUrl });
    rosConn.on("connection", () => {
      console.log("✅ Connected to ROS at", rosUrl);
      setConnected(true);
    });
    rosConn.on("error", (err) => {
      console.error("❌ ROS connection error:", err);
      setConnected(false);
    });
    rosConn.on("close", () => {
      console.warn("⚠️ ROS connection closed");
      setConnected(false);
    });

    setRos(rosConn);
    return () => rosConn.close();
  }, [rosUrl]);

  // Camera topic subscriptions
  useEffect(() => {
    if (!ros) return;

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
      topics.forEach((t) => t.unsubscribe());
      telemetryTopic.unsubscribe();
    };
  }, [ros]);

  // Drone control services
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

  // Handle Arm/Disarm
  const handleArmDisarmToggle = () => {
    if (!ros || !connected || !armService) return alert("ROS not connected!");

    const newState = !isArmed;
    const req = new ROSLIB.ServiceRequest({ value: newState });

    armService.callService(req, (res) => {
      if (res.success) {
        setIsArmed(newState);
        alert(newState ? "Drone Armed" : "Drone Disarmed");
      } else {
        alert("Failed to change arming state");
      }
    });
  };

  // Handle Takeoff
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
        alert("🚀 Drone Taking Off...");
      } else {
        alert("Takeoff Failed");
      }
    });
  };

  // Handle Land
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
        setIsFlying(false);
        alert("🛬 Drone Landing...");
      } else {
        alert("Landing Failed");
      }
    });
  };

  // Foxglove panel sync
  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => setRenderDone(() => done);
    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  // ---------------- UI ----------------
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
      {/* Left Section: Thumbnails + Main Feed */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid #333",
          padding: "0.5rem",
        }}
      >
        {/* Thumbnails */}
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
              onClick={() => setSelectedCamera(name)}
              style={{
                backgroundColor: selectedCamera === name ? "#333" : "#000",
                border: selectedCamera === name ? "2px solid #00adee" : "1px solid #222",
                borderRadius: "8px",
                cursor: "pointer",
                overflow: "hidden",
                aspectRatio: "1/1",
                position: "relative",
              }}
            >
              {cameraFeeds[name] ? (
                <img
                  src={cameraFeeds[name]!}
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
            </div>
          ))}
        </div>

        {/* Large Main Camera */}
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
            <span style={{ color: "#888" }}>Waiting for {selectedCamera} feed...</span>
          )}
        </div>
      </div>

      {/* Right Section: 3D Map + Telemetry + Control Buttons */}
      <div
        style={{
          flex: 1.5,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#181818",
          borderRadius: "8px",
          margin: "0.5rem",
          padding: "0.8rem",
          position: "relative",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
            borderRadius: "8px",
            position: "relative",
          }}
        >
          <span style={{ color: "#aaa", fontSize: "1rem" }}>3D Map View</span>

          {/* Left Center: Arm / Disarm Buttons */}
          <div
            style={{
              position: "absolute",
              left: "30px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* Arm Button */}
            <button
              onClick={handleArmDisarmToggle}
              disabled={isArmed}
              title="Arm Drone"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#555",
                border: "none",
                color: "#fff",
                cursor: isArmed ? "not-allowed" : "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <FaUnlock size={24} />
            </button>

            {/* Disarm Button */}
            <button
              onClick={handleArmDisarmToggle}
              disabled={!isArmed}
              title="Disarm Drone"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#555",
                border: "none",
                color: "#fff",
                cursor: !isArmed ? "not-allowed" : "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <FaLock size={24} />
            </button>
          </div>

          {/* Right Center: Takeoff / Land Buttons */}
          <div
            style={{
              position: "absolute",
              right: "30px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {/* Takeoff Button */}
            <button
              onClick={handleTakeoff}
              disabled={isFlying}
              title="Takeoff"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#555",
                border: "none",
                color: "#fff",
                cursor: isFlying ? "not-allowed" : "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img src={takeOff} alt="Drone" style={{ width: "25px", height: "25px" }} />
            </button>

            {/* Land Button */}
            <button
              onClick={handleLand}
              disabled={!isFlying}
              title="Land"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#555",
                border: "none",
                color: "#fff",
                cursor: !isFlying ? "not-allowed" : "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img src={land} alt="Drone" style={{ width: "25px", height: "25px" }} />
            </button>
          </div>
        </div>

        {/* Telemetry Data Below */}
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

          <div style={{ marginTop: "0.3rem" }}>{altitude.toFixed(2)} m</div>
          <div style={{ marginTop: "0.3rem" }}>{heading.toFixed(1)}°</div>
          <div style={{ marginTop: "0.3rem" }}>{odometer.toFixed(1)} m</div>
          <div style={{ marginTop: "0.3rem" }}>{speed.toFixed(2)} m/s</div>
        </div>
      </div>
    </div>
  );
}
