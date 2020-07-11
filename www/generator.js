function OMGSongGenerator() {
}

OMGSongGenerator.prototype.go = function (song) {
    
    song.sections.forEach(section => {

        section.parts.forEach(part => {
            if (part.data.name === "bass") {
                this.makeBassPart(part)
            }
            else if (part.data.name === "drums") {
                this.makeDrumsPart(part)
            }
            else {
                this.makePart(part)
            }
        })
    })
}

OMGSongGenerator.prototype.makeDrumsPart = function (part) {
    part.data.tracks[0].data = [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]
    part.data.tracks[1].data = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
    part.data.tracks[2].data = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
}


OMGSongGenerator.prototype.makeBassPart = function (part) {
    part.data.notes = [
        {note: 0, beats: 1},
        {note: 0, beats: 1},
        {note: 0, beats: 1},
        {note: 0, beats: 1}
    ]
}


OMGSongGenerator.prototype.makePart = function (part) {
    part.data.notes = []
    for (var i = 0; i < 8; i++) {
        part.data.notes.push({note: Math.floor(Math.random() * 36) - 24, beats: 0.5})
    }
}
