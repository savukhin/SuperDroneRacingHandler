const find = require('local-devices');
const axios = require('axios')
const {Gate, Color} = require('./js/gate')

var gateways = [];
let gates = {};

window.addEventListener('load', onLoad);
function onLoad(event) {
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

    console.log(`Got data ${event.data} to ${number}`)
}

function makeGateDiv(number, ip) {
    var generateColorPickCode = function(color) {
        return `<div class="outer-color-pick">
        <div class='color-pick' style="background: ${color}" onclick="colorPick(${number}, event.target.style.background)"></div>
        </div>`
    }

    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Gate ${number}</h2>
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

    var fadersColors = ['red', 'blue', 'green']
    fadersColors.forEach(color => {
        code += `<p><input id="${color}${number}" min=0 max=255 value=0 type="range" oninput="changeRangeColor(event.target, ${number}, this.value, '${color}')"/></p>`
    })

    code += `<p><button id="button_toggle${number}" class="button" onClick="toggle(${number})">Send</button></p>`
    code += `<p><button id="button_blink${number}" class="button" onClick="blink(${number})">Blink 3 times</button></p>`

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

function send(number, message) {
    var ip = gateways[number]
    console.log(`Sending ${message} to ${number} with ip ${ip}`)
    gates[ip].websocket.send(message);
}

function toggle(number) {
    send(number, getDisplayColor(number))
}

function blink(number, count=3) {
    send(number, `blink-${count}`)
}
