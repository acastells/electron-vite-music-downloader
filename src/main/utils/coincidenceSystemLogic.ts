export function stringSimilarity(str1, str2) {
	const intersectionPercentage = 0.8;
	const setSizePercentage = 0.7;
	const decreaseExtraWords = 0.06;

	// Remove file extension if present
	const filename1 = str1.replace(/\.[^/.]+$/, "");
	const filename2 = str2.replace(/\.[^/.]+$/, "");

	// Convert filenames to lowercase and split into individual words
	const words1 = filename1.toLowerCase().split(" ");
	const words2 = filename2.toLowerCase().split(" ");

	// Create sets of unique words
	const set1 = new Set(words1.filter((word) => /^[a-z0-9\(\)\[\]]+$/i.test(word)));
	const set2 = new Set(words2.filter((word) => /^[a-z0-9\(\)\[\]]+$/i.test(word)));

	// Calculate the intersection of the two sets
	const intersection = new Set([...set1].filter((word) => set2.has(word)));

	// Calculate the Jaccard similarity coefficient
	const similarity =
		(intersection.size * intersectionPercentage) /
		(set1.size * setSizePercentage +
			set2.size * setSizePercentage -
			intersection.size * intersectionPercentage);

	// Calculate the extra words in each filename
	const extraWords1 = set1.size - intersection.size;
	const extraWords2 = set2.size - intersection.size;

	// Decrease similarity based on the extra words
	const similarityWithExtraWords = similarity - (extraWords1 + extraWords2) * decreaseExtraWords;

	// Convert similarity to a percentage
	const similarityPercentage = similarityWithExtraWords * 100;

	// Round the similarity percentage to two decimal places
	const roundedSimilarity = Math.min(Math.round(similarityPercentage * 100) / 100, 100);

	return roundedSimilarity;
}