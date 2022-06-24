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

    Table.findFacility = function (facility) {
        var col = 0;
        for (; Table.columns[col] != facility.type && col < Table.columns.length; col++);

        for (var row = 0; row < Table.rows[col]; row++) {
            if (Table.facilities[col][row] == facility)
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
        Table.facilities.splice(col, 1);
        Table.columns.splice(col, 1);
        Table.rows.splice(col, 1);

        $(`#td_col_${col}`).remove();
        $(`#th_col_${col}`).remove();

        for (let c = col + 1; c <= Table.columns.length; c++) {
            $(`#td_col_${c}`).attr(`id`, `td_col_${c - 1}`);
            for (let r = 0; r < Table.rows[c - 1]; r++) {
                $(`#td_col_${c}_row_${r}`).attr(`id`, `td_col_${c - 1}_row_${r}`);
            }
            $(`#th_col_${c}`).attr(`id`, `th_col_${c - 1}`);

            setTimeout(() => {
                Table.facilities[c - 1].forEach((facility, row) => {
                    let card = $(`#td_col_${c - 1}_row_${row}`).find(".table-card");
                    Table.linkCardToFacility(card, facility);
                });
            }, 0)
        }
    }

    Table.updateDescription = function(facility) {
        facility.descrDiv.html(facility.getNumber());
    }

    Table.choseColumn = function(col) {
        let elements = [];
        Table.facilities[col].forEach(facility => {
            if (facility != null && facility != 0)
                elements.push(facility);
        });

        if (Keyboard.checkShift())
            Map.addToChosing(elements);
        else
            Map.choseElements(elements);
    }

    function createColumn(type) {
        var row = 0;
        var col = Table.columns.length;
        $('#main_table').find('tr').each(function () {
            var trow = $(this);
            if (trow.index() === 0) {
                trow.append(`<th id="th_col_${col}" onClick=Table.choseColumn(${col})><button class='button'>${type}</button></th>`);
            } else {
                trow.append(`<td id="td_col_${col}"></td>`);
                row++;
            }
        });

        Table.facilities.push([]);
        Table.columns.push(type);
        Table.rows.push(0);
    }

    function generateCard(facility) {
        let alternate = (facility.type == FacilityTypes.RECEIVER);
        let img = generateFacilityElem(facility, { transparent_block: true, alternate_position: alternate});
        let code = `
        <div class="table-card" ${alternate ? "style='text-align: right;'" : ""}>
            <div>
                <h class='description' ${alternate ? "style='right:0px'" : ""}>${facility.getNumber()}</h>
                ${img}
            </div>
        </div>`
        return code;
    }

    function generateCell(facility) {
        var code = `<div>`;

        code += generateCard(facility);

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

    function addToColumn(facility, col) {
        var cellDiv = generateCell(facility);

        $(`#td_col_${col}`)
        .append(
            `<div id='td_col_${col}_row_${Table.rows[col]}'>
            ${cellDiv}
            </div>
            </div>`
        );

        if (Table.rows[col] >= 1)
            $(`#td_col_${col}_row_${Table.rows[col] - 1}`)
                .find(`.table-card`)
                .css({'height': '20px'});

        let card = $(`#td_col_${col}_row_${Table.rows[col]}`).find(`.table-card`);
        card.css({'height': '130px'});
        let row = Table.rows[col];

        card
            .on("click", (event) => {
                Map.chooseElement(facility);
            })
            .on("mouseenter", (event) => {
                if (row == Table.rows[col] - 1)
                    return;

                $(card).stop();
                $(card).animate({
                    height: "130px",
                }, 300)
            })
            .on("mouseleave", (event) => {
                if (row == Table.rows[col] - 1)
                    return;
                
                $(card).stop();
                isAnimating = true;
                $(card).animate({
                    height: "20px",
                }, 300)
            })

        Table.rows[col]++;

        return card;
    }

    Table.linkCardToFacility = function(cardJQ, facility) {
        facility.cardDiv = cardJQ;

        query = $(cardJQ).find('.description');
        facility.descrDiv = query;
    }

    Table.addFacility = function (facility) {
        var col = Table.columns.indexOf(facility.type);
        if (col == -1) {
            createColumn(facility.type);
            col = Table.columns.indexOf(facility.type);
        }

        var row = Table.rows[col];

        let card = addToColumn(facility, col);
        Table.facilities[col][row] = facility;

        Table.linkCardToFacility(card, facility);

        var overlay = document.createElement('div');
        overlay.className = "overlay";
        overlay.onclick = function (event) {
            Action.chooseElement(facility);
        }

        getCell(col, row).append(overlay);

        Table.updateDescription(facility);
    }

}(window.Table = window.Table || {}, jQuery));

window.addEventListener('load', Table.load);
