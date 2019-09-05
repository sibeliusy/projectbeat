function Block(duration, notes = [], name = "Untitled Block") {
	this.duration = duration;
	this.notes = notes;
	this.name = name;
	this.copy = function() {
		return new Block(this.duration, this.notes, this.name);
	}
}

function Note(pitch, position, duration, velocity = 1) {
	this.pitch = pitch; //midi note (0-127)
	this.position = position;
	this.duration = duration;
	this.velocity = velocity;
}

function Track(instrument, blocks = [], name = "Untitled Track", type = "notype") {
	this.instrument = instrument;
	this.blocks = blocks;
	this.name = name;
	this.type = type;
}

function Chord(notes, duration) {
	this.notes = notes;
	this.duration = duration;

	this.inverted = function(inversion) {
		let newNotes = notes.map(function(note, i) {
			return (i < inversion ? note + 12 : note);
		});
		return new Chord(newNotes, duration);
	}
}

function ChordBlock(chords = []) {
	this.chords = chords;
	this.duration;

	this.updateDuration = function() {
		this.duration = "0:0:0";
		for (let i = 0; i < chords.length; i++) {
			this.duration = addBBSTimes(this.duration, chords[i].duration);
		}
	}

	this.updateDuration();

	this.add = function(chord) {
		chords.push(chord);
		this.updateDuration();
	}

	this.get = function(index) {
		return this.chords[index];
	}

	this.size = function() {
		return this.chords.length;
	}

	this.subdivide = function(subdivision) { //subdivision is in bbs
		let newChords = [];
		chords.forEach(function(chord) {
			for (let i = 0; i < fromBBStoBeats(chord.duration) / fromBBStoBeats(subdivision); i++) {
				newChords.push(new Chord(chord.notes, subdivision));
			}
		});
		return new ChordBlock(newChords);
	}
}
