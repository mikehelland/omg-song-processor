function OMGMelodyMaker(rand) {
    this.rand = rand
}

OMGMelodyMaker.prototype.makeMelody = function (totalBeats, beatBias) {

    //50/50 use a motif
    if (this.rand.nextBoolean()) {
        return this.makeMelodyFromMotif(totalBeats);
    }

    // choose a duration to tend toward
    if (beatBias === -1.0) {
        let bbr = this.rand.nextInt(3);
        beatBias = bbr == 0 ? 0.250 : bbr == 1 ? 0.5 : 1.0;
    }

    let adjust = 0;

    let restRatio = 2 + this.rand.nextInt(10);


    let playedBeats = 0.0;
    let currentNoteDuration;
    let currentNoteNumber;
    let currentNote;

    let lastNote = 0;

    let notesAway;

    let goingUp = this.rand.nextBoolean();

    while (playedBeats < totalBeats) {

        currentNote = new Note();
        //currentNote.setBeatPosition(playedBeats);

        line.add(currentNote);

        currentNoteDuration = Math.min(getRandomNoteDuration(beatBias),
                totalBeats - playedBeats);
        currentNote.setBeats(currentNoteDuration);

        playedBeats += currentNoteDuration;

        // rest?
        if (this.rand.nextInt(restRatio) == 0) {
            currentNote.setRest(true);
            continue;
        }

        // play the last note
        if (this.rand.nextBoolean()) {
            currentNote.setBasicNote(adjust + lastNote);
            continue;
        }

        // maybe change the direction
        if (this.rand.nextBoolean()) {
            goingUp = this.rand.nextBoolean();
        }

        // play a different note
        notesAway = this.rand.nextBoolean() ? 1 : this.rand.nextBoolean() ? 2 : this.rand.nextBoolean() ? 3 : 1;

        if (!goingUp) {
            notesAway = notesAway * -1;
        }
        currentNoteNumber = lastNote + notesAway;
        currentNote.setBasicNote(adjust + currentNoteNumber);
        lastNote = currentNoteNumber;

    }

    // go backwards
    playedBeats = 0.0;
    if (this.rand.nextInt(3) == 0) {
        let line2 = [];
        for (let ii = line.size(); ii > 0; ii--) {
            currentNote = line.get(ii - 1);
            //currentNote.setBeatPosition(playedBeats);
            playedBeats += currentNote.beats;
            line2.add(currentNote);
        }
        line = line2;
    }

    currentMelody = line;
    return line;
}


OMGMelodyMaker.prototype.getRandomNoteDuration = function (beatBias) {

        if (this.rand.nextBoolean() ) {
            return beatBias;
        }

        // 50 50 chance we get an eighth note
        if (this.rand.nextBoolean())
            return 0.5;

        // quarter note
        if (this.rand.nextBoolean())
            return 1.0;

        // go for a sixteenth
        if (this.rand.nextBoolean())
            return 0.25;

        // try and eighth note again
        if (this.rand.nextBoolean())
            return 0.5;


        return beatBias;

    }

OMGMelodyMaker.prototype.makeMelodyFromMotif = function (motif,  totalbeats) {

    let ret = []
    let loops = totalbeats / 2;

    this.melodify(motif);

    let playedBeats = 0.0;

    let pattern = this.rand.nextInt(5);

    let note
    for (let i = 0; i < loops; i++) {
        if ((pattern > 2 && i%2==1)
                || (pattern == 2 && i == loops -1)
                || (pattern == 1 && i%2==0)) {
            if (this.rand.nextInt(4) > 0) {
                note = {}
                note.rest = true;
                note.beats = 2.0;
                ret.push(note);
            }
            else {
                note = {}
                Object.assign(note, motif[0])
                ret.push(note);
                let beatsFromFirstNote = note.beats;

                if (beatsFromFirstNote < 2.0) {
                    note = {};
                    note.rest = true;
                    note.beats = 2.0 - beatsFromFirstNote;
                    ret.push(note);
                }
            }
            playedBeats += 2.0;


        }
        else {
            for (let note of motif) {
                note = JSON.parse(JSON.stringify(note));
                ret.push(note);
                playedBeats += note.beats;
            }

        }

    }

    return ret;
}



// a 2 beat motif
OMGMelodyMaker.prototype.makeMotif = function () {
    let ret = []

    let beatsNeeded = 2.0;
    let beatsUsed = 0.0;

    let currentNote;
    let currentBeats;

    let beatBias;
    if (this.rand.nextBoolean()) {
        beatBias = 1;
    }
    else {
        beatBias = 0.5;
    }

    while (beatsUsed < beatsNeeded) {
        currentNote = {};

        // first note 1 in 6 on the downbeat
        if (beatsUsed == 0) {
            if (this.rand.nextInt(6) == 0) {
                currentNote.rest = true;
            }
            else {
                currentNote.note = 0
            }
        }
        else {
            if (this.rand.nextInt(3) == 0) {
                currentNote.rest = true;
            }
            else {
                currentNote.note = 0
            }
        }

        currentBeats = this.getRandomNoteDuration(beatBias);
        currentBeats = Math.min(currentBeats, beatsNeeded - beatsUsed);
        currentNote.beats = currentBeats;

        beatsUsed += currentBeats;
        ret.push(currentNote);


    }

    mCurrentMotif = ret;
    return ret;
}

OMGMelodyMaker.prototype.melodify = function (motif) {

    let lastNote = 0;
    let notesAway;
    let goingUp = this.rand.nextBoolean();

    let note;
    for (let i = 1; i < motif.length; i++) {
        note = motif[i];

        // play the last note
        if (this.rand.nextBoolean()) {
            note.note = lastNote;
            continue;
        }

        // maybe change the direction
        if (this.rand.nextBoolean()) {
            goingUp = this.rand.nextBoolean();
        }

        // play a different note
        notesAway = this.rand.nextBoolean() ? 1 : this.rand.nextBoolean() ? 2 : this.rand.nextBoolean() ? 3 : 1;

        if (!goingUp) {
            notesAway = notesAway * -1;
        }

        note.note = notesAway;

    }

    return motif;
}

