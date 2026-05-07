# JOSEPH'S NOTEBOOK

## 2/16/26

Started researching what stack to use for the app and BLE side. Looked at React Native with Expo and `react-native-ble-plx` but also came across the Web Bluetooth API — lets a Chromium browser connect directly to a BLE peripheral with no native app install needed. Single HTML/CSS/JS file hosted on GitHub Pages, no backend required. That's a much simpler deployment story so I'm leaning that direction.

High-level plan for the system flow:
- ESP32 advertises a custom GATT service
- Browser scans, finds "ImpactInsoles", connects
- Browser subscribes to a characteristic and receives notifications at ~100 Hz
- App decodes the byte array and updates the pressure display live

Set up the dev environment:
- Installed Node.js and Expo CLI (for the React Native path, still exploring)
- Created project directory "ImpactInsoles"
- Installed `react-native-ble-plx` and Expo Go on my phone
- Wrote a rough mock UI to visualize what the dashboard should look like


## 2/17/26

Joint work session with the team to go over the BOM and figure out MCU and power delivery. From the firmware side, the ESP32-WROOM-32 is the clear pick — built-in BLE, enough ADC channels, and the Arduino core has a solid BLE stack (`BLEDevice`, `BLEServer`, `BLECharacteristic`, `BLE2902`). Talked through the coin cell vs. LiPo tradeoff — LiPo wins for us since the ESP32 BLE radio can draw up to a few hundred mA during TX, which would kill a coin cell fast. Went with LiPo.

## 2/20/26

- Installed Arduino IDE 2.x
- Added Espressif's ESP32 Arduino core (v3.3.7) via the Boards Manager
- Verified the toolchain compiles a blank sketch targeting ESP32-WROOM-32

## 2/23/26

- Checked Matthew's schematic
- Worked on the design document — wrote the sections covering my two subsystems (microcontroller/BLE and data visualization)

## 2/25/26

- Finished up the design document
- Wrote out the verification plan for my subsystems: BLE packet loss test (≤5% requirement), ADC full-scale test with FSR, and a cadence accuracy test (±3 BPM)

## 2/26/26

Design marathon with the group to finalize the PCB layout for round 1 submission. Reviewed placement from a firmware perspective to make sure the SPI ADC and mux are on the right ESP32 SPI pins. Helped Matthew catch a connector orientation bug before we submitted.

<img height="683" alt="Rev1 PCB Layout" src="https://github.com/user-attachments/assets/204cb265-5d8e-4339-8272-d555b42509e1" />

## 2/28/26

Wrote the first working BLE firmware sketch. Set up the GATT service with custom UUIDs:
- Service UUID: `12345678-1234-1234-1234-123456789abc`
- Characteristic UUID: `abcd1234-ab12-ab12-ab12-abcdef123456`

Characteristic is set to READ + NOTIFY, with a BLE2902 descriptor so the browser can subscribe. Connection callbacks reset the packet counter to zero on every new connect so the app can track loss accurately from the start of each session:

```cpp
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    digitalWrite(LED_PIN, HIGH);
    packetCounter = 0;
  }
  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    digitalWrite(LED_PIN, LOW);
  }
};
```

For the main loop, using `millis()` instead of `delay()` so the BLE stack never gets stalled:

```cpp
if (currentTime - lastSendTime >= SEND_INTERVAL) { // 10ms = 100Hz
  lastSendTime = currentTime;
  for (int i = 0; i < 4; i++) {
    rawValues[i] = analogRead(POT_PINS[i]);
  }
  // pack and notify...
}
```

Got a single potentiometer wired to GPIO 36 and pushed live readings through BLE to the browser as a first sanity check. Watching the value update in real time confirmed the full pipeline worked end to end.

<img width="600" alt="Initial web app UI — single sensor monitor" src="https://github.com/user-attachments/assets/2d28397f-b191-4f95-aa2c-cc4d5d6351f4" />

