(function (Action, $, undefined) {
    var chosen = null;

    Action.colorPick = function (color) {
        if (Action.chosen == null)
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
                var color = $(this).css('background-color');
                Action.colorPick(color);

                if (onclickCallback != undefined)
                    onclickCallback(event);
            }

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
        $(lastColor).children().attr("id", "prev_color");

        div.append(lastColor);

        div.append(document.createElement('br'));
        for (var i = colors.length / 2; i < colors.length - 1; i++) {
            div.append(generateColorPickDiv(colors[i]));
        }

        var customColor = generateColorPickDiv(colors[colors.length - 1],
            function (event) { Action.openColorPicker() });

        $(customColor).children().attr("id", "custom_color");
        $(customColor).append(`
            <img id="picker_settting_img" src="img/icons/settings-black.png"/>
        `);

        div.append(customColor);

        $(`#action_colors`).prepend(div);
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
        var customColor = $('custom_color').css("background-color");
        $(`#color_display`).css("background-color", customColor);

        if (colorPicker.style.display != 'block')
            colorPicker.style.display = 'block';
        else
            colorPicker.style.display = 'none';
    }

    Action.handleColorPicker = function (event, accept) {
        if (accept) {
            var color = getSlidersColor();
            $(`#custom_color`).css("background-color", color);
            Action.colorPick(color);

            var res = hexToRgb(color);
            var brightness = (res.r + res.g + res.b) / 3;

            if (brightness < 125)
                $(`#picker_settting_img`).attr('src', 'img/icons/settings-white.png');
            else
                $(`#picker_settting_img`).attr('src', 'img/icons/settings-black.png');
        }

        colorPicker.style.display = 'none';
    }

    Action.chooseElement = function (facility) {
        if (Action.chosen != null) {
            $(`#state_display_before`).html('');
            $(`#state_display_after`).html('');
        }

        var code = generateFacilityElem(facility);

        $(`#state_display_before`).html(
            code
        );
        $(`#state_display_after`).html(
            code
        );

        Action.chosen = facility;
        console.log(`choose element ${facility}`);
        // console.log()
    }

    function getSlidersColor() {
        return parseColors(document.getElementById(`red`).value,
            document.getElementById(`lime`).value,
            document.getElementById(`blue`).value)
    }

    Action.changeRangeColor = function (event, colorType, value) {
        const element = event.target
        var final_color = ""
        var value = parseInt(value)
        switch (colorType) {
            case 'red':
                final_color = rgbToHex(value, 0, 0)
                break;
            case 'lime':
                final_color = rgbToHex(0, value, 0)
                break;
            default:
                final_color = rgbToHex(0, 0, value)
                break;
        }

        element.style.setProperty('--background', final_color)

        // changeColorDisplay(number, getSlidersColor(number))
        $(`#color_display`).css("background-color", getSlidersColor());
        // $(`prev_color`).css("background-color", final_color);
    }

    function getFinalColor() {
        var raw_rgb = $(`#state_display_after`).children().children().css(`background-color`);
        var rgb = raw_rgb.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');

        return parseColors(rgb[0], rgb[1], rgb[2])
    }

    Action.toggle = function (event) {
        var color = getFinalColor();
        $('#prev_color').css('background-color', color);
        Websockets.toggle(Action.chosen, color);
    }

    Action.blink = function (event) {
        // var color = getFinalColor();
        Websockets.blink(Action.chosen);
    }

}(window.Action = window.Action || {}, jQuery));

window.addEventListener('load', Action.onLoad);
