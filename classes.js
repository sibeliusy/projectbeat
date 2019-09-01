function Block(duration, notes = [], name = "Untitled Block") {
	this.duration = duration;
	this.notes = notes;
	this.name = name;
	this.copy = function() {
		return new Block(this.duration, this.notes, this.name);
	}
}

function Note(pitch, position, duration = 0, velocity = 1) {
	this.pitch = pitch; //midi note (0-127)
	this.position = position;
	this.duration = duration;
	this.velocity = velocity;
}

function Track(instrument, blocks = [], name = "Untitled Track") {
	this.instrument = instrument;
	this.blocks = blocks;
	this.name = name;
}
