#include <Arduino.h>
#include <Wire.h>  
#include <SPI.h>

#include "Servo.h"
#include "Adafruit_GFX.h"
#include "Adafruit_SSD1306.h"

// Motor drive TB6612FNG config pin
#define AIN1 5
#define AIN2 4
#define BIN1 7
#define BIN2 8
#define PWMA 3
#define PWMB 9

#define _BZ 6

#include "nano_motor.h"

Adafruit_SSD1306 display(128, 64);

typedef int Number;
typedef int Boolean;


#define _servo1 0
#define _servo2 1
#define _servo3 2
#define _servo4 10

#define _servo5 11
#define _servo6 12

#include "nano_servo.h"

#define _knob A7
#define _BT 13

/*
#define _A0 22	// 0
#define _A1 23	// 1
#define _A2 24	// 2
#define _A3 25	// 3
*/

void wait();
void beep();

void NanoBOT(){
	display.begin(SSD1306_SWITCHCAPVCC, 0x3C); 
	
	display.clearDisplay(); 
	display.display(); 
	
	display.setTextColor(WHITE, BLACK); 
	display.setCursor(22, 10);
	display.setTextSize(2);
	display.println("NanoBOT");
	 
	display.setTextSize(1);
	display.setTextColor(BLACK, WHITE);
	display.setCursor(20, 30);
	display.print("www.itmaker.co");
	display.setTextColor(WHITE, BLACK);
	
	display.setCursor(30, 40); 
	display.setTextSize(2); 
	display.println("Ready!");
	 	 
	display.display(); 
	delay(1000); //while(1);
	
	display.clearDisplay();
	display.setCursor(40, 24); 
	display.setTextSize(3); 
	display.println("GO!");
	display.display(); 
	delay(1000); 
	
	pinMode(AIN1, OUTPUT);
	pinMode(AIN2, OUTPUT);
	pinMode(BIN1, OUTPUT);
	pinMode(BIN2, OUTPUT);
	pinMode(PWMA, OUTPUT);
	pinMode(PWMB, OUTPUT);
	//pinMode(STBY, OUTPUT);
	//digitalWrite(STBY, 1);
	//beep();
}

void wait(){
	// Press for button press //
	display.clearDisplay();
	display.setTextColor(WHITE, BLACK); 
	display.setCursor(30, 10);
	display.setTextSize(2);
	display.println("Press!");
	display.setCursor(30, 30);
	display.println("Button");
	display.setTextSize(1);
	display.setCursor(30, 50);
	display.setTextColor(BLACK, WHITE);
	display.println("to continue.");
	display.setTextColor(WHITE, BLACK);
	display.display();
  
	int button = 0;
	do{
		button = digitalRead(_BT);
	}while(!button);
	// End - Press for button press //
}

void beep(){
  pinMode(_BZ,OUTPUT);
  digitalWrite(_BZ,HIGH);
  delay(200);
  digitalWrite(_BZ,LOW);
}