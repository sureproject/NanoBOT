
// Update 06/08/2014 : Add alias number of digital pin to servo

	#include <Arduino.h>
	#include <inttypes.h>

	//#include "ipst_SoftwareServo.h"

	#define SERVO_B0 2
	#define SERVO_B1 10
	#define SERVO_B2 11
	#define SERVO_B3 12
	#define SERVO_B4 13

	#define SERVO_D15 2
	#define SERVO_D14 10
	#define SERVO_D13 11
	#define SERVO_D12 12

	#define __IPSTservo16 2
	#define __IPSTservo17 10
	#define __IPSTservo18 11
	#define __IPSTservo19 12
	#define __IPSTservo20 13

	class ipst_SoftwareServo
	{
	  private:
		uint8_t pin;
		uint8_t angle;       // in degrees
		uint16_t pulse0;     // pulse width in TCNT0 counts
		uint8_t min16;       // minimum pulse, 16uS units  (default is 34)
		uint8_t max16;       // maximum pulse, 16uS units, 0-4ms range (default is 150)
		class ipst_SoftwareServo *next;
		static ipst_SoftwareServo* first;
	  public:
		ipst_SoftwareServo();
		uint8_t attach(int);     // attach to a pin, sets pinMode, returns 0 on failure, won't
								 // position the servo until a subsequent write() happens
		void detach();
		void write(int);         // specify the angle in degrees, 0 to 180
		uint8_t read();
		uint8_t attached();
		void setMinimumPulse(uint16_t);  // pulse length for 0 degrees in microseconds, 540uS default
		void setMaximumPulse(uint16_t);  // pulse length for 180 degrees in microseconds, 2400uS default
		static void refresh();    // must be called at least every 50ms or so to keep servo alive
								  // you can call more often, it won't happen more than once every 20ms
	};

	ipst_SoftwareServo *ipst_SoftwareServo::first;

	#define NO_ANGLE (0xff)

	ipst_SoftwareServo::ipst_SoftwareServo() : pin(0),angle(NO_ANGLE),pulse0(0),min16(34),max16(150),next(0)
	{}

	void ipst_SoftwareServo::setMinimumPulse(uint16_t t)
	{
		min16 = t/16;
	}

	void ipst_SoftwareServo::setMaximumPulse(uint16_t t)
	{
		max16 = t/16;
	}

	uint8_t ipst_SoftwareServo::attach(int pinArg)
	{
		pin = pinArg;
		angle = NO_ANGLE;
		pulse0 = 0;
		next = first;
		first = this;
		digitalWrite(pin,0);
		pinMode(pin,OUTPUT);
		return 1;
	}

	void ipst_SoftwareServo::detach()
	{
		for ( ipst_SoftwareServo **p = &first; *p != 0; p = &((*p)->next) ) {
		if ( *p == this) {
			*p = this->next;
			this->next = 0;
			return;
		}
		}
	}

	void ipst_SoftwareServo::write(int angleArg)
	{
		if ( angleArg < 0) angleArg = 0;
		if ( angleArg > 180) angleArg = 180;
		angle = angleArg;
		// bleh, have to use longs to prevent overflow, could be tricky if always a 16MHz clock, but not true
		// That 64L on the end is the TCNT0 prescaler, it will need to change if the clock's prescaler changes,
		// but then there will likely be an overflow problem, so it will have to be handled by a human.
		pulse0 = (min16*16L*clockCyclesPerMicrosecond() + (max16-min16)*(16L*clockCyclesPerMicrosecond())*angle/180L)/64L;
	}

	uint8_t ipst_SoftwareServo::read()
	{
		return angle;
	}

	uint8_t ipst_SoftwareServo::attached()
	{
		for ( ipst_SoftwareServo *p = first; p != 0; p = p->next ) {
		if ( p == this) return 1;
		}
		return 0;
	}

	void ipst_SoftwareServo::refresh()
	{
		uint8_t count = 0, i = 0;
		uint16_t base = 0;
		ipst_SoftwareServo *p;
		static unsigned long lastRefresh = 0;
		unsigned long m = millis();

		// if we haven't wrapped millis, and 15ms have not passed, then don't do anything
		if ( m >= lastRefresh && m < lastRefresh + 15) return;
		lastRefresh = m;

		for ( p = first; p != 0; p = p->next ) if ( p->pulse0) count++;
		if ( count == 0) return;

		// gather all the SoftwareServos in an array
		ipst_SoftwareServo *s[count];
		for ( p = first; p != 0; p = p->next ) if ( p->pulse0) s[i++] = p;

		// bubblesort the SoftwareServos by pulse time, ascending order
		for(;;) {
		uint8_t moved = 0;
		for ( i = 1; i < count; i++) {
			if ( s[i]->pulse0 < s[i-1]->pulse0) {
			ipst_SoftwareServo *t = s[i];
			s[i] = s[i-1];
			s[i-1] = t;
			moved = 1;
			}
		}
		if ( !moved) break;
		}

		// turn on all the pins
		// Note the timing error here... when you have many SoftwareServos going, the
		// ones at the front will get a pulse that is a few microseconds too long.
		// Figure about 4uS/SoftwareServo after them. This could be compensated, but I feel
		// it is within the margin of error of software SoftwareServos that could catch
		// an extra interrupt handler at any time.
		for ( i = 0; i < count; i++) digitalWrite( s[i]->pin, 1);

		uint8_t start = TCNT0;
		uint8_t now = start;
		uint8_t last = now;

		// Now wait for each pin's time in turn..
		for ( i = 0; i < count; i++) {
		uint16_t go = start + s[i]->pulse0;

		// loop until we reach or pass 'go' time
		for (;;) {
			now = TCNT0;
			if ( now < last) base += 256;
			last = now;

			if ( base+now > go) {
			digitalWrite( s[i]->pin,0);
			break;
			}
		}
		}
	}


	ipst_SoftwareServo servo0;
	ipst_SoftwareServo servo1;
	ipst_SoftwareServo servo2;
	ipst_SoftwareServo servo3;
	ipst_SoftwareServo servo4;

	void servoSleep(void)
	{
	  ipst_SoftwareServo::refresh();
	}

	void servoSleep(unsigned int time)
	{
	  int j;
	  j=time>>4;

	  ipst_SoftwareServo::refresh();
	  while (j-->0)
	  {
		delay(16);
		ipst_SoftwareServo::refresh();
	  }
	  delay((time&0x000f));
	}

	void servoRefresh()
	{
	  int i;
	  for (i=0;i<25;i++)
	  {
		delay(20);
		ipst_SoftwareServo::refresh();
	  }
	}
	

	void servo(uint8_t servo,uint8_t angle)
	{
	  if ((servo==2)||(servo==10))
	  {
		if (angle==-1)
		{
		  servo0.detach();
		}
		else
		{
		  if (!(servo0.attached()))
		  {
			servo0.attach(10);
			servo0.setMaximumPulse(2200);
		  }
		  servo0.write(angle);
		}
	  }

	  if ((servo==SERVO_B1)||(servo==SERVO_D14))
	  {
		if (angle==-1)
		{
		  servo1.detach();
		}
		else
		{
		  if (!(servo1.attached()))
		  {
			servo1.attach(__IPSTservo17);
			servo1.setMaximumPulse(2200);
		  }
		  servo1.write(angle);
		}
	  }

	  if ((servo==SERVO_B2)||(servo==SERVO_D13))
	  {
		if (angle==-1)
		{
		  servo2.detach();
		}
		else
		{
		  if (!(servo2.attached()))
		  {
			servo2.attach(__IPSTservo18);
			servo2.setMaximumPulse(2200);
		  }
		  servo2.write(angle);
		}
	  }

	  if ((servo==SERVO_B3)||(servo==SERVO_D12))
	  {
		if (angle==-1)
		{
		  servo3.detach();
		}
		else
		{
		  if (!(servo3.attached()))
		  {
			servo3.attach(__IPSTservo19);
			servo3.setMaximumPulse(2200);
		  }
		  servo3.write(angle);
		}
	  }

	  if (servo==SERVO_B4)
	  {
		if (angle==-1)
		{
		  servo4.detach();
		}
		else
		{
		  if (!(servo4.attached()))
		  {
			servo4.attach(__IPSTservo20);
			servo4.setMaximumPulse(2200);
		  }
		  servo4.write(angle);
		}
	  }
	}

