(function (Map, $, undefined) {
    class MapElement {
        constructor(outline = false) {

            this.outline = outline;
        }
    }

    class Row {
        facilities = []
        elements = [];
        dragZones = []
        lines = [];
        draggingIndex = -1;

        constructor(singleWidth, fullWidth, div) {
            this.singleWidth = singleWidth;
            this.fullWidth = fullWidth;
            this.div = div;
            this.createDragLine(0);

            var zone = this.addZone(0);
        }

        createDragLine(beforeInd) {
            var position = beforeInd * this.singleWidth;
            var line = document.createElement('div');

            $(line).css('left', position + 'px');
            $(line).css('top', '0px');
            line.className = 'drag-line invisible';

            $(this.div).append(line);
            this.lines.push(line);
        }

        highlightDragLine(beforeInd, state=true) {
            // console.log(`highlight ${beforeInd} with state ${state}`);
            if (beforeInd < 0 || beforeInd > this.lines.length)
                return false;
            this.lines[beforeInd].className = "drag-line";
            if (!state)
                this.lines[beforeInd].className += " invisible";
        }

        move(from, beforeInd) { // from - index
            var elem = this.elements[from];
            var before = this.elements[beforeInd];
            $(before).before($(elem));

            this.elements.splice(from, 1);
            this.elements.splice(beforeInd, 0, elem);
        }

        generateElement(facility, index) {
            var div = document.createElement('div');
            div.innerHTML = generateFacilityElem(facility).trim();
            div.className = "map-element";
            div.draggable = true;
            
            var row = this;
            div.ondragstart = function (event) {
                this.className += ' hold';
                row.draggingIndex = row.elements.indexOf(this);
                setTimeout(() => (
                    row.dragZones.forEach(element => {
                        $(element).css('pointer-events', 'all');
                    })
                ), 0);
            }
            div.ondragend = function (event) {
                row.draggingIndex = -1;
                row.dragZones.forEach(element => {
                    $(element).css('pointer-events', 'none');
                });
                this.className = 'map-element';
            }
    
            var overlay = document.createElement('div');
            overlay.className = "overlay";
            overlay.onclick = function (event) {
                Action.chooseElement(facility);
            }
    
            $(div).children().append(overlay);
    
            return div;
        }

        addZone(index) {
            var row = this;

            var zone = document.createElement('div');
            $(zone).css('width', this.singleWidth + 'px');
            $(zone).css('left', index * this.singleWidth + 'px');
            zone.className = "drag-zone";

            zone.ondragenter = function (event) {
                row.highlightDragLine(row.dragZones.indexOf(event.target), true);
            }
            zone.ondragleave = function (event) {
                row.highlightDragLine(row.dragZones.indexOf(event.target), false);
            }
            zone.ondragover = function (event) {
                event.preventDefault();
            }
            zone.addEventListener('drop', (event) => {
                var beforeInd = row.dragZones.indexOf(event.target);
                var from = row.draggingIndex;
                row.highlightDragLine(beforeInd, false);

                this.move(from, beforeInd);
            });

            this.dragZones.splice(index, 0, zone);
            $(this.div).append(zone);

            return zone;
        }

        put(facility, index) {
            var element = this.generateElement(facility, index);
            $(element).css('width', this.singleWidth + 'px');
            // if (index == 0)
                // console.log("!!!!!!!!!!!!!!!!!")
            // console.log(`elements ${this.elements}`);
            this.addZone(index + 1);

            $(this.div).append(element);
            this.elements[index] = element;

            var query = $(element).find('.facility-element').children().not('.overlay')
            // console.log(`map DIV!!! find ${query.attr('class')}`);
            facility.mapDiv = query;
            this.facilities[index] = facility;
        }

        push_back(facility) {
            var newWidth = this.getMaxLen();
            $(this.div).css('width', newWidth + 'px');
            this.put(facility, this.elements.length);
            this.createDragLine(this.elements.length);
        }

        getMaxLen() {
            return this.singleWidth * (this.elements.length + 1);
        }

        findFacility(facility) {
            return this.facilities.indexOf(facility);
        }

        deleteFacility(facility) {
            var index = this.findFacility(facility);
            // console.log(`index is ${index} len is ${fa}`);
            if (index == -1)
                return false;
            
            // $(facility.mapDiv).parent().parent();
            // .css("background-color", "blue");
            // $(this.elements[index]).css("background-color", "blue");
            // $(this.dragZones[index]).css("background-color", "red");
            // $(this.lines[index]).css("background-color", "black");
            $(this.elements[index]).remove();
            $(this.dragZones[index]).remove();
            $(this.lines[index]).remove();
            delete this.elements[index];
            delete this.dragZones[index];
            delete this.lines[index];
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

    function place(facility, row, number) {
        rows[row].put(facility, number);
    }

    Map.addFacility = function (facility) {
        var row = typeToRow[facility.type];
        rows[row].push_back(facility);
    }

    Map.deleteFacility = function (facility) {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].deleteFacility(facility) == true)
                break;
        }
    }

}(window.Map = window.Map || {}, jQuery));

window.addEventListener('load', Map.onLoad);
