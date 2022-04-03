class Color {
    constructor(r=255, g=0, b=0) {
        this.red = r
        this.green = g
        this.blue = b
    }
}

class Gate {
    constructor(ip, websocket, number, color, div) {
        this.ip = ip
        this.websocket = websocket
        this.number = number
        this.color = color
        this.div = div
    }

    erase() {
        this.div.parentNode.removeChild(this.div)
        this.websocket.close()
    }
}

module.exports = { Gate, Color }
