export const transformAudioLengthToMinutes = (length: number): string => {
	const minutes = Math.floor(length / 60);
	const seconds = Math.floor(length % 60);

	if (minutes === 0 && seconds === 0){
		return ""
	}
	
	const formattedSeconds = seconds.toString().padStart(2, '0');

	return `${minutes}:${formattedSeconds}`;
  };