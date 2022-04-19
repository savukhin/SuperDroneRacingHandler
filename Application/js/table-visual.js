const { cp } = require("original-fs");

(function (Table, $, undefined) {
    Table.columns = [];
    Table.rows = [];
    Table.maxRows = 0;
    Table.facilities = []

    Table.load = function () {
    }

    Table.updateType = function(facility, newType) {
        $(facility.tableDiv).parent().attr('class', `${newType}-element`);

    }

    Table.findFacility = function (facilitiy) {
        var col = 0;
        for (; Table.columns[col] != facilitiy.type && col < Table.columns.length; col++);

        for (var row = 0; row < Table.rows[col]; row++) {
            if (Table.facilities[col][row] == facilitiy)
                return [col, row];
        }
        return false;
    }

    Table.deleteFacility = function (facility) {
        var res = Table.findFacility(facility);
        if (res == false)
            return false;
        var col = res[0], row = res[1];

        $(`#td_col_${col}_row_${row}`).children().each(function () {
            this.remove();
        });

        for (var i = row; i < Table.rows[col] - 1; i++) {
            $(`#td_col_${col}_row_${i}`).html(
                $(`#td_col_${col}_row_${i + 1}`).html()
            );

            Table.facilities[col][i] = Table.facilities[col][i + 1];
        }

        $(`#td_col_${col}_row_${Table.rows[col] - 1}`).html(``);
        Table.facilities[col][Table.rows[col] - 1] = null;

        Table.rows[col]--;

        setTimeout(() => {
            for (var i = row; i < Table.rows[col]; i++) {
                var cell = $(`#td_col_${col}_row_${i}`);
                var query = cell
                    .find('.facility-element').children()
                    .not('.overlay').not('.drag-line').not('.drag-zone');

                Table.facilities[col][i].tableDiv = query;

                query = cell.find('.indicator');
                Table.facilities[col][i].indicatorDiv = query;

                query = cell.find('.description');
                Table.facilities[col][i].descrDiv = query;
            }
        }, 0);

        var max = Math.max(...Table.rows);
        if (max < Table.maxRows) {
            Table.maxRows = max;
            Table.popRow();
        }

        $(facility.tableDiv).css("background-color", "red");
        if (Table.rows[col] == 0) {
            Table.deleteColumn(col);
        }
    }

    Table.popRow = function () {
        var lastRow = Math.max(...Table.rows);
        $(`#tr_row_${lastRow}`).remove();

        for (var i = 0; i < Table.columns.length; i++)
            Table.facilities[i].length--;
    }

    Table.deleteColumn = function(col) {
        function removeCell(trow, tagName, number) {
            trow.find(tagName).each(function() {
                var td = $(this);

                if (td.index() == number) {
                    td.remove();
                    return;
                }
            })
        }

        var row = 0;
        // var col = Table.columns.length;
        $('#main_table').find('tr').each(function () {
            var trow = $(this);
            if (trow.index() < 2) {
                removeCell(trow, 'th', col);
            } else {
                removeCell(trow, 'td', col);
                row++;
            }
        });

        Table.facilities.splice(col, 1);
        Table.columns.splice(col, 1);
        Table.rows.splice(col, 1);
    }

    Table.updateDescription = function(facility, descr) {
        $(facility.descrDiv).find('p').html(descr);
    }

    function createColumn(type) {
        var row = 0;
        var col = Table.columns.length;
        $('#main_table').find('tr').each(function () {
            var trow = $(this);
            if (trow.index() === 0) {
                trow.append(`<th>${type}</th>`);
            } else if (trow.index() == 1) {
                var code = `<div class="table-wrapper">`;
                code += `<div class="grid-cell">Type</div>`;
                if (NonDescriptionalFacilities.has(type))
                    code += ` <div class="grid-cell" style="grid-column-start: 2; grid-column-end: 4;"> Color </div>`;
                else
                    code += ` <div class="grid-cell">${FacilityDesciptions[type]}</div>
                        <div class="grid-cell indicator">Color</div>`;
                code += `</div>`;
                trow.append(`<th>${code}</th>`);
            } else {
                trow.append(`<td id="td_col_${col}_row_${row}"></td>`);
                row++;
            }
        });

        Table.facilities.push([]);
        Table.columns.push(type);
        Table.rows.push(0);
    }

    function generateCell(facility) {
        var code = `<div class="table-wrapper">`;

        var img = generateFacilityElem(facility);
        code += `<div class="grid-cell">${img}</div>`;

        if (NonDescriptionalFacilities.has(facility.type))
            code += ` <div class="grid-cell indicator" style="grid-column-start: 2; grid-column-end: 4; background: ${facility.color}"></div>`;
        else
            code += ` <div class="grid-cell description"><p>${facility.number}</p></div>
                <div class="grid-cell indicator" style="background: ${facility.color}"></div>`;

        code += `</div>`;

        return code;
    }

    function createRow() {
        var cols = Table.columns.length;

        var code = `<tr id="tr_row_${Table.maxRows}">`;
        for (var i = 0; i < cols; i++) {
            code += `<td id="td_col_${i}_row_${Table.maxRows}"></td>`;
            Table.facilities[i].push(null);
        }
        code += `</tr>`;

        Table.maxRows++;
        $('#main_table').append(code);
    }

    function getCell(col, row) {
        return $(`#td_col_${col}_row_${row}`)
    }

    Table.addFacility = function (facility) {
        var col = Table.columns.indexOf(facility.type);
        if (col == -1) {
            createColumn(facility.type);
            col = Table.columns.indexOf(facility.type);
        }

        var row = Table.rows[col];

        while (Table.maxRows < row + 1)
            createRow();

        var cellDiv = generateCell(facility);
        getCell(col, row).append(cellDiv);
        Table.facilities[col][row] = facility;
        var query = $(getCell(col, row))
            .find('.facility-element').children()
            .not('.overlay').not('.drag-line').not('.drag-zone');

        facility.tableDiv = query;

        query = $(getCell(col, row)).find('.indicator');
        facility.indicatorDiv = query;

        query = $(getCell(col, row)).find('.description');
        facility.descrDiv = query;

        Table.rows[col]++;

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function (event) {
            Action.chooseElement(facility);
        }

        getCell(col, row).append(overlay);
        Table.facilities[facility.ip] = [col, row];
    }

}(window.Table = window.Table || {}, jQuery));

window.addEventListener('load', Table.load);
