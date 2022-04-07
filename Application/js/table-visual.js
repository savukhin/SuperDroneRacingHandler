const { cp } = require("original-fs");

(function (Table, $, undefined) {
    var columns = [];
    var rows = [];
    var maxRows = 0;

    Table.load = function () {
    }

    function createColumn(type) {
        var row = 0;
        var col = columns.length;
        $('#main_table').find('tr').each(function () {
            var trow = $(this);
            if (trow.index() === 0) {
                trow.append(`<th>${type}</th>`);
            } else {
                trow.append(`<td id="td_col_${col}_row_${row}"></td>`);
                row++;
            }
        });

        columns.push(type);
        rows.push(0);
    }

    function generateCell(facility) {
        var code = `<div class="table-wrapper">`;

        var img = generateFacilityElem(facility);
        code += `<div class="grid-cell">${img}</div>`;           
            
        if (NonNumerableFacilities.has(facility.type))
            code += ` <div class="grid-cell" style="grid-column-start: 2; grid-column-end: 4; background: ${facility.color}"></div>`;
        else
            code += ` <div class="grid-cell">${facility.number}</div>
                <div class="grid-cell" style="background: ${facility.color}"></div>`;

        code += `</div>`;

        return code;
    }

    function createRow() {
        var cols = columns.length;
        
        var code = `<tr id="tr_row_${maxRows}">`;
        for (var i = 0; i < cols; i++)
            code += `<td id="td_col_${i}_row_${maxRows}"></td>`;
        code += `</tr>`;
        
        maxRows++;
        $('#main_table').append(code);
    }

    function getCell(col, row) {
        return $(`#td_col_${col}_row_${row}`)
    }

    Table.addFacility = function(facility) {
        var col = columns.indexOf(facility.type);
        if (col == -1) {
            createColumn(facility.type);
            col = columns.indexOf(facility.type);
        }

        var row = rows[col];
        // console.log(`Adding to row ${row} col ${col}`);

        while (maxRows < row + 1)
            createRow();
        
        var cellDiv = generateCell(facility);
        // console.log(`cell = ${cellDiv}`);
        getCell(col, row).append(cellDiv);
        rows[col]++;

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function(event) {
            Action.chooseElement(event, facility);
        }

        getCell(col, row).append(overlay);
    }

}(window.Table = window.Table || {}, jQuery));

window.addEventListener('load', Table.load);
