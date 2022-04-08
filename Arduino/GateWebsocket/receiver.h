#ifndef RECEIVER_H
#define RECEIVER_H

#include "button_actions.h"
#include "global_variables.h"

bool flagBlockMode = true;
bool holdBlockMode = true;
bool holdFlagMode = false;
bool bLastMode = 0;
bool flagMode = 0;
unsigned long disLastTimeMode = 0;
unsigned long trigTimeMode = 0;
unsigned long upTimeMode = 0;

// Auxiliar variables to store the current output state
String output5State = "off";
String output4State = "off";
String output0State = "off";


const int output5 = 5; // Blue
const int output4 = 4; // Red
const int output0 = 3; //Green

//int buttstate = 0;
//int a = 0;
//-------------------------------------------------------Indicator Var
#define clk 13
#define Wr 14
#define Baton 16
#define clDelay 5
#define refrDelay 1000
#define sensButton 12

byte lastNum = 0;
byte num = 0; //250 for reset
byte ones = 0;
byte tens = 0;
byte disTensState = 0;
bool reg1[8];
bool reg2[8];
bool regUpdateFlag = false; 
bool tensFlag = false;
bool tensShowFlag = false;

//-------------------------------------------------End of Indicator Var

//-------------------------------------------------------------------------------------------------------------Indicator Custom Functions
bool checkNum() {
  bool updated = false;
  bState = digitalRead(Baton);

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
    else if (holdFlag == false) {
      holdBlock = true;
      num ++; //for press
      updated = true;
      //if(debug)Serial.println("Press");
      //if(debug)Serial.println(num);
    }
    else holdFlag = false;
  }
  return updated;
}

//
//void checkMode() {
//  bState = digitalRead(sensButton);
//
//  if (bState != flagMode && bState != bLastMode) {
//    trigTimeMode = millis();
//    bLastMode = bState;
//    flagBlockMode  = false;
//  }
//  if ((millis() - trigTimeMode) > bDelay && flagBlockMode == false) {
//    flagMode = !flagMode;
//    flagBlockMode = true;
//    if (flagMode == 1) {
//      holdBlockMode = false;
//      upTimeMode = millis();
//    }
//    else if (holdFlagMode == false) {
//      holdBlockMode = true;
//      workMode ++; //for press on a sens button
//    }
//    else holdFlagMode = false;
//  }
//  if ((millis() - upTimeMode) > hDelay && holdBlockMode == false) {
//    holdBlockMode = true;
//    flagBlockMode = true;
//    holdFlagMode = true;
//    tensFlag = false;
//    num = 0; //Annulate workmode
//  }
//}


void resetInd() {                     //Reset display
  byte r = 0;
  while (r < 8) {
    digitalWrite(Wr, LOW);
    digitalWrite(clk, HIGH);
    delay(clDelay);
    digitalWrite(clk, LOW);
    r++;
  }
}


void showNum() {

  if (!tensFlag) {
    if ((millis() - disLastTime) > refrDelay ) {
      //if(debug)Serial.println("Writing");
      disLastTime = millis();
      regUpdateFlag = false;
      resetInd();
      byte i = 0;
      while (i < 8) {
        digitalWrite(Wr, reg1[i]);
        digitalWrite(clk, HIGH);
        delay(clDelay);
        digitalWrite(clk, LOW);
        i++;
      }
    }
  }
  else {
    if (debug) Serial.println("TENSSS");
    if ((millis() - disLastTime) > (refrDelay * 3) && disTensState == 4) {
      //if(debug)Serial.println("Writing");
      disLastTime = millis();
      resetInd();
      disTensState = 1;
      byte i = 0;
      while (i < 8) {
        digitalWrite(Wr, reg1[i]);
        digitalWrite(clk, HIGH);
        delay(clDelay);
        digitalWrite(clk, LOW);
        i++;
      }
    }
    if ((millis() - disLastTime) > (refrDelay * 2) && disTensState == 1) {
      //if(debug)Serial.println("Writing");
      disLastTime = millis();
      resetInd();
      disTensState = 2;
    }
    if ((millis() - disLastTime) > refrDelay && disTensState == 2) {
      disTensState = 3;
      disLastTime = millis();
      resetInd();
      byte i = 0;
      while (i < 8) {
        digitalWrite(Wr, reg2[i]);
        digitalWrite(clk, HIGH);
        delay(clDelay);
        digitalWrite(clk, LOW);
        i++;
      }
    }
    if ((millis() - disLastTime) > (refrDelay * 2) && disTensState == 3) {
      //if(debug)Serial.println("Writing");
      disLastTime = millis();
      resetInd();
      disTensState = 4;
    }

  }
}
/*   111
    2   3
    2   3
    2   3
     444
    5   6
    5   6
    5   6
     777
*/






