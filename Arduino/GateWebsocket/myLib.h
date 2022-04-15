#ifndef MYLIB_H
#define MYLIB_H

int hexToDec(uint8_t data) {
  if ('0' <= data && data <= '9')
    return data - '0';
  if ('a' <= data && data <= 'f')
    return data - 'a' + 10;
  return -1;
}

String decToHex(int number) {
  if (number < 0 || number > 255)
    return "00";
  int a = number / 16;
  int b = number % 16;
  String answer = "ab";
  if (a < 10)
    answer[0] = '0' + a;
  else
    answer[0] = 'a' + a - 10;

  if (b < 10)
    answer[1] = '0' + b;
  else
    answer[1] = 'a' + b - 10;

  return answer;
}

String toString(uint8_t *data, int len) {
  String result = String("");
  for (int i = 0; i < len; i++) {
    char val = data[i];
    result += val;
  }
  return result;
}

String toString(char *data) {
  int len = strlen(data);
  String result = String("");
  for (int i = 0; i < len; i++)
    result.concat(data[i]);
  return result;
}

bool isInt(uint8_t data) {
  return '0' <= data && data <= '9';
}

bool isInt(String str) {
  for (int i = 0; i < str.length(); i++) {
    if (str[i] < '0' || str[i] > '9')
      return false;
  }
  return true;
}

int toInt(String str) {
  if (!isInt(str))
    return 2;
    
  int result = 0;
  
  for (int i = 0; i < str.length(); i++) {
    result = result * 10 + (str[i] - '0');
  }
  return result;
}

#endif
