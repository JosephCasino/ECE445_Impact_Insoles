# Matthew's Lab Notebook


## 2/17/26 – BOM Work Session
Objective: Joint work session to work on PCB, parts, and software evaluation.
Joint work session to work on PCB, parts, and software evaluation. Started the schematic and looked into the BOM of the PCB. I wanted to focus on the MCU and and power delivery since that is the most integral part of the PCB. Figure out what battery to use
as well as converters. 

[Boost Converter](https://www.analog.com/media/en/technical-documentation/data-sheets/3525fc.pdf)
[Coin Battery](https://www.amazon.com/Amazon-Basics-CR2032-Compatible-Mercury-Free/dp/B0787K2XWZ?crid=1RGLYJASTWL0S&dib=eyJ2IjoiMSJ9.j91SHTfglVGyHdx10RX_UxAeZykKxFw8uNjl6snyKnCxYLngi0YGrliRfhqBVOYsz4IyOEaOc6JV7HSLB_w8pivh6c7DR_qKprivxw3tYQ0EuevY3qLoI2w6uKQ40LAsljBTMoTCXpDy6PZx2tG-O-SZ9Z9hNmkaP5VsvPjbGorHHbp5pDKIBlFim_5syncFJSEqNzgwWtMfoOgDwuHMeALJ4DFc8MqKWKLcTxKFi6IR5dU0ceWcaBJPoztbsLprecBbe0FKE4dvo__D9_V-QO3xCLAKXYVJsv6GaIZ5d0Y.MRDf9hDKcVG-x1w4QcxoDyA-n1gOIUGUGnkPTURPi94&dib_tag=se&keywords=coin%2Bbattery&qid=1771314334&rdc=1&sprefix=coin%2Bbattery%2Caps%2C155&sr=8-6&th=1)
[Battery Holder](https://www.amazon.com/Coliao-cr2032-Battery-Holder-CR2032/dp/B09QKRZBHC?crid=2169Y3J7RXQGF&dib=eyJ2IjoiMSJ9.FAZfUVjx-amvVZQFDQayx5zcVRqMXdkMu9gwLqSxQCFP4dgWdpxU42qAlKjEEUPqDdH6ZEtzWKmGJEvqz-bZjRWUG0S65WF0tcw0vK6JoKI7f0tFESlYU4zzcrsLKuKuh9NnFB6OWk6O3xqeRg76ICAbFI27U1ONMGMbtyc87YmcjzOhYXl1seBlpLw8tWBxfSGua_-oKsSD79E07iCdFt20gSaqlMF0_d5l2QU41as.SjAosMGBA-nyzxT9H95i1UPEx6sPOlJ5-ieFZG4U9bA&dib_tag=se&keywords=cr2032%2Bbattery%2Bholder%2Bsmd&qid=1771319125&sprefix=%E2%80%9CCR2032%2BSMD%2Bholder%2Caps%2C155&sr=8-8&th=1)

## 2/19/26
Objective: Finalize the power source selection and begin drafting the initial schematic for the sensor integration.
After deliberating between LiPo cells and coin battery, we decided to go with LiPo cells. We saw that the estimated current draw for our system underload and heavy load when transmitting data will be better supported with LiPo cells. In addition, we could have an easier time dropping the 3.7V instead of the 3V coin battery. However that will involve using a BMS and now making the board rechargable. 
[Proposed LiPo Battery ](https://www.adafruit.com/product/4236)

In addition, I started on the schematic for the PCB. I started working on the sensors since we mainly have those figured out. We decided to go with an FPC cable connector since it is the smallest profile.

Schematic as of now:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/71af821e-4d5b-4b3b-a1fc-914d6a594c22" />


## 2/20/26
Objective: Complete the PCB schematic, design the power/BMS circuit, and create a preliminary board layout.
I finished up the rest of the schematic. The power circuit is still a bit iffy. I decided to go with a power path switching/BMS IC instead of only a BMS IC. That is because I wanted to ensure that there would not be any back power somehow from the battery to the USB as well as the board being able to be powered by the USB. I also made a rough layout after I finished the schematic. 

Overall, I tried to keep most of the parts as generic as possible to keep the price down by using free parts given to us. In addition, I tried to add testpoints and make the circuits as simple as possible to make it easier to debug. 

High Lvl Schematic:

<img height="683"  alt="image" src="https://github.com/user-attachments/assets/0a7f7ab3-2991-4ed5-b923-a643c7a60b43" />

Rough Layout:

<img height="683" alt="image" src="https://github.com/user-attachments/assets/d3574280-8ad7-409a-9aa4-d68bac940c4d" />

## 2/26/26
Objective: Finalize the Rev 1 PCB layout and resolve any initial component placement bugs.
We did a design marathon to finish up the layout for the PCB for the first round. There were a little bit of bugs that we found such as orientation of the connector
but other than that, it was pretty smooth sailing. 

Rev1 final design:

<img height="683" alt="image" src="https://github.com/user-attachments/assets/204cb265-5d8e-4339-8272-d555b42509e1" />


## 2/28/26
Objective: Review, edit, and finalize assigned sections for the project design document.
Worked on the components of the design doc that were assigned to me as well as looked over my parteners components. I gave feedback and did little changes here and there
to their respective sections.

## 3/4/26
Objective: Research BMS datasheet requirements and plan the hardware to showcase BLE and ADC functionality for the breadboard demo.
Deciding wheter to not we should order for the second round but decided not to since our parts have not arrived yet. However, looked into more research regarding
the BMS and found there was a bug in the chip according to the datasheet. I forgot to add some passives mentioned in the datasheet.

[Datasheet](https://www.adafruit.com/product/4236](https://www.ti.com/general/docs/suppproductinfo.tsp?distId=10&gotoUrl=https%3A%2F%2Fwww.ti.com%2Flit%2Fgpn%2Fbq24075
)

Helped start to plan out the parts needed and what we wanted to showcase regarding the breadboard demo. We decided on that we wanted to show BLE since it was one of the most
important aspects. In addition, since we did not have our flex sensors in yet, we decided to use potentiometers to show ADC functionality due to their dynamic nature.

## 3/10/26
Objective: Execute the breadboard demo and begin schematic and connector revisions for Rev 2 of the PCB.
Finished up the breadboard demo as well as showed the breadboard demo. Started on cleaning up the schematic for the version 2 of our PCB. Debugged the issues mentioned earlier 
in the engineering log as well as changed the connector size. We were able to receive our flex pcb and saw that our connector was too small for it. 

Breadboard Demo:

<img width="653" height="923" alt="image" src="https://github.com/user-attachments/assets/5b287c0e-bc94-4b45-86fd-367452fe34ff" />


## 3/12/26
Objective: Finish the Rev 2 PCB layout and conduct lab testing to characterize the electrical properties of the FPC sensors.
Finished up the layout of the version 2 of the PCB. It is layout a little poorly due to the new size of the connector but functionality-wise should be a lot better compared
to version 1. In addition, we went into the lab to play around with the FPC sensors. We saw how resistivity changed and voltage when we hooked it up to a power supply. We are
thinking on using a more consistent weight so we are able to properly get measurements for certain values. 

Rev2 Layout

<img height="683" alt="image" src="https://github.com/user-attachments/assets/8ce373a2-b06a-4755-9b6e-8f92dcfbf812" />


## 3/22/26
Objective: Realign as a team post-spring break and establish a project roadmap for the final PCB iteration.
The time gap from the last notebook log to the current notebook log is due to spring break. We met up as a group today to create a roadmap before our final PCB. Our main concern is how we could not test the second round PCB which is important since we changed our connector. However, we know it is important to focus on what we currently can do.

Roadmap

<img  height="683" alt="image" src="https://github.com/user-attachments/assets/f404b276-fcc0-4588-816e-f0718deb00c1" />


## 3/23/26
Objective: Explore PCB reflow soldering techniques and draft a preliminary 3D CAD model for the device enclosure.
I went to the senior design room to use the oven, however, I realzied it might be a little bit more complicated than I thought. I used our current PCB and a plan I had in mind to create a rough CAD on our inclosure. This was generated using Claude so it is really rough, but is a good baseline on how I envision our enclosure to be. 

Rough CAD

<img   height="683"  alt="image" src="https://github.com/user-attachments/assets/6aa43289-be69-4f02-b282-0a092ca7e48d" />


## 3/24/26
Objective: Perform SMD reflow soldering on the BMS QFN package and verify battery charging and power delivery circuits.
I learned how to used the oven from Xiaodong so I was now able to solder the BMS QFN package. After putting the board in the oven and doing some basic rework, I tested the BMS operation. To test the operation of the BMS, I plugged in the USB-C and checked if the power LED was on. After ensuring the board was recieving 3V3 and the LED for power was on, I plugged in the battery. Therefore, I was able to see that the charging LED was on and probed the battery voltage intermittently. Through that, I was able to notice the battery voltage increasing. I also made sure the board was getting supplied 3V3 from the battery itself without the USB-C plugged in. 

BMS soldered onto the board

<img height="483"  alt="image" src="https://github.com/user-attachments/assets/79c19134-813f-4795-971c-7f5857db7d1a" />


## 3/25/26
Objective: Adjust the final PCB layout to include accurately sized mounting holes for enclosure integration.
I had a work session to make sure that our final PCB had mounting holes for our enclosure. I made sure that the holes were sized so it would not add too much to the dimensions of the PCB.

Final Rd PCB Layout

<img height="683" alt="image" src="https://github.com/user-attachments/assets/1d16d59d-221c-452c-a39c-1d58e999c1d7" />



## 4/2/26
Objective: Solder remaining core components (IMU, ESP32) and troubleshoot initial firmware flashing issues.
I finsihed soldering the remaing parts of the PCB including the IMU and ESP32. I started to try and program the ESP32 with Joseph but we ran into some problems that made the ESP32 unreachable. Currently, we have some theories such as the LDO not being able to supply enough current to the ESP32 at startup. The current behavior we have is that it is consistently connecting and disconnecting to the laptop. We solved that we were missing a pull-up resistor at enable, but there are still other unknown issues. 


This was one of the threads we looked online on how to debug our current issue. 
[Link](https://www.reddit.com/r/esp32/comments/ivtdzf/esp32_keeps_disconnecting_and_reconnecting_from/?share_id=mEda3ENu8LNhEc6iy4DJl&utm_name=androidcss)

## 4/3/26
Objective: Resolve ESP32 boot-mode errors to successfully flash firmware and diagnose IMU I2C addressing problems.
I continued debugging with Joseph on how to program the ESP32. We eventually found out that the issue was tha the ESP32 was constantly looking for firmware, but there was no firmware due to this being the first time flashing code onto it. Therefore the solution is to hold the BOOT -> EN -> Release EN -> Release BOOT to make the ESP32 enter boot mode. From there, we were able to properly program the ESP32. However, we ran into issues with correctly addressing the IMU from the ESP32. I found out in the datasheet, I incorrectly put the pull ups making the address of the IMU floating.

## 4/9 - 4/10/26
Objective: Assemble the latest PCB iteration, test flex sensor data acquisition, and document footprint mismatch bugs.
The next round of PCBs came in so I was able to test the new ADC and Op-Amp circuit alongside the flex PCB. I soldered the board and made sure I was able to program the ESP32 along side Joseph. After I made sure that was the case, I soldered a flex sensor to a flex PCB to test the fit. Since the fit work and Joseph wrote some basic firmware, I was able to test the PCB. However, we ran into issues regarding aquiring data from the sensor. After some probing and debugging, I realized the footprints I used did not match with the pinout that I used in the schematic. To ensure that we are able to extract data, I bypassed both the op-amp and the ADC to send the data straight from the mux to the onboard ADC. Joseph wrote firmware to confirm that the flex sensor data was being aquired by the ESP32.

One of the mismatched pinouts to footprint

<img width="391" height="329"  alt="image" src="https://github.com/user-attachments/assets/9364ada5-eaad-480e-b9e4-65c44bb5c92a" />

Flywire from mux to ESP32
<img width="391" height="429" alt="image" src="https://github.com/user-attachments/assets/383c01dd-fa37-48eb-9470-7c33950c81c5" />

## 4/11/26
Objective: Correct Op-Amp and ADC footprint mismatches in the design files for an emergency final PCB order.
Due to the issues seen from the footprint and the due date coming up, as a group we decided we needed to order our own boards from JLC. Today, I fixed the bugs seen previously by ensuring that our footprints matched the expected pin layout for our op-amp and ADC.

Notice the pin layout for these updated footprints
<img width="606" height="523" alt="image" src="https://github.com/user-attachments/assets/431a8598-0131-4914-bf1f-84884011f6da" />


## 4/19/26
Objective: Test fit the initial 3D printed enclosure and plan optimizations for footprint reduction and shoe attachment.
While waiting for our new PCB to come in, I worked along side Aarush to figure out how to properly size our enclosure. The picture below was the test fit for the first enclosure. Some points I wanted to improve on was the size to try and make it smaller,
finding a way to attach to the show, and having screws/heat inserts. However, the fit of the PCB on the enclosure and the lid did fit well.

<img width="387" height="330" alt="image" src="https://github.com/user-attachments/assets/17648006-84f9-4c06-b39a-aea8382b9ded" />


## 4/21/26
Objective: Receive, assemble, and conduct functional verification on the finalized JLC PCBs.
Joseph and I were waiting for the DHL truck to deliver our package. I had to ultimately chase down the DHL truck to get the new updated PCBs. I soldered them and did intial functionality testing to ensure that the board worked properly. What this entailed was 
makign sure the BMS behaved and that the ESP could be programed. In addition, we see now that the op-amp works and the ESP32 can communicate with the ADC. Therefore, we are now able to get sensor data from the connector.

<img width="248" height="304" alt="image" src="https://github.com/user-attachments/assets/afe6abd3-666f-4b60-b030-fae040599a7d" />

## 4/23/26
Objective: Perform full hardware/software integration testing across the entire sensor array and resolve final logic bugs.
The whole group met up today to do a full system integration with the full sensor array. The main bug we faced today was seeing that we accidently flipped the pins for connecting the flex PCB to the main PCB. Another bug we saw was how we were not properly
selecting the write mux address when selecting certain sensors. However, we were able to ultimately get the high level goal of our project to work. We plan on trying to find any more bugs before properly packaging this project for the final presentation.

<img width="807" height="230" alt="image" src="https://github.com/user-attachments/assets/4cd9fe88-8125-46c6-98a0-a0bac848978b" />

## 4/25/26
Objective: Finalize hardware packaging, install heat inserts, attach the sensor to the insole, and polish the companion software application.
Aarush lamanated the sensor to properly be attached to the insole. In addition, we test fitted the heat inserts which worked pretty well. Joseph cleaned up the app with some suggestions from the rest of the group. The product is working as intended with a little issues that could not be avoided.

<img width="401" height="819" alt="image" src="https://github.com/user-attachments/assets/12345b04-09cc-402a-95d7-b6abd52103c1" />

## 4/28/26
Objective: Prepare for the final demo presentation and perform a battery stress test to validate system longevity.
We worked on the presentation and how we should present our demo. I ensured that my subsystems were properly wokring by ensuring the BMS functionality. The screenshot below was the votlage at a resistor which proved the battery was charging at ~200mA. We also did a stress test to prove the battery could run for over an hour. Excited to get the presented and finished! Could not have done it without the rest of my group!

<img width="660" height="632" alt="image" src="https://github.com/user-attachments/assets/fda15de7-6299-42e1-858c-f8591728b877" />

