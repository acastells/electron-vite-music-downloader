import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import HideSourceIcon from "@mui/icons-material/HideSource";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import {
	Button,
	LinearProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
} from "@mui/material";
import { TrackStatus, Track } from "src/vm";

interface Props {
	tracks: Track[];
}

export const TableTracks = (props: Props) => {
	const { tracks } = props;

	const getStatusColor = (status: TrackStatus) => {
		switch (status) {
			case "Warning":
				return "orange";
			case "Error":
				return "red";
			case "Downloading":
				return "lightblue";
			case "Pending":
				return "lightblue";
			case "Success":
				return "green";
			default:
				return "white";
		}
	};

	const getSimilarityColor = (similarty: number) => {
		if (similarty > 50) {
			return "green";
		} else if (similarty > 25) {
			return "orange";
		} else {
			return "red";
		}
	};

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>Progress</TableCell>
						<TableCell>Length</TableCell>
						<TableCell>Similarity</TableCell>
						<TableCell>Status</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tracks.map((track) => (
						<TableRow key={track.id}>
							<TableCell>
								<Tooltip title={track.originalName}>
									<span>{track.name}</span>
								</Tooltip>
							</TableCell>
							<TableCell>
								<LinearProgress
									variant="determinate"
									color={track.completed === true ? "success" : "primary"}
									value={track.progress}></LinearProgress>
							</TableCell>
							<TableCell>{track.length}</TableCell>
							<TableCell sx={{ color: getSimilarityColor(track.similarity || 0) }}>
								{track.similarity || ""}
							</TableCell>
							<TableCell sx={{ color: getStatusColor(track.status) }}>
								<Tooltip title={JSON.stringify(track.msg)}>
									<span>{track.status}</span>
								</Tooltip>
							</TableCell>
							<TableCell>
								<Button
									color="success"
									onClick={() => window.api.send("playTrack", track)}>
									<PlayArrowIcon />
								</Button>
								<Button onClick={() => window.api.send("hideTrack", track)}>
									<HideSourceIcon />
								</Button>
								<Button
									color="warning"
									onClick={() => window.api.send("retryTrack", track)}>
									<ReplayIcon />
								</Button>
								<Button
									color="error"
									onClick={() => window.api.send("deleteTrack", track)}>
									<DeleteForeverIcon />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
