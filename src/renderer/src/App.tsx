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
import { Track, TrackStatus, TrackType } from "./vm";

import ClearAllIcon from "@mui/icons-material/ClearAll";
import DeleteIcon from "@mui/icons-material/Delete";
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

	React.useEffect(() => {
		setTracks([
			...tracks,
			{
				id: Date.now(),
				name: "Bangarang",
				path: "/Desktop/",
				type: TrackType.ByName,
				length: 330,
				progress: 50,
				similarity: 25,
				completed: false,
				status: TrackStatus.Pending,
				msg: "",
			},
		]);
	}, []);

	return (
		<Container sx={{ p: 4 }}>
			<Typography variant="h5" textAlign={"center"}>
				Music Downloader <Typography>By C4STI</Typography>
			</Typography>
			<Grid container spacing={4} sx={{ mt: 1, mb: 2 }}>
				<Grid item xs={5}>
					<TextField fullWidth variant="outlined" label="Track or URL"></TextField>
				</Grid>
				<Grid item xs={2}>
					<FormControl fullWidth>
						<InputLabel id="demo-simple-select-label">Type</InputLabel>
						<Select
							labelId="demo-simple-select-label"
							value={Object.entries(TrackType)[0][0]}
							label="Type"
							onChange={() => {}}>
							{Object.entries(TrackType).map(([key, value]) => (
								<MenuItem key={key} value={key}>{value}</MenuItem>
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
					<Button fullWidth variant="outlined">
						<DownloadIcon />
					</Button>
				</Grid>
				<Grid
					item
					xs={3}
					flexDirection={"row"}
					justifyContent="center"
					alignItems={"center"}>
					<ButtonGroup fullWidth>
						<Button>
							<SystemUpdateIcon /> FFMPEG
						</Button>
						<Button>
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
										value={50}></LinearProgress>
								</TableCell>
								<TableCell>{track.length}</TableCell>
								<TableCell>{track.similarity}</TableCell>
								<TableCell>{track.status}</TableCell>
								<TableCell>
									<Button color="success">
										<PlayArrowIcon />
									</Button>
									<Button>
										<HideSourceIcon />
									</Button>
									<Button color="warning">
										<DeleteIcon />
										<ReplayIcon />
									</Button>
									<Button color="error">
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
