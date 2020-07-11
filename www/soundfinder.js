function OMGSoundFinder() {
    
    this.sourceOMG = "https://openmusic.gallery/data/?type=SOUNDSET"
    this.sourceDrumKits = "https://mikehelland.github.io/omg-sounds/drums/shiny_happy_kits.json"
    this.sourceSoundFonts = "https://mikehelland.github.io/omg-sounds/soundfonts/FatBoy.json"
    
    // "https://mikehelland.github.io/omg-sounds/soundfonts/MusyngKite.json"
    // "https://mikehelland.github.io/omg-sounds/soundfonts/FluidR3.json"

}

OMGSoundFinder.prototype.go = async function (song, callback) {
    
    const parts = []

    for (const partName of song.partNames) {
        let soundSet = await this.findSoundSet(partName)

        let omgpart = {name: partName, type: "PART", soundSet}

        parts.push(omgpart)
    }

    song.sections.forEach(section => {
        section.parts = []
        parts.forEach(part => {
            section.parts.push(JSON.parse(JSON.stringify(part)))
        })
    })

    song.parts = parts
    if (callback) callback()
}

OMGSoundFinder.prototype.findSoundSet = function (part) {
    let defaultSet = {"url":"PRESET_OSC_SINE","name": part,
                    "type":"SOUNDSET","octave":5,"lowNote":0,"highNote":108,"chromatic":true}
    
    let promise = new Promise(async (resolve, reject) => {
        if (part === "bass") {
            omg.server.getHTTP("https://openmusic.gallery/data/395", data => {
                resolve(data)
            })
        }    
        else if (part === "drums") {
            omg.server.getHTTP("https://openmusic.gallery/data/1207", data => {
                resolve(data)
            })
        }
        else {
            let soundSet
            if (this.soundFonts) {
                soundSet = this.findSoundFont(part)
                resolve(soundSet || defaultSet)
            }
            else {
                omg.server.getHTTP(this.sourceSoundFonts, data => {
                    this.soundFonts = data
                    soundSet = this.findSoundFont(part)
                    resolve(soundSet || defaultSet)
                })
            }
        }
        
    })
    
    return promise
    
}

OMGSoundFinder.prototype.findSoundFont = function (partName) {
    const candidates = []
    for (var font of this.soundFonts) {
        if (font.name.indexOf(partName) > -1) {
            candidates.push(font)
        }
    }

    if (candidates.length === 0) {
        return
    }

    return candidates[Math.floor(Math.random() * candidates.length)]
}