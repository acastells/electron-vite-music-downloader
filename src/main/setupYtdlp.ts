import { BrowserWindow, app, ipcMain } from "electron";
import path from "path";
import { Track, TrackStatusObject, TrackType, TrackTypeObject } from "./../vm";
import { log } from "./logger";
import { downloadedMusicPath, ytDlpExePath } from "./paths";
import { upsertTrack } from "./setupDB";
import { stringSimilarity } from "./utils/coincidenceSystemLogic";
import { getAudioInfo } from "./utils/getAudioInfo";
import { renameFile } from "./utils/renameFilesLogic";
import { readCsvFilePromise } from "./utils/scrapCSV";
import { scrapBeatport } from "./utils/scrapBeatport";
import { scrapSpotifyPlaylist } from "./utils/scrapSpotifyPlaylist";
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work // https://github.com/foxesdocode/yt-dlp-wrap
const async = require("async");
const fs = require("fs");

export const setupYtdlp = () => {
	app.whenReady().then(() => {
		ipcMain.on("download_dlp", setupDlp);
		ipcMain.on("download", handleDownloadTrack);
		ipcMain.on("check_dlp", checkDlp);
	});
};

const checkDlp = async () => {
	const mainWindow = BrowserWindow.getAllWindows()[0];
	mainWindow.webContents.send("ffmpegSetup", `${ytDlpExePath} ${fs.existsSync(ytDlpExePath)}`);
};

const setupDlp = async () => {
	YTDlpWrap.downloadFromGithub(ytDlpExePath)
		.then(() => {
			log("yt-dlp.exe downloaded");
		})
		.catch((e) => {
			log(e);
		});
};

const handleDownloadTrack = (_event, listener) => {
	const { name, type } = listener;
	if (type === TrackTypeObject.CSV) {
		readCsvFilePromise(name)
			.then((csvData: string[]) => {
				downloadMultipleTracks(csvData);
			})
			.catch((error) => {
				log(JSON.stringify(error));
			});
	} else if (type === TrackTypeObject.BeatportTopURL) {
		scrapBeatport(name)
			.then((tracks: string[]) => {
				downloadMultipleTracks(tracks);
			})
			.catch((error) => {
				log(JSON.stringify(error));
			});
	} else if (type === TrackTypeObject.SpotifyPlaylistURL) {
		scrapSpotifyPlaylist(name)
			.then((tracks: string[]) => {
				downloadMultipleTracks(tracks);
			})
			.catch((error) => {
				log(JSON.stringify(error));
			});
	} else {
		const track = createEmptyTrack(name, type);
		downloadTrack(track);
	}
};

const downloadMultipleTracks = (tracksStr: string[]) => {
	const tracks: Track[] = tracksStr.map((trackName) => {
		const track = createEmptyTrack(trackName, TrackTypeObject.ByName);
		upsertTrack(track);
		return track;
	});

	async.eachLimit(tracks, 2, (track: Track, _callback) => {
		let processDlp = downloadTrack(track);
		processDlp.on("close", () => {
			processDlp.removeAllListeners();
			_callback(); // Notify async that the download is complete
		});
	});
};

export const downloadTrack = (track: Track) => {
	const ytDlpWrap = new YTDlpWrap(ytDlpExePath);

	let defaultSearch = "";
	if (track.type !== TrackTypeObject.ByID) {
		defaultSearch = "ytsearch:";
	}

	upsertTrack(track);

	const ytDlpEventEmitter = ytDlpWrap
		.exec([
			track.name,
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

			// correct dangerous filenames
			"--replace-in-metadata",
			"title",
			"[|:]",
			"",

			// correct dangerous filenames
			"--replace-in-metadata",
			"title",
			"[^0-9a-zA-Z- а-яА-Я.()[]]",
			"",
		])
		.on("progress", (progress) => {
			track.progress = progress.percent;
			track.status = "Downloading";
			upsertTrack(track);
		})
		.on("ytDlpEvent", (_eventType, eventData) => {
			if (track.progress > 0 && eventData.includes("Destination:")) {
				const destination = eventData.trim().split("Destination: ")[1];
				const escapedFilePath = destination.replace(/\\/g, "\\\\");
				const pathParsed = path.parse(escapedFilePath);
				track.name = pathParsed.base;
				track.path = path.join(pathParsed.dir, pathParsed.base);
				upsertTrack(track);
			}
		})
		.on("error", (error) => {
			track.completed = true;
			track.status = "Error";
			track.msg = JSON.stringify(error);
			log(JSON.stringify(error));
			upsertTrack(track);
		})
		.on("close", () => {
			track.completed = true;
			track.status = "Success";
			track.progress = 100;

			try {
				const [newName, newPath] = renameFile(path.parse(track.path));
				track.name = newName;
				track.path = newPath;
				track.similarity =
					track.type === TrackTypeObject.ByID
						? 100
						: stringSimilarity(track.originalName, track.name);
				if (track.similarity < 50) {
					track.status = "Warning";
					track.msg = "Similarity too low! ";
				}
				upsertTrack(track);

				getAudioInfo(track.path).then(({ duration, bitrate }) => {
					track.length = duration;
					if (bitrate < 320000) {
						track.msg += "Bad bitrate! ";
						track.status = "Warning";
					}
					if (duration < 120 || duration > 480) {
						track.msg += "Track seems too short or too long! ";
						track.status = "Warning";
					}
					upsertTrack(track);
				});
			} catch (e) {
				track.status = "Warning";
				track.msg = JSON.stringify(e);
				log(JSON.stringify(e));
				upsertTrack(track);
			}
		});

	log("Downloading: " + track.name + " with " + ytDlpEventEmitter.ytDlpProcess.pid);

	return ytDlpEventEmitter;
};

export const createEmptyTrack = (name: string, type: TrackType) => {
	return {
		id: Date.now().toString() + "_id",
		name: name,
		originalName: name,
		path: path.join(downloadedMusicPath, name + ".mp3"),
		type: type,
		length: 0,
		progress: 0,
		similarity: null,
		completed: false,
		status: TrackStatusObject.Pending,
		msg: "",
	};
};

