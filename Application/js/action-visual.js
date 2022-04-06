(function (Action, $, undefined) {
    var chosen = null;

    Action.colorPick = function (color) {
        if (chosen == null)
            return;
        
        $(`#state_display_after`).children().children().css(`background-color`, `${color}`);
    }

    function generateColors() {
        var generateColorPickDiv = function (color, onclickCallback = undefined) {
            var div = document.createElement('div');
            div.className = "outer-color-pick";

            var pick = document.createElement('div');
            pick.className = "color-pick";
            pick.style.background = `${color}`;
            pick.onclick = function (event) {
                Action.colorPick(color);

                if (onclickCallback != undefined)
                    onclickCallback(event);
            }

            // div.innerHTML = `<div class='color-pick' style="background: ${color}" onclick></div>`;
            div.append(pick);

            return div;
        }

        var colors = ['#ff0000', '#00ff00', '#0000ff', '#000000', '#ffffff',
            '#ff00ff', '#ffff00', '#00ffff', '#ffffff', '#ffc0cb'];
        var div = document.createElement('div');
        var code = ``;
        for (var i = 0; i < colors.length / 2 - 1; i++) {
            div.append(generateColorPickDiv(colors[i]));
        }

        var lastColor = generateColorPickDiv(colors[parseInt(colors.length / 2 - 1)]);
        lastColor.id = "last_color";
        // $(lastColor).children().id = "last_color";
        div.append(lastColor);

        div.append(document.createElement('br'));
        for (var i = colors.length / 2; i < colors.length - 1; i++) {
            div.append(generateColorPickDiv(colors[i]));
        }

        div.append(
            generateColorPickDiv(colors[colors.length - 1],
                function (event) { Action.openColorPicker() })
        );

        $(`#action_colors`).prepend(div);

        // $(`#action_colors`).append(code);
    }

    Action.onLoad = function () {
        generateColors();
    }

    Action.changeTab = function (event, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        document.getElementById(tabName).style.display = "block";
    }

    var colorPicker = document.getElementById("pickerBoxContainer");

    Action.openColorPicker = function (event) {
        if (colorPicker.style.display != 'block')
            colorPicker.style.display = 'block';
        else
            colorPicker.style.display = 'none';
    }

    Action.handleColorPicker = function (event) {
        colorPicker.style.display = 'none';
    }

    Action.chooseElement = function (event, facility) {
        var code = generateFacilityElem(facility);

        $(`#state_display_before`).html(
            code
        );
        $(`#state_display_after`).html(
            code
        );

        chosen = facility;
    }

}(window.Action = window.Action || {}, jQuery));

window.addEventListener('load', Action.onLoad);
