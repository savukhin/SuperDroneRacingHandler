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

    var state;
    if (event.data == "1") {
        state = "ON";
    }
    else {
        state = "OFF";
    }
    document.getElementById(`state${number}`).innerHTML = state;
}

function makeGateDiv(number, ip) {
    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Output - GPIO 2</h2>
        <p class="state">state: <span id="state${number}">%STATE%</span></p>
        <p><input id="red${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'red')" oninput="changeRangeColor(event, this.value, 'red')"/></p>
        <p><input id="blue${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'blue')" oninput="changeRangeColor(event, this.value, 'blue')"/></p>
        <p><input id="green${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'green')" oninput="changeRangeColor(event, this.value, 'green')"/></p>
        <p><button id="button${number}" class="button" onClick="toggle(${number})">Toggle ${number + 1}</button></p>
    </div>`
    var newDiv = document.createElement("div");
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
    gates[ip].websocket.send('toggle');
}
