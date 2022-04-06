const find = require('local-devices');
const axios = require('axios');
// const {Facility, Color} = require('./js/gate')


(function ( Websockets, $, undefined ) {
    var gateways = [];
    let facilities = new Set();

    Websockets.onLoad = function(event) {
        // addFacility(new Facility("1", null, 1, '#ff00ff', null, 'gate'));
        // addFacility(new Facility("2", null, 2, '#00ff00', null, 'gate'));
    }

    function addFacility(facility) {
        Table.addFacility(facility);
        Map.addFacility(facility);
        facilities.add(facility);
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

    async function checkFacility(ip, port) {
        var isFacility = false;
        const response = await axios
            .get(`http://${ip}:${port}/DOYOUGATE`)
            .then(res => {
                console.log(`Res is ${res.data}`);
                if (res.data == 'YES')
                    isFacility = 'gate';
                else
                    isFacility = 'flag';
            })
            .catch(error => {
                isFacility = false;
            })
        return isFacility;
    }


    function deleteFacility(number) {
        var ip = gateways[number]
    
        facilities[ip].erase()
        gateways.splice(number, 1);
        delete facilities[ip]
    }
    
    Websockets.refresh = function() {
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
    
                checkFacility(ip, 80).then(isFacility => {
                    if (!isFacility)
                        return
                    
                    var number = gateways.length;
                    gateways.push(ip);
                    var socket = makeWebSocket(ip);
                    console.log(`socket is ${socket}`);
                    //var div = makeFacilityDiv(number, ip)
                    addFacility(new Facility(ip, socket, number, 
                        new Color(), undefined, isFacility));
                    // facilities[ip] = new Facility(ip, makeWebSocket(ip), number, new Color(), undefined)
                })
            })
    
            check_gateways.forEach(elem => {
                Websockets.deleteFacility(gateways.indexOf(elem))
            })
            refresh_button.disabled = false
        })
    }
    
    function send(number, message) {
        var ip = gateways[number]
        facilities[ip].websocket.send(message);
    }
    
    // Websockets.toggle = function(number) {
    //     send(number, getDisplayColor(number))
    // }

    Websockets.toggle = function(facility, message) {
        // send(number, getDisplayColor(number))
        facility.websocket.send(message);
    }
    
    Websockets.blink = function(number, count=3) {
        send(number, `blink-${count}`)
    }

}(window.Websockets = window.Websockets || {}, jQuery ));

window.addEventListener('load', Websockets.onLoad);
