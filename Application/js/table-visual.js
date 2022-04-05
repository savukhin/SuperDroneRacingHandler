(function (table, $, undefined) {
    var columns = [];
    var rows = [];
    var maxRows = 0;

    table.load = function () {
        table.addFacility(new Facility("1", null, 1, '#ff00ff', null, 'gate'));
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

        console.log(`columns is ${columns.length} type is ${type}`);

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
        </div>
        <div class="overlay" onclick="chooseElement(event, ${facility})"></div>`;

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

    table.addFacility = function(facility) {
        var col = columns.indexOf(facility.type);
        if (col == -1) {
            createColumn(facility.type);
            col = columns.indexOf(facility.type);
        }
        
        var row = rows[col];
        console.log(`col ${col} row ${row}`);

        while (maxRows < row + 1)
            createRow();
        
        var code = generateCell(facility);
        
        getCell(col, row).append(code)
    }

}(window.table = window.table || {}, jQuery));

window.addEventListener('load', table.load);
