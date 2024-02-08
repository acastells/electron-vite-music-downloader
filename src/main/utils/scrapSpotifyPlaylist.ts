import { log } from "../logger";

const SpotifyWebApi = require("spotify-web-api-node");
const SPOTIFY_CLIENT_ID = "5098747bf7da4a368bb91bc3b9124501";
const SPOTIFY_CLIENT_SECRET = "c974a47f41a74811a8e61c2d6d45a95d";
const spotifyApi = new SpotifyWebApi({
	clientId: SPOTIFY_CLIENT_ID,
	clientSecret: SPOTIFY_CLIENT_SECRET,
});

async function loginSpotify() {
	// Retrieve an access token.
	const data = await spotifyApi.clientCredentialsGrant().catch((err) => {
		log(`Something went wrong when retrieving an access token ${err}`);
		throw `Something went wrong when retrieving an access token ${err}`;
	});

	// Save the access token so that it's used in future calls
	spotifyApi.setAccessToken(data.body["access_token"]);
}

export async function scrapSpotifyPlaylist(url: string) {
	const playlistId = extractPlaylistId(url);

	await loginSpotify();

	let offset = 0;
	let limit = 100;
	let totalItems = 0;
	const tracks: string[] = [];

	do {
		const response = await spotifyApi
			.getPlaylistTracks(playlistId, { offset, limit, fields: "items" })
			.catch((err) => {
				log(`Something went wrong when retrieving the tracks ${err}`);
				return [];
			});

		const items = response.body.items;
		for (const item of items) {
			const trackName = item.track.name;
			const artistNames = item.track.artists.map((artist) => artist.name);
			const trackInfo = `${trackName} - ${artistNames.join(" ")}`;
			tracks.push(trackInfo);
		}

		totalItems = tracks.length;
		offset += limit;
	} while (offset <= totalItems);

	return tracks;
}

function extractPlaylistId(url: string): string {
	const regex = /playlist\/([\w\d]+)/;
	const match = url.match(regex);
	if (match) {
		return match[1];
	}
	return url;
}
