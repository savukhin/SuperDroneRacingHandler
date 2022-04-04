#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

#define corrector 10
#define delayCorrection 300
#define debug false  //true for debug
#define CapLoss 20
#define bDelay 50
#define hDelay 2500
#define baton 12
#define outputRed 4
#define outputGreen 3
#define outputBlue 5


// Replace with your network credentials
const char* ssid = "HonorView10";
const char* password = "saveliythebest";

int V = 0;
int cells = 0;
bool offFlag = 0;

int redCount = 0;
int blueCount = 0;
int greenCount = 0;


// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

void notifyClients() {
  ws.textAll(String("#" + decToHex(redCount) + decToHex(greenCount) + decToHex(blueCount)));
}

bool isColor(uint8_t *data) {
  if (data[0] != '#') {
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
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;

    if (!isColor(data)) {
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
  checkMode();

  //pinMode(A0, INPUT);
  
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
  }

  // Print ESP Local IP Address

  initWebSocket();
 
  server.on("/DOYOUGATE", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/html", "YES");
  });

  // Start server
  server.begin();
}

void loop() {
  if (offFlag != 1)
    checkMode();
      
  ws.cleanupClients();
}

void checkMode(){
  analogWrite(outputRed, redCount);
  analogWrite(outputGreen, greenCount);
  analogWrite(outputBlue, blueCount);
}
 