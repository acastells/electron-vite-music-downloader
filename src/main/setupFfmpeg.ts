import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
const fs = require("fs");
const decompress = require("decompress");

export const versionFFmpeg = "ffmpeg-master-latest-win64-lgpl-shared";

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
			console.log("ffmpeg.exists and is unzipped, no operation...");
		} else if (zipPathExists && !binPathExists) {
			console.log("ffmpeg.zip exists, unzipping...");
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
				console.error(error);
			}
		}
	};

	const unzipFfmpeg = () => {
		decompress(ffmpegDownloadOptions.zipPath, ffmpegDownloadOptions.folderPath)
			.then(() => {
				console.log("unzipped");
			})
			.catch((error) => {
				console.log(error);
			});
	};
};
