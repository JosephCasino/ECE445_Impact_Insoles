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

# 2026-02-22 – Flex PCB Research Session
Individual session to research flex PCB implementation. Read Interlink Electronics's [FSR Integration Guide](https://cdn.sparkfun.com/assets/e/3/b/3/8/force_sensing_resistor_guide.pdf), and found other resources for PCB design:

[FSR 402 Short](https://buyinterlinkelectronics.com/products/fsr-x-402-short)
[FPC End Generator](https://github.com/mikeWShef/Kicad_FPC_board_ends?tab=readme-ov-file)
[Stackup Reference](https://community.element14.com/products/pcbprototyping/b/pcb-blogs/posts/creating-a-flexible-pcb)
[PCBWay Spec](https://www.pcbway.com/pcb_prototype/Stack_up_for_FPC.html)

The plan for now is to design a simple test board to see if a conductive epoxy method for electrical connection will work, as well as to test the FPC connector design. 

# 2026-02-26 – Initial Flex PCB Design
Marathon session to design test flex PCB for order. All aspects planned on the 22nd were implemented. The script-generated FPC connectors did not stand up to DRC (custom rules and edge clearance issues), so some manual placement and footprint editing was necessary.

![[InitialFlexPCBLayout.png]]![[InitialFlexPCBSchematic.png]]

