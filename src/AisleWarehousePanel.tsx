import { useEffect, useLayoutEffect, useState } from "react";
import { PanelExtensionContext } from "@foxglove/extension";
import { FaExpand, FaCompress } from "react-icons/fa";

interface Props {
  context: PanelExtensionContext;
  rosUrl: string;
}

export function AisleWarehousePanel({ context, rosUrl }: Props) {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [activeTab, setActiveTab] = useState<"aisle" | "warehouse">("aisle");
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    context.onRender = (_renderState, done) => setRenderDone(() => done);
  }, [context]);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  console.log("ROS Server URL:", rosUrl);

  const sampleData = [
    {
      mission: "01",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
    {
      mission: "02",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
    {
      mission: "03",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
    {
      mission: "04",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
    {
      mission: "05",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
    {
      mission: "06",
      binScanned: "38",
      startedEDT: "30/10/2025 1:34 PM",
      completedEDT: "30/10/2025 2:00 PM",
      supplier: "-",
      warehouse: "BarrettDistrubution",
      Action: "...",
    },
  ];

  const sampleData1 = [
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
    {
      product: "LPN",
      code: "D154-4",
      qty: "1",
      status: "Match",
      inventory: "Action Pending",
      location: "43-19-B38",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "100%",
        width: "100%",
        backgroundColor: "#fafafa",
        fontFamily: "Inter, sans-serif",
        color: "#111",
        padding: "1rem",
        gap: "1rem",
        boxSizing: "border-box",
        overflow: "hidden",
        transition: "all 0.4s ease",
      }}
    >
      {/* LEFT SIDE (hidden when expanded) */}
      {!isExpanded && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Inventory Table */}
          <div>
            <h3 style={{ marginBottom: "0.8rem" }}>Inventory Table</h3>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead style={{ backgroundColor: "#f3f3f3", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: "10px" }}>Mission</th>
                    <th style={{ padding: "10px" }}>Bin Scanned</th>
                    <th style={{ padding: "10px" }}>Started on (EDT)</th>
                    <th style={{ padding: "10px" }}>Completed on (EDT)</th>
                    <th style={{ padding: "10px" }}>Supplier</th>
                    <th style={{ padding: "10px" }}>Warehouse</th>
                    <th style={{ padding: "10px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{row.mission}</td>
                      <td style={{ padding: "10px" }}>{row.binScanned}</td>
                      <td style={{ padding: "10px" }}>{row.startedEDT}</td>
                      <td style={{ padding: "10px" }}>{row.completedEDT}</td>
                      <td style={{ padding: "10px" }}>{row.supplier}</td>
                      <td style={{ padding: "10px" }}>{row.warehouse}</td>
                      <td style={{ padding: "10px" }}>{row.Action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mission Details Table */}
          <div>
            <h3 style={{ marginBottom: "0.8rem" }}>Mission details</h3>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead style={{ backgroundColor: "#f3f3f3", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: "10px" }}>Product</th>
                    <th style={{ padding: "10px" }}>Code</th>
                    <th style={{ padding: "10px" }}>Quantity</th>
                    <th style={{ padding: "10px" }}>Status</th>
                    <th style={{ padding: "10px" }}>Inventory Action</th>
                    <th style={{ padding: "10px" }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData1.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{row.product}</td>
                      <td style={{ padding: "10px" }}>{row.code}</td>
                      <td style={{ padding: "10px" }}>{row.qty}</td>
                      <td style={{ padding: "10px" }}>{row.status}</td>
                      <td style={{ padding: "10px" }}>{row.inventory}</td>
                      <td style={{ padding: "10px" }}>{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE — Aisle/Warehouse Toggle View */}
      <div
        style={{
          flex: isExpanded ? "1 1 100%" : 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: isExpanded ? "absolute" : "relative",
          top: isExpanded ? 0 : "auto",
          left: isExpanded ? 0 : "auto",
          width: isExpanded ? "100%" : "auto",
          height: isExpanded ? "100%" : "auto",
          zIndex: isExpanded ? 10 : 1,
          transition: "all 0.3s ease",
        }}
      >
        {/* Tab Switch */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#f6f6f6",
          }}
        >
          <button
            onClick={() => setActiveTab("aisle")}
            style={{
              flex: 1,
              padding: "0.8rem",
              border: "none",
              backgroundColor: activeTab === "aisle" ? "#fff" : "transparent",
              borderBottom: activeTab === "aisle" ? "3px solid #333" : "none",
              cursor: "pointer",
              fontWeight: activeTab === "aisle" ? 600 : 400,
              transition: "0.3s",
            }}
          >
            Aisle View
          </button>
          <button
            onClick={() => setActiveTab("warehouse")}
            style={{
              flex: 1,
              padding: "0.8rem",
              border: "none",
              backgroundColor: activeTab === "warehouse" ? "#fff" : "transparent",
              borderBottom: activeTab === "warehouse" ? "3px solid #333" : "none",
              cursor: "pointer",
              fontWeight: activeTab === "warehouse" ? 600 : 400,
              transition: "0.3s",
            }}
          >
            Warehouse View
          </button>
        </div>

        {/* View Container */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f3f3f3",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.2rem",
            color: "#555",
            position: "relative",
          }}
        >
          {activeTab === "aisle"
            ? "Aisle Camera / Visualization Feed Here"
            : "Warehouse View / 3D Scene Feed Here"}

          {/* Expand / Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              position: "absolute",
              bottom: "15px",
              right: "15px",
              backgroundColor: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
            title={isExpanded ? "Exit Fullscreen" : "Expand View"}
          >
            {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
