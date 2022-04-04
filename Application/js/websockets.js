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
