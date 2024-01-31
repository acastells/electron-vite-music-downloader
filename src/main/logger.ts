import { BrowserWindow } from "electron";

export const log = (logStr: string) => {
	console.log(logStr);
	const mainWindow = BrowserWindow.getAllWindows()[0];
	mainWindow.webContents.send("logConsole", logStr);
}