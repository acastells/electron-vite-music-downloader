import { app, ipcMain } from "electron";
import path from "path";
import { getTracks, upsertTrack } from "../setupDB";
const fs = require("fs");

app.whenReady().then(() => {
	ipcMain.on("rename_files", renameFiles);
});

export const renameFiles = () => {
	for (const track of getTracks()) {
		const [newName, newPath] = renameFile(path.parse(track.path));
		track.name = newName;
		track.path = newPath;
		upsertTrack(track);
	}
};

export const renameFile = (pathParsed: path.ParsedPath) => {
	const renameFileAux = (filePath: string, oldText: string, newText: string): path.ParsedPath => {
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
		"Official Visualizer",
		"LYRIC VIDEO",
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