<img width="600" alt="ESP32 dev board breadboard setup for demo" src="https://github.com/user-attachments/assets/2734d59c-c2e9-4288-a1e0-97a369ed5936" />

## 3/2/26

Nailed down the BLE packet format. Each packet is exactly 20 bytes — fits in the BLE ATT MTU default of 23 bytes (20 payload + 3 ATT overhead), so no MTU negotiation needed at connection time.

| Bytes | Field | Description |
|-------|-------|-------------|
| 0–1 | Sensor 0 | 12-bit ADC, big-endian |
| 2–3 | Sensor 1 | 12-bit ADC, big-endian |
| 4–5 | Sensor 2 | 12-bit ADC, big-endian |
| 6–7 | Sensor 3 | 12-bit ADC, big-endian |
| 8–15 | Reserved | Zero-padded, for channels 4–15 later |
| 16–19 | Packet Counter | uint32, big-endian, resets on connect |

Packing on the firmware side:

```cpp
for (int i = 0; i < 4; i++) {
  sensorData[i*2]     = (rawValues[i] >> 8) & 0xFF;
  sensorData[i*2 + 1] =  rawValues[i]       & 0xFF;
}
sensorData[16] = (packetCounter >> 24) & 0xFF;
sensorData[17] = (packetCounter >> 16) & 0xFF;
sensorData[18] = (packetCounter >>  8) & 0xFF;
sensorData[19] =  packetCounter        & 0xFF;
```

Unpacking in JavaScript mirrors it exactly:

```js
for (let i = 0; i < 4; i++) {
  sensors[i] = (data[i * 2] << 8) | data[i * 2 + 1];
}
const packetID = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
```

Bytes 8–15 reserved for when we scale to all 16 mux channels.

## 3/4/26

Met with the group to plan the breadboard demo. Since the flex sensors haven't arrived yet, we're using 4 potentiometers on ADC1 pins to simulate dynamic analog input — they sweep 0–3.3V smoothly which exercises the full ADC range. The goal for the demo is to show BLE streaming live to the app and basic ADC multi-channel acquisition.

<img width="600" alt="Web app during breadboard demo — 4 sensor cards, 1.72% packet loss" src="https://github.com/user-attachments/assets/3c3f0b93-3416-41df-be18-6826816dec42" />

## 3/5/26

Sorted out the ADC config and started building the web app.

For the ADC, two settings matter:

```cpp
analogReadResolution(12);        // 0–4095
analogSetAttenuation(ADC_11db);  // input range 0–3.3V
```

The 11db attenuation is needed because the FSR voltage divider runs from 3.3V — without it the ESP32's default 0–1.1V range would clip anything above that. Also important: ADC2 is completely disabled when BLE is active (known ESP32-WROOM-32 hardware limitation), so I'm limited to the 4 ADC1 pins (GPIO 34, 35, 36, 39). That's why the final design uses an external SPI ADC for all 16 channels instead of relying on internal ADC pins.

On the app side, built the core Web Bluetooth connection flow. `startNotifications()` is the key call — without it the ESP32 sends packets but the browser never receives them.

```js
bleChar = await service.getCharacteristic(CHARACTERISTIC_UUID);
await bleChar.startNotifications();
bleChar.addEventListener('characteristicvaluechanged', handleBleData);
```

Packet loss is tracked against the ESP32's own counter rather than just packets received, so any dropped burst gets counted accurately:

```
lossPercent = (expectedCount - receivedCount) / expectedCount × 100
```

In JS, the counter is extracted from the last 4 bytes and compared against the previous packet ID:

```js
const pktId = (data[24]<<24)|(data[25]<<16)|(data[26]<<8)|data[27];
rxCount++;
if (lastPacketId >= 0 && pktId !== lastPacketId + 1)
  lostCount += Math.abs(pktId - lastPacketId - 1);
lastPacketId = pktId;
```

