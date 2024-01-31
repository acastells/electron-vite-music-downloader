import { app } from "electron";
import path from "path";

export const versionFFmpeg = "ffmpeg-master-latest-win64-lgpl-shared";

export const pathFfprobe = path.join(
	app.getPath("appData"),
	"Music Downloader",
	"ffmpeg",
	versionFFmpeg,
	"bin",
	"ffprobe.exe"
);

export const ffmpegDownloadOptionsDirectory = path.join(app.getPath("appData"), "Music Downloader");
export const ffmpegDownloadOptionsZipPath = path.join(
	app.getPath("appData"),
	"Music Downloader",
	"ffmpeg.zip"
);
export const ffmpegDownloadOptionsFolderPath = path.join(
	app.getPath("appData"),
	"Music Downloader",
	"ffmpeg"
);
export const ffmpegDownloadOptionsBinPath = path.join(
	app.getPath("appData"),
	"Music Downloader",
	"ffmpeg",
	versionFFmpeg,
	"bin",
	"ffmpeg.exe"
);

export const ytDlpExePath = path.join(
	app.getPath("appData"),
	"Music Downloader",
	"ffmpeg",
	versionFFmpeg,
	"bin",
	"yt-dlp.exe"
);

export const downloadedMusicPath = path.join(app.getPath("desktop"), "MusicDownloaded");
