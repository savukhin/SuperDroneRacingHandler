#ifndef GLOBAL_VARIABLES_H
#define GLOBAL_VARIABLES_H

#define corrector 10
#define delayCorrection 300
#define debug false  //true for debug
#define CapLoss 20
#define bDelay 50
#define hDelay 1250
#define baton 12
#define buttonPin 12

#define outputRed 4
#define outputGreen 5
#define outputBlue 3

#include "colors.h"

Color globalColor = { 0, 0, 0 };

const char  * ssid = "HonorView10";
const char* password = "saveliythebest";

//const char* ssid = "WS_Lab7";
//const char* password = "ws2020ws";

int buttonState = 0;
int lastButtonState = 0;
short V = 0;
short maxVal = 0;
short minVal = 1000;
int cells = 0;
bool offFlag = 0;

unsigned long currentTime = millis();
unsigned long previousTime = 0;
const long timeoutTime = 500;

byte lastMode = 0;
bool flagBlock = true;
bool holdBlock = true;
bool holdFlag = false;
bool bLast = 0;
bool flag = 0;
bool bState = 0;
unsigned long disLastTime = 0;
unsigned long trigTime = 0;
unsigned long upTime = 0;

#endif
