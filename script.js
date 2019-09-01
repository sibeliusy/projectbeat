console.clear();
var tracks = [];
var maxTime;
var beatPixels = 100;
var loopEnd;
var loopStart;

window.onload = function() {
	console.log("flexion started");

	window.requestAnimationFrame(redraw);

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
		onEnd: function (/**Event*/evt) {
			tracks.move(evt.oldIndex, evt.newIndex);
			// swapDivs($(".track-display:nth-child(" + (evt.oldIndex+1) + ")"), $(".track-display:nth-child(" + (evt.newIndex+1) + ")"));
			// sortableTrackDisplay($(".track-display:nth-child(" + (evt.oldIndex+1) + ")")[0]);
			// sortableTrackDisplay($(".track-display:nth-child(" + (evt.newIndex+1) + ")")[0]);
			// updateBlockGraphics();
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
		console.log("click");
		updatePosition(e);
	});

	document.getElementById("new-track").addEventListener("click", function() {
		newEmptyTrack();
	});

	document.getElementById("new-beat").addEventListener("click", function() {
		newTrapBeat();
	});

// 	newEmptyTrack();
// 	newHihatTrack();


	updateTransport();
}

$(window).keypress(function (e) {
  if (e.key === ' ' || e.key === 'Spacebar') {
    // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
    // e.preventDefault();
    playPause();
  }
})

function newTrapBeat() {
	setTempo(getRandomInt(108, 188));
	let $808track = newTrap808Track();
	newTrapDrumTrack($808track);
}

function newTrap808Track() {
	let instrument = new Tone.MembraneSynth({
		pitchDecay  : 0.01,
		oscillator  : {
			type  : "sine",
			partials: [1, 0.35, 0.17, 0.08, 0.03, 0.01]
		}  ,
		envelope  : {
			attack  : 0.1,
			decay  : 0.5,
			sustain  : 0.3,
			release  : 3,
		}
	});

	instrument.toMaster();

	let gain = new Tone.Gain(1.5).toMaster();
	var dist = new Tone.Distortion(0.05).toMaster();
	instrument.chain(gain, dist);

	let track = new Track(instrument, [], "808");
	tracks.push(track);

	let notes = [];
	for (let i = 0; i < 16; i++) {
		if (i % 16 == 0 || Math.random() < 0.3) {
			notes.push(new Note(getRandomInt(24, 36), "0:0:" + 2*i, "8n"));
		}
	}
	let block = new Block("2:0:0", notes);
	let blocks = [block];
	track.blocks = blocks;

	console.log("track name is " + track.name);
	createTrackElements(track);

	return track;
}

function newTrapDrumTrack($808track) {
	let instrument = new Tone.Sampler({
		"72" : "sounds/hihat.wav",
		"60" : "sounds/snare.wav",
		"59" : "sounds/clap.wav"
	});
	// let instrument = new Tone.PolySynth();


	instrument.toMaster();
	let track = new Track(instrument, [], "Drum Sampler");
	tracks.push(track);

	let notes = [];
	for (let i = 0; i < 16; i++) {
		if (Math.random() < 0.1) {
			notes.push(new Note(72, "0:0:" + 2*i, "16n"));
			notes.push(new Note(72, "0:0:" + (2*i + 1), "16n"));
		} else if (Math.random() < 0.1) {
			notes.push(new Note(72, "0:0:" + 2*i, "32n"));
			notes.push(new Note(72, "0:0:" + (2*i + 0.5), "32n"));
			notes.push(new Note(72, "0:0:" + (2*i + 1), "32n"));
			notes.push(new Note(72, "0:0:" + (2*i + 1.5), "32n"));
		} else {
			notes.push(new Note(72, "0:0:" + 2*i, "8n"));
		}
	}

	for (let i = 0; i < 16; i++) {
		if (Math.random() < 0.2 && i % 2 == 1) { //808 doesnt have note at this beat
			// console.log(Tone.Time("0:0:" + 2*i).toBarsBeatsSixteenths());
			if (!$808track.blocks[0].notes.some(function(note) {
				return checkEqualTimes("0:0:" + 2*i, note.position);
			})) {
				notes.push(new Note(63, "0:0:" + 2*i, "8n"));
			}
		}
	}
	notes.push(new Note(59, "0:2", "8n"));
	notes.push(new Note(59, "1:2", "8n"));
	let block = new Block("2:0:0", notes);
	let blocks = [block];
	track.blocks = blocks;

	createTrackElements(track, "Drum Sampler");
}

