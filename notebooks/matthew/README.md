# Matthew's Lab Notebook


## 2/17/26 – BOM Work Session
Joint work session to work on PCB, parts, and software evaluation. Started the schematic and looked into the BOM of the PCB. I wanted to focus on the MCU and and power delivery since that is the most integral part of the PCB. Figure out what battery to use
as well as converters. 

[Boost Converter](https://www.analog.com/media/en/technical-documentation/data-sheets/3525fc.pdf)
[Coin Battery](https://www.amazon.com/Amazon-Basics-CR2032-Compatible-Mercury-Free/dp/B0787K2XWZ?crid=1RGLYJASTWL0S&dib=eyJ2IjoiMSJ9.j91SHTfglVGyHdx10RX_UxAeZykKxFw8uNjl6snyKnCxYLngi0YGrliRfhqBVOYsz4IyOEaOc6JV7HSLB_w8pivh6c7DR_qKprivxw3tYQ0EuevY3qLoI2w6uKQ40LAsljBTMoTCXpDy6PZx2tG-O-SZ9Z9hNmkaP5VsvPjbGorHHbp5pDKIBlFim_5syncFJSEqNzgwWtMfoOgDwuHMeALJ4DFc8MqKWKLcTxKFi6IR5dU0ceWcaBJPoztbsLprecBbe0FKE4dvo__D9_V-QO3xCLAKXYVJsv6GaIZ5d0Y.MRDf9hDKcVG-x1w4QcxoDyA-n1gOIUGUGnkPTURPi94&dib_tag=se&keywords=coin%2Bbattery&qid=1771314334&rdc=1&sprefix=coin%2Bbattery%2Caps%2C155&sr=8-6&th=1)
[Battery Holder](https://www.amazon.com/Coliao-cr2032-Battery-Holder-CR2032/dp/B09QKRZBHC?crid=2169Y3J7RXQGF&dib=eyJ2IjoiMSJ9.FAZfUVjx-amvVZQFDQayx5zcVRqMXdkMu9gwLqSxQCFP4dgWdpxU42qAlKjEEUPqDdH6ZEtzWKmGJEvqz-bZjRWUG0S65WF0tcw0vK6JoKI7f0tFESlYU4zzcrsLKuKuh9NnFB6OWk6O3xqeRg76ICAbFI27U1ONMGMbtyc87YmcjzOhYXl1seBlpLw8tWBxfSGua_-oKsSD79E07iCdFt20gSaqlMF0_d5l2QU41as.SjAosMGBA-nyzxT9H95i1UPEx6sPOlJ5-ieFZG4U9bA&dib_tag=se&keywords=cr2032%2Bbattery%2Bholder%2Bsmd&qid=1771319125&sprefix=%E2%80%9CCR2032%2BSMD%2Bholder%2Caps%2C155&sr=8-8&th=1)

## 2/19/26

After deliberating between LiPo cells and coin battery, we decided to go with LiPo cells. We saw that the estimated current draw for our system underload and heavy load when transmitting data will be better supported with LiPo cells. In addition, we could have an easier time dropping the 3.7V instead of the 3V coin battery. However that will involve using a BMS and now making the board rechargable. 
[Proposed LiPo Battery ](https://www.adafruit.com/product/4236)

In addition, I started on the schematic for the PCB. I started working on the sensors since we mainly have those figured out. We decided to go with an FPC cable connector since it is the smallest profile.

Schematic as of now:

<img width="800" alt="image" src="https://github.com/user-attachments/assets/71af821e-4d5b-4b3b-a1fc-914d6a594c22" />


## 2/20/26

I finished up the rest of the schematic. The power circuit is still a bit iffy. I decided to go with a power path switching/BMS IC instead of only a BMS IC. That is because I wanted to ensure that there would not be any back power somehow from the battery to the USB as well as the board being able to be powered by the USB. I also made a rough layout after I finished the schematic. 

Overall, I tried to keep most of the parts as generic as possible to keep the price down by using free parts given to us. In addition, I tried to add testpoints and make the circuits as simple as possible to make it easier to debug. 

High Lvl Schematic:

<img height="683"  alt="image" src="https://github.com/user-attachments/assets/0a7f7ab3-2991-4ed5-b923-a643c7a60b43" />

Rough Layout:

<img height="683" alt="image" src="https://github.com/user-attachments/assets/d3574280-8ad7-409a-9aa4-d68bac940c4d" />

## 2/26/26

We did a design marathon to finish up the layout for the PCB for the first round. There were a little bit of bugs that we found such as orientation of the connector
but other than that, it was pretty smooth sailing. 

Rev1 final design:

<img height="683" alt="image" src="https://github.com/user-attachments/assets/204cb265-5d8e-4339-8272-d555b42509e1" />


## 2/28/26

Worked on the components of the design doc that were assigned to me as well as looked over my parteners components. I gave feedback and did little changes here and there
to their respective sections.

## 3/4/26

Deciding wheter to not we should order for the second round but decided not to since our parts have not arrived yet. However, looked into more research regarding
the BMS and found there was a bug in the chip according to the datasheet. I forgot to add some passives mentioned in the datasheet.

[Datasheet]([https://www.adafruit.com/product/4236](https://www.ti.com/general/docs/suppproductinfo.tsp?distId=10&gotoUrl=https%3A%2F%2Fwww.ti.com%2Flit%2Fgpn%2Fbq24075
))

Helped start to plan out the parts needed and what we wanted to showcase regarding the breadboard demo. We decided on that we wanted to show BLE since it was one of the most
important aspects. In addition, since we did not have our flex sensors in yet, we decided to use potentiometers to show ADC functionality due to their dynamic nature.

## 3/10/26

Finished up the breadboard demo as well as showed the breadboard demo. Started on cleaning up the schematic for the version 2 of our PCB. Debugged the issues mentioned earlier 
in the engineering log as well as changed the connector size. We were able to receive our flex pcb and saw that our connector was too small for it. 

Breadboard Demo:

<img width="653" height="923" alt="image" src="https://github.com/user-attachments/assets/5b287c0e-bc94-4b45-86fd-367452fe34ff" />


## 3/12/26

Finished up the layout of the version 2 of the PCB. It is layout a little poorly due to the new size of the connector but functionality-wise should be a lot better compared
to version 1. In addition, we went into the lab to play around with the FPC sensors. We saw how resistivity changed and voltage when we hooked it up to a power supply. We are
thinking on using a more consistent weight so we are able to properly get measurements for certain values. 

Rev2 Layout

<img height="683" alt="image" src="https://github.com/user-attachments/assets/8ce373a2-b06a-4755-9b6e-8f92dcfbf812" />







