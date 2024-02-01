import { app, ipcMain } from "electron";
import path from "path";
import { Track, TrackTypeObject } from "./../vm";
import { log } from "./logger";
import { downloadedMusicPath, ytDlpExePath } from "./paths";
import { upsertTrack } from "./setupDB";
import { getAudioInfo, readCsvFilePromise } from "./utils";
import { renameFile } from "./utilsRenameFiles";
import { stringSimilarity } from "./utilsCoincidenceSystem";
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work // https://github.com/foxesdocode/yt-dlp-wrap
const async = require("async");

export const setupYtdlp = () => {
	app.whenReady().then(() => {
		ipcMain.on("download_dlp", setupDlp);
		ipcMain.on("download", downloadTrack);
	});
};

const setupDlp = async () => {
	YTDlpWrap.downloadFromGithub(ytDlpExePath).then(() => {
		log("yt-dlp.exe downloaded");
	});
};

const downloadTracks = (tracks: string[]) => {
	async.eachLimit(tracks, 4, (trackName, callback) => {
		let processDlp = downloadTrack(null, { name: trackName, type: TrackTypeObject.ByName });
		processDlp.on("close", () => {
			callback(); // Notify async that the download is complete
		});
	});
};

export const downloadTrack = (_event, listener) => {
	const ytDlpWrap = new YTDlpWrap(ytDlpExePath);
	const { name, type } = listener;

	if (type === TrackTypeObject.CSV) {
		readCsvFilePromise(name)
			.then((csvData: string[]) => {
				downloadTracks(csvData);
			})
			.catch((error) => {
				log(JSON.stringify(error));
			});
		return;
	}

	let defaultSearch = "";
	if (type !== TrackTypeObject.ByID) {
		defaultSearch = "ytsearch:";
	}

	const track: Track = {
		id: Date.now().toString() + "_id",
		name: name,
		originalName: name,
		path: path.join(downloadedMusicPath, name, ".mp3"),
		type: type,
		length: 0,
		progress: 0,
		similarity: 0,
		completed: false,
		status: "Pending",
		msg: "",
	};

	upsertTrack(track);
	

	const ytDlpEventEmitter = ytDlpWrap
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

			// correct dangerous filenames
			"--replace-in-metadata",
			"title,channel,playlist",
			"[^0-9a-zA-Z- а-яА-Я.]",
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
			
			track.similarity = stringSimilarity(track.originalName, track.name);
			if (track.similarity < 50) {
				track.status = "Warning";
				track.msg = "Similarity too low! ";
			}

			try {
				const [newName, newPath] = renameFile(path.parse(track.path));
				track.name = newName;
				track.path = newPath;
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
