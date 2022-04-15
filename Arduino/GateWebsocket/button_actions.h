#ifndef BUTTON_ACTIONS_H
#define BUTTON_ACTIONS_H

#include "global_variables.h"

int workMode = 0;
int buttstate = 0;
int a = 0;



//Setup***************************************

void buttonSetup() {
  pinMode(buttonPin, INPUT);

  if (debug == 1) Serial.begin(9600);
  pinMode(A0, INPUT);

  //Define cells number
  #define vInitDelay 15
  #define probes 50
  #define vRaz 6
  byte i = 0;
  while (i < probes) {
    V = analogRead(A0) - corrector;
    if (V > maxVal) maxVal = V;
    if (V < minVal) minVal = V;
    delay(vInitDelay);
    i ++;
  }

  if ((maxVal - minVal) > vRaz) cells = 0;
  else if (V > 470 && V < 638) cells = 3;
  else if (V > 638 && V < 840) cells = 4;
}

void updateColorsButton() {
//  workMode = newMode;
  if (offFlag != 1) {
    if (workMode == 1) {
      globalColor.red = 255;
      globalColor.blue = 255;
      globalColor.green = 255;
    } else if (workMode == 2) {
      globalColor.green = 255;
      globalColor.red = 0;
      globalColor.blue = 0;
    } else if (workMode == 3) {
      globalColor.green = 0;
      globalColor.red = 255;
      globalColor.blue = 0;
    } else if (workMode == 4) {
      globalColor.green = 0;
      globalColor.red = 0;
      globalColor.blue = 255;
    }

    else if (workMode == 5) {
        globalColor.green = 0;
        globalColor.red = 255;
        globalColor.blue = 255;
    } else if (workMode == 6) {
        globalColor.green = 255;
        globalColor.red = 255;
        globalColor.blue = 0;
    } else if (workMode == 7) {
        globalColor.green = 255;
        globalColor.red = 0;
        globalColor.blue = 255;
    }

    else if (workMode >= 8) {
      workMode = 0;
      globalColor.green = 0;
      globalColor.red = 0;
      globalColor.blue = 0;
    }
  }
}

bool checkButtonMode() {
  bool updated = false;
  bState = digitalRead(baton);

  if (bState != flag && bState != bLast) {
    trigTime = millis();
    bLast = bState;
    flagBlock  = false;
  }
  if ((millis() - trigTime) > bDelay && flagBlock == false) {
    flag = !flag;
    flagBlock = true;
    if (flag == 1) {
      holdBlock = false;
      upTime = millis();
    }
    else if (holdFlag == false) { //for press
      holdBlock = true;
      workMode ++;
      while (workMode >= 5 && workMode <= 7) workMode ++;
      updateColorsButton();
      updated = true;
    }
    else holdFlag = false;
  }
  if ((millis() - upTime) > hDelay && holdBlock == false) {
    holdBlock = true;
    flagBlock = true;
    holdFlag = true;
    workMode ++;
    while (workMode >= 1 && workMode <= 4) workMode ++;
    updateColorsButton();
    updated = true;
  }
  return updated;
}

void telemetryOut(){
  if (debug == 1) Serial.print("cells   ");
  if (debug == 1) Serial.println(cells);
  if (debug == 1) Serial.print("Max   ");
  if (debug == 1) Serial.println(maxVal);
  if (debug == 1) Serial.print("MIN   ");
  if (debug == 1) Serial.println(minVal);
  if (offFlag == 1 && debug == 1) Serial.print("Flag triggered");
}

void cellOffAnim(int index) {
    digitalWrite(outputGreen, LOW);
    digitalWrite(outputRed, HIGH);
    digitalWrite(outputBlue, LOW);
    
    delay(500);
    digitalWrite(outputGreen, LOW);
    digitalWrite(outputRed, LOW);
    digitalWrite(outputBlue, LOW);
    delay(500);
}

bool buttonLoop() {
  bool updated = checkButtonMode();
  
  if (debug == 1) telemetryOut();

  // End of the button script

  //Start Voltage check******************************************
  if (cells != 0) {
    V = analogRead(A0) - corrector;
    if (cells == 3 && V <= 506) offFlag = 1;
    if (cells == 4 && V <= 676) offFlag = 1;
  }

  if (offFlag == 1) {
    for (a; a < cells; a++) {
      cellOffAnim(a);
    }
  }
  return updated;
}

#endif
