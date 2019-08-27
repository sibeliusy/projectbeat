console.clear();
var tracks = [];
var maxTime;
var beatPixels = 100;

window.onload = function() {
	console.log("flexion started");
	

	
	document.getElementById("tempo-number").addEventListener("change", function() {
		setTempo(this.value);
	});
	document.getElementById("tempo-range").addEventListener("input", function() {
		setTempo(this.value);
	});
	
	document.getElementById("beatPixels-range").addEventListener("input", function() {
		beatPixels = this.value;
		updateTimelineGraphics();
		updateBlockGraphics();
	});
	
	
	document.getElementById("play-pause").addEventListener("click", function() {
		playPause();
	});
	
	document.getElementById("beginning").addEventListener("click", function() {
		Tone.Transport.position = "0:0:0";
		document.getElementById("position").innerHTML = Tone.Transport.position;
		updatePlayhead();
	});
	
	Sortable.create(document.getElementById("track-headers"), {
		animation: 200,
		direction: "vertical",
		group: "track-headers",
		handle: ".handle",
		onEnd: function (/**Event*/evt) {
			tracks.move(evt.oldIndex, evt.newIndex);
			swapDivs($(".track-display:nth-child(" + (evt.oldIndex+1) + ")"), $(".track-display:nth-child(" + (evt.newIndex+1) + ")"));
			sortableTrackDisplay($(".track-display:nth-child(" + (evt.oldIndex+1) + ")")[0]);
			sortableTrackDisplay($(".track-display:nth-child(" + (evt.newIndex+1) + ")")[0]);
			updateBlockGraphics();
		},
	});
	
	let timeline = document.getElementById("timeline");
	for (i = 0; i < 100; i++) {
		let beat = document.createElement("div")
		beat.classList.add("timeline-beat");
		
		let beatText = document.createElement("div");
		beatText.innerHTML = Math.floor(i/4) + (i % 4 == 0 ? "" : ("." + i % 4));
		beat.appendChild(beatText);
		// if (i % 4 == 0) {
// 			
// 		}
		timeline.appendChild(beat);
	}
	
	let playhead = document.getElementById("playhead");
	timeline.addEventListener("click", function(e) {
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

$( window ).resize(function() {
	updatePlayhead();
});

$(window).keypress(function (e) {
  if (e.key === ' ' || e.key === 'Spacebar') {
    // ' ' is standard, 'Spacebar' was used by IE9 and Firefox < 37
    e.preventDefault();
    playPause();
  }
})

function newTrapBeat() {
	setTempo(getRandomInt(108, 188));
	newDrumTrack();
	new808Track();
}

function new808Track() {
	let instrument = new Tone.MembraneSynth({
		pitchDecay  : 0 ,
		oscillator  : {
			type  : "sine"
		}  ,
		envelope  : {
			attack  : 0.01 ,
			decay  : 0.1 ,
			sustain  : 0.3,
			release  : 2,
		}
	});
	instrument.toMaster();
	let track = new Track(instrument);
	tracks.push(track);
	
	let notes = [];
	for (let i = 0; i < 16; i++) {
		if (i % 16 == 0 || Math.random() < 0.3) {
			notes.push(new Note(getRandomInt(30, 40), "0:0:" + 2*i, "8n"));
		}
	}
	let block = new Block("2:0:0", notes);
	let blocks = [block];		
	track.blocks = blocks;
	
	createTrackElements(track, "808");
}

function newDrumTrack() {
	let instrument = new Tone.Sampler({
// 		"72" : "https://cdn-13.anonfile.com/l2q9ld42n5/ce75658f-1566884432/hihat.wav",
// 		"60" : "https://cdn-17.anonfile.com/kfqalc4dne/4b954d9a-1566884374/snare.wav",
// 		"59" : "https://cdn-11.anonfile.com/j1q6l249n4/e36aa229-1566884452/clap.wav"

		"72" : "sounds/hihat.wav",
		"60" : "sounds/snare.wav",
		"59" : "sounds/clap.wav"
	});
// 	let instrument = new Tone.PolySynth();
	instrument.toMaster();
	let track = new Track(instrument);
	tracks.push(track);
	
	let notes = [];
	for (let i = 0; i < 8; i++) {
		notes.push(new Note(72, "0:0:" + 2*i, "8n"));
	}
	notes.push(new Note(59, "0:2", "8n"));
	let block = new Block("1:0:0", notes);
	let blocks = [block, block.copy()];		
	track.blocks = blocks;
	
	createTrackElements(track, "Drum Sampler");
}

function newEmptyTrack() {
	var name = prompt("Enter track name", "Harry Potter");
	if (name == "" || name == null) {
		name = "Untitled Track";
	}
		
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

function createTrackElements(track, name = "Untitled Track") {
	let trackHeader = document.createElement("div");
	trackHeader.classList.add("track-header");
	trackHeader.classList.add("flex-container");
	trackHeader.classList.add("left");
	document.getElementById("track-headers").appendChild(trackHeader);
		
	let trackHeaderHandle = document.createElement("div")
	trackHeaderHandle.classList.add("handle");
	trackHeaderHandle.innerHTML = "⋮";
// 	trackHeaderHandle.innerHTML = "↕";
	trackHeader.appendChild(trackHeaderHandle);
		
	let trackHeaderText = document.createElement("div")
	trackHeaderText.classList.add("track-header-text");
	trackHeaderText.innerHTML = name;
	trackHeader.appendChild(trackHeaderText);
	
	let trackDisplay = document.createElement("div");
	trackDisplay.classList.add("track-display");
	trackDisplay.classList.add("track-part");
	document.getElementById("track-displays").appendChild(trackDisplay);
	
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
		
	let scrollAmount = $("#track-elements").height() - $("#tracks-container").height();
	if (scrollAmount > 0) {
		$("#tracks-container").animate({
			scrollTop: scrollAmount
		}, 200);
	}
	
// 	updateBlockGraphics();
	updateTransport();
}

function sortableTrackDisplay(trackDisplay) {
	Sortable.create(trackDisplay, {
		animation: 200,
		group: "blocks",
// 		touchStartThreshold: 100,
// 		multiDrag: true,
		onEnd: function (/**Event*/evt) {
			moveItemBetweenArrays(tracks[$(evt.from).index()].blocks, evt.oldIndex, tracks[$(evt.to).index()].blocks, evt.newIndex);
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

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

function moveItemBetweenArrays(oldArray, oldIndex, newArray, newIndex) {
	let movingItem = oldArray[oldIndex]
	oldArray.splice(oldIndex, 1);
	newArray.splice(newIndex, 0, movingItem);
}

function updateBlockGraphics() {
	
	
	$(".track-block-container").on("click touchstart", function(e){ //click touchstart
		console.log($(this));
		console.log($(this).hasClass("selected"));
		console.log(e.type);
		e.stopImmediatePropagation();
		e.stopPropagation(); e.preventDefault();
		
		$(".track-block-container").not($(this)).removeClass("selected");
		console.log($(this).hasClass("selected"));
		$(this).toggleClass("selected");
	});
	
	$("#track-displays").on("click touchstart", function(evt){
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
			
			
			let text = "";
			block.notes.forEach(function(note) {
				text += note.pitch + " ";
				
				let notePosition = fromBBStoBeats(note.position) / fromBBStoBeats(block.duration);
				let noteDuration = fromBBStoBeats(note.duration) / fromBBStoBeats(block.duration);
				ctx.beginPath();
				let y = blockCanvas.height - (0.6*((note.pitch - minPitch) / (maxPitch - minPitch))+0.2)  * blockCanvas.height;
				ctx.moveTo(notePosition * blockCanvas.width, y);
				ctx.lineTo((notePosition + noteDuration) * blockCanvas.width - 2 * scalar, y);
				ctx.stroke();
			});
			blockText.innerHTML = text;
		});
	});
}

function updateTransport() {

	Tone.Transport.loop = true;
	Tone.Transport.loopStart = "0:0:0";
	Tone.Transport.loopEnd = "2:0:0";

	maxTime = "0:0:0";
	Tone.Transport.cancel();
	if (tracks.length > 0) {
		tracks.forEach(function(track) {
			if (track.blocks.length > 0) {
				currentPosition = "0:0:0";
				//what the hell is this declaring vars? If I say its a var or a let then it can't read it lower down
				track.blocks.forEach(function(block) {
					if (block.notes.length > 0) {
						block.notes.forEach(function(note) {
							let pitch = note.pitch;
							let position = addBBSTimes(currentPosition, note.position);
							let duration = note.duration;

// 							console.log("pitch: " + pitch + ", position: " + position);
							
							Tone.Transport.schedule(function(time) { 
								track.instrument.triggerAttackRelease(Tone.Frequency(pitch, "midi").toNote(), duration);
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
	
	Tone.Transport.scheduleRepeat(function(time) {
		repeat(time);
	}, 0.01);

	updateTimelineGraphics();
	updateBlockGraphics();
	
	console.log("updated with new maxTime = " + maxTime);
}

function updateTimelineGraphics() {
	updatePlayhead();
	let timeline = $("#timeline");
	timeline.children(".timeline-beat").each(function(i) {
		if (i < fromBBStoBeats(maxTime)) {
			$(".timeline-beat:nth-of-type(" + (i+2) + ")").removeClass("off");
			Tone.Transport.schedule(function(time) {
				Tone.Draw.schedule(function() {
					let child = $(".timeline-beat:nth-of-type(" + (i+2) + ")")
					child.addClass("on");
					child.on("animationend", function(){
				    	$(this).removeClass('on');
				    });
					console.log(i);
					console.log("0:" + i + ":0");
				}, time);
			}, "0:" + i + ":0");
		} else {
			$(".timeline-beat:nth-of-type(" + (i+2) + ")").addClass("off");
		}
	});
	
	timeline.children(".timeline-beat").children("div").css("display", "none");
	if (beatPixels < 17) {
		timeline.children(".timeline-beat:nth-of-type(8n+2)").children("div").css("display", "block");
	} else if (beatPixels < 34) {
		timeline.children(".timeline-beat:nth-of-type(4n+2)").children("div").css("display", "block");
	} else {
		timeline.children(".timeline-beat").children("div").css("display", "block");
	}
	
	
	$(".timeline-beat").css("width", beatPixels + "px");
	
	let grayedOut = document.getElementById("grayed-out");
	grayedOut.style.left = Tone.Time(maxTime).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline").css('padding-left')) + "px";
	grayedOut.style.width = "calc(100% - " + grayedOut.style.left + ")";
}

function addBBSTimes(time1, time2) {
	return Tone.Time( Tone.Time(time1).valueOf() + Tone.Time(time2).valueOf() ).toBarsBeatsSixteenths();
}

function repeat(time) {
	console.log('repeating');
	let position = document.getElementById("position");
// 	let playhead = document.getElementById("playhead");
	if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf() && Tone.Transport.state == "started" && Tone.Transport.loop == false) {
		playPause(document.getElementById("play-pause"));
		Tone.Transport.position = maxTime;
	}
	Tone.Draw.schedule(function(){
		position.innerHTML = Tone.Transport.position;
		updatePlayhead();
// 		updateTimelineGraphics();
	}, time);
}

function updatePosition(e) {
	console.log(e.type);
	if (e.type == "drag") {
		Tone.Transport.position = "0:" + ((    (parseFloat(($("#playhead").css('left'))))    - parseFloat($("#timeline").css('padding-left'))) / beatPixels) + ":0";
	} else if (e.type == "click" || e.type == "dragstop") {
		Tone.Transport.position = "0:" + Math.round((e.clientX - parseFloat($("#timeline").css('padding-left')) - parseFloat($("#tracks-top-left").css('width')) + parseFloat($("#tracks-container").scrollLeft())) / beatPixels) + ":0";
		if (Tone.Time(Tone.Transport.position).valueOf() > Tone.Time(maxTime).valueOf()) {
			Tone.Transport.position = maxTime;
		}
	}
	
	document.getElementById("position").innerHTML = Tone.Transport.position;
	updatePlayhead();
}

function updatePlayhead() {
	let playhead = document.getElementById("playhead");
	let playheadBar = document.getElementById("playhead-bar");
// 	console.log(parseFloat($("#track-elements-right").scrollLeft()));
	playhead.style.left = Tone.Time(Tone.Transport.position).valueOf() * Tone.Transport.bpm.value / 60 * beatPixels + parseFloat($("#timeline").css('padding-left')) + "px";
	playheadBar.style.height = $( "#track-elements-right" ).height() + "px";
}

function playPause() {
// 	updateTransport();
// 	Tone.context.resume();	
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