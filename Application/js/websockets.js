const find = require('local-devices');
const axios = require('axios');


(function (Websockets, $, undefined) {
    var gateways = [];
    let facilities = {};
    var colorRegexp = '#[a-fA-F0-9]{6}';
    const convertation = {
        'g': FacilityTypes.GATE,
        'f': FacilityTypes.FLAG,
        'm': FacilityTypes.MARKER,
        'r': FacilityTypes.RECEIVER,
        't': FacilityTypes.MAT,
    }

    Websockets.testAdd = function() {
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

        // addFacility(new Facility("1", null, 1, '#ff00ff', null, 'gate'));
        // addFacility(new Facility("2", null, 2, '#00ff00', null, 'flag'));
        // addFacility(new Facility("3", null, 3, '#000000', null, 'marker'));
        // addFacility(new Facility("4", null, 4, '#ffffff', null, 'flag'));
        // addFacility(new Facility("5", null, 5, '#aaffaa', null, 'gate'));


        for (const [key, value] of Object.entries(facilities)) {
            gateways.push(value.ip);
        }
    }

    Websockets.testDelete = function () {
        // setTimeout( () => {
        //     Websockets.deleteFacility(facilities[6]);
        // }, 50);
        let len = gateways.length;
        for (let i = 0; i < len; i++) {
            Websockets.deleteFacility(facilities[gateways[0]]);
        }
    }

    Websockets.onLoad = function (event) {
        // Websockets.testAdd();
    }

    function addFacility(facility) {
        Table.addFacility(facility);
        Map.addFacility(facility);
        facilities[facility.ip] = facility;
    }

    function makeWebSocket(ip) {
        var socket = new WebSocket(`ws://${ip}/ws`);
        socket.onopen = onOpen;
        // socket.onclose = onClose;
        socket.onmessage = onMessage;
        return socket
    }
    function onOpen(event) {
        console.log('Connection opened');
    }

    function onClose(event) {
        console.log('Connection closed event', event.target.url.slice(5, -3));
        var address = event.target.url.slice(5, -3);
        var facility = facilities[address];
        if (facility == undefined)
            return false;

        Websockets.deleteFacility(facility);
    }

    function updateColors(facility, newColor) {
        var map = $(facility.mapDiv);
        // console.log(`update color of`, facility, ' with ', newColor);
        $(facility.mapDiv).css('background-color', newColor);
        $(facility.tableDiv).css('background-color', newColor);
        $(facility.indicatorDiv).css('background-color', newColor);
        facility.color = newColor;

        if (Action.chosen != null) { 
            if (Action.chosen == facility)
                Action.chooseElement(Action.chosen);
            else if (Action.multiChose && Action.chosen.has(facility))
                Action.choseMultipleElements(Action.chosen);
        }
    }

    function updateType(facility, newType) {
        Map.updateType(faciliy, newType);
        Table.updateType(faciliy, newType);
        facility.type = newType;
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
        console.log(`match is ${match} regexp is ${regexp} on data ${event.data}`)
        if (match == null || match.length != 1) {
            console.log("Decline");
            return false;
        }

        if (facility.type == FacilityTypes.RECEIVER) {
            var count = parseInt(event.data.slice(8));
            facility.count = count;
            Table.updateDescription(facility);
        }

        var newColor = event.data.slice(0, 7);

        updateColors(facility, newColor);
    }

    async function checkFacility(ip, port) {
        var isFacility = false;
        var regexp = `^[`
        for (const [key, value] of Object.entries(convertation)) {
            regexp += key + ',';
        }
        regexp += ']' + colorRegexp;
        
        const response = await axios
            .get(`http://${ip}:${port}/DOYOUGATE`)
            .catch(error => {
                isFacility = false;
                console.log("~axios error " + error);
                return ;
            })

        if (response == false || response == undefined)
            return false;

        if (response.data.length < 1)
            return false;
        
        if (response.data[0] == 'r')
            regexp += '-\\d*';
        regexp += '$';

        if (response.data.match(regexp).length != 1) {
            return isFacility;
        }
        
        var conv = convertation[response.data[0]];
        var color = response.data.slice(1,8);
        if (conv == undefined)
            return false;
        
        isFacility = [conv, color];
        if (conv == FacilityTypes.RECEIVER) {
            isFacility.push(parseInt(response.data.slice(9, )));
        }

        isFacility.push(ip);
            
        return isFacility;
    }


    Websockets.deleteFacility = function (facility) {
        // console.log(`facility to delete`, facility, facility.ip)
        Action.deleteFacility(facility);
        Table.deleteFacility(facility);
        Map.deleteFacility(facility);

        var number = facility.number - 1;
        var ip = facility.ip;
        var index = gateways.indexOf(facility.ip);

        facility.erase()
        console.log(`splicing gateways at ${index}`);
        gateways.splice(index, 1);

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

    Websockets.refresh = async function () {
        var check_gateways = new Set();
        gateways.forEach(elem => {
            check_gateways.add(elem);
            // facilities[elem].websocket.close();
        });
        console.log(`check gateways is `, check_gateways);

        Topnav.startRefreshAnim();

        const devices = await find(null, true).then(result => {
            console.log('result of find is ', result);
            return result;
        });
        console.log('devices is', devices);

        var promises = []

        for (const device of devices) {
            var ip = device.ip;
            console.log(` catch device ip ${ip}`);

            var promise = new Promise( (resolve, reject) => {
                resolve(checkFacility(ip, 80))
                    
            });
            promises.push(promise);
        }

        Promise.all(promises).then(value => {
            value.forEach(isFacility => {
                console.log(`is facility ${isFacility}`);
                var ip = isFacility[isFacility.length - 1];
                    
                if (!isFacility[0]) {
                    return;
                }

                if (gateways.includes(ip)) {
                    check_gateways.delete(ip);
                    var facility = facilities[ip]
    
                    if (facility.websocket.readyState == WebSocket.CLOSED) {
                        var socket = makeWebSocket(ip);
                        facility.websocket = socket;

                        var count = parseInt(isFacility[2]);
                        Table.updateDescription(facility, count);
                    }

                    if (facility.color != isFacility[1])
                        updateColors(facility, isFacility[1]);
                    
                    if (facility.type != isFacility[0])
                        updateType(facility, isFacility[0]);

                    return;
                }

                var number = gateways.length + 1;
                gateways.push(ip);
                var socket = makeWebSocket(ip);

                var facility = new Facility(ip, socket, number,
                    isFacility[1], undefined, isFacility[0]);
                addFacility(facility);

                if (facility.type == FacilityTypes.RECEIVER) {
                    var count = parseInt(isFacility[2]);
                    Table.updateDescription(facility, count);
                }
            })
            check_gateways.forEach(elem => {
                try {
                Websockets.deleteFacility(facilities[elem]);
                } catch {}
            })
            
            Topnav.endRefreshAnim();
        }, reason => {
            Topnav.endRefreshAnim();
        });
    }

    Websockets.refreshClick = function() {
        Websockets.refresh();
    }

    Websockets.toggle = function (facility, message) {
        facility.websocket.send(message);
    }

    Websockets.blink = function (facility, count=2, duration=0.25, color="#ffffff", endless=false) { // duration in seconds
        var message = `blink-${count}-${parseInt(duration*1000)}-${color}`;
        if (endless)
            message += `-endless`;
        facility.websocket.send(message);
    }

    Websockets.stopAnim = function (facility) {
        facility.websocket.send("stopAnimation");
    }

    Websockets.reset = function (facility) {
        facility.websocket.send(`reset`);
    }

}(window.Websockets = window.Websockets || {}, jQuery));

window.addEventListener('load', Websockets.onLoad);
