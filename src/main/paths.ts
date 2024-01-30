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