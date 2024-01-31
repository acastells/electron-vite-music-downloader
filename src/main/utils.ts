const fs = require("fs");
const csv = require("csv-parser");
import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { log } from "./logger";

export const readCsvFilePromise = (filePath): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		const rows: string[] = [];

		fs.createReadStream(filePath)
			.pipe(csv())
			.on("data", (data: { [key: string]: string }) => {
				const values = Object.values(data);
				rows.push(...values);
			})
			.on("end", () => {
				resolve(rows);
			})
			.on("error", (error) => {
				reject(error);
			});
	});
};

app.whenReady().then(() => {
	ipcMain.on("showOpenDialog", showOpenDialog);
});

export const showOpenDialog = (_event, _listener) => {
	dialog
		.showOpenDialog({ properties: ["openFile"] })
		.then((data) => {
			const filePathSelected = data.filePaths[0];
			const mainWindow = BrowserWindow.getAllWindows()[0];
			mainWindow.webContents.send("showOpenDialog", filePathSelected);
		})
		.catch((e) => {
			log(e);
		});
};
