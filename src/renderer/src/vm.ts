type TrackTypeType = "ByName" | "ByID" | "CSV" | "SpotifyPlaylistURL" | "BeatportTopURL";
type TrackStatusType = "Pending" | "Downloading" | "Warning" | "Error" | "Success";

export const TrackType: Record<string, TrackTypeType> = {
	ByName: "ByName",
	ByID: "ByID",
	CSV: "CSV",
	SpotifyPlaylistURL: "SpotifyPlaylistURL",
	BeatportTopURL: "BeatportTopURL",
};

export const TrackStatus: Record<string, TrackStatusType> = {
	Pending: "Pending",
	Downloading: "Downloading",
	Warning: "Warning",
	Error: "Error",
	Success: "Success",
};

export interface Track {
	id: number;
	name: string;
	path: string;
	type: TrackTypeType;
	length: number;
	progress: number;
	similarity: number;
	completed: boolean;
	status: TrackStatusType;
	msg: string;
}