function newEmptyTrack() {
	name = "Untitled Track";

	let instrument = new Tone.Synth;
	instrument.toMaster();
	let track = new Track(instrument);
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
	console.log(scrollAmount);
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
		onEnd: function (/**Event*/evt) {
			console.log($(evt.from).parent().index());
			moveItemBetweenArrays(tracks[$(evt.from).parent().index()].blocks, evt.oldIndex, tracks[$(evt.to).parent().index()].blocks, evt.newIndex);
			updateTransport();
		},
	});
}

function swapDivs(div1, div2) {
	tdiv1 = div1.clone();
	tdiv2 = div2.clone();
    div1.replaceWith(tdiv2);
    div2.replaceWith(tdiv1);
}

function moveItemBetweenArrays(oldArray, oldIndex, newArray, newIndex) {
	let movingItem = oldArray[oldIndex]
	oldArray.splice(oldIndex, 1);
	newArray.splice(newIndex, 0, movingItem);
}

function updateBlockGraphics() {

	$(".track-block-container").on("click touchstart dragstart", function(e){
		if (e.type == "touchstart" || e.type == "click") {
			e.stopImmediatePropagation();
			e.stopPropagation();
			e.preventDefault();
		}
		console.log(e.type);
		$(".track-block-container").not($(this)).removeClass("selected");
		$(this).addClass("selected");
	});

	$("#tracks-area").on("click touchstart", function(evt){
		console.log("should deselect");
		evt.stopImmediatePropagation();
		$(".track-block-container").not($(this)).removeClass("selected");
		$(this).toggleClass("selected");
	});


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
			ctx.strokeStyle = "#0092cc";
			ctx.lineWidth = blockCanvas.height / 16;

			let block = tracks[i].blocks[j];

			blockContainer.style.width = Tone.Time(block.duration).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + "px";

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
				ctx.lineTo((notePosition + noteDuration) * blockCanvas.width - 2 * scalar, y);
				ctx.stroke();
			});
			blockText.innerHTML = block.name;
			console.log("flex");
		});
	});
}

function updateTransport() {

	// console.log(loopEnd);
	Tone.Transport.loop = true;
	setLoop("0:0:0", "2:0:0");

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
		timeline.children(".timeline-beat:nth-of-type(8n+1)").children("div").css("display", "block");
	} else if (beatPixels < 34) {
		timeline.children(".timeline-beat:nth-of-type(4n+1)").children("div").css("display", "block");
	} else {
		timeline.children(".timeline-beat").children("div").css("display", "block");
	}


	$(".timeline-beat").css("width", beatPixels + "px");
	let grayedOut = document.getElementById("grayed-out");
	grayedOut.style.left = Tone.Time(maxTime).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline-wrapper").css('padding-left')) + parseFloat($("#tracks-top-left").css("width")) + "px";
	grayedOut.style.width = "calc(100% - " + grayedOut.style.left + ")";
}

function redraw() {
	// console.log("redrawing");
	let position = document.getElementById("position");
	if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf() && Tone.Transport.state == "started" && !Tone.Transport.loop) {
		playPause(document.getElementById("play-pause"));
		Tone.Transport.position = maxTime;
	}
	position.innerHTML = Tone.Transport.position;
	$(".playhead-part").css("left", Tone.Time(Tone.Transport.position).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline-wrapper").css('padding-left')) + parseFloat($("#tracks-top-left").css("width"))  + "px");
	window.requestAnimationFrame(redraw);
}

function updatePosition(e) {
	console.log("position update startd");
	// Tone.Transport.position = "0:" + Math.round((e.clientX - parseFloat($(".playhead-part").parent().css('padding-left')) - parseFloat($("#tracks-top-left").css('width')) + parseFloat($("#tracks-area").scrollLeft())) / beatPixels) + ":0";
	Tone.Transport.position = "0:" + ((e.clientX - parseFloat($(".playhead-part").parent().css('padding-left')) - parseFloat($("#tracks-top-left").css('width')) + parseFloat($("#tracks-area").scrollLeft())) / beatPixels) + ":0";
	if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf()) {
		Tone.Transport.position = maxTime;
	}

	document.getElementById("position").innerHTML = Tone.Transport.position;
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
}

function setTempo(value) {
	document.getElementById("tempo-number").value = value;
	document.getElementById("tempo-range").value = value;
	Tone.Transport.bpm.value = value;
}

function setLoop(start, end) {
	loopStart = start;
	loopEnd = end;
	Tone.Transport.loopStart = start;
	Tone.Transport.loopEnd = end;
}
