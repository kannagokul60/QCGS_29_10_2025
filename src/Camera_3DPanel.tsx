import { useEffect, useState, useLayoutEffect } from "react";
import { PanelExtensionContext } from "@foxglove/extension";
import * as ROSLIB from "roslib";
import { FaLock, FaUnlock } from "react-icons/fa";
import { FaExpand, FaCompress } from "react-icons/fa";

interface Camera3DPanelProps {
  context: PanelExtensionContext;
  rosUrl: string;
}
const takeOff =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjM3NzYgMC42MTIxMzdDMjQuMjA3NSAxLjQ0MjM5IDI0LjIwNzUgMi43NzkyNCAyMy4zNzc2IDMuNTk1NDNMMTcuOTA1OSA5LjA2OTQ4TDIwLjg4NzkgMjIuMDAxOEwxOC45MDQ2IDI0TDEzLjQ0NyAxMy41NDQ0TDcuOTYxMzIgMTkuMDMyNUw4LjQ2NzY5IDIyLjUwODRMNi45NjI2NCAyNEw0LjQ4NzAzIDE5LjUyNTFMMCAxNy4wMzQzTDEuNDkwOTkgMTUuNTE0NUw1LjAwNzQ3IDE2LjAzNTJMMTAuNDUxIDEwLjU4OTNMMCA1LjA4NzA3TDEuOTk3MzYgMy4xMDI5TDE0LjkyNCA2LjA4NjE5TDIwLjM5NTYgMC42MTIxMzdDMjEuMTgzMyAtMC4yMDQwNDYgMjIuNTg5OSAtMC4yMDQwNDYgMjMuMzc3NiAwLjYxMjEzN1oiIGZpbGw9IiNFNkU2RTYiLz4KPC9zdmc+Cg==";

