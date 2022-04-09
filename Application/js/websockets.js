const find = require('local-devices');
const axios = require('axios');
// const {Facility, Color} = require('./js/gate')


(function (Websockets, $, undefined) {
    var gateways = [];
    // let facilities = new Set();
    let facilities = {};
    var colorRegexp = '#[a-fA-F0-9]{6}';
    const convertation = {
        'g': FacilityTypes.GATE,
        'f': FacilityTypes.FLAG,
        'm': FacilityTypes.MARKER,
        'r': FacilityTypes.RECEIVER,
        't': FacilityTypes.MAT,
    }

    function testAdd() {
        addFacility(new Facility("1", null, 1, '#ff00ff', null, 'gate'));
        addFacility(new Facility("2", null, 2, '#00ff00', null, 'flag'));
        addFacility(new Facility("3", null, 3, '#000000', null, 'marker'));
        addFacility(new Facility("4", null, 4, '#ffffff', null, 'flag'));
        addFacility(new Facility("5", null, 5, '#aaffaa', null, 'gate'));
        addFacility(new Facility("6", null, 6, '#0000ff', null, 'receiver'));
        addFacility(new Facility("7", null, 7, '#00ffff', null, 'mat'));
        addFacility(new Facility("14", null, 8, '#00fff0', null, 'marker'));
        addFacility(new Facility("15", null, 9, '#ffffff', null, 'marker'));
        addFacility(new Facility("10", null, 10, '#aaaaaa', null, 'gate'));
        addFacility(new Facility("16", null, 11, '#ff0000', null, 'receiver'));
        addFacility(new Facility("12", null, 12, '#ffff00', null, 'gate'));
        addFacility(new Facility("26", null, 13, '#000000', null, 'receiver'));
        addFacility(new Facility("36", null, 14, '#ff00ff', null, 'mat'));


        for (const [key, value] of Object.entries(facilities)) {
            gateways.push(value.ip);
        }
        console.log(`gateways is ${gateways}`);
    }

    Websockets.testDelete = function () {
        setTimeout( () => {
        Websockets.deleteFacility(facilities[5]);
        }, 50);
    }

    Websockets.onLoad = function (event) {
        testAdd();
    }

    function addFacility(facility) {
        Table.addFacility(facility);
        Map.addFacility(facility);
        // facilities.add(facility);
        facilities[facility.ip] = facility;
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
        var facility = facilities[address];
        if (facility == undefined)
            return false;

        var regexp = '^' + colorRegexp;
        if (facility.type == FacilityTypes.RECEIVER)
            regexp += '-\\d*';
        regexp += '$';

        var match = event.data.match(regexp);
        console.log(`match is ${match} regexp is ${regexp}`)
        if (match == null || match.length != 1) {
            console.log("Decline");
            return false;
        }

        if (facility.type == FacilityTypes.RECEIVER) {
            var count = parseInt(event.data.slice(8));
            $(facility.descrDiv).find('p').html(count);
        }

        var newColor = event.data.slice(0, 7);

        var map = $(facility.mapDiv);
        $(facility.mapDiv).css('background-color', newColor);
        $(facility.tableDiv).css('background-color', newColor);
        $(facility.indicatorDiv).css('background-color', newColor);
        facility.color = newColor;

        if (Action.chosen == facility)
            Action.chooseElement(facility);
    }

    async function checkFacility(ip, port) {
        var isFacility = false;
        var regexp = `^[`
        for (const [key, value] of Object.entries(convertation)) {
            regexp += key + ',';
        }
        regexp += ']' + colorRegexp + '$';

        const response = await axios
            .get(`http://${ip}:${port}/DOYOUGATE`)
            .then(res => {
                if (res.data.match(regexp).length != 1) {
                    return isFacility;
                }

                console.log(`Res is ${res.data}`);
                var conv = convertation[res.data[0]];
                var color = res.data.slice(1,);
                console.log(`conv is ${conv}`);
                if (conv != undefined)
                    isFacility = [conv, color];
            })
            .catch(error => {
                isFacility = false;
            })
        return isFacility;
    }


    Websockets.deleteFacility = function (facility) {
        Action.deleteFacility(facility);
        Table.deleteFacility(facility);
        Map.deleteFacility(facility);

        var number = facility.number - 1;
        var ip = facility.ip;

        facility.erase()
        gateways.splice(number, 1);

        setTimeout(() => {
            for (var [key, value] of Object.entries(facilities)) {
                if (parseInt(value.number) <= parseInt(number))
                    continue;

                    value.number--;
                if (!NonDescriptionalFacilities.has(value.type) && value.type != FacilityTypes.RECEIVER) {
                    var query = $(value.tableDiv).parent().parent().parent().find(".description");
                    query.html(`<p>${value.number}</p>`);
                }
            }
        }, 0);
        delete facilities[ip];
    }

    Websockets.refresh = function () {
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
                    if (!isFacility[0])
                        return

                    var number = gateways.length + 1;
                    gateways.push(ip);
                    var socket = makeWebSocket(ip);
                    addFacility(new Facility(ip, socket, number,
                        isFacility[1], undefined, isFacility[0]));
                })
            })

            check_gateways.forEach(elem => {
                Websockets.deleteFacility(gateways.indexOf(elem))
            })
            refresh_button.disabled = false;
        })
    }

    Websockets.toggle = function (facility, message) {
        facility.websocket.send(message);
    }

    Websockets.blink = function (facility, count = 3) {
        facility.websocket.send(`blink-${count}`);
    }

    Websockets.reset = function (facility) {
        facility.websocket.send(`reset`);
    }

}(window.Websockets = window.Websockets || {}, jQuery));

window.addEventListener('load', Websockets.onLoad);
