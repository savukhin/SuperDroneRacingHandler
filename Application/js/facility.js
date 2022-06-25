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

const FacilityDesciptions = {
    "gate" : 'Number',
    "flag" : 'Number',
    "marker" : 'Number',
    "receiver" : 'Count',
    "mat" : 'Number',
}

const NonDescriptionalFacilities = new Set([
    // FacilityTypes.MAT,
]);

let FacilityMasks = {
    'gate' : "img/Gate-1000-blackened.png",
    'flag' : "img/Flag-1000-blackened.png",
    'marker' : "img/Marker-1000-blackened.png",
    'receiver' : "img/Receiver-1000-blackened.png",
    'mat' : "img/Mat-1000-blackened.png",
};

class Facility {
    constructor(ip, websocket, number, color, div, type, count=0) {
        this.ip = ip
        this.websocket = websocket
        this.number = number
        this.color = color
        this.div = div
        this.type = type
        this.mapDiv = null;
        this.tableDiv = null;
        this.descrDiv = null;
        this.cardDiv = null;
        this.count = count;
    }

    erase() {
        if (this.websocket != null)
            this.websocket.close()
    }

    getNumber() {
        let ans = "";
        if (!NonDescriptionalFacilities.has(this.type)) {
            switch (FacilityDesciptions[this.type]) {
                case 'Number':
                    ans += this.number;
                    break;
                case 'Count':
                    ans += this.count;
                    break;
                default:
                    break;
            } 
        } else {
            ans += this.number;
        }
        return ans;
    }

    getDescription() {
        let ans = this.type + " #" + this.getNumber();
        return ans;
    }
}

module.exports = { Facility, Color }
