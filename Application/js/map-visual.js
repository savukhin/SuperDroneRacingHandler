(function (Map, $, undefined) {
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
            if (beforeInd < 0 || beforeInd > this.lines.length)
                return false;
            this.lines[beforeInd].className = "drag-line";
            if (!state)
                this.lines[beforeInd].className += " invisible";
        }

        move(from, beforeInd) { // from - index
            var elem = this.elements[from];
            var facility = this.facilities[from];
            if (beforeInd < this.elements.length) {
                var before = this.elements[beforeInd];
                $(before).before($(elem));

                this.facilities.splice(from, 1);
                this.elements.splice(from, 1);
                let splicingIndex = (beforeInd <= from ? beforeInd : beforeInd - 1);
                this.facilities.splice(splicingIndex, 0, facility);
                this.elements.splice(splicingIndex, 0, elem);

                
            } else {
                var afterInd = beforeInd - 1;
                var after = this.elements[afterInd];
                $(after).after($(elem));

                this.facilities.splice(from, 1);
                this.elements.splice(from, 1);
                this.facilities.splice(afterInd, 0, facility);
                this.elements.splice(afterInd, 0, elem);
            }
        }

        generateElement(facility, index) {
            var div = document.createElement('div');
            div.innerHTML = generateFacilityElem(facility).trim();
            div.className = "map-element selectable-zone";
            div.draggable = true;
            
            var row = this;
            div.ondragstart = function (event) {
                this.className += ' hold';
                row.draggingIndex = row.elements.indexOf(this);
                setTimeout(() => {
                    this.className += ' dragging';

                    row.dragZones.forEach(element => {
                        $(element).css('pointer-events', 'all');
                    });
                }, 0);
            }
            div.ondragend = function (event) {
                row.draggingIndex = -1;
                row.dragZones.forEach(element => {
                    $(element).css('pointer-events', 'none');
                });
                this.className = 'map-element selectable-zone';
            }
    
            var overlay = document.createElement('div');
            overlay.className = "overlay";
            overlay.onclick = function (event) {
                if (Keyboard.checkShift()) {
                    if (selectedItems.has(facility))
                        Map.deleteChosingElement(facility);
                    else
                        Map.addChosingElement(facility);
                } else {
                    Map.chooseElement(facility);
                }
            }
            overlay.onmouseenter = function(event){
                $(div).css("z-index", "100");
                // var code = `<div class="map-hint">${facility.type} #${facility.number}</div>`;
                var code = `<div class="map-hint">${facility.getDescription()}</div>`;
                $(this).append(code);
            }
            overlay.onmouseleave = function(event){
                $(div).css("z-index", "10");
                $(this).html('');
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
            this.addZone(index + 1);

            $(this.div).append(element);
            this.elements[index] = element;

            var query = $(element).find('.facility-element').children().not('.overlay')
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
            if (index == -1)
                return false;
            
            $(this.elements[index]).remove();
            $(this.dragZones[index]).remove();
            $(this.lines[index]).remove();

            for (var i = index + 1; i < this.dragZones.length; i++) {
                $(this.dragZones[i]).css('left', (i - 1) * this.singleWidth + 'px');
                $(this.lines[i]).css('left', (i - 1) * this.singleWidth + 'px');
            }

            this.elements.splice(index, 1);
            this.dragZones.splice(index, 1);
            this.lines.splice(index, 1);
            this.facilities.splice(index, 1);
            
            var newWidth = this.getMaxLen() - this.singleWidth;
            $(this.div).css('width', newWidth + 'px');
            return true;
        }

        getObjectsBySelection(pos1, pos2) {
            function intersects(pos, shape) {
                var leftX   = Math.max( pos1.x, pos.x );
                var rightX  = Math.min( pos2.x, pos.x + shape.x );
                var topY    = Math.max( pos1.y, pos.y );
                var bottomY = Math.min( pos2.y, pos.y + shape.y );

                return leftX <= rightX && topY <= bottomY;
            }

            var result = [];
            for (var i = 0; i < this.elements.length; i++) {
                var domElem = this.facilities[i].mapDiv[0];
                var rect = domElem.getBoundingClientRect();

                if (intersects({x: rect.x, y: rect.y}, {x: rect.width, y: rect.height})) {
                    result.push(this.facilities[i]);
                }
            }
            return result;
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
    var selectionPos = {x: 0, y: 0};
    var isSelecting = false;
    var selectedItems = new Set();
    let shiftPressed 

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
            if (rows[i].deleteFacility(facility) == true) {
                break;
            }
        }
    }

    var getObjectsBySelection = function(pos1, pos2) {
        var x1 = Math.min(pos1.x, pos2.x);
        var y1 = Math.min(pos1.y, pos2.y);
        var x2 = Math.max(pos1.x, pos2.x);
        var y2 = Math.max(pos1.y, pos2.y);

        var result = new Set();
        for (var i = 0; i < rows.length; i++) {
            var tmp = rows[i].getObjectsBySelection({x: x1, y: y1}, {x: x2, y: y2});
            result = new Set([...result, ...tmp]);
        }
        return result;
    }

    Map.clearSelection = function() {
        highlighFacilities(selectedItems, false);
        selectedItems.clear();
    }

    Map.startSelection = function(event) {
        if (isSelecting || !event.target.classList.contains("selectable-zone"))
            return;
        
        var pos = {x: event.pageX, 
            y: event.pageY};
        $("#selection").css("left", pos.x);
        $("#selection").css("top", pos.y);
        $("#selection").css("width", 0);
        $("#selection").css("height", 0);
        $("#selection").css("display", "block");
        selectionPos.x = pos.x;
        selectionPos.y = pos.y;

        isSelecting = true;
    }

    var highlighFacilities = function(facilities, makeActive=true) {
        facilities.forEach(facility => {
            var overlayQuery = facility
                .mapDiv.parent();

            if (makeActive)
                overlayQuery = overlayQuery.find(".overlay");
            else
                overlayQuery = overlayQuery.find(".overlay-active");
            
            if (overlayQuery[0] == undefined)
                return;

            if (makeActive)
                overlayQuery[0].className = "overlay-active";
            else
                overlayQuery[0].className = "overlay";
        });
    }

    Map.updateType = function(facility, newType) {
        $(facility.mapDiv).attr('class', `${newType}-element`);
        // TODO   
    }

    var checkSelection = function(delta, add=false) {
        let selected = getObjectsBySelection(selectionPos, {x: selectionPos.x + delta.x, y : selectionPos.y + delta.y});
        highlighFacilities(selected);

        if (!add) {
            let checker = new Set([...selectedItems].filter(x => !selected.has(x)));
            highlighFacilities(checker, false);
            selectedItems = selected;
        }

        // selected = new Set([...selected, ...])
        selectedItems = new Set([...selected, ...selectedItems]);
    }

    Map.handleSelection = function(event) {
        if (!isSelecting)
            return;
        
        var pos = {x: event.pageX, 
            y: event.pageY};
        var delta = {x: pos.x - selectionPos.x,
            y: pos.y - selectionPos.y};
            
        if (delta.x < 0) 
            $("#selection").css("left", pos.x);
        else
            $("#selection").css("left", selectionPos.x);

        if (delta.y < 0)
            $("#selection").css("top", pos.y);
        else
            $("#selection").css("top", selectionPos.y);
        
        $("#selection").css("width", Math.abs(delta.x));
        $("#selection").css("height", Math.abs(delta.y));

        let addiction = false;
        if (Keyboard.checkShift())
            addiction = true;
        checkSelection(delta, addiction);
    }

    Map.endSelection = function(event) {
        if (!isSelecting)
            return;

        $("#selection").css("display", "none");
        var pos = {x: event.pageX, 
            y: event.pageY};
        var delta = {x: pos.x - selectionPos.x,
            y: pos.y - selectionPos.y};

        isSelecting = false;

        let addiction = false;
        if (Keyboard.checkShift())
            addiction = true;
        checkSelection(delta, addiction);

        Action.choseMultipleElements(selectedItems);
    }

    Map.addChosingElement = function(facility) {
        Action.addChosingElement(facility);
        selectedItems.add(facility);
        highlighFacilities(selectedItems);
    }

    Map.deleteAllChosingElements = function(facility) {
        Action.deleteAllElements();
    }

    Map.deleteChosingElement = function(facility) {
        if (!selectedItems.has(facility))
            return;

        Action.deleteChosingElement(facility);
        selectedItems.delete(facility);
        highlighFacilities(new Set([facility]), false);
    }
    
    Map.addToChosing = function(facilities) {
        facilities.forEach(facility => {
            Map.addChosingElement(facility);
        })
    }

    Map.choseElements = function(facilities) {
        Map.clearSelection();
        Action.deleteAllElements();

        Map.addToChosing(facilities);
    }

    Map.chooseElement = function(facility) {
        Action.chooseElement(facility);
        Map.clearSelection();
        selectedItems.add(facility);
        highlighFacilities(selectedItems);
    }

    Map.choseAll = function() {
        let facilities = new Set();
        for (var i = 0; i < rows.length; i++) {
            var tmp = rows[i].facilities;
            facilities = new Set([...facilities, ...tmp]);
        }
        return Map.choseElements(facilities);
    }

}(window.Map = window.Map || {}, jQuery));

window.addEventListener('load', Map.onLoad);
