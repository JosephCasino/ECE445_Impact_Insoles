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
<img width="1713" height="883" alt="image" src="https://github.com/user-attachments/assets/71af821e-4d5b-4b3b-a1fc-914d6a594c22" />


## 2/20/26

I finished up the rest of the schematic. The power circuit is still a bit iffy. I decided to go with a power path switching/BMS IC instead of only a BMS IC. That is because I wanted to ensure that there would not be any back power somehow from the battery to the USB as well as the board being able to be powered by the USB. I also made a rough layout after I finished the schematic. 

Overall, I tried to keep most of the parts as generic as possible to keep the price down by using free parts given to us. In addition, I tried to add testpoints and make the circuits as simple as possible to make it easier to debug. 

High Lvl Schematic:
<img width="947" height="481" alt="image" src="https://github.com/user-attachments/assets/0a7f7ab3-2991-4ed5-b923-a643c7a60b43" />
Rough Layout:
<img width="646" height="635" alt="image" src="https://github.com/user-attachments/assets/d3574280-8ad7-409a-9aa4-d68bac940c4d" />






