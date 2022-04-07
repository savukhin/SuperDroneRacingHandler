// const { Facility } = require("./facility");

(function ( Map, $, undefined ) {
    class MapElement {
        constructor(outline=false) {

            this.outline = outline;
        }
    }

    class Row {
        elements = [];

        constructor(singleWidth, fullWidth, div) {
            this.singleWidth = singleWidth;
            this.fullWidth = fullWidth;
            this.div = div;
        }

        put(facility, index) {
            this.elements[index] = facility;
            var element = generateElement(facility);
            $(this.div).append(element);

            var left = (index + 1) * this.singleWidth;
            element.style.setProperty('left', `${left}px`);   
        }

        push_back(facility) {
            this.put(facility, this.elements.length);
        }
    }

    const typeToRow = {
        'gate' : 0,
        'flag' : 0,
        'marker' : 0,
        'receiver' : 1,
        'mat' : 2,
    }

    var fullWidth = parseFloat($(`#map_line`).css("width").slice(0, -2));
    var rows = [
        new Row(100, fullWidth, $(`#map_line`)), // Gates, Flags, Markers
        // new Row(500, fullWidth, $(`#map_line`)), // Gates, Flags, Markers
        new Row(20, fullWidth, $(`#row_2`)), // Receivers
        new Row(20, fullWidth, $(`#row_3`)), // Mats
    ];
    // var singleWidth = 100;

    Map.onLoad = function () {
    }

    function generateElement(facility) {
        var div = document.createElement('div');
        div.innerHTML = generateFacilityElem(facility).trim();
        div.className = "map-element";

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function(event) {
            Action.chooseElement(event, facility);
        }

        $(div).children().append(overlay);

        return div;
    }

    function place(facility, row, number) {
        rows[row].put(facility, number);
    }

    Map.addFacility = function(facility) {
        var row = typeToRow[facility.type];
        rows[row].push_back(facility);
    }

}(window.Map = window.Map || {}, jQuery ));

window.addEventListener('load', Map.onLoad);
