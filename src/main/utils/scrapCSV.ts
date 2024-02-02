const fs = require("fs");
const csv = require("csv-parser");

export const readCsvFilePromise = (filePath): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		const rows: string[] = [];

		fs.createReadStream(filePath)
			.pipe(csv())
			.on("data", (data: { [key: string]: string }) => {
				const values = Object.values(data);
				rows.push(...values);
			})
			.on("end", () => {
				resolve(rows);
			})
			.on("error", (error) => {
				reject(error);
			});
	});
};
