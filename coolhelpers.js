function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function fromBBStoBeats(bbs) {
	return Tone.Time(bbs).valueOf() * Tone.Transport.bpm.value / 60;
}

function addBBSTimes(time1, time2) {
	return Tone.Time( Tone.Time(time1).valueOf() + Tone.Time(time2).valueOf() ).toBarsBeatsSixteenths();
}

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};
