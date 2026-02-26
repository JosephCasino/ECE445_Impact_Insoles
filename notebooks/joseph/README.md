# JOSEPH'S NOTEBOOK


## 2/16/2026

Began researching development for app and bluetooth connectivity:

Expo → handles the project setup, no Xcode/Android Studio headaches to start
react-native-ble-plx → the BLE layer, handles scanning, connecting, subscribing to characteristics
Victory Native or Recharts → for plotting pressure data in real time

ESP32-C3 → advertises a custom GATT service, notifies the phone with a byte array of sensor readings

Typical flow:
- ESP32-C3 advertises with a known Service UUID you define
- Phone scans, finds it, connects
Phone subscribes to a Characteristic UUID (your sensor data stream)
- ESP32-C3 sends notifications at 100 Hz with packed ADC readings
- App parses the byte array → calculates cadence → updates the display

Setup:
 - Installed Node.js
 - Installed Expo CLI
 - Created Project Directory "ImpactInsoles"
 - Installed BLE Library
 - Installed Expo Build Tools 
 - Installed "Expo Go" app
 - Created dummy code for a mock app design
 
## 2/20/2026

- Installed Arduino IDE
- Installed ESP32 board packages

## 2/23/2026

- Checked Matthew's Schematic 
- Worked on Design Document

## 2/25/2025

- Worked on Design Document

