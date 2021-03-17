function OMGSongDocParser() {
    this.keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] 
    this.romanNumeralCharacters = ["i", "I", "v", "V", "b", "#"]
}

OMGSongDocParser.prototype.go = function (content) {

    while (content.indexOf("<br>") > -1) {
        content = content.replace("<br>", "\n")    
    }
    
    this.currentSection = null
    this.result = {
        type: "SONG", beatParams: {}, 
        keyParams: {rootNote: 0, scale: [0, 2, 4, 5, 7, 9, 11]}, 
        sections: [],
        partNames: []
    }
    
    const lines = content.split("\n")
    let line
    this.sectionI = -1

    for (let i = 0; i < lines.length; i++) {
        line = lines[i]

        if (!line) continue

        this.parseLine(line, i)
    }

    if (this.currentSection) {
        this.currentSection.endLine = lines.length 
    }

    this.makeChordProgessions()

    return this.result
}

OMGSongDocParser.prototype.parseLine = function (line, i) {

    if (i === 0) {
        this.result.name = line
    }
    else if (line.startsWith("---")) {
        // beginning of a new section
    
        if (this.currentSection) {
            //the previous line is actually the new section name
            // so remove it from the lyrics of the last section
            this.currentSection.lyrics.pop()

            this.currentSection.endLine = i - 2 
        }

        this.sectionI++
        let sectionName = this.lastLine || ("section " + this.sectionI)

        this.result.sections[this.sectionI] = {name: sectionName, chords: [], lyrics: [], 
            partNames: JSON.parse(JSON.stringify(this.result.partNames)),
            startLine: i - 1
        }
        
        this.currentSection = this.result.sections[this.sectionI]
    }
    else if (this.currentSection) {

        if (line.startsWith("(")) {
            //todo parts
        }
        else if (line.startsWith("|")) {
            line.substring(1).split(" ").forEach(chord => {
                if (chord) {
                    this.currentSection.chords.push(chord)
                }
            })
        }
        else {
            this.currentSection.lyrics.push(line)
        }
    }
    else {
        this.parseHeaderLine(line)
    }

    this.lastLine = line
}

OMGSongDocParser.prototype.parseHeaderLine = function (line, i) {

    let lowerLine = line.toLowerCase()

    if (lowerLine.startsWith("by ")) {
        //author... but aren't you logged in?
    }
    else if (lowerLine.startsWith("key of ")) {
        let p = this.parseLetterChord(line.substr(7))
        if (p) {
            p.scale = p.scale === "minor" ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11]
            this.result.keyParams = p
        }
    }
    else if (lowerLine.endsWith(" bpm")) {
        try {
            this.result.beatParams.bpm = parseInt(line.split(" ")[0])
        } catch (e) {console.error}
    }
    else if (lowerLine.startsWith("(")) {
        parts = this.parseParts(lowerLine)
    }
    else if (line.split("/").length === 2) {
        let timeSig = line.split("/")
        try {
            let beats = parseInt(timeSig[0])
            this.result.beatParams.beats = beats
        } catch (e) {console.error(e)}
    }
    else {
        console.log(line)
    }

}



OMGSongDocParser.prototype.parseParts = function (line) {
    // get rid of the parenthesis eg. (bass,drums)
    let parts = line.substr(1, line.length - 2).split(",")
    parts.forEach(part => {
        part = part.trim()

        if (this.currentSection) {
            this.currentSection.partNames.push(part)
        }
        else {
            this.result.partNames.push(part)
        }
    })
}


OMGSongDocParser.prototype.makeChordProgessions = function () {
    for (var i = 0; i < this.result.sections.length; i++) {
        this.result.sections[i].chordProgression = 
            this.makeChordProgession(this.result.sections[i].chords)
        delete this.result.sections[i].chords 
    }
}

OMGSongDocParser.prototype.makeChordProgession = function (chords) {

    let progression = []
    for (var i = 0; i < chords.length; i++) {
        progression.push(this.parseChord(chords[i]))
    }
    if (progression.length === 0) {
        progression.push(0)
    }
    return progression
}

OMGSongDocParser.prototype.parseChord = function (chordText) {

    if (this.romanNumeralCharacters.indexOf(chordText.substring(0, 1)) > -1) {
        return this.parseRomanNumeralChord(chordText)
    }

    let chord = this.parseLetterChord(chordText)
    console.log(chord)
    //is this chord in the key of the song
    //todo auto detect if not set
    let root = this.result.keyParams.rootNote || 0
    let scale = this.result.keyParams.scale || [0, 2, 4, 5, 7, 9, 11]

    for (var i = 0; i < scale.length; i++) {
        console.log(scale[i], chord.rootNote, root)
        if ((scale[i] + root) % 12 === chord.rootNote) {
            return i
        }
    }
    
    return 0
}

OMGSongDocParser.prototype.parseRomanNumeralChord = function (chordText) {

    switch (chordText) {
        case "VII":
            return 6
        case "VI":
            return 5
        case "V":
            return 4
        case "IV":
            return 3
        case "III":
            return 2
        case "II":
            return 1
        case "I":
            return 0
        }

    return 0
}

OMGSongDocParser.prototype.parseLetterChord = function (line) {

    line = line.trim().toUpperCase()
    line.replace("DB", "C#")
    line.replace("EB", "D#")
    line.replace("GB", "F#")
    line.replace("AB", "G#")
    line.replace("BB", "A#")
    
    let chord = {rootNote: 0, scale: "major"}
 
    //go backwards to get the sharp first
    for (let i = this.keys.length - 1; i >= 0; i--) {
        if (line.startsWith(this.keys[i])) {
            chord.rootNote = i

            let rest = line.replace(this.keys[i], "")
            if (rest.startsWith(" ")) {
                rest = rest.substring(1)
            }
            if (rest === "M" || rest.startsWith("MIN")) {
                chord.scale = "minor"
            }
            else {
                chord.scale = "major"
            }
            return chord
        }
    }

    return chord
}