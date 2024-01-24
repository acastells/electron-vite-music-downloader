import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, app, ipcMain, shell } from "electron";
import path, { join } from "path";
import icon from "../../resources/icon.png?asset";
const fs = require("fs");

function createWindow(): void {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
app.whenReady().then(() => {
	ipcMain.on("download_ffmpeg", downloadFfmpeg);
	ipcMain.on("download_dlp", () => {});
	ipcMain.on("clear_success", () => {});
	ipcMain.on("clear_warning", () => {});
	ipcMain.on("clear_all", () => {});
	ipcMain.on("download", () => {});
});

let ffmpegDownloadOptions = {
	zipPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg.zip"),
	folderPath: path.join(app.getPath("appData"), "Music Downloader", "ffmpeg"),
	binPath: path.join(
		app.getPath("appData"),
		"Music Downloader",
		"ffmpeg",
		"ffmpeg-master-latest-win64-lgpl-shared",
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
		console.log("ffmpeg exists and is unzipped, no operation...");
	} else if (zipPathExists && !binPathExists) {
		console.log("ffmpeg zip exists, unzipping...");
		unzipFfmpeg();
	} else {
		try {
			const url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest";
			const finalUrl = `${url}/ffmpeg-master-latest-win64-lgpl-shared.zip`;
			const win = BrowserWindow.getFocusedWindow();
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
	const { createReadStream } = require("fs");
	const unzipper = require("unzipper");

	createReadStream(ffmpegDownloadOptions.zipPath)
		.pipe(unzipper.Extract({ path: ffmpegDownloadOptions.folderPath }))
		.on("finish", () => {
			console.log("Unzipped successfully!");
		})
		.on("error", (err) => {
			console.error("Error while unzipping:", err);
		});
};
