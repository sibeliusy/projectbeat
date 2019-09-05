console.clear();

var $ = require("jquery");

var key = 0;
var tracks = [];
var maxTime;
var beatPixels = 100;
var loop;
var loopEnd;
var loopStart;

main();

// console.log(getWeightedRandomItem([0, 1, 2, 3], [0, 1, 0.5, 2]));

function main() {
	console.log("Window loaded. App will now start");

	window.requestAnimationFrame(redraw);

	// Tone.Transport.loop = true;
	setLoop("0:0:0", "1:0:0");

	// let keys = "ABCDEFG";
	let keySelector = document.getElementById("key");
	for (let i = 0; i < 12; i++) {
		let option = document.createElement("option");
		option.value = i;
		option.innerHTML = i;
		keySelector.appendChild(option);
	}
	keySelector.addEventListener("change", function() {
		setKey(this.value);
	});


	document.getElementById("tempo-number").addEventListener("change", function() {
		setTempo(this.value);
	});
	document.getElementById("tempo-range").addEventListener("input", function() {
		setTempo(this.value);
	});

	document.getElementById("beatPixels-range").addEventListener("input", function() {
		beatPixels = this.value;
		updateTimelineGraphics();
		// updateBlockGraphics();
		redraw();
	});


	document.getElementById("play-pause").addEventListener("click", function() {
		playPause();
	});

	document.getElementById("beginning").addEventListener("click", function() {
		Tone.Transport.position = "0:0:0";
		document.getElementById("position").innerHTML = Tone.Transport.position;
	});

	Sortable.create(document.getElementById("tracks"), {
		animation: 200,
		direction: "vertical",
		group: "tracks",
		handle: ".handle",
		// multiDrag: true,
		onEnd: function (/**Event*/evt) {
			tracks.move(evt.oldIndex, evt.newIndex);
		},
	});

	let timeline = document.getElementById("timeline");
	for (i = 0; i < 100; i++) {
		let beat = document.createElement("div")
		beat.classList.add("timeline-beat");

		let beatText = document.createElement("div");
		beatText.innerHTML = Math.floor(i/4) + (i % 4 == 0 ? "" : ("." + i % 4));
		beat.appendChild(beatText);
		timeline.appendChild(beat);
	}

	document.getElementById("timeline-wrapper").addEventListener("click", function(e) {
		// console.log("click");
		updatePosition(e);
	});

	document.getElementById("new-track").addEventListener("click", function() {
		newEmptyTrack();
	});

	document.getElementById("new-beat").addEventListener("click", function() {
		genTrapBeat();
	});

// 	newEmptyTrack();
// 	newHihatTrack();


	updateTransport();
}

$(document).keydown(function (e) {
  if (e.key === ' ' || e.key === 'Spacebar') {
    // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
		if(!$(e.target).is(':input')){
    	playPause();
			e.preventDefault();
		}
  }
})

function genTrapBeat() {
	Tone.Transport.position = "0:0:0";
	redraw();
	let duration = [1, 2, 4].getWeightedRandomItem([13, 2, 1]);
	setLoop("0:0:0", duration + ":0:0");
	setKey(getRandomInt(0, 12));
	setTempo(getRandomInt(54, 94));
	let chordBlock = genTrapChords(duration);
	genTrapHarmony(chordBlock);
	let subdividedChordBlock = chordBlock.subdivide("0:0:1");
	let $808track = genTrap808Track(subdividedChordBlock);
	genTrapDrumTrack(subdividedChordBlock, $808track);
}