Display is color-coded: green for 0%, orange for <5%, red for ≥5%. On stop, `generateGraph()` renders all 4 channels as separate colored lines using Chart.js.

## 3/9/26

Tried to get the web app working on iOS since the Web Bluetooth API isn't supported on Safari/iOS at all. Explored a web hosting manifest approach to see if wrapping it as a PWA would help, but that didn't pan out — iOS is just locked out of Web Bluetooth regardless. Changed the UI a bit while messing around with it. Going to just target Chrome on desktop/Android and call that the supported platform.

## 3/10/26

Showed the breadboard demo. ESP32 dev board with 4 potentiometers on GPIO 36, 39, 34, 35, connected to the web app in Chrome. Demonstrated live sensor card updates, session recording, and the Chart.js graph playback. Packet loss was near 0% at close range. Good validation that the full software pipeline works end-to-end.

Also pushed a few web app updates in the lead-up to the demo — added the packet loss test display, bumped ADC resolution to 12-bit across the board, and fixed a BLE reconnect bug where the browser wouldn't resubscribe to notifications after a disconnect. Updated the firmware to correctly read from the 4 potentiometer pins.

<img width="653" height="923" alt="Breadboard Demo" src="https://github.com/user-attachments/assets/5b287c0e-bc94-4b45-86fd-367452fe34ff" />


## 3/16/26

Designed and tested the FSR 402 voltage divider circuit. The FSR resistance drops from >1 MΩ at rest to ~1 kΩ under full body weight. Using a 11.5 kΩ fixed pull-down (nearest available to the standard 10 kΩ):

```
V_out = 3.3V × R_fixed / (R_FSR + R_fixed)
```

Predicted vs. actual:

| Condition | R_FSR | Expected V_out | Expected ADC |
|-----------|-------|----------------|--------------|
| No pressure | ~1 MΩ | ~0.038 V | ~47 |
| Full body weight | ~1 kΩ | ~3.036 V | ~3,774 |

**Test 2 results (Arduino Serial Monitor, 115200 baud):**
- At rest: ADC consistently < 50 ✓
- Light finger pressure: ADC > 3,500 ✓
- Full body weight: ADC hit 4,095 ✓

Full-scale utilization confirmed across the expected foot pressure range.

<img width="600" alt="FSR 402 voltage divider breadboard — 3.3V rail, FSR 402, 11.5 kΩ to GND, wire to GPIO 36" src="https://github.com/user-attachments/assets/766a6946-7741-4a25-ab3d-c3f63741fe80" />

## 3/18/26

Ran the end-to-end BLE streaming test. Connected the breadboard to Chrome, did a 6-second recording session while varying all 4 potentiometers.

**Test 1 results:**

| Metric | Value |
|--------|-------|
| Packets expected | 19,905 |
| Packets received | 19,561 |
| Lost | 344 |
| **Loss** | **1.72%** — below 5% requirement ✓ |

Session graph rendered correctly with all 4 channels. At close range (<1 m) loss approached 0%.

<img width="600" alt="BLE packet loss test — session graph and 1.72% loss" src="https://github.com/user-attachments/assets/3c3f0b93-3416-41df-be18-6826816dec42" />

## 3/22/26

Met up as a group to make a roadmap leading up to the final PCB. Main concern is that we can't test PCB Rev 2 since the connector changed. Agreed to focus on what we can do now. My software milestones: update firmware for the external SPI ADC and mux, scale the BLE packet to all sensor channels, implement cadence detection in the app, and finish the full UI.

<img height="683" alt="Group Roadmap" src="https://github.com/user-attachments/assets/f404b276-fcc0-4588-816e-f0718deb00c1" />

## 4/2/26

Worked with Matthew to program the ESP32 on the actual PCB for the first time. Hit repeated USB connect/disconnect cycling — the device wouldn't stay enumerated long enough to flash. Suspected the LDO couldn't source enough current during ESP32 startup. Matthew found that the EN pin was floating (missing pull-up), which was causing spontaneous resets. Needs rework before we can flash.

