import { exec } from "child_process";
import { pathFfprobe } from "../paths";

export const getAudioInfo = (filePath: string): Promise<{ duration: number; bitrate: number }> => {
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
