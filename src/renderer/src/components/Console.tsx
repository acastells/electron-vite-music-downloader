import { Paper } from "@mui/material";

const makeStyles = () => {
	return {
		root: {
			padding: 2,
			backgroundColor: "#212121",
			color: "#ffffff",
			fontFamily: "monospace",
			minHeight: 200,
			overflow: "auto",
			marginTop: 2,
			marginBottom: 2,
		},
	};
};

export const Console = ({ output }) => {
	const classes = makeStyles();

	return (
		<Paper sx={classes.root}>
			{output.map((line, index) => (
				<pre key={index}>{line}</pre>
			))}
		</Paper>
	);
};
