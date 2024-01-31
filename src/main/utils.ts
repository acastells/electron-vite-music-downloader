const fs = require("fs");
const csv = require("csv-parser");
import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { log } from "./logger";
import { pathFfprobe } from "./paths";
import { exec } from "child_process";

app.whenReady().then(() => {
	ipcMain.on("showOpenDialog", showOpenDialog);
});

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


export const getAudioInfo = (filePath: string): Promise<{ duration: number; bitrate: number }> => {
	return new Promise((resolve, reject) => {
		const command = `"${pathFfprobe}" -v error -select_streams a:0 -show_entries stream=duration,bit_rate -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

		exec(command, (error, stdout, _stderr) => {
			if (error) {
				reject(error);
				return;
			}

			const [duration, bitrate] = stdout.trim().split("\n");

			resolve({
				duration: parseFloat(duration),
				bitrate: parseInt(bitrate),
			});
		});
	});
};