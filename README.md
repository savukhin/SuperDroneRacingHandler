# SuperDroneRacingHandler

Program for ontrolling objects on Drone Racing map.

Flying drones interact with some types of objects during the race. It is cool when this objects not just static but changing their colors. So this program helps to manage colors of elements of this kind of maps. 

As you see, there is different colors of map objects:
<img src="./Readme files/Drone goes through gate.gif" title="Drone goes through gate">

## Table of contents
- [SuperDroneRacingHandler](#superdroneracinghandler)
    - [Pre-requisites](#pre-requisites)
        - [Software pre-requisites](#software-pre-requisites)
        - [Hardware pre-requisites](#hardware-pre-requisites)
        - [My setup for tests](#my-setup-for-tests)
    - [Getting started](#getting-started)
        - [Test start without Arduino ESP8266](#test-start-without-arduino-esp8266)
        - [Start with Arduino ESP8266](#start-with-arduino-esp8266)
    - [Interface](#interface)
    - [Element description](#element-description)
    - [Working example](#working-example)


## Pre-requisites

### Software pre-requisites
1) [NodeJS](https://nodejs.org/en/) version 8.5.0
2) [Arduino IDE](https://www.arduino.cc/en/software) version 1.8.5
3) Arduino core for [ESP8266](https://github.com/esp8266/Arduino)
4) [ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer) and [ESPAsyncTCP](https://github.com/me-no-dev/ESPAsyncTCP) libraries

### Hardware pre-requisites
1) ESP8266 Arduino
2) RGB LED Strip Light

### My setup for tests
<img src="./Readme files/Setup.jpg" title="My setup for testing" width="500px">
In clockwise direction:

1) Battery (10-15V) and tool for voltage check; it shows 10.9V.
2) XL4015 DC-DC Voltage transformer from 4-38V to 12V (in DIY frame).
3) Arduino ESP8266 (in DIY frame).
4) RGB LED Strip Light.

## Getting started
- Clone the repository:
```
git clone https://github.com/savukhin/SuperDroneRacingHandler.git
```
- Install application dependencies:
```
cd SuperDroneRacingHandler/Application
npm install
```
- Build and run the project:
```
npm start
```
### Test start without Arduino ESP8266
- If you want some testing data, just uncomment 57 line in SuperDroneRacingHandler/Application/js/websockets.js:
```
Websockets.onLoad = function (event) {
    Websockets.testAdd();
}
```
### Start with Arduino ESP8266
- Install depencencies for Arduino (follow the description in links above).
- Change ssid and password section Arduino/GateWebsocket/global_variables.h (23-24 lines):
```
const char* ssid = "Your_wifi_ssid";
const char* password = "Your_wifi_password";
```
- Chose one of gate type in Arduino/GateWebsocket/Gatewebsocket.ino (18-22 lines), just uncomment what you need:
```
FacilityType facilityType = FacilityType::RECEIVER;
//FacilityType facilityType = FacilityType::FLAG;
//FacilityType facilityType = FacilityType::MAT;
//FacilityType facilityType = FacilityType::GATE;
//FacilityType facilityType = FacilityType::MARKER;
```

## Interface
<img src="./Readme files/Explanation.png" title="Interface">

1) Navbar (Top panel):
    - <b>Refresh button</b>. When you run application you need to link program with all arduinos connected to the internet.
    - <b>Sellect all</b>. Select all elements on map
2) Map (Left-upper panel):
    - Program adds new elements here.
    - User can select element by right click.
    - User can reorder elements by drag and drop.
    - User can select several elements by holding mouse button (select box).
    - User can select several elements by holding shift button (including right click and selecting by box).
3) Table (Left-bottom panel):
    - Program adds new elements here.
    - User can select group of elements by clicking button on the top of group.
    - User can expand full deck by mouse over on group.
    - User can select element by clicking on the card.
    - User can select several elements by holding. shift button (can be combined with map selection)
4) Actions (Right panel):
    - Program shows chosen elements in the top square.
    - User can chose new color by clicking color pick.
    <img src="./Readme files/Color picker.png" title="Color Picker" width="300px">
    
    - <b>Top Send button.</b> Send new color.
    - <b>Blink button.</b> Send usual blink (2 blinks 0.25 second each).
    <img src="./Readme files/Blink animation section.png" title="Blink animation section" width="300px">
    
    - <b>Duration of one.</b> Duration of each blink
    - <b>Count.</b> Count of blinks.
    - <b>Flag.</b> Put if you want endless blinking.
    - <b>Bottom Send button.</b> Send blinking animation with parameters.
    - <b>Stop button.</b> Stop animation.

## Element description
1) Gate - Drone must fly through the gate

<img src="./Readme files/Gate.jpg" title="Gate" width="300px">
2) Flag - Drone must fly around the flag

<img src="./Readme files/Flag.jpg" title="Flag" width="300px">
3) Marker - Drone must fly above the marker

<img src="./Readme files/Marker.jpg" title="Marker" width="300px">
4) Receiver - Drone must take up load (tennis ball, for example) and throw off this to the top of receiver

<img src="./Readme files/Receiver.jpg" title="Receiver" width="300px">
5) Mat - Just decoration

<img src="./Readme files/Mat.jpg" title="Mat" width="300px">

## Working example
<img src="./Readme files/Working example.gif" title="example">
