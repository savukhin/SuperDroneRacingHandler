#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "animations.h"
#include "button_actions.h"
#include "receiver.h"
#include "global_variables.h"

enum FacilityType {
  GATE = 'g',
  FLAG = 'f',
  MARKER = 'm',
  RECEIVER = 'r',
  MAT = 't'
};

FacilityType facilityType = FacilityType::RECEIVER;
//FacilityType facilityType = FacilityType::FLAG;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String getFinalColor() {
  return String("#" + decToHex(redCount) + decToHex(greenCount) + decToHex(blueCount));
}

String getAnswer() {
  String answer = getFinalColor();
  if (facilityType == FacilityType::RECEIVER)
    answer += "-" + String(num);
  return answer;
}

void notifyClients() {
  //ws.textAll(String("#" + decToHex(redCount) + decToHex(greenCount) + decToHex(blueCount)));
//  String answer = getFinalColor();
//   if (facilityType == FacilityType::RECEIVER)
//    answer += "-" + String(num);
  ws.textAll(getAnswer());
}

bool isColor(uint8_t *data, int len) {
  if (data[0] != '#' || len != 7) {
    return false;
  }
  for (int i = 1; i < 7; i++) {
    if ('0' <= data[i] && data[i] <= '9')
      continue;
    if ('a' <= data[i] && data[i] <= 'f')
      continue;
    return false;
  }
  return true;
}

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

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT && !blinking) {
    data[len] = 0;

    int blink = isBlink(data, len);
    if (blink != -1 ) {
      startBlinking(blink, 1);
      
      return;
   }

   if (facilityType == FacilityType::RECEIVER && strcmp((char*)data, "reset") == 0) {
      num = 0;
      notifyClients();
      return;
    }

    if (!isColor(data, len)) {
      return;
    }
    

    redCount = hexToDec(data[1]) * 16 + hexToDec(data[2]);
    greenCount = hexToDec(data[3]) * 16 + hexToDec(data[4]);
    blueCount = hexToDec(data[5]) * 16 + hexToDec(data[6]); 
    notifyClients();
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len) {
    switch (type) {
      case WS_EVT_CONNECT:
        break;
      case WS_EVT_DISCONNECT:
        break;
      case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
      case WS_EVT_PONG:
      case WS_EVT_ERROR:
        break;
  }
}

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}

void setup(){
  pinMode(outputRed, OUTPUT);
  pinMode(outputGreen, OUTPUT);
  pinMode(outputBlue, OUTPUT);
//  checkMode();

  //pinMode(A0, INPUT);
  
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }

  // Print ESP Local IP Address

  initWebSocket();
 
  server.on("/DOYOUGATE", HTTP_GET, [](AsyncWebServerRequest *request){
//    request->send(200, "text/html", String(char(facilityType)) + getFinalColor());
    request->send(200, "text/html", String(char(facilityType)) + getAnswer());
  });
  
  server.on("/STATE", HTTP_GET, [](AsyncWebServerRequest *request){
//    request->send(200, "text/html", getFinalColor());
    request->send(200, "text/html", getAnswer());
  });

  // Start server
  server.begin();

  if (facilityType == FacilityType::RECEIVER) {
    receiverSetup();
  } else {
    buttonSetup();
  }

  startBlinking(5, 3);
}

void loop() {
  bool updated = false;
  if (facilityType == FacilityType::RECEIVER) {
    updated = receiverLoop();
  } else {
    updated = buttonLoop();
  }
  if (updated)
    notifyClients();
  if (offFlag != 1)
    checkMode();
      
  ws.cleanupClients();
}

void checkMode(){
  if (blinking) {
    float count = blinkFunctionColor();
    //ws.textAll(String("blinking with count " + String(count) + " And millis() " + String(millis()) + " End time is " + String(animationEndTime) + " Speed is" + String(animationSpeed) + " Start time = " + String(startAnimationTime)));
    analogWrite(outputRed, count);
    analogWrite(outputGreen, count);
    analogWrite(outputBlue, count);
  } else {
    analogWrite(outputRed, redCount);
    analogWrite(outputGreen, greenCount);
    analogWrite(outputBlue, blueCount);
  }
  checkAnimationEnd();
}
 
