(function (Map, $, undefined) {
    class MapElement {
        constructor(outline = false) {

            this.outline = outline;
        }
    }

    class Row {
        elements = [];
        dragZones = []
        lines = [];

        constructor(singleWidth, fullWidth, div) {
            this.singleWidth = singleWidth;
            this.fullWidth = fullWidth;
            this.div = div;
            this.createDragLine(0);

            // var zone = this.addZone(0);
        }

        createDragLine(beforeInd) {
            var position = beforeInd * this.singleWidth;
            var line = document.createElement('div');

            $(line).css('left', position + 'px');
            $(line).css('top', '0px');
            line.className = 'drag-line';

            $(this.div).append(line);
            this.lines.push(line);
        }

        highlightDragLine(beforeInd, state=true) {
            console.log(`highlight ${beforeInd} with state ${state}`);
            if (beforeInd < 0 || beforeInd > this.lines.length)
                return false;
            this.lines[beforeInd].className = "drag-line";
            if (!state)
                this.lines[beforeInd].className += " invisible";
        }

        shift(from, to) { // from, to - indexes

        }

        addZone(index) {
            var row = this;

            var zone = document.createElement('div');
            $(zone).css('width', this.singleWidth + 'px');
            $(zone).css('left', index * this.singleWidth + 'px');
            zone.className = "drag-zone";

            zone.ondragenter = function (event) {
                row.highlightDragLine(row.dragZones.indexOf(event.target), true);
                console.log(`Ongragenter on ${event.target.innerHTML}`);
            }
            zone.ondragleave = function (event) {
                row.highlightDragLine(row.dragZones.indexOf(event.target), false);
                console.log(`ondragleave on ${event.target.innerHTML}`);
            }
            zone.ondragover = function (event) {
                event.preventDefault();
                console.log("ondragover");
            }
            zone.addEventListener('drop', (event) => {
                row.highlightDragLine(row.dragZones.indexOf(event.target), false);

                console.log("drop");
            });

            // zone.draggable = false;

            this.dragZones[index] = zone;
            $(this.div).append(zone);

            return zone;
        }

        put(facility, index) {
            // this.elements[index] = facility;

            var element = generateElement(facility);
            $(element).css('width', this.singleWidth + 'px');
            if (index == 0)
                console.log("!!!!!!!!!!!!!!!!!")
            console.log(`elements ${this.elements}`);
            // this.addZone(index);
            // element.append(zone);
            var row = this;

            element.ondragenter = function(event) {
                row.highlightDragLine( row.elements.indexOf(event.target), true );
                console.log(`Ongragenter on ${event.target.innerHTML}`);
            }
            element.ondragleave = function(event) {
                row.highlightDragLine( row.elements.indexOf(event.target), false );
                console.log(`ondragleave on ${event.target.innerHTML}`);
            }
            element.ondragover = function(event) {
                event.preventDefault();
                console.log("ondragover");
            }
            element.addEventListener('drop', (event) => {
                console.log("drop");
            });

            $(this.div).append(element);
            this.elements[index] = element;
            // this.dragZones.splice(index, 0, zone);
            // this.dragZones.push(zone);
        }

        push_back(facility) {
            var newWidth = this.getMaxLen();
            $(this.div).css('width', newWidth + 'px');
            this.put(facility, this.elements.length);
            this.createDragLine(this.elements.length);
            // console.log(`elements is lines is `)
        }

        getMaxLen() {
            return this.singleWidth * (this.elements.length + 1);
        }
    }

    const typeToRow = {
        'gate': 0,
        'flag': 0,
        'marker': 0,
        'receiver': 1,
        'mat': 2,
    }

    var initLineWidth = parseFloat($(`#map_line`).css("width").slice(0, -2));
    var rows = [
        new Row(100, initLineWidth, $(`#row_1`)), // Gates, Flags, Markers
        new Row(100, initLineWidth, $(`#row_2`)), // Receivers
        new Row(100, initLineWidth, $(`#row_3`)), // Mats
    ];

    Map.onLoad = function () {
    }

    function generateElement(facility) {
        var div = document.createElement('div');
        div.innerHTML = generateFacilityElem(facility).trim();
        div.className = "map-element";
        div.draggable = true;
        div.ondragstart = function (event) {
            this.className += ' hold';
            // setTimeout(() => (this.className = 'invisible'), 0);
        }
        div.ondragend = function (event) {
            this.className = 'map-element';
        }

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function (event) {
            Action.chooseElement(event, facility);
        }

        $(div).children().append(overlay);

        return div;
    }

    function place(facility, row, number) {
        rows[row].put(facility, number);
    }

    Map.addFacility = function (facility) {
        var row = typeToRow[facility.type];
        rows[row].push_back(facility);
    }

}(window.Map = window.Map || {}, jQuery));

window.addEventListener('load', Map.onLoad);
