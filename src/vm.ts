export type TrackType = "ByName" | "ByID" | "CSV" | "SpotifyPlaylistURL" | "BeatportTopURL";
export type TrackStatus = "Pending" | "Downloading" | "Warning" | "Error" | "Success";

export const TrackTypeObject: Record<TrackType, TrackType> = {
	ByName: "ByName",
	ByID: "ByID",
	CSV: "CSV",
	SpotifyPlaylistURL: "SpotifyPlaylistURL",
	BeatportTopURL: "BeatportTopURL",
};

export const TrackStatusObject: Record<TrackStatus, TrackStatus> = {
	Pending: "Pending",
	Downloading: "Downloading",
	Warning: "Warning",
	Error: "Error",
	Success: "Success",
};

export interface Track {
	id: string;
	name: string;
	originalName: string;
	path: string;
	type: TrackType;
	length: number;
	progress: number;
	similarity: number | null;
	completed: boolean;
	status: TrackStatus;
	msg: string;
}
