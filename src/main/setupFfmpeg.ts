import { BrowserWindow, app, ipcMain } from "electron";
import { log } from "./logger";
import {
	ffmpegDownloadOptionsBinPath,
	ffmpegDownloadOptionsDirectory,
	ffmpegDownloadOptionsFolderPath,
	ffmpegDownloadOptionsZipPath,
	versionFFmpeg,
} from "./paths";
const fs = require("fs");
const decompress = require("decompress");

export const setupFFmpeg = () => {
	app.whenReady().then(() => {
		ipcMain.on("download_ffmpeg", downloadFfmpeg);
		ipcMain.on("check_ffmpeg", checkFfmpeg);
	});
};

const checkFfmpeg = () => {
	const mainWindow = BrowserWindow.getAllWindows()[0];
	mainWindow.webContents.send("ffmpegSetup", `${ffmpegDownloadOptionsBinPath} ${fs.existsSync(ffmpegDownloadOptionsBinPath)}`);
}

let ffmpegDownloadOptions = {
	filename: "ffmpeg.zip",
	directory: ffmpegDownloadOptionsDirectory,
	zipPath: ffmpegDownloadOptionsZipPath,
	folderPath: ffmpegDownloadOptionsFolderPath,
	binPath: ffmpegDownloadOptionsBinPath,
	onStarted: () => {},
	onCompleted: () => {},
};

const downloadFfmpeg = async (_event: Electron.IpcMainEvent, ..._args: any[]) => {
	const zipPathExists = fs.existsSync(ffmpegDownloadOptions.zipPath);
	const binPathExists = fs.existsSync(ffmpegDownloadOptions.binPath);

	if (zipPathExists && binPathExists) {
		log("ffmpeg.exists and is unzipped, no operation...");
	} else if (zipPathExists && !binPathExists) {
		log("ffmpeg.zip exists, unzipping...");
		unzipFfmpeg();
	} else {		
		try {
			const url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest";
			const finalUrl = `${url}/${versionFFmpeg}.zip`;
			const win = BrowserWindow.getAllWindows()[0];

			log(`downloading from ${finalUrl}...`)
			ffmpegDownloadOptions.onStarted = () => {};
			ffmpegDownloadOptions.onCompleted = unzipFfmpeg;
			const { download } = require("electron-dl");
			download(win, finalUrl, ffmpegDownloadOptions);
		} catch (error) {
			log(JSON.stringify(error));
		}
	}
};

const unzipFfmpeg = () => {
	log("unzipping...")
	decompress(ffmpegDownloadOptions.zipPath, ffmpegDownloadOptions.folderPath)
		.then(() => {
			log("unzipped");
		})
		.catch((error) => {
			log(JSON.stringify(error));
		});
};
