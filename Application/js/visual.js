function makeGateDiv(number, ip) {
    var generateColorPickCode = function (color) {
        return `<div class="outer-color-pick">
        <div class='color-pick' style="background: ${color}" onclick="colorPick(${number}, event.target.style.background)"></div>
        </div>`
    }

    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Gate ${number + 1}</h2>
        <div id="color_display${number}" class="color-display"></div>
        <br>
    `
    var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '00ffff',
        '#ff00ff', '#ffffff', '#000000', '#00ffff', '#ffc0cb']
    for (var i = 0; i < colors.length / 2; i++) {
        code += generateColorPickCode(colors[i])
    }
    code += '<br>'
    for (var i = colors.length / 2; i < colors.length; i++) {
        code += generateColorPickCode(colors[i])
    }

    var fadersColors = ['red', 'blue', 'lime']
    fadersColors.forEach(color => {
        code += `<p><input id="${color}${number}"  min=0 max=255 value=0 type="range" class="${color}-slider" oninput="changeRangeColor(event.target, ${number}, this.value, '${color}')"/></p>`
    })

    code += `<p><button id="button_toggle${number}" class="button" onClick="toggle(${number})">Send</button></p>`
    code += `<p><button id="button_blink${number}" class="button" onClick="blink(${number})">Blink 3 times</button></p>`

    var newDiv = document.createElement("div");
    newDiv.className = "outer-card"
    newDiv.id = `outer_card${number}`
    newDiv.innerHTML = code

    document.getElementById('content').appendChild(newDiv);

    fadersColors.forEach(color => {
        document.getElementById(`${color}${number}`).style.setProperty('--slider-color', color)

    })

    return newDiv
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function parseColors(red, green, blue) {
    var red = parseInt(red).toString(16)
    var green = parseInt(green).toString(16)
    var blue = parseInt(blue).toString(16)

    if (red.length == 1) red = '0' + red
    if (green.length == 1) green = '0' + green
    if (blue.length == 1) blue = '0' + blue

    var color = '#' + red + green + blue
    return color
}

function getDisplayColor(number) {
    var raw_rgb = document.getElementById(`color_display${number}`).style.backgroundColor
    var rgb = raw_rgb.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');

    return parseColors(rgb[0], rgb[1], rgb[2])
}

function getSlidersColor(number) {
    return parseColors(document.getElementById(`red${number}`).value,
        document.getElementById(`lime${number}`).value,
        document.getElementById(`blue${number}`).value)
}

function changeColorDisplay(number, color) {
    document.getElementById(`color_display${number}`).style.background = color
}

function colorPick(number, color) {
    changeColorDisplay(number, color)
}

function changeRangeColor(target, number, value, color) {
    const element = target
    var final_color = ""
    var value = parseInt(value)
    switch (color) {
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

    changeColorDisplay(number, getSlidersColor(number))
}

function generateFacilityElem(facility) {
    var code = `
    <div class="block facility-element">
        <div class="${facility.type}-element" style="background-color: ${facility.color}"></div>
    </div>
    `
    return code;
}
