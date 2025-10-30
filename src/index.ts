// extension.ts
import { ExtensionContext } from "@foxglove/extension";
import { initMainPanel } from "./MainPanel"; // import your new main panel

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({
    name: "Main Control Panel", // You can rename this as you like
    initPanel: initMainPanel,
  });
}






// // extension.ts
// import { ExtensionContext } from "@foxglove/extension";
// import { initRackPanel } from "./RackPanel";
// import { initCamera3DPanel } from "./Camera_3DPanel";

// export function activate(extensionContext: ExtensionContext): void {
//   // Register Example Panel
//   extensionContext.registerPanel({
//     name: "Example Panel",
//     initPanel: initRackPanel,
//   });

//   // Register Camera 3D Panel
//   extensionContext.registerPanel({
//     name: "Camera 3D Panel",
//     initPanel: initCamera3DPanel,
//   });
// }


// import { ExtensionContext } from "@foxglove/extension";

// import { initRackPanel } from "./RackPanel";

// export function activate(extensionContext: ExtensionContext): void {
// extensionContext.registerPanel({ name: "Extension Demo", initPanel: initRackPanel });

// }
