(function (Table, $, undefined) {
    var columns = [];
    var rows = [];
    var maxRows = 0;

    Table.load = function () {
        // Table.addFacility(new Facility("1", null, 1, '#ff00ff', null, 'gate'));
    }

    function createColumn(type) {
        var row = 0;
        var col = columns.length;
        $('#main_table').find('tr').each(function () {
            var trow = $(this);
            if (trow.index() === 0) {
                trow.append(`<td>${type}</td>`);
            } else {
                trow.append(`<td id="td_col_${col}_row_${row}"></td>`);
            }
            row++;
        });

        columns.push(type);
        rows.push(0);
    }

    function generateCell(facility) {
        var code = `<div class="table-wrapper">`;

        var img = generateFacilityElem(facility);
        if (NonNumerableFacilities.has(facility.type))
            code += `<div class="grid-cell" style="border: black solid 1px; grid-column-start: 1; grid-column-end: 3;">${img}</div>`;
        else
            code += `<div class="grid-cell" style="border: black solid 1px">${img}</div>
            <div class="grid-cell" style="border: black solid 1px">${facility.number}</div>`;

        code += ` <div class="grid-cell" style="border: black solid 1px; background: ${facility.color}"></div>
        </div>`

        return code;
    }

    function createRow() {
        var cols = columns.length;
        maxRows++;
        
        var code = `<tr id="tr_row_${rows}">`;
        for (var i = 0; i < cols; i++)
            code += `<td id="td_col_${i}_row_${rows}"></td>`;
        code += `</tr>`;

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

        while (maxRows < row + 1)
            createRow();
        
        var cellDiv = generateCell(facility);
        getCell(col, row).append(cellDiv);

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function(event) {
            Action.chooseElement(event, facility);
        }

        getCell(col, row).append(overlay);
    }

}(window.Table = window.Table || {}, jQuery));

window.addEventListener('load', Table.load);
