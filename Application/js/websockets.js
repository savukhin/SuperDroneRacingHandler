const find = require('local-devices');
const http = require('http')
const axios = require('axios')

var gateways = []
var gatewaysNumbers = {}
let gates = {}
let gateDivs = {}
var websockets = {};

window.addEventListener('load', onLoad);
function onLoad(event) {
}

function initWebSocket(ip) {
    console.log('Trying to open a WebSocket connection...');
    var socket = new WebSocket(`ws://${ip}/ws`);
    socket.onopen = onOpen;
    socket.onclose = onClose;
    socket.onmessage = onMessage; // <-- add this line
    websockets[ip] = socket
}
function onOpen(event) {
    console.log('Connection opened');
}

function onClose(event) {
    console.log('Connection closed');
}
function onMessage(event) {
    address = event.origin.slice(5)

    var state;
    if (event.data == "1") {
        state = "ON";
    }
    else {
        state = "OFF";
    }
    document.getElementById(`state1`).innerHTML = state;
}

function makeGateDiv(number, ip) {
    var code = `<ul></ul>
    <div id="card${number}" class="card">
        <h2>Output - GPIO 2</h2>
        <p class="state">state: <span id="state${number}">%STATE%</span></p>
        <p><button id="button${number}" class="button" onClick="toggle(${number - 1})">Toggle ${number}</button></p>
    </div>`
    var newDiv = document.createElement("div");
        newDiv.innerHTML = code
    gateDivs[ip] = newDiv

    document.getElementById('content').appendChild(newDiv);
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

    div.parentNode.removeChild(div)
    console.log("Closing websocket")
    websockets[ip].close()
    console.log("Closed")

    gateways.splice(index, 1);
    delete websockets[ip]
    delete gatewaysNumbers[ip]
    delete gateDivs[ip]
}

function refresh() {
    var check_gateways = new Set()
    gateways.forEach(elem => {
        check_gateways.add(elem)
    })
    alert("CheckGateways = " + check_gateways.size)

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
                //gates[ip] = Gate(ip, Color())
                var number = gateways.length
                gateways.push(ip)
                gatewaysNumbers[ip] = number
                initWebSocket(ip)
                makeGateDiv(number + 1, ip)
            })
        })

        alert("CheckGateways = " + check_gateways.size)

        check_gateways.forEach(elem => {
            deleteGate(gateways.indexOf(elem))
        })
    })
}

function toggle(number) {
    alert(gateways)
    alert(`Number = ${number} gateway = ${gateways[number]}`)
    websockets[gateways[number]].send('toggle');
}
