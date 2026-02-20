# Aarush's Lab Notebook


# 2026-02-17 – BOM Work Session
Joint work session to work on PCB, parts, and software evaluation. After a discussion with someone experienced with thin-film force sensors, I briefly evaluated capacitive force sensors before choosing to stick with FSRs for cost purposes. We decided to purchase trial FSRs of different ranges to determine which range yields the most accurate results, since the logarithmic nature of the resistance-force curve yields more accurate results at mid-to-high pressures within the rated range. These are some examples of the ranges available:

[Proposed Interlink Electronics FSR 402 - 0.2 - 20 N](https://files.seeedstudio.com/wiki/Grove-Round_Force_Sensor_FSR402/res/FSR402.pdf)
[Adafruit 0.3 - 10 N](https://www.adafruit.com/product/166?srsltid=AfmBOoqzUEIqx3sCnWpLPe5M8BWuqT9p1HTI4oQA6RdI9MUYgeoppe2CxJA)
[Adafruit 1 - 100 N](https://www.adafruit.com/product/5475)

# 2026-02-19 – PCB Work Session
Joint mini work session with Matthew. Decided on sensor ranges for testing. Also discussed how we'll collaborate on KiCAD and took a look at the hard PCB. 

I took a look at how to implement the female end of the FPC connector on the flexible insole PCB ("flex PCB"). These links are helpful:

[FPC Instructables](https://www.instructables.com/Design-Order-Customized-FPC-Cable-Using-KiCAD/)
[General flexible PCB design](https://www.youtube.com/watch?v=gIRUQSaB3e0)

I will try to design a male 20-pin width FPC on the flex PCB at first based on these (and other) resources. If this doesn't work I'll just add a female connector to a tongue with all 17 traces and then use a male-to-male extension cable to couple the flex PCB to the hard PCB.