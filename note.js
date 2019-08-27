class Note {
	constructor(pitch, position, duration = 0, velocity = 1) {
		this.pitch = pitch; //midi note (0-127)
		this.position = position;
		this.duration = duration;
		this.velocity = velocity;
	}
}