function genTrapChords(duration) {
	let diatonicTriads = [
		[0, 4, 7],
		[2, 5, 9],
		[4, 7, 11],
		[5, 9, 12],
		[7, 11, 14],
		[9, 12, 16],
		[11, 14, 17]
	];


	let chordBlock = new ChordBlock();
	let numChords = [2, 3, 4].getWeightedRandomItem([1, 1]);
	let durations;
	if (numChords == 2) {
		durations = ["0:2:0", "0:2:0"];
	} else if (numChords == 3) {
		durations = ["0:1:2", "0:1:2", "0:1:0"];
	} else if (numChords == 4) {
		durations = ["0:1:0", "0:1:0", "0:1:0", "0:1:0"];
	}
	for (let i = 0; i < numChords * duration; i++) {
		if (i % numChords == 0) {
			chordBlock.add(new Chord(diatonicTriads.getWeightedRandomItem([0.02, 0.02, 0.02, 0.15, 0.2, 0.75, 0]), durations[i % durations.length]));
		} else {
			chordBlock.add(new Chord(diatonicTriads.getWeightedRandomItem([0.5, 0.5, 0.5, 1, 1, 3, 0]), durations[i % durations.length]));
		}
	}
	console.log(chordBlock);
	return chordBlock;

	// let chords = [];
	// for (let i = 0; i < 4; i++) {
	// 	if (i == 0) {
	// 		chords.push(diatonicTriads.getWeightedRandomItem([0.02, 0.02, 0.02, 0.15, 0.2, 0.75, 0]));
	// 	} else {
	// 		chords.push(diatonicTriads.getWeightedRandomItem([0.5, 0.5, 0.5, 1, 1, 3, 0]));
	// 	}
	// }
	// return chords;
}

function genTrapHarmony(chordBlock) {
	let instrument = new Tone.PolySynth(4, Tone.Synth, {
		oscillator  : {
			type  : "triangle"
		}  ,
		envelope  : {
			attack  : 0.01 ,
			decay  : 0 ,
			sustain  : Math.random() + 0.1,
			release  : Math.random() * 2 + 1
		}
	});


	let vibrato = new Tone.Vibrato(Math.random() * 8, Math.random() * 0.2);
	let feedbackDelay = new Tone.FeedbackDelay("8n", Math.random() * 0.5).toMaster();
	var filter = new Tone.Filter(500 + Math.random() * 1000, "lowpass", -24).toMaster();
	instrument.chain(vibrato, filter, Tone.Master);
	instrument.connect(filter);

	let track = new Track(instrument, [], "PolySynth", "midi");
	tracks.push(track);

	let invertedChords = [];
	chordBlock.chords.forEach(function(chord) {
		invertedChords.push(chord.inverted([0, 1, 2].getWeightedRandomItem([2, 1, 1])));
	});
	let invertedChordBlock = new ChordBlock(invertedChords);

	let notes = [];
	let currentPosition = "0:0:0";
	for (let i = 0; i < chordBlock.size(); i++) {
		let octave = (Math.random() < 0.7 ? 0 : 12);
		let duration = invertedChordBlock.get(i).duration;
		invertedChordBlock.get(i).notes.forEach(function(note) {
			notes.push(new Note(48 + octave + (key + note), currentPosition, "8n"));
		});
		currentPosition = addBBSTimes(currentPosition, duration);
	}
	let block = new Block(chordBlock.duration, notes);
	let blocks = [block];
	track.blocks = blocks;

	createTrackElements(track);
}

function genTrap808Track(subdividedChordBlock) {
	let instrument = new Tone.MembraneSynth({
		pitchDecay  : 0.005,
		oscillator  : {
			type  : "sine",
			partials: [1, 0.35, 0.17, 0.08, 0.03, 0.01]
		}  ,
		envelope  : {
			attack  : 0.01,
			decay  : 0.5,
			sustain  : 0.3,
			release  : 3,
		}
	});

	instrument.toMaster();

	let gain = new Tone.Gain(1.5).toMaster();
	var dist = new Tone.Distortion(0.03).toMaster();
	instrument.chain(gain, dist);

	let track = new Track(instrument, [], "808", "midi");
	tracks.push(track);


	let notes = [];
	for (let i = 0; i < subdividedChordBlock.size(); i++) {
		if (i % 16 == 0 || Math.random() < 0.2 && i % 8 != 4) {
			let probablities = (i == 0 ? [1, 0, 0] : [2, 1, 1]);
			let note = subdividedChordBlock.get(i).notes.getWeightedRandomItem(probablities);
			notes.push(new Note(24 + (key + note) %12, "0:0:" + i, "16n"));
		}
	}
	// console.log(notes);
	let block = new Block(subdividedChordBlock.duration, notes);
	let blocks = [block];
	track.blocks = blocks;
	createTrackElements(track);

	return track;
}

