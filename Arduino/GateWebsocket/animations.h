#ifndef ANIMATIONS_H
#define ANIMATIONS_H

bool blinking = false;
int redBlinking = 0;
int blueBlinking = 0;
int greenBlinking = 0;
float startAnimationTime = -1;
float animationSpeed = 1;
float animationEndTime = -1;

bool isInt(uint8_t data) {
  return '0' <= data && data <= '9';
}

int isBlink(uint8_t *data, int len) {
  if (len < 7)
    return -1;
  char check[] = "blink-";
  for (int i = 0; i < 6; i++) {
    if (data[i] != check[i])
      return -1;
  }
  int result = 0;
  for (int i = 6; i < len; i++) {
    if (!isInt(data[i]))
      return -1;
    result = result * 10 + (data[i] - '0');
  }
  return result;
}

float blinkFunctionColor() {
  float x = (millis() - startAnimationTime) / 1000; // in seconds
  x *= PI;
  x *= animationSpeed;
  return sin(abs(cos((float)x))*abs((float)x)/(float)x);
}

void startBlinking(float count, float speed=1, int red=255, int green=255, int blue=255) {
  blinking = true;
  startAnimationTime = millis();
  animationSpeed = speed;
  animationEndTime = startAnimationTime + count * 1000 / speed;
  redBlinking = red;
  greenBlinking = green;
  blueBlinking = blue;
}

void checkAnimationEnd() {
  if (millis() > animationEndTime) {
    blinking = false;
  }
}

#endif
