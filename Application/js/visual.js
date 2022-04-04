function componentToHex(c) {
    var hex = c.toString(16);
    console.log(`hex = ${hex}`)
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getFinalColor(number) {
    var red = parseInt(document.getElementById(`red${number}`).value).toString(16)
    var blue = parseInt(document.getElementById(`blue${number}`).value).toString(16)
    var green = parseInt(document.getElementById(`green${number}`).value).toString(16)
    if (red.length == 1) red = '0' + red
    if (green.length == 1) green = '0' + green
    if (blue.length == 1) blue = '0' + blue
    
    var color = '#' + red + green + blue
    return color
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
        case 'green':
            final_color = rgbToHex(0, value, 0)
            break;
        default:
            final_color = rgbToHex(0, 0, value)
            break;
    }

    element.style.setProperty('--background', final_color)

    changeColorDisplay(number,  getFinalColor(number))
}