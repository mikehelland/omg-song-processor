function OMGSongRandomizer() {

    this.rand = {
        nextInt: function (i) {
            return Math.floor(Math.random() * (i || 2))
        },
        nextBoolean: function () {
            return Math.random() < 0.5
        }
    }

    this.mm = new OMGMelodyMaker(this.rand);
    this.bm = new OMGBeatMaker(this.rand);
    
}

OMGSongRandomizer.prototype.go = function (song) {
    this.beats = song.data.beatParams.beats
    this.motif = this.mm.makeMotif();
    this.melody = this.mm.makeMelodyFromMotif(this.motif, this.beats);

    Object.values(song.sections).forEach(section => {

        for (var partName in section.parts) {
            var part = section.parts[partName]
            if (part.data.name === "drums") {
                this.bm.makeDrumBeat(part, song.data.beatParams)
            }
            else {
                part.data.notes = this.makePartNotes(part)
            }
        }
    })
}

OMGSongRandomizer.prototype.makePartNotes = function (part) {

    let melody
    
    if (part.data.name.toLowerCase().indexOf("bass") > -1) {
        melody = this.mm.makeBassLine(this.motif, this.beats)
    }
    else if (this.rand.nextInt(5) === 0) {
        this.motif = this.mm.makeMotif();
        melody = this.mm.makeMelodyFromMotif(this.motif, this.beats);
    }
    else if (this.rand.nextInt(4) === 0) {
        let motif = this.mm.makeMotif();
        melody = this.mm.makeMelodyFromMotif(motif, this.beats);
    }
    else if (this.rand.nextInt(3) === 0) {
        // keep the motif, but change melody
        melody = this.mm.makeMelodyFromMotif(this.motif, this.beats);
    }
    else {
        melody = JSON.parse(JSON.stringify(this.melody))
    }

    return melody
}



OMGSongRandomizer.prototype.randomRuleChange = function (now) {

    let change = this.rand.nextInt(7);

    switch (change) {
        case 0:
            //subbeatLength += this.rand.nextBoolean() ? 10 : -10;
            subbeatLength = 70 + this.rand.nextInt(125); // 125
            break;
        case 1:
            this.mm.pickRandomKey();
            break;
        case 2:
            this.mm.pickRandomScale();
            break;
        case 3:
            makeChordProgression();
            break;
        case 4:
            makeDrumbeatFromMelody();

            break;
        case 5:
            makePartNotes(basslineChannel);

            break;
        case 6:
            makePartNotes(keyboardChannel);

            break;

    }

}

OMGSongRandomizer.prototype.everyRuleChange = function () {

    subbeatLength = 70 + this.rand.nextInt(125);

    this.mm.pickRandomKey();
    this.mm.pickRandomScale();
    makeChordProgression();

    this.mm.makeMotif();
    this.mm.makeMelodyFromMotif(this.beats);

    // effects probabilities of makeDrumBeats
    setDrumset(this.rand.nextInt(2));

    monkeyWithBass();
    if (this.rand.nextInt(20) == 0) {
        basslineChannel.disable();
    }
    else {
        basslineChannel.enable();
    }

    monkeyWithDrums();
    if (this.rand.nextInt(20) == 0) {
        drumChannel.disable();
    }
    else {
        drumChannel.enable();
    }

    monkeyWithGuitar();
    if (this.rand.nextInt(3) == 0) {
        guitarChannel.enable();
    }
    else {
        guitarChannel.disable();
    }

    monkeyWithSynth();
    if (this.rand.nextInt(3) == 0) {
        keyboardChannel.enable();
    }
    else {
        keyboardChannel.disable();
    }

    monkeyWithDsp();
    if (this.rand.nextInt(3) == 0) {
        dialpadChannel.enable();
    }
    else {
        dialpadChannel.disable();
    }

    samplerChannel.makeFill();
    if (this.rand.nextInt(3) == 0) {
        samplerChannel.disable();
    }
    else {
        samplerChannel.enable();
    }

    makePartNotes(guitarChannel);
    makePartNotes(keyboardChannel);

    makePartNotes(dialpadChannel);

    playbackThread.ibeat = 0;
}



OMGSongRandomizer.prototype.makeChordProgression = function () {
    progressionI = 0;

    let pattern = this.rand.nextInt(10);
    let scaleLength = this.mm.getScaleLength();

    if (pattern < 2) {
        let rc =  2 + this.rand.nextInt(scaleLength - 2);
        progression = [0, 0, rc, rc];
    }
    else if (pattern < 4)
        progression = [0,
                        this.rand.nextInt(scaleLength),
                        this.rand.nextInt(scaleLength),
                        this.rand.nextInt(scaleLength)];

    else if (pattern < 6) {
        if (scaleLength == 6)
            progression = [0, 4, 5, 2];
        else if (scaleLength == 5) {
            progression = [0, 3, 4, 2];
        }
        else {
            progression = [0, 4, 5, 3];
        }
    }

    else if (pattern < 8) {
        if (scaleLength == 6)
            progression = [0, 0, 2, 0, 4, 2, 0, 4];
        else if (scaleLength == 5) {
            progression = [3, 4, 2, 0, ];
        }
        else {
            progression = [0, 0, 3, 0, 4, 3, 0, 4];
        }
    }

    else if (pattern == 8)
        progression = [this.rand.nextInt(scaleLength), this.rand.nextInt(scaleLength),
                this.rand.nextInt(scaleLength)];

    else {
        let changes = 1 + this.rand.nextInt(8);
        progression = new int[changes];
        for (let i = 0; i < changes; i++) {
            progression[i] = this.rand.nextInt(scaleLength);
        }
    }

    currentChord = progression[0];

}
