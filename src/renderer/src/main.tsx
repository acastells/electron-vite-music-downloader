import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import { App } from "./App";

const darkTheme = createTheme({
	palette: {
		mode: "dark",
	},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
