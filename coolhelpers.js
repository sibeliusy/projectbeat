function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function fromBBStoBeats(bbs) {
	return Tone.Time(bbs).valueOf() * Tone.Transport.bpm.value / 60;
}