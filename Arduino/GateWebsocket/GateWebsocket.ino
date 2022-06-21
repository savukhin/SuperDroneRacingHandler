#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include "animations.h"
#include "global_variables.h"
#include "button_actions.h"
#include "receiver.h"
//#include "global_variables.h"

enum FacilityType {
  GATE = 'g',
  FLAG = 'f',
  MARKER = 'm',
  RECEIVER = 'r',
  MAT = 't'
};

//FacilityType facilityType = FacilityType::RECEIVER;
//FacilityType facilityType = FacilityType::FLAG;
//FacilityType facilityType = FacilityType::MAT;
//FacilityType facilityType = FacilityType::GATE;
FacilityType facilityType = FacilityType::MARKER;

bool connected = false;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String getFinalColor() {
  return globalColor.toString();
}

String getAnswer() {
  String answer = getFinalColor();
  if (facilityType == FacilityType::RECEIVER)
    answer += "-" + String(num);
  return answer;
}

void notifyClients() {
  ws.textAll(getAnswer());
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    String str = toString(data, len);

    auto blink = isBlink(str);
    if (blink.valid) {
      startBlinking(blink.count, blink.getSpeed(), blink.color, blink.endless);
      return;
    }

    if (facilityType == FacilityType::RECEIVER && strcmp((char*)data, "reset") == 0) {
      num = 0;
      notifyClients();
      return;
    }

    if (str == String("stopAnimation")) {
      blinking = false;
      return;
    }

    if (!isColor(str)) {
      return;
    }

    globalColor = Color::fromString(str);
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

void setup() {
  pinMode(outputRed, OUTPUT);
  pinMode(outputGreen, OUTPUT);
  pinMode(outputBlue, OUTPUT);

  Serial.begin(9600);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);

  if (facilityType == FacilityType::RECEIVER) {
    receiverSetup();
  } else {
    buttonSetup();
//receiverSetup();
  }
}

bool tryConnect() {
  if (WiFi.status() != WL_CONNECTED)
    return false;

  connected = true;
  initWebSocket();

  server.on("/DOYOUGATE", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/html", String(char(facilityType)) + getAnswer());
  });

  server.on("/STATE", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(200, "text/html", getAnswer());
  });

  // Start server
  server.begin();

  startBlinking(5, 5, Color { 0, 255, 0 } );

  return true;
}

void loop() {
  if (!connected && offFlag != 1)
    tryConnect();

  bool updated = false;
  if (facilityType == FacilityType::RECEIVER) {
    updated = receiverLoop();
  } else {
//    updated = receiverLoop();
    updated = buttonLoop();
  }

  if (updated && connected)
    notifyClients();
  if (offFlag != 1)
    checkMode();
  if (connected) {
    ws.cleanupClients();
  }
}

void checkMode() {
  if (blinking) {
    float count = blinkFunctionColor();
    analogWrite(outputRed, blinkingColor.red * count);
    analogWrite(outputGreen, blinkingColor.green * count);
    analogWrite(outputBlue, blinkingColor.blue * count);
  } else {
    analogWrite(outputRed, globalColor.red);
    analogWrite(outputGreen, globalColor.green);
    analogWrite(outputBlue, globalColor.blue);
  }
  checkAnimationEnd();
}