## 4/3/26

Continued with Matthew. After the EN pull-up rework the cycling improved but flashing still failed — turns out the ESP32 was boot-looping looking for firmware that doesn't exist yet since this is the first flash. Fixed it by manually entering download mode: hold BOOT → press and release EN → release BOOT. Successfully flashed the ESP32. Loaded the breadboard BLE firmware as a sanity check and the device advertised correctly.

Then hit IMU I²C issues — Matthew traced it to the I²C address pin floating (missing pull resistor in the schematic). No firmware fix for a floating address, that goes on the Rev 3 list.

## 4/6/26 – 4/7/26

Spent a couple days doing a big web app overhaul. The old version was pretty bare — this update added a proper foot heatmap, a demo mode for showing the UI without needing a live BLE connection, and a force value column to the session recording. Also added the ability to adjust sensor placement on the footmap and fixed a session graph rendering bug that was causing the Chart.js lines to not draw correctly when stopping and restarting a recording. A lot of polish that was overdue.

The heatmap uses inverse-distance weighting across all sensor positions, rendered pixel-by-pixel onto a canvas clipped to the insole outline. Color maps from blue (no load) → green → yellow → red (max):

```js
function normToRGB(n) {
  const stops = [
    [0.00, [10,20,80]],   [0.15,[15,80,160]],  [0.30,[0,160,210]],
    [0.50,[80,220,130]],  [0.65,[240,210,30]],  [0.80,[232,80,10]], [1.00,[140,0,0]],
  ];
  // linearly interpolate between nearest stops
}
```

<img width="600" alt="Web app after 4/6 overhaul — foot heatmap, sensor table, force values" src="https://github.com/user-attachments/assets/76f3b014-f51a-4e19-94f3-0cb5efedbf69" />

## 4/9/26 – 4/10/26

New PCBs came in. Matthew soldered and I verified programming using the boot mode sequence. Then hit a footprint mismatch — the op-amp and external ADC pads didn't match the schematic pinout. Matthew bypassed both and ran the mux output directly to an ESP32 ADC pin via a fly wire.

<img width="391" height="329" alt="Mismatched op-amp/ADC pinout" src="https://github.com/user-attachments/assets/9364ada5-eaad-480e-b9e4-65c44bb5c92a" />

<img width="391" height="429" alt="Fly wire from mux to ESP32 ADC pin" src="https://github.com/user-attachments/assets/383c01dd-fa37-48eb-9470-7c33950c81c5" />

Wrote firmware to read through the bypassed path, cycling through mux channels by toggling the S0–S3 control lines:

```cpp
digitalWrite(MUX_S0,  channel       & 0x1);
digitalWrite(MUX_S1, (channel >> 1) & 0x1);
digitalWrite(MUX_S2, (channel >> 2) & 0x1);
digitalWrite(MUX_S3, (channel >> 3) & 0x1);
delayMicroseconds(10);
rawValues[channel] = analogRead(36);
```

Confirmed flex sensor data was coming through — ADC values responded to manual pressure on the sensor.

## 4/11/26

Reviewed Matthew's updated footprints for the JLC order. Made note of the corrected ADC0081S021 SPI pin mapping (CS, SCLK, DOUT) so I can write the proper SPI firmware once the boards come in.

## 4/19/26

While waiting for the JLC PCBs, worked on the web app. Updated the sensor card layout to support up to 16 channels and started sketching out the cadence detection logic — detect heel strike when sensor 0 crosses a threshold, detect toe-off when it drops back below a hysteresis threshold, and compute BPM from the average stride period.

Started laying out the sensor map in code with pixel coordinates for each sensor's position on the insole canvas (160×320 px):