function genTrapDrumTrack(subdividedChordBlock, $808track) {
	let instrument = new Tone.Sampler({
		"72" : "sounds/hihat.wav",
		"60" : "sounds/snare.wav",
		"59" : "sounds/clap.wav"
	});
	// let instrument = new Tone.PolySynth();


	instrument.toMaster();
	let track = new Track(instrument, [], "Drum Sampler", "sampler");
	tracks.push(track);

	let notes = [];
	for (let i = 0; i < subdividedChordBlock.size(); i++) {
		if (Math.random() < 0.1) {
			notes.push(new Note(72, "0:0:" + i, "32n"));
			notes.push(new Note(72, "0:0:" + (i + 0.5), "32n"));
		} else if (Math.random() < 0.1) {
			notes.push(new Note(72, "0:0:" + i, "64n"));
			notes.push(new Note(72, "0:0:" + (i + 0.25), "64n"));
			notes.push(new Note(72, "0:0:" + (i + 0.5), "64n"));
			notes.push(new Note(72, "0:0:" + (i + 0.75), "64n"));
		} else {
			notes.push(new Note(72, "0:0:" + i, "16n"));
		}

		if (Math.random() < 0.2 && i % 2 == 1) { //808 doesnt have note at this beat
			// console.log(Tone.Time("0:0:" + 2*i).toBarsBeatsSixteenths());
			if (!$808track.blocks[0].notes.some(function(note) {
				return checkEqualTimes("0:0:" + i, note.position);
			})) {
				notes.push(new Note(63, "0:0:" + i, "16n"));
			}
		}

		console.log("i=" + i);
		if (i % 8 == 4) {
			notes.push(new Note(59, "0:0:" + i, "16n"));
		}
	}
	let block = new Block(subdividedChordBlock.duration, notes);
	let blocks = [block];
	track.blocks = blocks;

	createTrackElements(track, "Drum Sampler");
}

function newEmptyTrack() {
	name = "Untitled Track";

	let instrument = new Tone.Synth;
	instrument.toMaster();
	let track = new Track(instrument, [], "Synth", "midi");
	tracks.push(track);

	let notes = [];
	for (let i = 0; i < 4; i++) {
		notes.push(new Note(Math.floor(Math.random() * 20 + 50), "0:0:" + 4*i, "4n"));
	}
	let block = new Block("1:0:0", notes);

	let blocks = [block];
	track.blocks = blocks;

	createTrackElements(track, name);
}

