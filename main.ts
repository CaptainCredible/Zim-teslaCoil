let iAmZam = false   // CHOOSE IF YOU ARE PROGRAMMING ZIM OR ZAM
let altTrack = !iAmZam

//turns out altTrack is Zim and Zam is normal

let list = 0
let myOnTime = 500
let portBOnTimes: number[] = []
let portAOnTimes: number[] = []
let pauseLength = 0
//let outputBBuffer = 0
let portBTimers: number[] = []
let portATimers: number[] = []
let flip = false
let myOnTimer = 0
//let outputABuffer = 0
let outPut = 0
let perxles: neopixel.Strip = null
let midiChannel: midi.MidiController = null
let anOutputIsOn = false
let incrementor = 0
let notes: number[] = []
let chan = 0
let muted = false

function handleMCP23017Out() {
    if (myNote < 8) {
        // serial.writeValue("less than 8", myNote)
        MCP23017.setOutputA(myNote)
        portATimers[myNote] = input.runningTime()
    } else {
        // serial.writeValue("more than 8", myNote)
        MCP23017.setOutputB(myNote - 8)
        portBTimers[myNote - 8] = input.runningTime()
    }
}
function handlePinOuts() {
    pins.digitalWritePin(myPins[myNote], 1)
    anOutputIsOn = true
}
function handleNeoPixies() {
    for (let indeks = 0; indeks <= 2; indeks++) {
        perxles.setPixelColor(myNote + indeks, neopixel.colors(NeoPixelColors.Red))
        perxles.show()
    }
}
function sendMidi() {
    midiChannel.noteOn(50 - myNote)
    basic.pause(1)
    led.toggle(0, 0)
    midiChannel.noteOff(50 - myNote)
    basic.pause(1)
}
function handleOutput() {
    led.plot(0, outPut % 5)
    led.plot(1, outPut % 5)
    led.plot(2, outPut % 5)
    led.plot(3, outPut % 5)
    led.plot(4, outPut % 5)
    led.plot(outPut % 5 - 5, 0)
    led.plot(outPut % 5 - 5, 1)
    led.plot(outPut % 5 - 5, 2)
    led.plot(outPut % 5 - 5, 3)
    led.plot(outPut % 5 - 5, 4)
    myOnTimer = input.runningTime() + myOnTime

    pins.digitalWritePin(DigitalPin.P1, 1)
    myNote = outPut + 1
    makeSomeNoise()
}



function makeSomeNoise() {
    notes = [65, 69, 73, 78, 82, 87, 92, 98, 104, 110, 117, 123, 131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247]
    //music.playTone(notes[myNote], music.beat(BeatFraction.Sixteenth))
    music.ringTone(notes[myNote%notes.length])
}
function updateMCP23017() {
    MCP23017.updateOutputAOn(ADDRESS.A27)
    MCP23017.updateOutputBOn(ADDRESS.A27)
}
input.onButtonPressed(Button.A, () => {
    chan += 1
    midiChannel = midi.channel(chan)
})

input.onButtonPressed(Button.A, () => {
    muted = !muted
})

function blink() {
    led.plotAll()
    basic.pause(20)
}


