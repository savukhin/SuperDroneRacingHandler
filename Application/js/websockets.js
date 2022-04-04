const find = require('local-devices');
const axios = require('axios')
const {Gate, Color} = require('./js/gate')

var gateways = [];
let gates = {};

window.addEventListener('load', onLoad);
function onLoad(event) {
    makeGateDiv(3, "3")
    makeGateDiv(4, "3")
    makeGateDiv(4, "3")
    makeGateDiv(4, "3")
    makeGateDiv(4, "3")
    makeGateDiv(4, "3")
    makeGateDiv(4, "3")
}

function makeWebSocket(ip) {
    var socket = new WebSocket(`ws://${ip}/ws`);
    socket.onopen = onOpen;
    socket.onclose = onClose;
    socket.onmessage = onMessage;
    return socket
}
function onOpen(event) {
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
}
function onMessage(event) {
    var address = event.origin.slice(5)
    var number = gateways.indexOf(address)

    var state;
    console.log(`Got data ${event.data} to ${number}`)
    if (event.data == "1") {
        state = "ON";
    }
    else {
        state = event.data;
    }
    document.getElementById(`state${number}`).innerHTML = state;
}

function makeGateDiv(number, ip) {
    var generateColorPickCode = function(color) {
        return `<div class="outer-color-pick">
        <div class='color-pick' style="background: ${color}" onclick="colorPick(${number}, event.target.style.background)"></div>
        </div>`
    }

    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Output - GPIO 2</h2>
        <div id="color_display${number}" class="color-display"></div>
        <br>
    `
    var colors = ['red', 'green', 'blue', 'yellow', 'aqua', 
    'magenta', 'white', 'black', 'cyan', 'pink']
    for (var i = 0; i < colors.length / 2; i++) {
        code += generateColorPickCode(colors[i])
    }
    code += '<br>'
    for (var i = colors.length / 2; i < colors.length; i++) {
        code += generateColorPickCode(colors[i])
    }

    var fadersColors = ['red', 'blue', 'green']
    fadersColors.forEach(color => {
        code += `<p><input id="${color}${number}" min=0 max=255 value=0 type="range" oninput="changeRangeColor(event.target, ${number}, this.value, '${color}')"/></p>`
    })

    code += `<p><button id="button${number}" class="button" onClick="toggle(${number})">Toggle ${number + 1}</button></p>`

    var newDiv = document.createElement("div");
    newDiv.className = "outer-card"
    newDiv.id = `outer_card${number}`
    newDiv.innerHTML = code

    document.getElementById('content').appendChild(newDiv);

    return newDiv
}

async function checkIsGate(ip, port) {
    var isGate = false
    const response = await axios
        .get(`http://${ip}:${port}/DOYOUGATE`)
        .then(res => {
            isGate = true
        })
        .catch(error => {
            isGate = false
        })
    return isGate
}

function deleteGate(number) {
    var ip = gateways[number]

    gates[ip].erase()
    gateways.splice(number, 1);
    delete gates[ip]
}

function refresh() {
    var check_gateways = new Set();
    gateways.forEach(elem => {
        check_gateways.add(elem);
    });

    refresh_button.disabled = true

    find().then(devices => {
        devices.forEach(device => {
            var ip = device.ip
            if (gateways.includes(ip)) {
                check_gateways.delete(ip)
                return
            }

            checkIsGate(ip, 80).then(isGate => {
                if (!isGate)
                    return
                
                var number = gateways.length
                gateways.push(ip)
                var div = makeGateDiv(number, ip)
                gates[ip] = new Gate(ip, makeWebSocket(ip), number, new Color(), div)
            })
        })

        check_gateways.forEach(elem => {
            deleteGate(gateways.indexOf(elem))
        })
        refresh_button.disabled = false
    })
}

function toggle(number) {
    var ip = gateways[number]
    
    /*var red = parseInt(document.getElementById(`red${number}`).value).toString(16)
    var blue = parseInt(document.getElementById(`blue${number}`).value).toString(16)
    var green = parseInt(document.getElementById(`green${number}`).value).toString(16)
    if (red.length == 1) red = '0' + red
    if (green.length == 1) green = '0' + green
    if (blue.length == 1) blue = '0' + blue
    
    var message = '#' + red + blue + green*/
    var message = getFinalColor(number)

    gates[ip].websocket.send(message);
}
