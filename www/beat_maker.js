function OMGBeatMaker (rand) {
    this.rand = rand
}


OMGBeatMaker.prototype.makeDrumBeatsFromMelody = function (pattern) {

    clearPattern();

    let kick = this.pattern[0];
    let clap = this.pattern[1];
    let toms = [this.pattern[5], this.pattern[6], this.pattern[7]];

    let usedBeats = 0.0;

    let snareCutTime = this.rand.nextBoolean();

    let ib = 0;

    let usetom = false;
    let usekick;
    let useclap;

    for (let note of bassline) {
        usekick = false;
        useclap = false;
        usetom = false;

        if ((snareCutTime && usedBeats % 2 == 1.0) ||
                (!snareCutTime && usedBeats % 4 == 2.0)) {
            useclap = !note.isRest() || this.rand.nextBoolean();
        }
        else if ((snareCutTime && usedBeats % 2 == 0.0) ||
                (!snareCutTime && usedBeats % 4 == 0.0)) {
            usekick = !note.isRest() || this.rand.nextBoolean();
        }
        else {
            if (this.rand.nextBoolean())
                usekick = !note.isRest() && this.rand.nextBoolean();
            else
                usetom = !note.isRest() && this.rand.nextBoolean();
        }

        kick[ib] = usekick;
        clap[ib] = useclap;
        if (usetom) {
            toms[this.rand.nextInt(3)][ib] = true;
        }

        for (ib = ib + 1; ib < (usedBeats  + note.beats) * this.subbeats; ib++) {
            kick[ib] = this.rand.nextBoolean() && ((snareCutTime && ib % (2 * this.subbeats) == 0) ||
                    (!snareCutTime && ib % (4 * this.subbeats) == 0));
            clap[ib] = (snareCutTime && ib % (2 * this.subbeats) == this.subbeats) ||
                    (!snareCutTime && ib % (4 * this.subbeats) == (2 * this.subbeats));
        }

        usedBeats += note.beats;
    }

    for (ib = ib + 1; ib < (beats - usedBeats) * this.subbeats; ib++) {
        kick[ib] = this.rand.nextBoolean() && ((snareCutTime && ib % (2 * this.subbeats) == 0) ||
                (!snareCutTime && ib % (4 * this.subbeats) == 0));
        clap[ib] = this.rand.nextBoolean() && ((snareCutTime && ib % (2 * this.subbeats) == this.subbeats) ||
                (!snareCutTime && ib % (4 * this.subbeats) == (2 * this.subbeats)));
    }

    makeHiHatBeats(false);
}


OMGBeatMaker.prototype.makeHiHatBeats = function (defaultPattern) {

    let hihats = [this.pattern[2], this.pattern[3]];

    let openhh = this.rand.nextInt(3) > 0 ? 0 : 1;
    let opensubs = this.rand.nextInt(3) > 0 ? 0 : 1;
    let tmpopensubs;

    for (let i = 0; i < this.totalSubbeats; i++) {
        hihats[0][i] = defaultPattern && default_hithat[i];
        hihats[1][i] = false;
    }

    if (defaultPattern)
        return;

    let accent = Math.round(Math.random() * 10) / 10

    let downbeat;
    for (let i = 0; i < 4; i++) {
        downbeat = i * 4;
        hihats[openhh][downbeat] = this.rand.nextInt(20) > 0;
        hihats[openhh][downbeat + 16] = this.rand.nextInt(20) > 0;

        if (this.rand.nextInt(5) > 0) {
            tmpopensubs = (opensubs == 1 && this.rand.nextBoolean()) ? 1 : 0;
            hihats[tmpopensubs][downbeat + 2] = true;
            hihats[tmpopensubs][downbeat + 2 + 16] = true;

            if (this.rand.nextBoolean()) {
                hihats[opensubs][downbeat + 1] = accent;
                hihats[opensubs][downbeat + 3] = accent;
                hihats[opensubs][downbeat + 1 + 16] = accent;
                hihats[opensubs][downbeat + 3 + 16] = accent;
            }

        }
    }
}

OMGBeatMaker.prototype.makeKickBeats = function (defaultPattern) {

    let kick = this.pattern[0];
    console.log(kick)
    if (defaultPattern) {
        for (let i = 0; i < this.totalSubbeats; i++) {
            kick[i] = default_kick[i];
        }
        return;
    }

    let p = this.rand.nextInt(10);

    for (let i = 0; i < this.totalSubbeats; i++) {
        kick[i] = p == 0 ? (this.rand.nextBoolean() && this.rand.nextBoolean()) :
                    p <  5  ? i % this.subbeats == 0 :
                    p <  9 ? i % 8 == 0 :
                            (i == 0 || i == 8 || i == 16);
        
    }
}
OMGBeatMaker.prototype.makeClapBeats = function (defaultPattern) {

    let clap = this.pattern[1];
    if (defaultPattern) {
        for (let i = 0; i < this.totalSubbeats; i++) {
            clap[i] = default_clap[i];
        }
        return;
    }

    let pattern = this.rand.nextInt(20);

//        clap = new boolean[beats * subbeats];

    let snareCutTime = false //this.rand.nextBoolean();
    for (let i = 0; i < this.totalSubbeats; i++) {

        clap[i] = pattern != 0 && (
            (!snareCutTime && i % (2 * this.subbeats) == this.subbeats) ||
                    (snareCutTime && i % (4 * this.subbeats) == (2 * this.subbeats))

        );

    }

}

OMGBeatMaker.prototype.getTrack = function (track)  {
    return this.pattern[track];
}

OMGBeatMaker.prototype.setPattern = function (track, subbeat, value) {
    this.pattern[track][subbeat] = value;
}

OMGBeatMaker.prototype.makeDrumBeat = function (part, beatParams) {

    this.subbeats = beatParams.subbeats
    this.totalSubbeats = beatParams.subbeats * beatParams.beats * beatParams.measures
    let tracks = part.data.tracks
    this.pattern = [
        tracks[0].data, 
        tracks[1].data, 
        tracks[2].data, 
        tracks[3].data, 
        tracks[4].data, 
        tracks[5].data, 
        tracks[6].data, 
        tracks[7].data
    ]

    //clearPattern();

    //half the time, drums from the bass
    if (false && this.this.rand.nextBoolean()) {
        this.makeDrumBeatsFromMelody(basslineChannel.getNotes());
    }
    else {
        // make them separate
        this.makeKickBeats(false);
        this.makeClapBeats(false);
        this.makeHiHatBeats(false);
    
        this.makeTomBeats();
    }
}

OMGBeatMaker.prototype.makeTomBeats = function () {

    //maybe none?
    if (this.rand.nextBoolean())
        return;

    if (this.rand.nextInt(5) > -1) {
        this.makeTomFill();
        return;
    }

    let toms = [this.pattern[5], this.pattern[6], this.pattern[7]];

    for (let ib = 0; ib < 4; ib++) {

    }

}

OMGBeatMaker.prototype.makeTomFill = function () {

    let everyBar = this.rand.nextBoolean();
    let toms = [this.pattern[5], this.pattern[6], this.pattern[7]];

    let start = 8;
    if (!everyBar && this.rand.nextInt(5) == 0) {
        start = 0;
    }

    let sparse = this.rand.nextBoolean();
    let on;
    let tom;
    for (let i = start; i < 16; i++) {

        on = (sparse && this.rand.nextBoolean()) ||
                (!sparse && (this.rand.nextBoolean() || this.rand.nextBoolean()));
        tom = this.rand.nextInt(3);

        if (everyBar) {
            toms[tom][i] = on;
        }

        toms[tom][i + 16] = on;
    }

}


