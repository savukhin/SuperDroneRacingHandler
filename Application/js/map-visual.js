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
            console.log(`BEFORE Wdith = ${$(element).css('width')} single = ${this.singleWidth + 'px'}`)
            $(element).css('width', this.singleWidth + 'px');
            console.log(`AFTER Wdith = ${$(element).css('width')} single = ${this.singleWidth + 'px'}`)
            // element.style.width = this.singleWidth;
            $(this.div).append(element);
            console.log(`AFTER APPEND Wdith = ${$(element).css('width')} single = ${this.singleWidth + 'px'}`)
        }

        push_back(facility) {
            var newWidth = this.getMaxLen();
            $(this.div).css('width', newWidth + 'px');
            this.put(facility, this.elements.length);
        }

        getMaxLen() {
            return this.singleWidth * (this.elements.length + 1);
        }
    }

    const typeToRow = {
        'gate' : 0,
        'flag' : 0,
        'marker' : 0,
        'receiver' : 1,
        'mat' : 2,
    }

    var initLineWidth = parseFloat($(`#map_line`).css("width").slice(0, -2));
    var rows = [
        new Row(100, initLineWidth, $(`#map_line`)), // Gates, Flags, Markers
        new Row(100, initLineWidth, $(`#row_2`)), // Receivers
        new Row(100, initLineWidth, $(`#row_3`)), // Mats
    ];

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

    function updateLineWith(width) {
        console.log(`update to ${width} with init ${initLineWidth}`)
        $(`#map_line`).css(`width`, width + 'px');
    }

    Map.addFacility = function(facility) {
        var row = typeToRow[facility.type];
        if (row == 0) {
            // var width = parseFloat($(`#map_line`).css(`width`).slice(0, -2));
            width = rows[0].getMaxLen();
            var tmp = $(`#map_line`).css("width");
            
            var element = document.getElementById('map_line'),
            style = window.getComputedStyle(element),
            asdf = style.getPropertyValue('width');

            var tmp2 = map_line.clientWidth;

            console.log(`jquery result is ${$(`#map_line`).css("width")} dom result is ${asdf}`);
            // var tmp = $(`#map_line`).width();
            console.log(`init len is ${initLineWidth} now is ${tmp} tmp2 is ${tmp2}`)
            // $(`#map_line`).css(`width`, asdf);
            // tmp = $(`#map_line`).css("width");
            tmp = $(`#map_line`).width();
            console.log(`update to ${tmp}`);
            // updateLineWith(width);
        }
        rows[row].push_back(facility);
    }

}(window.Map = window.Map || {}, jQuery ));

window.addEventListener('load', Map.onLoad);
