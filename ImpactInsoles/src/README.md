# ImpactInsoles — Setup Instructions

## 1. Copy files into your project
Place files exactly like this:

```
ImpactInsoles/
├── App.js
├── src/
│   ├── BLEManager.js
│   ├── HomeScreen.js
│   └── DataScreen.js
```

## 2. Install dependencies
Run these inside your ImpactInsoles folder:

```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

## 3. Start the app
```bash
npx expo start
```
Scan the QR code with Expo Go on your phone.

## 4. When your ESP32-C3 arrives
- Set MOCK_MODE = false in BLEManager.js
- Uncomment the real BLE functions at the bottom of BLEManager.js
- Run: npx expo install react-native-ble-plx
- Build a custom dev client: eas build --profile development --platform android
