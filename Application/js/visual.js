function componentToHex(c) {

    var hex = c.toString(16);
    console.log(`hex = ${hex}`)
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function changeRangeColor(event, value, color) {
    const element = document.querySelector(`#${event.target.id}`)
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

    console.log(`${event.target.id} -> ${value} final = ${final_color}`)
    element.style.setProperty('--background', final_color)
}