class Block {
	constructor(duration, notes = [], name = "Untitled Block") {
		this.duration = duration;
		this.notes = notes;
		this.name = name;
	}
	
	copy() {
		return new Block(this.duration, this.notes, this.name);
	}
}