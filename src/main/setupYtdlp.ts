import { app, ipcMain, BrowserWindow } from "electron";
import path from "path";
import { versionFFmpeg } from "./setupFfmpeg";
import { Track, TrackTypeObject } from "./../vm";
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work // https://github.com/foxesdocode/yt-dlp-wrap

export const setupYtdlp = () => {
	const downloadedMusicPath = app.getPath("desktop");

	// yt-dlp.exe must be in the same folder as ffmpeg.exe
	const binaryPath = path.join(
		app.getPath("appData"),
		"Music Downloader",
		"ffmpeg",
		versionFFmpeg,
		"bin",
		"yt-dlp.exe"
	);

	app.whenReady().then(() => {
		ipcMain.on("download_dlp", setupDlp);
		ipcMain.on("download", downloadTrack);
	});

	const setupDlp = async () => {
		YTDlpWrap.downloadFromGithub(binaryPath).then(() => {
			console.log("yt-dlp.exe downloaded");
		});
	};

	const downloadTrack = (_event, listener) => {
		const mainWindow = BrowserWindow.getFocusedWindow() as BrowserWindow 
		const ytDlpWrap = new YTDlpWrap(binaryPath);
		const { name, type } = listener;

		let defaultSearch = "";
		if (type !== TrackTypeObject.ByID) {
			defaultSearch = "ytsearch:";
		}

		const track: Track = {
			id: Date.now(),
			name: name,
			path: path.join(downloadedMusicPath, name),
			type: type,
			length: 0,
			progress: 0,
			similarity: 0,
			completed: false,
			status: "Pending",
			msg: "",
		};

		let ytDlpEventEmitter = ytDlpWrap
			.exec([
				name,
				"-o",
				"%(title)s - %(artist)s",
				"-P",
				downloadedMusicPath,
				"--extract-audio",
				"--audio-format",
				"mp3",
				"--audio-quality",
				"320",
				"--force-overwrites",
				"--default-search",
				defaultSearch,
			])
			.on("progress", (progress) => {
				track.progress = progress.percent
				mainWindow.webContents.send("tracks", [{...track}])
			})
			.on("ytDlpEvent", (eventType, eventData) =>
				console.log("ytDlpEvent", eventType, eventData)
			)
			.on("error", (error) => console.error(error))
			.on("close", () => console.log("all done"));

		// TODO: save track
		mainWindow.webContents.send("tracks", [{...track}])

		console.log("PID:", ytDlpEventEmitter.ytDlpProcess.pid, track);
	};
};
