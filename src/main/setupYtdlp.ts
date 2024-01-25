import { app, ipcMain } from "electron";
import path from "path";
import { versionFFmpeg } from "./setupFfmpeg";
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work // https://github.com/foxesdocode/yt-dlp-wrap

export const setupYtdlp = () => {
	const binaryPath = path.join(
		app.getPath("appData"),
		"Music Downloader",
		"ffmpeg",
		versionFFmpeg,
		"bin",
		"yt-dlp.exe"
	);
	const downloadPath = app.getPath("desktop");
	const ffmpegPath = path.join(
		app.getPath("appData"),
		"Music Downloader",
		"ffmpeg",
		versionFFmpeg,
		"bin",
		"ffmpeg.exe"
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
		const { name, type } = listener;
		console.log(name, type);

		const ytDlpWrap = new YTDlpWrap(binaryPath);

		let ytDlpEventEmitter = ytDlpWrap
			.exec([
				"https://www.youtube.com/watch?v=aqz-KE-bpKQ",
				"-o",
				"%(title)s - %(artist)s.%(ext)s",
				"-P",
				downloadPath,
				"--extract-audio",
				"--audio-format",
				"mp3",
				"--audio-quality",
				"320",
				"--ffmpeg-location",
				ffmpegPath,
				"--default-search",
				"ytsearch:",
			])
			.on("progress", (progress) => console.log(progress.percent))
			.on("ytDlpEvent", (eventType, eventData) => console.log("hey", eventType, eventData))
			.on("error", (error) => console.error(error))
			.on("close", () => console.log("all done"));

		console.log(ytDlpEventEmitter.ytDlpProcess.pid);
	};
};
