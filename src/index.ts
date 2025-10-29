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
// import { initExamplePanel } from "./ExamplePanel";
// import { initCamera3DPanel } from "./Camera_3DPanel";

// export function activate(extensionContext: ExtensionContext): void {
//   // Register Example Panel
//   extensionContext.registerPanel({
//     name: "Example Panel",
//     initPanel: initExamplePanel,
//   });

//   // Register Camera 3D Panel
//   extensionContext.registerPanel({
//     name: "Camera 3D Panel",
//     initPanel: initCamera3DPanel,
//   });
// }


// import { ExtensionContext } from "@foxglove/extension";

// import { initExamplePanel } from "./ExamplePanel";

// export function activate(extensionContext: ExtensionContext): void {
// extensionContext.registerPanel({ name: "Extension Demo", initPanel: initExamplePanel });

// }
