const find = require('local-devices');
const http = require('http')
const axios = require('axios')
const {Gate, Color} = require('./gate.js')

var gateways = []
//var gatewaysNumbers = {}
let gates = {}
//let gateDivs = {}
//var websockets = {};

window.addEventListener('load', onLoad);
function onLoad(event) {
}

function makeWebSocket(ip) {
    //console.log('Trying to open a WebSocket connection...');
    var socket = new WebSocket(`ws://${ip}/ws`);
    socket.onopen = onOpen;
    socket.onclose = onClose;
    socket.onmessage = onMessage; // <-- add this line
    //websockets[ip] = socket
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
    document.getElementById(`state${number + 1}`).innerHTML = state;
}

function makeGateDiv(number, ip) {
    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Output - GPIO 2</h2>
        <p class="state">state: <span id="state${number}">%STATE%</span></p>
        <p><input id="red${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'red')" oninput="changeRangeColor(event, this.value, 'red')"/></p>
        <p><input id="blue${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'blue')" oninput="changeRangeColor(event, this.value, 'blue')"/></p>
        <p><input id="green${number}" min=0 max=255 type="range" onload="changeRangeColor(event, this.value, 'green')" oninput="changeRangeColor(event, this.value, 'green')"/></p>
        <p><button id="button${number}" class="button">Toggle ${number + 1}</button></p>
    </div>`
    var newDiv = document.createElement("div");
        newDiv.innerHTML = code
    gateDivs[ip] = newDiv

    document.getElementById('content').appendChild(newDiv);

    return newDiv
}

async function checkIsGate(ip, port) {
    var isGate = false
    const response = await axios
        .get(`http://${ip}:${port}/DOYOUGATE`)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            console.log(res)
            isGate = true
        })
        .catch(error => {
            console.error("Error = " + error)
            isGate = false
        })
    return isGate
}

function deleteGate(number) {
    console.log(`Deleting number ${number}`)
    var ip = gateways[number]
    var div = gateDivs[ip]

    console.log("Starting deleting")

    gateways.splice(index, 1);
    gates[ip].erase()
    delete gates[ip]
}

function refresh() {
    var check_gateways = new Set()
    gateways.forEach(elem => {
        check_gateways.add(elem)
    })

    find().then(devices => {
        devices.forEach(device => {
            var ip = device.ip
            if (gateways.includes(ip)) {
                check_gateways.delete(ip)
                return
            }

            var isGate = checkIsGate(ip, 80).then(isGate => {
                if (!isGate)
                    return
                
                var number = gateways.length
                gateways.push(ip)
                gates[ip] = Gate(ip, makeWebSocket(ip), number, makeGateDiv(number, ip), Color())
            })
        })

        check_gateways.forEach(elem => {
            deleteGate(gateways.indexOf(elem))
        })
    })
}

function toggle(number) {
    websockets[gateways[number]].send('toggle');
}
