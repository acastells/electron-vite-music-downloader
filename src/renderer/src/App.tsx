import {
	Button,
	ButtonGroup,
	Container,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import React from "react";
import { Track, TrackType, TrackTypeObject } from "../../vm";

import ClearAllIcon from "@mui/icons-material/ClearAll";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import DownloadIcon from "@mui/icons-material/Download";
import HideSourceIcon from "@mui/icons-material/HideSource";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import WarningIcon from "@mui/icons-material/Warning";
import LinearProgress from "@mui/material/LinearProgress";

function App(): JSX.Element {
	const [tracks, setTracks] = React.useState<Track[]>([]);
	const [newTrack, setNewTrack] = React.useState<{ name: string; type: TrackType }>({
		name: "",
		type: "ByName",
	});

	React.useEffect(() => {
		window.api.receive("tracks", setTracks);
		window.api.send("getTracks");
	}, []);

	const handleDownloadTrack = () => {
		if (!newTrack.name) {
			console.log("Track name or url can not be empty");
			return;
		}

		window.api.send("download", newTrack);
	};

	React.useEffect(() => {
		if (newTrack.type === "CSV") {
			window.api.send("showOpenDialog");
			window.api.receive("showOpenDialog", (path) =>
				setNewTrack({ ...newTrack, name: path })
			);
		}
	}, [newTrack.type]);

	return (
		<Container sx={{ p: 4 }}>
			<Typography variant="h5" textAlign={"center"}>
				Music Downloader <Typography>By C4STI</Typography>
			</Typography>
			<Grid container spacing={4} sx={{ mt: 1, mb: 2 }}>
				<Grid item xs={5}>
					<TextField
						fullWidth
						variant="outlined"
						label="Track or URL"
						value={newTrack.name}
						onChange={(e) =>
							setNewTrack({ ...newTrack, name: e.target.value })
						}></TextField>
				</Grid>
				<Grid item xs={2}>
					<FormControl fullWidth>
						<InputLabel id="demo-simple-select-label">Type</InputLabel>
						<Select
							labelId="demo-simple-select-label"
							value={newTrack.type}
							label="Type"
							onChange={(e) =>
								setNewTrack({ ...newTrack, type: e.target.value as TrackType })
							}>
							<MenuItem disabled>-- Choose --</MenuItem>
							{Object.entries(TrackTypeObject).map(([key, value]) => (
								<MenuItem key={key} value={value}>
									{value}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				<Grid
					item
					xs={2}
					justifyContent={"center"}
					alignItems={"center"}
					flexDirection={"row"}>
					<Button fullWidth variant="outlined" onClick={handleDownloadTrack}>
						<DownloadIcon />
					</Button>
					<Button fullWidth variant="outlined" onClick={() => window.api.send("dbDebug")}>
						dbDebug
					</Button>
					<Button fullWidth variant="outlined" onClick={() => window.api.send("dbClear")}>
						dbClear
					</Button>
				</Grid>
				<Grid
					item
					xs={3}
					flexDirection={"row"}
					justifyContent="center"
					alignItems={"center"}>
					<ButtonGroup fullWidth>
						<Button onClick={() => window.api.send("download_ffmpeg")}>
							<SystemUpdateIcon /> FFMPEG
						</Button>
						<Button onClick={() => window.api.send("download_dlp")}>
							<SystemUpdateIcon /> DLP
						</Button>
					</ButtonGroup>
					<ButtonGroup fullWidth>
						<Button>
							<ClearAllIcon /> <DoneIcon />
						</Button>
						<Button>
							<ClearAllIcon /> <WarningIcon />
						</Button>
						<Button>
							<ClearAllIcon />{" "}
						</Button>
					</ButtonGroup>
				</Grid>
			</Grid>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Type</TableCell>
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
								<TableCell>{track.name}</TableCell>
								<TableCell>{track.type}</TableCell>
								<TableCell>
									<LinearProgress
										variant="determinate"
										color={track.completed === true ? "success" : "primary"}
										value={track.progress}></LinearProgress>
								</TableCell>
								<TableCell>{track.length}</TableCell>
								<TableCell>{track.similarity}</TableCell>
								<TableCell>{track.status}</TableCell>
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
		</Container>
	);
}

export default App;
