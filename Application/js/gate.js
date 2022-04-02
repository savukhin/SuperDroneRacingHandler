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
    constructor(ip, color) {
        this.ip = ip
        this.color = color
    }
}