function createTrackElements(track) {
	let trackElement = document.createElement("div");
	trackElement.classList.add("track");
	trackElement.classList.add(track.type);
	document.getElementById("tracks").appendChild(trackElement);

	let trackHeader = document.createElement("div");
	trackHeader.classList.add("track-header");
	trackHeader.classList.add("left");
	trackElement.appendChild(trackHeader);

	let trackHandle = document.createElement("div")
	trackHandle.classList.add("handle");
	// trackHandle.innerHTML = "⋮";
	// trackHandle.innerHTML = "↕";
	trackHandle.innerHTML = "⠿";
	// trackHandle.innerHTML = "⇅";
	trackHeader.appendChild(trackHandle);

	let trackInfo = document.createElement("div");
	trackInfo.classList.add("track-header-info");
	trackHeader.appendChild(trackInfo);

	let trackName = document.createElement("input");
	trackName.classList.add("track-header-name");
	trackName.value = track.name;
	trackInfo.appendChild(trackName);

	let trackVolume = document.createElement("input");
	trackVolume.classList.add("track-header-volume");
	trackVolume.type = "range";
	trackVolume.min = 0;
	trackVolume.max = 1;
	trackVolume.step = 0.05;
	trackVolume.value = 0.75;
	trackVolume.addEventListener("input", function() {
		console.log(round(6 / Math.log(4/3) * Math.log(4/3 * this.value), 1));
		tracks[$(trackElement).index()].instrument.volume.value = round(6 / Math.log(4/3) * Math.log(4/3 * this.value), 1);
	});
	trackInfo.appendChild(trackVolume);

	let trackDelete = document.createElement("div");
	trackDelete.classList.add("track-header-delete");
	trackDelete.innerHTML = "X";
	trackDelete.addEventListener("click", function() {
		tracks.splice($(trackElement).index(), 1);
		trackElement.remove();
		updateTransport();
	})
	trackInfo.appendChild(trackDelete);

	let trackDisplay = document.createElement("div");
	trackDisplay.classList.add("track-display");
	trackDisplay.classList.add("right");
	trackElement.appendChild(trackDisplay);

	track.blocks.forEach(function(block) {
		let blockContainer = document.createElement("div");
		blockContainer.classList.add("track-block-container");
		trackDisplay.appendChild(blockContainer);

		let blockElement = document.createElement("div");
		blockElement.classList.add("track-block");
		blockContainer.appendChild(blockElement);

		let blockText = document.createElement("div");
		blockText.classList.add("track-block-text");
		blockElement.appendChild(blockText);

		let blockCanvasWrapper = document.createElement("div");
		blockCanvasWrapper.classList.add("track-block-canvas-wrapper");
		blockElement.appendChild(blockCanvasWrapper);

		let blockCanvas = document.createElement("canvas");
		blockCanvas.width = 1000;
		blockCanvas.height = 500;
		blockCanvasWrapper.appendChild(blockCanvas);
	});

	sortableTrackDisplay(trackDisplay);

	let scrollAmount = $("#tracks-wrapper").height() - $("#tracks-area").height();
	// console.log(scrollAmount);
	if (scrollAmount > 0) {
		$("#tracks-area").animate({
			scrollTop: scrollAmount
		}, 200);
	}

	updateBlockGraphics();
	updateTransport();
}

function sortableTrackDisplay(trackDisplay) {
	Sortable.create(trackDisplay, {
		animation: 200,
		group: "blocks",
		handle: ".track-block",
		multiDrag: true,
		selectedClass: "selected",
		// onStart: function(evt) {
		// 	console.log(evt.item);
		// 	$(evt.item).addClass("selected");
		// },
		onEnd: function (/**Event*/evt) {
			let oldBlockArray = tracks[$(evt.from).parent().index()].blocks;
			let newBlockArray = tracks[$(evt.to).parent().index()].blocks;

			if (evt.oldIndicies.length > 0) { //detect if it was multidragged
				for (let i = evt.oldIndicies.length - 1; i >= 0; i--) { 	//multiDrag: splice in reverse order to not mess up order
					moveItemBetweenArrays(oldBlockArray, evt.oldIndicies[i].index, newBlockArray, evt.newIndicies[i].index);
				}
			} else {
				//if no multiDrag
				moveItemBetweenArrays(oldBlockArray, evt.oldIndex, newBlockArray, evt.newIndex);
			}

			updateTransport();
		},
	});
}

