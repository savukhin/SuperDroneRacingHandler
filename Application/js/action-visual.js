(function (Action, $, undefined) {
    var multiChose = false;
    Action.chosen = null;
    var finalColor = null;
    var colorRegexp = '#[a-fA-F0-9]{6}';
    var tabs = {
        ANIMATION : "animation",
        COLORS : "colors",
    }
    var currentTab = "action_colors";

    Action.colorPick = function (color) {
        if (Action.chosen == null)
            return;

        $(`#state_display_after`).find('.facility-element').children().css(`background-color`, `${color}`);
        finalColor = color;
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
        $(customColor).children().append(`
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
        currentTab = tabName;
        console.log(`change currentTab to ${currentTab}`);
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
        multiChose = false;
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
        if (facility.type == FacilityTypes.RECEIVER) {
            $(reset_button).css("display", "inline-block");
        } else {
            $(reset_button).css("display", "none");
        }
    }

    Action.choseMultipleElements = function (facilities) {
        multiChose = true;
        if (Action.chosen != null) {
            $(`#state_display_before`).html('');
            $(`#state_display_after`).html('');
        }

        Action.chosen = facilities;
        var hasReceiver = false;
        var divBefore = document.createElement('div');
        var divAfter = document.createElement('div');
        // divBefore.id = "before_multiple";
        // divAfter.id = "after_multiple";
        divBefore.className = "multiple-view";
        divAfter.className = "multiple-view";

        Action.chosen.forEach(facility => {
            var code = generateFacilityElem(facility);
            $(divBefore).append(code);
            $(divAfter).append(code);


            if (facility.type == FacilityTypes.RECEIVER) {
                hasReceiver = true;
            }
        });

        $(`#state_display_before`).append(divBefore);
        $(`#state_display_after`).append(divAfter);

        if (hasReceiver) {
            $(reset_button).css("display", "inline-block");
        } else {
            $(reset_button).css("display", "none");
        }
    }

    function getSlidersColor() {
        return parseColors(document.getElementById(`red`).value,
            document.getElementById(`lime`).value,
            document.getElementById(`blue`).value)
    }

    Action.deleteFacility = function (facility) {

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

        $(`#color_display`).css("background-color", getSlidersColor());
    }

    function finalizeColor(color) {
        var match = color.match(colorRegexp);
        if (match != null && match.length == 1)
            return color;
        
        var raw_rgb = color;
        var rgb = raw_rgb.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
        
        return parseColors(rgb[0], rgb[1], rgb[2]);
    }

    Action.toggle = function (event) {
        if (Action.chosen == null || finalColor == null)
            return;
        var color = finalizeColor(finalColor);
        $('#prev_color').css('background-color', color);

        if (multiChose) {
            Action.chosen.forEach(facility => {
                Websockets.toggle(Action.chosen, color);
            });
        } else {
            Websockets.toggle(Action.chosen, color);
        }
    }

    Action.animation = function (event) {
        if (Action.chosen == null)
            return;
        // var color = animation_color.value;
        var color = '#ffffff';
        if (finalColor != null)
            color = finalizeColor(finalColor);
        var count = animation_count.value;
        var duration = animation_duration.value;

        if (multiChose) {
            Action.chosen.forEach(facility => {
                Websockets.blink(Action.chosen, count, duration, color);
            });
        } else {
            Websockets.blink(Action.chosen, count, duration, color);
        }
    }

    Action.blink = function (event) {
        if (Action.chosen == null)
            return;
        // Websockets.blink(Action.chosen);

        if (multiChose) {
            Action.chosen.forEach(facility => {
                Websockets.blink(facility);
            });
        } else {
            Websockets.blink(Action.chosen);
        }
    }

    Action.reset = function (event) {
        if (Action.chosen == null)
            return;
        // Websockets.reset(Action.chosen);
        if (multiChose) {
            Action.chosen.forEach(facility => {
                if (facility.type == FacilityTypes.RECEIVER)
                    Websockets.reset(facility);
            });
        } else {
            if (Action.chosen.type == FacilityTypes.RECEIVER)
                Websockets.reset(Action.chosen);
        }
    }

}(window.Action = window.Action || {}, jQuery));

window.addEventListener('load', Action.onLoad);
