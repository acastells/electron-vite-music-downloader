export const stringSimilarity = (str1: string, str2: string): number => {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    // Split and sort the strings into individual words
    const words1: string[] = str1.match(/\w+/g)?.sort() || [];
    const words2: string[] = str2.match(/\w+/g)?.sort() || [];

    // Calculate the number of common words using Counter
    const counter1: Map<string, number> = countWords(words1);
    const counter2: Map<string, number> = countWords(words2);
    const commonWords: Set<string> = new Set([...counter1.keys()].filter(word => counter2.has(word)));

    // Calculate the total number of words
    const totalWords: number = Math.max(words1.length, words2.length);

    // Calculate the similarity score
    let similarity: number = 0;
    if (totalWords === 0) {
        similarity = 0;
    } else {
        similarity = commonWords.size / totalWords;
    }

    commonWords.forEach(word => {
        while (words1.includes(word)) {
            words1.splice(words1.indexOf(word), 1);
        }
        while (words2.includes(word)) {
            words2.splice(words2.indexOf(word), 1);
        }
    });

    while (true) {
        if (words1.length === 0 && words2.length === 0) {
            break;
        }
        if (words1.length === 0 || words2.length === 0) {
            // Penalize the similarity score if one string has more words than the other
            similarity *= 0.8; // For example, decrease the score by 20%
            break;
        } else {
            const auxScore: number = similarityBySimpleMatcher(words1[0], words2[0]);
            similarity += auxScore * (1 - (commonWords.size / totalWords));
            words1.shift();
            words2.shift();
        }
    }

    // Convert the similarity score to a percentage, maximum is 100
    const similarityPercentage: number = Math.min(Math.round(similarity * 100), 100);

    return similarityPercentage;
}

function countWords(words: string[]): Map<string, number> {
    const counter: Map<string, number> = new Map();
    for (const word of words) {
        counter.set(word, (counter.get(word) || 0) + 1);
    }
    return counter;
}

function similarityBySimpleMatcher(word1: string, word2: string): number {
    const minLength = Math.min(word1.length, word2.length);
    let matchCount = 0;
    for (let i = 0; i < minLength; i++) {
        if (word1[i] === word2[i]) {
            matchCount++;
        } else {
            break;
        }
    }
    return matchCount / minLength;
}