window.addEventListener('load', visualLoad);

function visualLoad(event) {
    var dest = $('#helper').children();
    for (var [key, value] of Object.entries(FacilityTypes)) {
        var code = `
        <div class="grid-2col" style="margin-bottom:10px">
            <div class="block facility-element">
              <div class="${value}-element"></div>
            </div>
            <div> ${value} </div>
          </div>
          `;
        dest.append(code);
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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

function generateMaskElem(facility, classes="") {
    return `<div class="${facility.type}-element ${classes}" style="background-color: ${facility.color}"></div>`
}

function generateFacilityElem(facility, params) {
    let styles = ``;
    if (params) {
        styles += `${params.transparent_block ? "background-color: rgba(0, 0, 0, 0);" : ""}`;
        styles += `${params.alternate_position ? "left: 0px;" : ""}`;
    }
    let code = `
    <div class="block facility-element" style='${styles}'>
        ${generateMaskElem(facility)}
    </div>
    `
    return code;
}
