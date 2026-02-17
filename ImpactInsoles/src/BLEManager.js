// ─────────────────────────────────────────────────────────────
//  BLEManager.js
//  Handles all Bluetooth Low Energy logic for the ESP32-C3.
//  Currently runs in MOCK MODE — swap in real BLE calls when
//  hardware arrives. All mock functions are clearly marked.
// ─────────────────────────────────────────────────────────────

// UUIDs must match what you program into the ESP32-C3 sketch
export const SERVICE_UUID        = '12345678-1234-1234-1234-123456789abc';
export const CHARACTERISTIC_UUID = 'abcd1234-ab12-ab12-ab12-abcdef123456';
export const DEVICE_NAME         = 'ImpactInsoles';

// ── MOCK MODE FLAG ───────────────────────────────────────────
// Set to false when real hardware is connected
export const MOCK_MODE = true;

// ── MOCK: Simulate scanning and finding a device ─────────────
export function mockScan(onDeviceFound) {
  console.log('[BLE] Mock scan started...');
  setTimeout(() => {
    onDeviceFound({
      id: 'mock-device-001',
      name: DEVICE_NAME,
      rssi: -62,
    });
  }, 2000); // Simulates a 2-second scan delay
}

// ── MOCK: Simulate connecting to a device ────────────────────
export async function mockConnect(device) {
  console.log('[BLE] Mock connecting to:', device.name);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[BLE] Mock connected!');
      resolve({ ...device, connected: true });
    }, 1000);
  });
}

// ── MOCK: Stream fake sensor data ────────────────────────────
// Simulates 8 FSR pressure sensors on the insole.
// Returns a cleanup function to stop the stream.
export function mockStartDataStream(onDataReceived) {
  console.log('[BLE] Mock data stream started');

  // Sensor layout (indices match insole positions):
  // [0] Heel Left   [1] Heel Right
  // [2] Arch Left   [3] Arch Right
  // [4] Ball Left   [5] Ball Right
  // [6] Toe Left    [7] Toe Right

  let step = 0;

  const interval = setInterval(() => {
    step++;

    // Simulate a running gait cycle (heel strike → toe off)
    const gaitPhase = (step % 20) / 20; // 0.0 → 1.0 over 20 ticks

    let sensors;
    if (gaitPhase < 0.3) {
      // Heel strike
      sensors = [210, 220, 80, 70, 30, 25, 10, 10];
    } else if (gaitPhase < 0.6) {
      // Midstance
      sensors = [120, 130, 180, 190, 140, 150, 60, 55];
    } else if (gaitPhase < 0.85) {
      // Toe off
      sensors = [20, 15, 60, 55, 200, 210, 230, 235];
    } else {
      // Flight phase (foot in air)
      sensors = [5, 5, 5, 5, 5, 5, 5, 5];
    }

    // Add small random noise to make it feel realistic
    sensors = sensors.map((v) => Math.min(255, Math.max(0, v + Math.floor(Math.random() * 20 - 10))));

    // Cadence: simulate ~170 BPM (steps per minute)
    // A "step" event fires every ~350ms at 170 BPM
    const isStepEvent = step % 6 === 0; // ~every 6 ticks at 100ms intervals = 600ms ≈ 100 BPM (adjust as needed)

    onDataReceived({
      sensors,       // array of 8 values, 0–255
      isStepEvent,   // true on foot-strike frames
      timestamp: Date.now(),
    });
  }, 100); // 100ms = 10 Hz for mock (real device will do 100 Hz)

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('[BLE] Mock data stream stopped');
  };
}

// ── REAL BLE (uncomment when hardware arrives) ───────────────
// import { BleManager } from 'react-native-ble-plx';
// export const bleManager = new BleManager();
//
// export function startScan(onDeviceFound) {
//   bleManager.startDeviceScan(
//     [SERVICE_UUID],
//     null,
//     (error, device) => {
//       if (error) { console.error(error); return; }
//       if (device.name === DEVICE_NAME) {
//         bleManager.stopDeviceScan();
//         onDeviceFound(device);
//       }
//     }
//   );
// }
//
// export async function connectToDevice(device) {
//   const connected = await device.connect();
//   await connected.discoverAllServicesAndCharacteristics();
//   return connected;
// }
//
// export function startDataStream(device, onDataReceived) {
//   device.monitorCharacteristicForService(
//     SERVICE_UUID,
//     CHARACTERISTIC_UUID,
//     (error, characteristic) => {
//       if (error) { console.error(error); return; }
//       const bytes = Buffer.from(characteristic.value, 'base64');
//       const sensors = Array.from(bytes.slice(0, 8));
//       onDataReceived({ sensors, timestamp: Date.now() });
//     }
//   );
// }
