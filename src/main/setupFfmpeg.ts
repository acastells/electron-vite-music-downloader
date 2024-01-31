import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { versionFFmpeg } from "./paths";
import { log } from "./logger";
const fs = require("fs");
const decompress = require("decompress");

export const setupFFmpeg = () => {
	app.whenReady().then(() => {
		ipcMain.on("download_ffmpeg", downloadFfmpeg);
	});

	let ffmpegDownloadOptions = {
		filename: "ffmpeg.zip",
		directory: path.join(app.getPath("appData"), "Music Downloader"),
		zipPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg.zip"),
		folderPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg"),
		binPath: path.join(
			app.getPath("appData"),
			"Music Downloader",
			"ffmpeg",
			versionFFmpeg,
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
			log("ffmpeg.exists and is unzipped, no operation...");
		} else if (zipPathExists && !binPathExists) {
			log("ffmpeg.zip exists, unzipping...");
			unzipFfmpeg();
		} else {
			try {
				const url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest";
				const finalUrl = `${url}/${versionFFmpeg}`;
				const win = BrowserWindow.getAllWindows()[0];
				ffmpegDownloadOptions.onStarted = () => {};
				ffmpegDownloadOptions.onCompleted = unzipFfmpeg;
				const { download } = require("electron-dl");
				download(win, finalUrl, ffmpegDownloadOptions);
			} catch (error) {
				log(JSON.stringify(error))
			}
		}
	};

	const unzipFfmpeg = () => {
		decompress(ffmpegDownloadOptions.zipPath, ffmpegDownloadOptions.folderPath)
			.then(() => {
				log("unzipped");
			})
			.catch((error) => {
				log(JSON.stringify(error))
			});
	};
};
