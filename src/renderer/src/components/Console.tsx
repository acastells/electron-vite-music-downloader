import { Paper } from "@mui/material";

export const makeStyles = () => {
	return {
		root: {
			padding: 2,
			backgroundColor: "#212121",
			color: "#ffffff",
			fontFamily: "monospace",
			minHeight: 200,
			overflow: "auto",
		},
	};
};

const Console = ({ output }) => {
	const classes = makeStyles();

	return (
		<Paper sx={classes.root}>
			<pre>{output}</pre>
		</Paper>
	);
};

export default Console;
