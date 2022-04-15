#ifndef COLORS_H
#define COLORS_H

#include "myLib.h";

bool isColor(String data) {
  if (data[0] != '#' || data.length() != 7)
    return false;
  
  for (int i = 1; i < 7; i++) {
    if ('0' <= data[i] && data[i] <= '9')
      continue;
    if ('a' <= data[i] && data[i] <= 'f')
      continue;
    return false;
  }
  return true;
}

struct Color {
  int red;
  int green;
  int blue;

  static Color fromString(String str) {
    if (!isColor(str))
      return Color {-1, -1, -1};
      
    int r = hexToDec(str[1]) * 16 + hexToDec(str[2]);
    int g = hexToDec(str[3]) * 16 + hexToDec(str[4]);
    int b = hexToDec(str[5]) * 16 + hexToDec(str[6]);
    return Color {r, g, b };
  }

  String toString() {
    return String("#" + decToHex(red) + decToHex(green) + decToHex(blue));
  }
};

#endif