const land =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjM4NzkgMjMuMzc3NkMyMi41NTc2IDI0LjIwNzUgMjEuMjIwOCAyNC4yMDc1IDIwLjQwNDYgMjMuMzc3NkwxNC45MzA1IDE3LjkwNTlMMS45OTgyNCAyMC44ODc5TDYuMjAxOTFlLTA3IDE4LjkwNDZMMTAuNDU1NiAxMy40NDdMNC45Njc0NiA3Ljk2MTMyTDEuNDkxNjUgOC40Njc2OUw2LjIwMTkxZS0wNyA2Ljk2MjY0TDQuNDc0OTMgNC40ODcwM0w2Ljk2NTcgMEw4LjQ4NTQ5IDEuNDkwOTlMNy45NjQ4MiA1LjAwNzQ3TDEzLjQxMDcgMTAuNDUxTDE4LjkxMjkgMEwyMC44OTcxIDEuOTk3MzZMMTcuOTEzOCAxNC45MjRMMjMuMzg3OSAyMC4zOTU2QzI0LjIwNCAyMS4xODMzIDI0LjIwNCAyMi41ODk5IDIzLjM4NzkgMjMuMzc3NloiIGZpbGw9IiNFNkU2RTYiLz4KPC9zdmc+Cg==";

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
  const [fullscreen, setFullscreen] = useState<"camera" | "map" | null>(null);

  // ROS connection
  useEffect(() => {
    if (!rosUrl) return;
    console.log("🔗 Connecting to ROS:", rosUrl);

    const rosConn = new ROSLIB.Ros({ url: rosUrl });
    rosConn.on("connection", () => {
      console.log("Connected to ROS at", rosUrl);
      setConnected(true);
    });
    rosConn.on("error", (err) => {
      console.error("ROS connection error:", err);
      setConnected(false);
    });
    rosConn.on("close", () => {
      console.warn("ROS connection closed");
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
        alert("Drone Taking Off...");
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
        alert("Drone Landing...");
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
        position: "relative",
      }}
    >
      {/* Left Section: Camera View + Telemetry + Buttons */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid #333",
          padding: "0.5rem",
          position: "relative",
        }}
      >
        {/* --- Top Bar: Camera Dropdown (Normal View) --- */}
        {fullscreen !== "camera" && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value as CameraKey)}
              style={{
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                padding: "0.4rem 0.8rem",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              {cameraNames.map((name) => (
                <option key={name} value={name}>
                  {name.charAt(0).toUpperCase() + name.slice(1)} Camera
                </option>
              ))}
            </select>
          </div>
        )}

        {/* --- Large Main Camera View --- */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#000",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: fullscreen === "camera" ? "fixed" : "relative",
            top: fullscreen === "camera" ? 0 : undefined,
            left: fullscreen === "camera" ? 0 : undefined,
            width: fullscreen === "camera" ? "100vw" : "auto",
            height: fullscreen === "camera" ? "100vh" : "100%",
            zIndex: fullscreen === "camera" ? 9999 : "auto",
          }}
        >
          {cameraFeeds[selectedCamera] ? (
            <img
              src={cameraFeeds[selectedCamera]!}
              alt={`${selectedCamera} view`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ color: "#888" }}>Waiting for {selectedCamera} feed...</span>
          )}

          {/* --- Dropdown for Fullscreen Mode --- */}
          {fullscreen === "camera" && (
            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "10%",
                padding: "0.25rem 0.6rem",
              }}
            >
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value as CameraKey)}
                style={{
                  backgroundColor: "#222",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: "6px",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {cameraNames.map((name) => (
                  <option key={name} value={name}>
                    {name.charAt(0).toUpperCase() + name.slice(1)} Camera
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* --- Expand/Compress Button --- */}
          <button
            onClick={() => setFullscreen(fullscreen === "camera" ? null : "camera")}
            style={{
              position: "absolute",
              right: "15px",
              bottom: "15px",
              backgroundColor: "#222",
              border: "1px solid #555",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              transition: "background 0.2s ease",
            }}
          >
            {fullscreen === "camera" ? <FaCompress /> : <FaExpand />}
          </button>
        </div>

        {/* --- Telemetry Actions Section --- */}
        <div
          style={{
            marginTop: "1rem",
            width: "100%",
            height: "auto",
            backgroundColor: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
              textAlign: "left",
            }}
          >
            Telemetry
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            {/* Battery Status */}
            <div
              style={{
                backgroundColor: "#2b2b2b",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                flex: "1 1 calc(25% - 1rem)",
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #444",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Battery Status
              </span>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ color: "#f8c756", fontWeight: 600, fontSize: "1rem" }}>Volt:</span>
                <span style={{ color: "#f0f0f0ff", fontWeight: 500 }}>15.4V</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ color: "#f8c756", fontWeight: 600, fontSize: "1rem" }}>Curr:</span>
                <span style={{ color: "#f0f0f0ff", fontWeight: 500 }}>3.2A</span>
              </div>
            </div>

            {/* Flight Time */}
            <div
              style={{
                backgroundColor: "#2b2b2b",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                flex: "1 1 calc(25% - 1rem)",
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #444",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Flight Time</span>
              <span style={{ color: "#f8c756", fontWeight: 600, fontSize: "1.1rem" }}>00:00</span>
            </div>

            {/* Distance Travelled */}
            <div
              style={{
                backgroundColor: "#2b2b2b",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                flex: "1 1 calc(25% - 1rem)",
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #444",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Distance Travelled</span>
              <span style={{ color: "#f8c756", fontWeight: 600, fontSize: "1.1rem" }}>0.0 m</span>
            </div>

            {/* RSI Signal Strength */}
            <div
              style={{
                backgroundColor: "#2b2b2b",
                borderRadius: "8px",
                padding: "0.75rem 1.25rem",
                flex: "1 1 calc(25% - 1rem)",
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                border: "1px solid #444",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>RSI Signal Strength</span>
              <span style={{ color: "#f8c756", fontWeight: 600, fontSize: "1.1rem" }}>85%</span>
            </div>
          </div>
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
            position: fullscreen === "map" ? "fixed" : "relative",
            top: fullscreen === "map" ? 0 : undefined,
            left: fullscreen === "map" ? 0 : undefined,
            width: fullscreen === "map" ? "100vw" : "auto",
            height: fullscreen === "map" ? "100vh" : "100%",
            zIndex: fullscreen === "map" ? 9999 : "auto",
          }}
        >
          <span style={{ color: "#aaa", fontSize: "1rem" }}>3D Map View</span>
          <button
            onClick={() => setFullscreen(fullscreen === "map" ? null : "map")}
            style={{
              position: "absolute",
              right: "15px",
              bottom: "15px",
              backgroundColor: "#222",
              border: "1px solid #555",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              transition: "background 0.2s ease",
            }}
          >
            {fullscreen === "map" ? <FaCompress /> : <FaExpand />}
          </button>

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
