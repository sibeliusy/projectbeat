function Block(duration, notes = [], name = "Untitled Block") {
	this.duration = duration;
	this.notes = notes;
	this.name = name;
	this.clone = function() {
		return new Block(this.duration, this.notes.map(note => note.clone()), this.name);
	}
	this.hasNoteAt = function(position) {
		// console.log("psiton is " + Tone.Time(position).toBarsBeatsSixteenths());
		return this.notes.some(function(note) {
			// console.log("note psiton is " + Tone.Time(note.position).toBarsBeatsSixteenths());
			return checkEqualTimes(note.position, position);
		});
	}
	this.getNoteAt = function(position) {
		for (let i = 0; i < this.notes.length; i++) {
			let note = this.notes[i];
			if (checkEqualTimes(note.position, position)) {
				return note;
			}
		}
		return false;
	}
}

function Note(pitch, position, duration, velocity = 1) {
	this.pitch = pitch; //midi note (0-127)
	this.position = position;
	this.duration = duration;
	this.velocity = velocity;
	this.clone = function() {
		return new Note(this.pitch, this.position, this.duration, this.velocity);
	}
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

	this.getMod = function(index) {
		return this.get(index % this.size());
	}

	this.size = function() {
		return this.chords.length;
	}

	this.subdivide = function(subdivision) { //subdivision is in bbs
		let newChords = [];
		this.chords.forEach(function(chord) {
			for (let i = 0; i < Math.round(fromBBStoBeats(chord.duration) / fromBBStoBeats(subdivision)); i++) {
				newChords.push(new Chord(chord.notes, subdivision));
			}
		});
		return new ChordBlock(newChords);
	}
}
