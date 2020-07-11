if (typeof omg === "object" && omg.registerEmbeddedViewer) {
    omg.registerEmbeddedViewer("SONGDOC", OMGEmbeddedViewerDOC)
}

function OMGEmbeddedViewerDOC(viewer) {
    var data = viewer.data
    var parentDiv = viewer.embedDiv
    this.viewMode = viewer.params.viewMode || "full"
    this.div = document.createElement("div")
    this.div.className = "omg-thing-p"
    this.textDiv = document.createElement("div")
    this.div.appendChild(this.textDiv)
    parentDiv.appendChild(this.div)

    viewer.loadScriptsForType(
            ["https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js"],
            data.type, () => {
                this.markdown("#" + data.text)
            }
    )
}

OMGEmbeddedViewerDOC.prototype.markdown = function (input) {
    if (!this.converter) {
        this.converter = new showdown.Converter()
        this.converter.setOption('simplifiedAutoLink', 'value');
        this.converter.setOption('openLinksInNewWindow', true);
    }

    this.textDiv.innerHTML = this.converter.makeHtml(input);
}