function updateBlockGraphics() {

	// $(".track-block-container").on("click", function(e){ //click, touchstart, dragstart too?
	// 	e.stopPropagation();
	// 	// console.log(e.type);
	// 	// console.log(this);
	// 	$(this).toggleClass("selected");
	// });
	//
	// $("#tracks-area").on("click", function(evt){ //touchstart too?
	// 	if(!$(evt.target).is(".track-block-container")) {
	// 		console.log("should deselect");
	// 		evt.stopImmediatePropagation();
	// 		$(".track-block-container").not($(this)).removeClass("selected");
	// 		$(this).toggleClass("selected");
	// 	}
	// });


	$(".track-display").each(function(i) {
		$(this).children().each(function(j) {
			let blockContainer = $(this)[0];
			let blockElement = $(this).find(".track-block")[0];
			let blockText = $(this).find(".track-block-text")[0];
			let blockCanvas = $(this).find("canvas")[0];
			let ctx = blockCanvas.getContext("2d")

			ctx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);

			let scalar = 4;
			blockCanvas.width = parseFloat($(this).find("canvas").css("width")) * scalar;
			blockCanvas.height = parseFloat($(this).find("canvas").css("height")) * scalar;
			// ctx.strokeStyle = "#0092cc";
			ctx.strokeStyle = "black";
			ctx.lineWidth = blockCanvas.height / 16;

			let block = tracks[i].blocks[j];

			// blockContainer.style.width = Tone.Time(block.duration).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + "px";
			blockElement.style.width = Tone.Time(block.duration).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels - parseFloat($(blockElement).css("margin-right")) + "px";

			let minPitch = 128;
			let maxPitch = 0;
			block.notes.forEach(function(note) {
				if (note.pitch < minPitch) {
					minPitch = note.pitch;
				}
				if (note.pitch > maxPitch) {
					maxPitch = note.pitch;
				}
			});
			minPitch -= 1;
			maxPitch += 1;



			block.notes.forEach(function(note) {
				// text += note.pitch + " ";

				let notePosition = fromBBStoBeats(note.position) / fromBBStoBeats(block.duration);
				let noteDuration = fromBBStoBeats(note.duration) / fromBBStoBeats(block.duration);
				ctx.beginPath();
				let y = blockCanvas.height - (0.6*((note.pitch - minPitch) / (maxPitch - minPitch))+0.2)  * blockCanvas.height;
				ctx.moveTo(notePosition * blockCanvas.width, y);
				ctx.lineTo((notePosition + noteDuration) * blockCanvas.width - 1 * scalar, y);
				ctx.stroke();
			});
			blockText.innerHTML = block.name;
		});
	});
}

function updateTransport() {

	// console.log(Tone.Transport.loop);

	// if (loop) {
	// 	setLoop(loopStart, loopEnd);
	// }

	if (Tone.Transport.loop) {
		maxTime = loopEnd;
	} else {
		maxTime = "0:0:0";
	}
	Tone.Transport.cancel();
	if (tracks.length > 0) {
		tracks.forEach(function(track) {
			if (track.blocks.length > 0) {
				currentPosition = "0:0:0";
				//what the hell is this declaring vars? If I say its a var or a let then it can't read it lower down
				track.blocks.forEach(function(block) {
					if (block.notes.length > 0) {
						block.notes.forEach(function(note) {
							let position = addBBSTimes(currentPosition, note.position);
							Tone.Transport.schedule(function(time) {
								track.instrument.triggerAttackRelease(Tone.Frequency(note.pitch, "midi").toNote(), note.duration, time);
							}, position);
						});
					}
					currentPosition = addBBSTimes(currentPosition, block.duration);
					if (Tone.Time(currentPosition).valueOf() > Tone.Time(maxTime).valueOf()) {
						maxTime = currentPosition;
					}
				});
			}
		});
	}

	// window.requestAnimationFrame(redraw);

	updateTimelineGraphics();
	// updateBlockGraphics();

	console.log("updated with new maxTime = " + maxTime);
}

