#ifndef ANIMATIONS_H
#define ANIMATIONS_H

#include "myLib.h"
#include "colors.h"
#include "queries.h"

bool blinking = false;
//int redBlinking = 0;
//int blueBlinking = 0;
//int greenBlinking = 0;
Color blinkingColor = { 0, 0, 0 };
float startAnimationTime = -1;
float animationSpeed = 1;
float animationEndTime = -1;

float blinkFunctionColor() {
  float x = (millis() - startAnimationTime) / 1000; // in seconds
  x *= PI;
  x *= animationSpeed;
  return sin(abs(cos((float)x))*abs((float)x)/(float)x);
}

void startBlinking(float count, float speed=1, Color color = Color { 255, 255, 255 }) {
  blinking = true;
  startAnimationTime = millis();
  animationSpeed = speed;
  animationEndTime = startAnimationTime + count * 1000 / speed;
  blinkingColor = color;
}

void checkAnimationEnd() {
  if (millis() > animationEndTime) {
    blinking = false;
  }
}

#endif
