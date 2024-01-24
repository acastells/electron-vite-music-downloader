import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
const fs = require("fs");

export const setupFFmpeg = () => {
	app.whenReady().then(() => {
		ipcMain.on("download_ffmpeg", downloadFfmpeg);
		ipcMain.on("download_dlp", () => {});
		ipcMain.on("clear_success", () => {});
		ipcMain.on("clear_warning", () => {});
		ipcMain.on("clear_all", () => {});
		ipcMain.on("download", () => {});
	});

	let ffmpegDownloadOptions = {
		zipPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg.zip"),
		folderPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg"),
		binPath: path.join(
			app.getPath("appData"),
			"Music Downloader",
			"ffmpeg",
			"ffmpeg-master-latest-win64-lgpl-shared",
			"bin",
			"ffmpeg.exe"
		),
		onStarted: () => {},
		onCompleted: () => {},
	};

	const downloadFfmpeg = async (_event: Electron.IpcMainEvent, ..._args: any[]) => {
		const zipPathExists = fs.existsSync(ffmpegDownloadOptions.zipPath);
		const binPathExists = fs.existsSync(ffmpegDownloadOptions.binPath);

		if (zipPathExists && binPathExists) {
			console.log("ffmpeg exists and is unzipped, no operation...");
		} else if (zipPathExists && !binPathExists) {
			console.log("ffmpeg zip exists, unzipping...");
			unzipFfmpeg();
		} else {
			try {
				const url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest";
				const finalUrl = `${url}/ffmpeg-master-latest-win64-lgpl-shared.zip`;
				const win = BrowserWindow.getFocusedWindow();
				ffmpegDownloadOptions.onStarted = () => {};
				ffmpegDownloadOptions.onCompleted = unzipFfmpeg;
				const { download } = require("electron-dl");
				download(win, finalUrl, ffmpegDownloadOptions);
			} catch (error) {
				console.error(error);
			}
		}
	};

	const unzipFfmpeg = () => {
		const { createReadStream } = require("fs");
		const unzipper = require("unzipper");

		createReadStream(ffmpegDownloadOptions.zipPath)
			.pipe(unzipper.Extract({ path: ffmpegDownloadOptions.folderPath }))
			.on("finish", () => {
				console.log("Unzipped successfully!");
			})
			.on("error", (err) => {
				console.error("Error while unzipping:", err);
			});
	};
};
