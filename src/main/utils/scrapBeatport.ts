import { parse } from "node-html-parser";

export async function scrapBeatport(url: string) {
	const response = await fetch(url);
	const body = await response.text();
	const tracks: string[] = [];
	const options = {
		blockTextElements: {
			noscript: false,
			style: false, // keep text content when parsing
			pre: false, // keep text content when parsing
		},
	};

	const root = parse(body, options);
	const scriptInHtml = root.querySelector("#__NEXT_DATA__");
	const parsed = JSON.parse(scriptInHtml ? scriptInHtml.rawText : "{}");

	for (const track of parsed.props.pageProps.dehydratedState.queries[0].state.data.results) {
		tracks.push(
			`${track.name} ${track.artists.map((item) => item.name).join(" - ")} ${track.mix_name}`
		);
	}
	return tracks;
}