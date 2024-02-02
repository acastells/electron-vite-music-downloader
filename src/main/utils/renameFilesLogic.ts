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

	const keywords = [
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
		"Release"
	];

	const removeParenthesisWithKeywords = (str) => {
		const regex = new RegExp(`\\([^\\)]*(${keywords.join("|")})[^\\)]*\\)`, "gi");
		return str.replace(regex, "").trim();
	};
	
	const removeBracketsWithKeywords = (str) => {
		const regex = new RegExp(`\\[[^\\]]*(${keywords.join("|")})[^\\]]*\\]`, "gi");
		return str.replace(regex, "").trim();
	};

	let oldName = pathParsed.base;
	let newName = removeParenthesisWithKeywords(oldName);
	fs.renameSync(path.join(pathParsed.dir, oldName), path.join(pathParsed.dir, newName));
	oldName = newName;
	newName = removeBracketsWithKeywords(oldName);
	fs.renameSync(path.join(pathParsed.dir, oldName), path.join(pathParsed.dir, newName));
	pathParsed = path.parse(path.join(pathParsed.dir, newName));

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

	return [pathParsed.base, path.join(pathParsed.dir, pathParsed.base)];
};
