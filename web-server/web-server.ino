#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiAP.h>
#include <stdio.h>
#include <stdlib.h>
#include "ESPAsyncWebServer.h"
#include "./page.c"

#define LED_BUILTIN 2   // Set the GPIO pin where you connected your test LED or comment this line out if your dev board has a built-in LED
const int ledPin = 2;
const int freq = 5000;

const int servosCount = 3;
const int servoChannels[] = {2, 3, 4};
const int servoPins[] = {4, 16, 17};
const String parameterNames[] = {"servo1", "servo2", "servo3"};
const int servoFreq = 50;
const int servoResolution = 16;


// Set these to your desired credentials.
const char *ssid = "my-robotic-hand";
const char *password = "my-robotic-hand";

AsyncWebServer server(80);

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  int i;
  for (i = 0; i < servosCount; i++) {
    ledcSetup(servoChannels[i], servoFreq, servoResolution);
    ledcAttachPin(servoPins[i], servoChannels[i]);
  }

  Serial.begin(115200);
  Serial.println();
  Serial.println("Configuring access point...");

  // You can remove the password parameter if you want the AP to be open.
  WiFi.softAP(ssid, password);
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);

  server.on("/", HTTP_GET, handleRoot);
  server.on("/wheels", HTTP_GET, handleWheels);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println("Server started");
  digitalWrite(LED_BUILTIN, HIGH);
}
void handleRoot(AsyncWebServerRequest *request) {
  AsyncResponseStream *response = request->beginResponseStream("text/html");
  response->print(page1);
  response->print(page2);
  response->print(page3);
  request->send(response);
}

int getValue(String unParsedValue) {
  char charBuf[unParsedValue.length() + 1];
  unParsedValue.toCharArray(charBuf, unParsedValue.length()+1);
  return atoi(charBuf);
}

int getPwm(int angle) { // angle = [0..180]
  const float minAngle = 0;
  const float maxAngle = 180;

  const float minTime = 500; //ms
  const float maxTime = 2500; // ms
  const float microSecondsCount = 1000000;
  const float maxPwm = 65536;
  const float pwm = maxPwm * (minTime + (maxTime - minTime) * angle / (maxAngle - minAngle)) / microSecondsCount  * servoFreq;
  return (int)pwm;
}
void showMessages(AsyncWebServerRequest *request) {
  int params = request->params();
  String message = "";
  for (int i=0;i < params;i++) {
    AsyncWebParameter* p = request->getParam(i);
    message += "argName ";
    message += p->name().c_str();
    message += "; argValue ";
    message += p->value().c_str();
    Serial.println(message);
  }

}
void showDebugServoMessage(int pwm, String name) {
  // Serial.print(name);
  char debugMessage[50];
  snprintf(debugMessage, 30, "%s PWM: %d", name, (int)pwm);
  Serial.println(debugMessage);
}
void setServo(int angle, String name, int curChanel) {
  const int pwm = getPwm(angle);
  showDebugServoMessage(pwm, name);
  ledcWrite(curChanel, pwm);
}
void handleWheels(AsyncWebServerRequest *request) {
  unsigned long start = micros();
  showMessages(request);
  int i;
  for (i = 0; i < servosCount; i++) {
    if (request->hasParam(parameterNames[i])) {
      int value = getValue(request->getParam(parameterNames[i])->value());
      setServo(value, parameterNames[i], servoChannels[i]);
    }

  }
  request->send(200, "text/plain", "ok");
}

void handleNotFound(AsyncWebServerRequest *request) {
  request->send(404, "text/plain", "Not found");
}

void loop(void) {
}
