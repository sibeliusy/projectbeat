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

function checkEqualTimes(time1, time2) {
  return Tone.Time(time1).toBarsBeatsSixteenths() == Tone.Time(time2).toBarsBeatsSixteenths();
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

Array.prototype.getWeightedRandomItem = function(relativePs) {
  let totalP = 0;
  relativePs.forEach(function(p) {
    totalP += p;
  });

  let randomP = Math.random() * totalP;
  let currentP = 0;
  for (let i = 0; i < this.length; i++) {
    currentP += relativePs[i];
    if (randomP < currentP) {
      return this[i];
    }
  }
  // return 0;
}

Array.prototype.rotateRight = function( n ) {
  this.unshift.apply( this, this.splice( n, this.length ) );
  return this;
}

function moveItemBetweenArrays(oldArray, oldIndex, newArray, newIndex) {
	let movingItem = oldArray[oldIndex]
	oldArray.splice(oldIndex, 1);
	newArray.splice(newIndex, 0, movingItem);
}
