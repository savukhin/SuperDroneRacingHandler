class Color {
    constructor(r, g, b) {
        this.red = r
        this.green = g
        this.blue = b
    }

    constructor() {
        this.red = 255
        this.green = 0
        this.blue = 0
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
        this.div.parentNode.removeChild(div)
        console.log("Closing websocket")
        this.websocket.close()
        console.log("Closed")
    }
}

module.exports = Gate, Color
