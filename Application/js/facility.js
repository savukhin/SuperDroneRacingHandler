class Color {
    constructor(r=255, g=0, b=0) {
        this.red = r
        this.green = g
        this.blue = b
    }
}

const FacilityTypes = {
    GATE : "gate",
    FLAG : "flag",
    MARKER : "marker",
    RECEIVER : "receiver",
    MAT : "mat",
};

const NonNumerableFacilities = new Set([
    FacilityTypes.RECEIVER,
    FacilityTypes.MAT,
]);

let FacilityMasks = {
    'gate' : "img/Gate-1000-blackened.png",
    'flag' : "img/Flag-1000-blackened.png",
    'marker' : "img/Marker-1000-blackened.png",
    'receiver' : "img/Receiver-1000-blackened.png",
    'mat' : "img/Mat-1000-blackened.png",
};

class Facility {
    constructor(ip, websocket, number, color, div, type) {
        this.ip = ip
        this.websocket = websocket
        this.number = number
        this.color = color
        this.div = div
        this.type = type
        this.mapDiv = null;
        this.tableDiv = null;
        this.indicatorDiv = null;
    }

    erase() {
        this.div.parentNode.removeChild(this.div)
        this.websocket.close()
    }
}

module.exports = { Facility, Color }
