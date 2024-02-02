import {
	Button,
	ButtonGroup,
	Container,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import React from "react";
import { Track, TrackType, TrackTypeObject } from "../../vm";

import ClearAllIcon from "@mui/icons-material/ClearAll";
import DoneIcon from "@mui/icons-material/Done";
import DownloadIcon from "@mui/icons-material/Download";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import WarningIcon from "@mui/icons-material/Warning";
import { Console } from "./components/Console";
import { TableTracks } from "./components/TableTracks";

export const App = () => {
	const [tracks, setTracks] = React.useState<Track[]>([]);
	const [newTrack, setNewTrack] = React.useState<{ name: string; type: TrackType }>({
		name: "",
		type: "ByName",
	});
	const [showConsole, setShowConsole] = React.useState(false);
	const [logConsole, setLogConsole] = React.useState<string[]>([]);
	const log = (str: string) => {
		setLogConsole([...logConsole, str]);
	};

	React.useEffect(() => {
		window.api.receive("tracks", setTracks);
		window.api.send("getTracks");
	}, []);

	React.useEffect(() => {
		window.api.receive("ffmpegSetup", (e) => log(e));
		window.api.receive("ytdlpSetup", (e) => log(e));
	}, [logConsole]);

	React.useEffect(() => {
		window.api.receive("logConsole", (e) => log(e));
	}, [logConsole]);

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
			{showConsole && <Console output={logConsole} />}
			<Grid container spacing={4} sx={{ mt: 2, mb: 2 }}>
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
					<Button
						fullWidth
						variant="outlined"
						onClick={() => setShowConsole(!showConsole)}>
						Console
					</Button>
				</Grid>
				<Grid
					item
					xs={3}
					flexDirection={"row"}
					justifyContent="center"
					alignItems={"center"}>
					<ButtonGroup fullWidth>
						<Button onClick={() => window.api.send("check_ffmpeg")}>FFMPEG ?</Button>
						<Button onClick={() => window.api.send("check_dlp")}>DLP ?</Button>
					</ButtonGroup>
					<ButtonGroup fullWidth>
						<Button onClick={() => window.api.send("download_ffmpeg")}>
							FFMPEG <SystemUpdateIcon />
						</Button>
						<Button onClick={() => window.api.send("download_dlp")}>
							DLP <SystemUpdateIcon />
						</Button>
					</ButtonGroup>
					<ButtonGroup fullWidth>
						<Button onClick={() => window.api.send("removeSuccessTracks")}>
							<ClearAllIcon /> <DoneIcon />
						</Button>
						<Button onClick={() => window.api.send("removeWarningTracks")}>
							<ClearAllIcon /> <WarningIcon />
						</Button>
						<Button onClick={() => window.api.send("dbClear")}>
							<ClearAllIcon />{" "}
						</Button>
					</ButtonGroup>
				</Grid>
			</Grid>

			<TableTracks tracks={tracks} />
		</Container>
	);
};