```js
const SENSORS = [
  { id:0,  zone:'Fore',  cx:52,  cy:88  },  { id:1,  zone:'Fore',  cx:72,  cy:78  },
  { id:2,  zone:'Fore',  cx:96,  cy:78  },  { id:3,  zone:'Fore',  cx:116, cy:90  },
  { id:4,  zone:'U-Mid', cx:60,  cy:156 },  { id:5,  zone:'U-Mid', cx:96,  cy:154 },
  { id:6,  zone:'L-Mid', cx:60,  cy:248 },  { id:7,  zone:'L-Mid', cx:96,  cy:248 },
  { id:8,  zone:'Heel',  cx:52,  cy:272 },  // ... 4 heel sensors
];
```

Threshold values will be determined empirically with actual sensor data — placeholders for now.

## 4/21/26

Matthew and I waited for the DHL truck and eventually chased it down to get the package. After Matthew soldered the boards, we did initial bring-up: BMS charging confirmed, ESP32 programmable, op-amp and external ADC both functional. First time the full analog chain from the connector through to the ESP32 actually works. Updated firmware to read from the external ADC over SPI and confirmed values respond to sensor pressure.

<img width="248" height="304" alt="Assembled JLC PCB" src="https://github.com/user-attachments/assets/afe6abd3-666f-4b60-b030-fae040599a7d" />

<img width="600" alt="Final web app — dashboard with gait events, pressure heatmap, recording" src="https://github.com/user-attachments/assets/48097f3f-9763-4ab6-9bb3-fa257b30c11b" />

Also spent a good chunk of the day rebuilding the web app. Rebuilt the layout from scratch — cleaner UI, collapsable session history so old sessions don't clutter the screen, general visual improvements. Added gait event detection placeholders and a freeze feature so the displayed gait state doesn't flicker mid-stride. Also added IMU data placeholders for when we eventually wire that up.

## 4/23/26

Whole group met for full system integration with the complete sensor array. Two bugs came up:

1. **Connector pin flip** — the flex PCB connector was wired with pins reversed relative to the main PCB header. Fixed in firmware by remapping the mux channel scan order.

2. **Mux address select** — certain channels were reading 0 regardless of pressure. The S0–S3 bit-shift logic was wrong for some channel indices. Fixed and re-verified all channels.

After both fixes, all sensors responded to pressure and data streamed to the app correctly. High-level goal achieved.

<img width="600" alt="Full flex PCB sensor array with all FSR sensors" src="https://github.com/user-attachments/assets/6e5441af-d0c2-4882-b40e-181bb7c18626" />

<img width="807" height="230" alt="Full system integration — all sensors live" src="https://github.com/user-attachments/assets/4cd9fe88-8125-46c6-98a0-a0bac848978b" />

## 4/24/26

Spent time reconfiguring the sensor labels and placement on the foot heatmap now that we have real data from the full sensor array. The original sensor numbering didn't match the physical layout once everything was integrated, so I had to remap which sensor index corresponds to which region of the foot (heel, midfoot, forefoot). Did a few iterations to get the placement visually accurate.

<img width="600" alt="Foot heatmap sensor placement configuration" src="https://github.com/user-attachments/assets/620dc2ab-1110-4317-ae42-34a84379a18c" />

## 4/25/26

Cleaned up the app based on group feedback — polished the UI, added a clearer connection status banner, tightened up the session graph labels. Aarush laminated the sensors to the insole and tested the heat inserts. Everything is coming together.

<img width="401" height="819" alt="Insole laminated and fitted in enclosure" src="https://github.com/user-attachments/assets/12345b04-09cc-402a-95d7-b6abd52103c1" />


## 4/26/26

More foot heatmap work — reconfigured the circle positions to better reflect the actual sensor locations on the insole after seeing it in use. Also deleted the IMU section from the app since we're not wiring that up for the final demo. Adjusted the FSR scaling values since we ended up using a mix of FSR400 and FSR402 sensors — the two have slightly different force-resistance curves so the ADC-to-force conversion needed tuning per sensor type.

