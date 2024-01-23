/// <reference types="vite/client" />


import { ElectronAPI } from "@electron-toolkit/preload";
import { ContextBridgeApi } from "../../preload/index";

declare global {
	interface Window {
		electron: ElectronAPI;
		api: ContextBridgeApi;
	}
}
