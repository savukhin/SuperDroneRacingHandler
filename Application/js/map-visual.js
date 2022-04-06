(function ( Map, $, undefined ) {
    class MapElement {
        constructor(outline=false) {

            this.outline = outline;
        }
    }

    var elements = [];
    var fullWidth = parseFloat($(`#map_line`).css("width").slice(0, -2));
    var singleWidth = 100;

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

    Map.addFacility = function(facility) {
        var element = generateElement(facility);
        $("#map_line").append(element);
        elements.push(element);
        var left = elements.length * singleWidth;
        element.style.setProperty('left', `${left}px`);
    }

}(window.Map = window.Map || {}, jQuery ));

window.addEventListener('load', Map.onLoad);
