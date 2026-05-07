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
# 2026-02-27 - Design Document Work Session
Put finishing touches on design document with Matthew and Joseph.

# 2026-03-04 - Flex PCB Revision
Began designing real sensor flex PCB mount (R1 was a test). This was originally meant for R2 but I'll push it back to R3 since we have no idea how R1 turned out. 

So far, we've been thinking of designing a big flex PCB in the shape of an insole and slotting that into a shoe. However, due to size constraints, I'm thinking of stringing together PCBs like our R1 PCB and fitting that into a shoe.

I also want to check out if these expanded-range versions of the Interlink FSRs are worth looking into:

[UX 402](https://buyinterlinkelectronics.com/collections/x-ux-force-sensors/products/fsr-ux-402)

# 2026-03-08 - Breadboard Demo Work Session
Worked with Joseph today to implement a PWA. We have a basic website UI right now, but our end goal is an app. However, we can convert a website into an app based on web frameworks (running in a special browser session), a PWA, with a few little tweaks. Since I have experience with that, I helped get it working with Joseph today.

For future ref, the [manifest generator](https://progressier.com/pwa-manifest-generator).

# 2026-03-11 - Flex PCB R1 Test and R3 Design
Went in today to test the R1 flex PCB that recently came in. The custom footprint I made to mount the FSRs will do the job. However, the stiffener on the male connector tongue is too thick, and it won't couple into the female connector. However, there is no need to change the stiffener thickness. This is because we will be switching to a connector with 1 mm pitch instead of 0.5 mm, because this connector is also less wide than we expected (and as a result the mechanical hold is less than we expected). The 0.2 mm stiffener should work fine here.

[This](https://www.mouser.com/ProductDetail/Molex/52806-1810?qs=EeaHXY5iaaOqZZKhtrX24g%3D%3D&mgh=1&srsltid=AfmBOoq4thNLstaD8Ezmrxx9VSL35RedeaQ2lw32o8BHimK1WnXGM_Ajna0) is a potential connector that could work.

I also took the chance to design the flex PCB design mentioned in the entry from the 4th. This is below.

![[FlexV2.png]]

# 2026-03-22 - Post-Spring-Break Meeting

We decided to meet up after spring break and evaluate our progress, as well as make a roadmap for what we need to do to get this project done. This is what we came up with:

### Roadmap

**Thursday, March 26th** - Final round PCB orders

TODO before then:
- [ ] Complete hard PCB design
	- [ ] Test if first round works in general
		- [ ] Test FPC connection
		- [ ] Test if single-resistor MUXing works
		- [ ] Test BMS circuit
	- [ ] Complete new design/necessary modifications
		- [ ] Research oven-safe connectors
- [ ] Complete flex PCB design
	- [ ] Choose between full-piece and three-prong design
	- [ ] If full-piece design full board, if three-prong design connector hub based on measured sizes
- [ ] Make final parts order form
	- [ ] Finalize FSR range

Software Side: 
- [ ] Complete UI for Web App
	- [ ] Display Sensor Readings
	- [ ] Animated Sensor Map 
	- [ ] Foot Heat Map Generation After Session
	- [ ] Step Counter
	- [ ] Cadence Calculator
- [ ] Write FSR driver code
- [ ] Write IMU driver code


**Wednesday, April 1st** - Individual progress report

# 2026-03-25 - Final Round Flex PCB Design
I generated a quote for a full insole PCB. Unfortunately, if we were to buy it ourselves, it would cost $50:
![[InsoleFlexQuote.png]]

As such, I've designed two flex PCBs. The first is a shorter version of the flex PCB design from R3. I've also angled the side pads sharper. This is after doing a crude AutoCAD sketch of the dimensions and fit within a shoe-sized rectangle:
![[CrudeAutoCAD.png]]
This is how it turned out:
![[ShortFlex.png]]

The second PCB is the bridge that connects the two to an output ribbon cable, called the FlexHub. This is how it turned out:
![[FlexHub.png]]
I also decided an additional extender FlexExt PCB that will allow for a sideways ribbon cable exit, as well as for some extra length within the insole if necessary:
![[FlexExt.png]]


I also tested the three sensor ranges we bought with R1 again (by standing on them) and decided to go with the FSR 402. We will buy shorts for the bottom, as seen in the AutoCAD drawing.

# 2026-04-03 - FSR Joint Test
Went in today to test some FSR solder joints on the designed footprints, as well as their durability. I tried to spread different amounts and see how durable they were. This is a still from the test timelapse of the most successful one (which turned out to be the one with the most solder):
![[JointTest.png]]

The technique I've found is to deposit some solder on one pad, then align the FSR tabs onto the uneven pads. Then, press down on the FSR pads with tweezers, and reflow the solder onto the FSR tab. Finally, solder the other tab on, pressing down on the tab with tweezers as you do so. This results in a nearly-flush mounting without applying too much heat to the FSR, which is what we want to avoid. 
# 2026-04-11 - Test R4 Flex PCB and FlexHub
The final round boards came in yesterday. I went in to check dimensions of the FlexHub and the ShortFlex, as well as to do some minimal soldering to check the coupling between the boards. This is what that turned out to be:
![[MinimalSolderHub.jpeg]]
The coupling seems to be plenty strong laterally. When we mount this onto an insole (I'm thinking of laminating it using cold-lamination sheets) it should firm up in the vertical direction too.

We also met as a group earlier today and decided that we need to redesign and buy a new hard PCB board due to some unfortunately-wrong pinouts. 

# 2026-04-16 - Design Enclosure for Hard PCB
Since I have previous CAD experience, I decided to design the final enclosure that will house our hard electronics. Matthew has previously asked AI to generate a design, and while I ultimately took some inspiration from that, I made my own from scratch:
![[PCBEnclosureV1.png]]
With lid:
![[EnclosureV1Lid.png]]

Key design choices:
- Tabs on the top short sides to easily align lid onto the base
- Battery compartment below PCB mounting plane
- Big holes to test alignment of the lid and of the PCB
- Holes for the ribbon cable and USB-C charging
- Thick design to test clearance
- Lid holes designed for M2.5 screws

# 2026-04-19 - Testing V1 Enclosure
Matthew and I sliced, printed, and tested the V1 enclosure I designed three days ago with a blank PCB. The lateral dimensions seem fine, but it is definitely too tall. Both the PCB section and the battery compartment have lots of extra room, and as it stands it will jut out of the show too much. The clearance for the battery cable, my main concern, ended up working, though. Here is how the blank fit within the enclosure:
![[EnclosureV1Test.png]]

# 2026-04-20 - Quick Mock Demo Session
Had a quick meeting today to get our demo straight for the Mock tomorrow. We don't have the system fully integrated yet due to the roadblocks we've faced in hard PCB and sensor shipping, so the next week will be busy.

# 2026-04-22 - Full Sensor Array PCB Assembly
I decided to go in today and get all the sensors soldered on for testing of the full sensor array, as well as all connectors in the FlexHub. This is how it turned out:
![[SensorArray.jpg]]
![[ArrayinShoe.jpg]]

A couple notes:
- The connectors are a little big unstable on the FlexHub with all the sensors in place. Might have to figure out a solution to this later but the lamination should fix it in place.
- I decided to switch to all shorts in the bottom ShortFlex. This is because I found that doing so and letting the array sit closed to the heel makes the FSRs on top better align with the balls of the feet.

While we have tested prototype/breadboard versions of the modules together in the past (before demos), we will attempt a final-version flat integration tomorrow.

# 2026-04-23 - First Final Form Integration
We all met up today to attempt a full-system integration:
![[FullInt1.png]]

As we did that, I found a problem with the FlexHub. Because a path between two female connectors is the same as a rotating a cable 180 degrees, the pinout leaving the FlexExt is reversed from the desired pinout. This is a problem because the 3V3 supply is going to the (unconnected) ground pin in the Flex PCBs. As a temporary fix, I attached a FlexExt to the end of the FPC cable with the female connector reversed. For a more permanent fix, I ordered FPC cables on Amazon that have pins exposed on opposite sides (one end on the top, the other on the bottom). This 'flips' the pinout order within the cable, serving the same purpose in a cleaner way.

# 2026-04-24 - CAD Session
Today, I finished the V2 (and V3) designs of the enclosure. This is V2:
![[EnclosureV2.png]]
This was made significantly thinner than before. Additionally, the holes are now threaded for M2.5 screws. The lid stayed the same. Additionally, a hole is included through the battery compartment to attach a clip (which will clip onto the shoe). I also designed that clip:
![[Clip.png]]

When printed, however, 3D-printed M2.5 screws would not thread through the printed holes. Because of this, I quickly CAD-ed two alternate designs. The first has snap-fit joints, in case we can't get screws working:
![[EnclosureV3Snap.png]]

The second has holes meant to slide brass M2.5 heat inserts into (which we bought on Amazon):
![[EnclosureV3Heat.png]]

We will print these two and test (given that the inserts come in time).

# 2026-04-25 - Packaging Joint Session
Today we met up and worked on packaging details. Notably, I laminated the insole flexes onto the foam insole of Joseph's shoe:
![[Lamination.png]]

All sensors seem to work with the lamination intact. 

# 2026-04-26 - New Enclosure Test
We managed to print the new designs and test. The snap-fits worked better than expected, but would break on removal. We decided to set one aside as an extra. 

Update: the heat inserts came, so I inserted them into the corresponding design and tested. This works extremely well:
![[HeatInsert.jpg]]

I tested the clip and enclosure on my own shoe, and the design does not seem to need much modification. The clip holds with no movement after mounting it onto the enclosure by slipping a nut through the middle ot the clip. I will modify if Joseph's tests show that it's necessary, though.
![[OnShoe.jpg]]
![[OnShoeSide.jpg]]

# 2026-04-28 - Testing Session
We got together to practice our demo, work on our presentation, and compile our testing data into graphs for the presentation/report. To this end, I took data on the distribution of sensor differences between consecutive samples. Me and Joseph pulsed the sensors rapidly over 15 seconds to take this data. I then displayed the distribution as a Pareto graph:
![[SensorPareto.png]]

I also took data of the mean and variance of the sensors under a standardized, equivalent load (my phone balanced onto a button cell battery on each sensor):
![[LoadTests.png]]

After this, we practiced for the demo. The project is done and seems to work!
![[FullProject.jpg]]
