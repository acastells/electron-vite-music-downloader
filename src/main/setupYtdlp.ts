import { app, ipcMain } from "electron";
import path from "path";
import { Track, TrackTypeObject } from "./../vm";
import { pathFfprobe, versionFFmpeg } from "./paths";
import { getTracks, removeTrack, upsertTrack } from "./setupDB";
import { readCsvFilePromise } from "./utils";
const YTDlpWrap = require("yt-dlp-wrap").default; // TS version does not work // https://github.com/foxesdocode/yt-dlp-wrap
const fs = require("fs");
const { exec } = require("child_process");
const async = require('async');

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
		ipcMain.on("rename_files", renameFiles);
		ipcMain.on("playTrack", playTrack);
		ipcMain.on("hideTrack", hideTrack);
		ipcMain.on("retryTrack", retryTrack);
		ipcMain.on("deleteTrack", deleteTrack);
	});

	const playTrack = (_event, track: Track) => {
		exec(`start wmplayer "${track.path}"`, (error) => {
			if (error) {
				console.error("Error:", error);
			}
		});
	};

	const hideTrack = (_event, track: Track) => {
		removeTrack(track);
	};

	const retryTrack = (_event, track: Track) => {
		removeTrack(track);
		try {
			fs.unlinkSync(track.path);
			console.log("File is deleted.");
		} catch (err) {
			console.error(err);
		}
		downloadTrack(null, { name: track.originalName, type: TrackTypeObject.ByName });
	};

	const deleteTrack = (_event, track: Track) => {
		removeTrack(track);
		try {
			fs.unlinkSync(track.path);
			console.log("File is deleted.");
		} catch (err) {
			console.error(err);
		}
	};

	const setupDlp = async () => {
		YTDlpWrap.downloadFromGithub(binaryPath).then(() => {
			console.log("yt-dlp.exe downloaded");
		});
	};

	const renameFiles = () => {
		for (const track of getTracks()) {
			const [newName, newPath] = renameFile(path.parse(track.path));
			track.name = newName;
			track.path = newPath;
			upsertTrack(track);
		}
	};

	const renameFile = (pathParsed: path.ParsedPath) => {
		const renameFileAux = (
			filePath: string,
			oldText: string,
			newText: string
		): path.ParsedPath => {
			const newFilePath = filePath.replace(oldText, newText);
			fs.renameSync(filePath, newFilePath);
			pathParsed = path.parse(newFilePath);
			return pathParsed;
		};

		if (pathParsed.base.includes("|")) {
			const filePath = path.join(pathParsed.dir, pathParsed.base);
			pathParsed = renameFileAux(filePath, "|", "");
		}

		if (pathParsed.base.includes(" - NA.mp3")) {
			const filePath = path.join(pathParsed.dir, pathParsed.base);
			pathParsed = renameFileAux(filePath, " - NA.mp3", ".mp3");
		}

		if (pathParsed.base.includes(" - .mp3")) {
			const filePath = path.join(pathParsed.dir, pathParsed.base);
			pathParsed = renameFileAux(filePath, " - .mp3", ".mp3");
		}

		if (pathParsed.base.includes(" .mp3")) {
			const filePath = path.join(pathParsed.dir, pathParsed.base);
			pathParsed = renameFileAux(filePath, " .mp3", ".mp3");
		}

		const regexPatterns = [/\(([^)]+)\)/, /\[([^)]+)\]/];

		const thingsToRemove = [
			"Official",
			"Oficial",
			"Music",
			"Video",
			"Español",
			"Lyric",
			"Audio",
			"Download",
			"Visualizer",
			"Radio",
			"Monstercat",
			"Release",
		];

		for (const regexPattern of regexPatterns) {
			const matches = pathParsed.base.match(regexPattern);
			if (matches) {
				for (const match of matches) {
					for (const thing of thingsToRemove) {
						if (match.includes(thing)) {
							const oldFilename = path.join(pathParsed.dir, pathParsed.base);
							const newFilename = pathParsed.base.replace(match, "");
							const newFilePath = path.join(pathParsed.dir, newFilename);
							fs.renameSync(oldFilename, newFilePath);
							pathParsed = path.parse(newFilePath);
						}
					}
				}
			}
		}

		return [pathParsed.base, path.join(pathParsed.dir, pathParsed.base)];
	};

	const downloadTracks = (tracks: string[]) => {
		async.eachLimit(tracks, 4, (trackName, callback) => {
			let processDlp = downloadTrack(null, {name:trackName, type:TrackTypeObject.ByName })		  
			  processDlp.on('close', () => {
				callback(); // Notify async that the download is complete
			  });
		})
	}

	const downloadTrack = (_event, listener) => {
		const ytDlpWrap = new YTDlpWrap(binaryPath);
		const { name, type } = listener;

		if (type === TrackTypeObject.CSV) {
			readCsvFilePromise(name)
				.then((csvData: string[]) => {
					downloadTracks(csvData)
				})
				.catch((error) => {
					console.error(error);
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
				"--replace-in-metadata",
				"title,uploader",
				"[_|]",
				"-",
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
				console.error(error);
				upsertTrack(track);
			})
			.on("close", () => {
				track.completed = true;
				track.status = "Success";
				track.progress = 100;
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
			});

			return ytDlpEventEmitter
	};
};

const getAudioInfo = (filePath): Promise<{ duration: number; bitrate: number }> => {
	return new Promise((resolve, reject) => {
		const command = `"${pathFfprobe}" -v error -select_streams a:0 -show_entries stream=duration,bit_rate -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;

		exec(command, (error, stdout, _stderr) => {
			if (error) {
				reject(error);
				return;
			}

			const [duration, bitrate] = stdout.trim().split("\n");

			resolve({
				duration: parseFloat(duration),
				bitrate: parseInt(bitrate),
			});
		});
	});
};
