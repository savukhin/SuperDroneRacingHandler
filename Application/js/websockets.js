const find = require('local-devices');
const axios = require('axios')
// const {Facility, Color} = require('./js/gate')

var gateways = [];
let facilities = {};

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

async function checkIsFacility(ip, port) {
    var isFacility = false
    const response = await axios
        .get(`http://${ip}:${port}/DOYOUGATE`)
        .then(res => {
            isFacility = true
        })
        .catch(error => {
            isFacility = false
        })
    return isFacility
}

function deleteFacility(number) {
    var ip = gateways[number]

    facilities[ip].erase()
    gateways.splice(number, 1);
    delete facilities[ip]
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

            checkIsFacility(ip, 80).then(isFacility => {
                if (!isFacility)
                    return
                
                var number = gateways.length
                gateways.push(ip)
                var div = makeFacilityDiv(number, ip)
                facilities[ip] = new Facility(ip, makeWebSocket(ip), number, new Color(), div)
            })
        })

        check_gateways.forEach(elem => {
            deleteFacility(gateways.indexOf(elem))
        })
        refresh_button.disabled = false
    })
}

function send(number, message) {
    var ip = gateways[number]
    facilities[ip].websocket.send(message);
}

function toggle(number) {
    send(number, getDisplayColor(number))
}

function blink(number, count=3) {
    send(number, `blink-${count}`)
}