void updateIndRegState(byte digit) {

  regUpdateFlag = true;
  switch (digit) {
    case 0:
      reg1[1] = 1;
      reg1[2] = 1;
      reg1[3] = 1;
      reg1[4] = 0;
      reg1[5] = 1;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 1:
      reg1[1] = 0;
      reg1[2] = 0;
      reg1[3] = 1;
      reg1[4] = 0;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 0;
      break;
    case 2:
      reg1[1] = 1;
      reg1[2] = 0;
      reg1[3] = 1;
      reg1[4] = 1;
      reg1[5] = 1;
      reg1[6] = 0;
      reg1[7] = 1;
      break;
    case 3:
      reg1[1] = 1;
      reg1[2] = 0;
      reg1[3] = 1;
      reg1[4] = 1;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 4:
      reg1[1] = 0;
      reg1[2] = 1;
      reg1[3] = 1;
      reg1[4] = 1;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 0;
      break;
    case 5:
      reg1[1] = 1;
      reg1[2] = 1;
      reg1[3] = 0;
      reg1[4] = 1;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 6:
      reg1[1] = 1;
      reg1[2] = 1;
      reg1[3] = 0;
      reg1[4] = 1;
      reg1[5] = 1;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 7:
      reg1[1] = 1;
      reg1[2] = 0;
      reg1[3] = 1;
      reg1[4] = 0;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 0;
      break;
    case 8:
      reg1[1] = 1;
      reg1[2] = 1;
      reg1[3] = 1;
      reg1[4] = 1;
      reg1[5] = 1;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 9:
      reg1[1] = 1;
      reg1[2] = 1;
      reg1[3] = 1;
      reg1[4] = 1;
      reg1[5] = 0;
      reg1[6] = 1;
      reg1[7] = 1;
      break;
    case 250:
      reg1[1] = 0;
      reg1[2] = 0;
      reg1[3] = 0;
      reg1[4] = 0;
      reg1[5] = 0;
      reg1[6] = 0;
      reg1[7] = 0;
      break;
  }
}
//--------------------------------------------------------------------------------End Of Indicator Custom Functions

//-----------------------------------------------------------------------------Setup
void receiverSetup() {
  delay(0);
  buttonSetup();
  pinMode(sensButton, INPUT);
  
  pinMode(clk, OUTPUT);
  pinMode(Wr, OUTPUT);
  pinMode(Baton, INPUT);
  if (debug) Serial.begin(9600);
  digitalWrite(clk, LOW);
  resetInd();
  updateIndRegState(num);
}

bool checkReceiverMode() {
  bool updated = false;
  bState = digitalRead(sensButton);

  if (bState != flagMode && bState != bLastMode) {
    trigTimeMode = millis();
    bLastMode = bState;
    flagBlockMode  = false;
  }
  if ((millis() - trigTimeMode) > bDelay && flagBlockMode == false) {
    flagMode = !flagMode;
    flagBlockMode = true;
    if (flagMode == 1) {
      holdBlockMode = false;
      upTimeMode = millis();
    }
    else if (holdFlagMode == false) {
      holdBlockMode = true;
      workMode ++; //for press on a sens button
      updateColorsButton();
      updated = true;
    }
    else holdFlagMode = false;
  }
  if ((millis() - upTimeMode) > hDelay && holdBlockMode == false) {
    holdBlockMode = true;
    flagBlockMode = true;
    holdFlagMode = true;
    tensFlag = false;
    num = 0; //Annulate workmode
    updated = true;
  }

  return updated;
}

bool receiverLoop() {
  bool updated = checkReceiverMode();
  if (debug == 1) telemetryOut();
  
  //Start Voltage check******************************************
  #define vCheckDelayFlag 50
  if (cells != 0) {
    V = analogRead(A0) - corrector;
    if (cells == 3 && V <= 506) {
      delay(vCheckDelayFlag);
      V = analogRead(A0) - corrector;
      if (V <= 506)offFlag = 1;
    }
    if (cells == 4 && V <= 676) {
      delay(vCheckDelayFlag);
      V = analogRead(A0) - corrector;
      if (V <= 676)offFlag = 1;
      offFlag = 1;
    }
  }

  if (offFlag == 1) {
    for (a; a < cells; a++) {
      cellOffAnim(a);
      updateIndRegState(250);
      showNum();
    }
  }



  //------------------------------------------------------------------------------------------------------------Indicator Loop Code
  updated = updated + checkNum();
  if (num != lastNum) {
    if (num <= 9) {
      updateIndRegState(num);
      lastNum = num;
      if (offFlag != 1)tensFlag = false;
    }
    else if (num <= 99) {
      lastNum = num;
      tensFlag = true;
      disTensState = 4;
      tens = num / 10;
      ones = num - tens * 10;
      updateIndRegState(ones);
      memcpy( reg2, reg1, sizeof(reg1) ); //reg2 now contais ones *5 from 15 ex*
      updateIndRegState(tens);            //reg1 now contains tens *1 from 15 ex*
      showNum();
    }
  }

  if (regUpdateFlag) showNum();
  if (tensFlag) showNum();
  //-----------------------------------------------------------------------------------------------------------End Of Indicator Loop Code

  return updated;
}

#endif