FSR400 active area is ~20.3 mm² vs FSR402's ~126.7 mm², so FSR400 reads proportionally weaker for the same force. Added a scale factor applied before the heatmap render:

```js
const FSR400_SCALE = 1.6;  // empirically tuned — theoretical ratio is 6.25 but circuit response is softer
```

Force conversion using the Interlink resistive FSR model:

```js
function adcToForceN(adc) {
  const vOut = (adc / 4095) * 3.3;
  const rFsr = 10000 * (3.3 - vOut) / vOut;  // voltage divider inverted
  return (1e6 / rFsr) / 101.97;               // FSR conductance → force in Newtons
}
```

## 4/28/26

Big app push! Reworked the step count logic to use proper gait phases (stance, swing) instead of a simple threshold cross. Added gait phase detection so the app can distinguish heel strike from toe-off. Also added raw ADC value and force value recording to the CSV export so we have full data for the final writeup. Tried a step calibration approach, didn't like it, reverted. Also removed an AI analysis section I had been experimenting with — not reliable enough to include in the demo.

Gait detection uses per-sensor delta from a rolling EMA baseline instead of a fixed threshold, so it handles DC-offset channels automatically:

```js
const STEP_ACTIVATE_DELTA  = 300;  // ADC counts above baseline → sensor loaded
const STEP_RELEASE_DELTA   = 80;   // back within this → sensor unloaded
const BASELINE_ALPHA       = 0.03; // EMA rate for resting baseline tracking
const MIN_STANCE_MS        = 100;  // stances shorter than this are noise-rejected
const MIN_STEP_INTERVAL_MS = 350;  // debounce
```

A step registers when all loaded sensors return to baseline AND at least 2 sensors completed a full load→unload cycle during that stance:

```js
if (footInStance && loadedCount === 0) {
  if (stanceDur >= MIN_STANCE_MS && peakedCount >= 2) {
    gait.stepCount++;
    gait.gcts.push(stanceDur);  // ground contact time
  }
  sensorPeaked.fill(false);
}
```

Rehearsed the demo flow with the group. Helped out Matthew with a battery stress test — ~200 mA charging confirmed at a sense resistor, and the system ran on LiPo only for over an hour with no resets or dropped BLE. Battery requirement met!

<img width="660" height="632" alt="Battery charging current at ~200mA on oscilloscope" src="https://github.com/user-attachments/assets/fda15de7-6299-42e1-858c-f8591728b877" />

## 4/29/26

Final app touches. Changed the session graph from a raw sensor plot to a cadence-over-time view so it's more meaningful to someone watching the demo. Added a live sample rate display so we can confirm 100 Hz is being maintained. Added a verification tab to show test results inline. Tweaked the foot shape and heatmap circle positions a few more times until it looked right. Fixed gait event detection — it was double-counting steps in some edge cases.

The cadence chart plots instantaneous steps/min at each detected step, derived from the stride interval between consecutive footstrikes:

```js
for (let i = 1; i < stepTimestamps.length; i++) {
  const strideMs = stepTimestamps[i] - stepTimestamps[i - 1];
  cadences.push(+(60000 / strideMs).toFixed(1));  // stride interval → steps/min
}
```

An average cadence reference line overlays the scatter so you can see drift over a session at a glance.

## 4/29/26 - 4/30/26

Presented Impact Insoles at the ECE445 final demo. Walked the judges through the full system — insole in shoe, PCB in enclosure, BLE streaming live to the web app on a laptop. Showed real-time pressure heatmap, gait event detection, and a recorded session with the cadence graph. Everything worked. Really proud of how far this came from a breadboard with 4 potentiometers to a fully integrated wearable. Big shoutout to the best teammates Matthew and Aarush, couldn't have done it without them. Impact Insoles is complete!

<img width="600" alt="Final presentation — Impact Insoles demo day" src="https://github.com/user-attachments/assets/3794ae5d-b5e2-4ec4-a457-3986a30e1b62" />