function updateTimelineGraphics() {
	updateBlockGraphics();
	let timeline = $("#timeline");
	timeline.children(".timeline-beat").each(function(i) {
		let beat = $(".timeline-beat").eq(i);

		beat.removeClass("normal loop loop-end");

		if (i < fromBBStoBeats(maxTime)) {
			beat.addClass("normal");
			Tone.Transport.schedule(function(time) {
				Tone.Draw.schedule(function() {
					beat.addClass("normal-ping");
					beat.on("animationend", function(){
			    	$(this).removeClass('normal-ping');
			    });
				}, time);
			}, "0:" + i + ":0");
		}

		if (Tone.Transport.loop) {
			if (i >= Math.round(fromBBStoBeats(loopStart)) && i < Math.round(fromBBStoBeats(loopEnd))) {
				beat.addClass("loop");
				Tone.Transport.schedule(function(time) {
					Tone.Draw.schedule(function() {
						beat.addClass("loop-ping");
						beat.on("animationend", function(){
				    	$(this).removeClass('loop-ping');
				    });
					}, time);
				}, "0:" + i + ":0");
			} else if (i == Math.round(fromBBStoBeats(loopEnd))) {
				beat.addClass("loop-end");
			}
		}
	});

	timeline.children(".timeline-beat").children("div").css("display", "none");
	if (beatPixels < 17) {
		timeline.children(".timeline-beat:nth-of-type(8n+1)").children("div").css("display", "flex");
	} else if (beatPixels < 34) {
		timeline.children(".timeline-beat:nth-of-type(4n+1)").children("div").css("display", "flex");
	} else {
		timeline.children(".timeline-beat").children("div").css("display", "flex");
	}


	$(".timeline-beat").css("width", beatPixels + "px");
	let grayedOut = document.getElementById("grayed-out");
	grayedOut.style.left = Tone.Time(maxTime).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline-wrapper").css('padding-left')) + parseFloat($("#tracks-top-left").css("width")) + "px";
	grayedOut.style.width = "calc(100% - " + grayedOut.style.left + ")";
}

function redraw() {
	// console.log("redrawing");
	if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf() && Tone.Transport.state == "started" && !Tone.Transport.loop) {
		playPause(document.getElementById("play-pause"));
		Tone.Transport.position = maxTime;
	}
	document.getElementById("position").innerHTML = Tone.Transport.position;
	// + parseFloat($("#timeline-wrapper").css('padding-left'))
	$(".playhead-part").css("left", Tone.Time(Tone.Transport.position).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline-wrapper").css('padding-left')) + parseFloat($("#tracks-top-left").css("width"))  + "px");
	if (Tone.Transport.state == "started") {
		window.requestAnimationFrame(redraw);
	}
}

function updatePosition(e) {
	// console.log("position update startd");
	let positionToSet = ((e.clientX - parseFloat($("#timeline-wrapper").css('padding-left')) - parseFloat($("#tracks-top-left").css('width')) + parseFloat($("#tracks-area").scrollLeft())) / beatPixels);
	if (positionToSet < 0) {
		positionToSet = 0;
	}
	Tone.Transport.position = "0:" + positionToSet + ":0";
	if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf()) {
		Tone.Transport.position = maxTime;
	}

	document.getElementById("position").innerHTML = Tone.Transport.position;
	redraw();
}

function playPause() {
	if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }
	if (Tone.Transport.state == "stopped" || Tone.Transport.state == "paused") {
		Tone.Transport.start();
		document.getElementById("play-pause").innerHTML = "pause";
	} else {
		Tone.Transport.pause();
		document.getElementById("play-pause").innerHTML = "play";
	}
	redraw();
}

function setTempo(value) {
	document.getElementById("tempo-number").value = value;
	document.getElementById("tempo-range").value = value;
	Tone.Transport.bpm.value = value;
}

function setKey(value) {
	document.getElementById("key").value = value;
	key = value;
}

function setLoop(start, end) {
	// console.log("setloop start=" + start + ", end=" + end);
	loop = true;
	Tone.Transport.loop = true;
	loopStart = start;
	loopEnd = end;
	Tone.Transport.loopStart = start;
	Tone.Transport.loopEnd = end;
	// console.log(Tone.Transport.loop);
}