radio.onReceivedValue(function (name, value) {

    if (!muted) {
        if ((name == "ZimP") && !iAmZam) {
            bitCheckMask = 1
            for (let i = 0; i <= 16 - 1; i++) {
                if (bitCheckMask & value) {
                    outPut = 44 - i
                    // outPut = 15-i //add this to flip output!
                    handleOutput()
                }
                bitCheckMask = bitCheckMask << 1
            }

        } else if ((name == "ZamP") && iAmZam) {
            bitCheckMask = 1
            for (let i = 0; i <= 16 - 1; i++) {
                if (bitCheckMask & value) {
                    outPut = 44 - i
                    led.toggleAll()
                    // outPut = 15-i //add this to flip output!
                    handleOutput()
                }
                bitCheckMask = bitCheckMask << 1
            }
        } else if (name == "Zim") {
            //blink()
            if ((altTrack)) {
                outPut = value & 0b0000000011111111

            } else {
                outPut = value >> 8
            }
            if (outPut > 1 && outPut < 120) {
                //outPut += 3
                handleOutput()
            }
        } else if ((name == "Zam") && iAmZam) {
            outPut = value
            if (outPut != 0 && outPut < 127) {
                handleOutput()
            }
        }
        /*
                if (name == "ZimP") {
        
                    if (!(altTrack)) {
                        bitCheckMask = 1
                        for (let i = 0; i <= 16 - 1; i++) {
                            if (bitCheckMask & value) {
                                outPut = i
                                handleOutput()
                            }
                            bitCheckMask = bitCheckMask << 1
                        }
                    }
                } else if (name == "Zim") {
                    //blink()
                    if (!(altTrack)) {
                        outPut = value & 0b0000000011111111
        
                    } else {
                        outPut = value >> 8
                    }
                    if (outPut > 1 && outPut < 120) {
                        outPut += 3
                        handleOutput()
                    }
                }
        */

    }

    if (name == "m") {
        /*
        Bob 00000001
        Tim 00000010
        Ted 00000100
        Pat 00001000
        Cat 00010000
        Dad 00100000
        Mum 01000000
        Zim 10000000
        */
        if (value & 0b10000000) {
            muted = true
            basic.showIcon(IconNames.No, 1)
        } else {
            muted = false
            basic.clearScreen()
        }
    }
})


function handleMCP23017offs() {
    if (outputABuffer > 0) {
        for (let handleMCP23017offsIndexA = 0; handleMCP23017offsIndexA <= 8 - 1; handleMCP23017offsIndexA++) {
            if (input.runningTime() > portATimers[handleMCP23017offsIndexA] + portAOnTimes[handleMCP23017offsIndexA]) {
                MCP23017.clearOutputA(handleMCP23017offsIndexA)
                MCP23017.updateOutputAOn(ADDRESS.A27)
            }
        }
    }
    if (outputBBuffer > 0) {
        for (let handleMCP23017offsIndexB = 0; handleMCP23017offsIndexB <= 8 - 1; handleMCP23017offsIndexB++) {
            if (input.runningTime() > portBTimers[handleMCP23017offsIndexB] + portBOnTimes[handleMCP23017offsIndexB]) {
                MCP23017.clearOutputB(handleMCP23017offsIndexB)
                MCP23017.updateOutputBOn(ADDRESS.A27)
            }
        }
    }
}
function turnOffAllLeds() {
    perxles.clear()
    perxles.show()
}
let myNote = 0
let bitCheckMask = 0
incrementor = 0
flip = false
pauseLength = 0
serial.redirectToUSB()
myOnTimer = 1000
portAOnTimes = [20, 20, 20, 20, 20, 20, 20, 20]
portBOnTimes = [20, 20, 20, 20, 20, 20, 20, 20]
portATimers = [0, 0, 0, 0, 0, 0, 0, 0]
portBTimers = [0, 0, 0, 0, 0, 0, 0, 0]
let myPins: number[]
basic.showLeds(`
    . . . . .
    . # # # .
    # # . # #
    . # # # .
    . . . . .
    `)
basic.pause(500)
MCP23017.setPortAsOutput(ADDRESS.A27, SET_PORT.A)
MCP23017.setPortAsOutput(ADDRESS.A27, SET_PORT.B)

myPins = [9, 15, 20, 21, 22, 23]
list = 0
radio.setGroup(83)
music.setTempo(200)
basic.forever(() => {
    if (input.runningTime() > myOnTimer) {
        music.stopAllSounds();
        if (!muted) {
            basic.clearScreen()
        } else {
            basic.showIcon(IconNames.No, 1)
        }
        led.plot(0, 0)
        // turnOffAllLeds()
        for (let offIndex = 0; offIndex <= 6 - 1; offIndex++) {
            pins.digitalWritePin(myPins[offIndex], 0)
            pins.digitalWritePin(DigitalPin.P1, 0)
        }
        anOutputIsOn = false
    }
})
control.inBackground(() => {
    while (true) {
        handleMCP23017offs()
        basic.pause(1)
    }
})
