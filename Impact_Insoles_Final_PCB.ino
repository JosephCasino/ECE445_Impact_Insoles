/*
 * ImpactInsolesDrivers.ino
 * ECE445 Group 68 — Impact Insoles
 * Authors: Joseph Casino, Aarush Sivanesan, Matthew Weng
 *
 * ─────────────────────────────────────────────────────────────
 * PCB VERSION — 12 FSR Sensors via CD74HC4067 MUX + MCP3201 SPI ADC
 * TARGET BOARD: ESP32-S3-WROOM-1
 * ─────────────────────────────────────────────────────────────
 *
 * SIGNAL CHAIN:
 *   FSR → J1 connector → CD74HC4067 MUX → TLV9001 Op-Amp
 *      → MCP3201 12-bit SPI ADC → ESP32-S3
 *
 * MCP3201 SPI PROTOCOL:
 *   - 12-bit, single-channel, MSB-first
 *   - CS low → 16 clocks (null bit + 12 data bits) → CS high
 *   - Max SPI clock: 1.05 MHz @ 3.3V
 *
 * BLE PACKET FORMAT (28 bytes):
 *   Bytes  0–23 : 12 × 2-byte sensor values (big-endian, 12-bit)
 *   Bytes 24–27 : Packet counter (uint32, big-endian)
 * ─────────────────────────────────────────────────────────────
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <SPI.h>

// ═══════════════════════════════════════════════════════════════
// BLE Configuration  (must match index.html exactly)
// ═══════════════════════════════════════════════════════════════
#define SERVICE_UUID        "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcd1234-ab12-ab12-ab12-abcdef123456"
#define DEVICE_NAME         "ImpactInsoles"

// ═══════════════════════════════════════════════════════════════
// MUX Pin Definitions — CD74HC4067
// ═══════════════════════════════════════════════════════════════
#define MUX_S0    4
#define MUX_S1    5
#define MUX_S2    6
#define MUX_S3   15

// ═══════════════════════════════════════════════════════════════
// MCP3201 SPI Pin Definitions
// ═══════════════════════════════════════════════════════════════
#define ADC_CS    10
#define ADC_SCLK  12
#define ADC_MISO  13

// ═══════════════════════════════════════════════════════════════
// Sensor → MUX Channel Mapping
// ═══════════════════════════════════════════════════════════════
#define SENSOR1_MUX_CH    4
#define SENSOR2_MUX_CH    0
#define SENSOR3_MUX_CH   13
#define SENSOR4_MUX_CH   11
#define SENSOR5_MUX_CH    2
#define SENSOR6_MUX_CH   15
#define SENSOR7_MUX_CH   10
#define SENSOR8_MUX_CH    7
#define SENSOR9_MUX_CH   12
#define SENSOR10_MUX_CH   8
#define SENSOR11_MUX_CH   5
#define SENSOR12_MUX_CH   3

// ═══════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════
#define NUM_SENSORS      12
#define PACKET_SIZE      28
#define SEND_INTERVAL_MS 10 // 100 hz
#define MUX_SETTLE_US    50

// ═══════════════════════════════════════════════════════════════
// MUX channel table — static, allocated once at compile time
// ═══════════════════════════════════════════════════════════════
static const uint8_t MUX_CH[NUM_SENSORS] = {
  SENSOR1_MUX_CH,  SENSOR2_MUX_CH,  SENSOR3_MUX_CH,
  SENSOR4_MUX_CH,  SENSOR5_MUX_CH,  SENSOR6_MUX_CH,
  SENSOR7_MUX_CH,  SENSOR8_MUX_CH,  SENSOR9_MUX_CH,
  SENSOR10_MUX_CH, SENSOR11_MUX_CH, SENSOR12_MUX_CH
};

// ═══════════════════════════════════════════════════════════════
// Globals
// ═══════════════════════════════════════════════════════════════
SPIClass           hspi(HSPI);
BLEServer         *pServer         = nullptr;
BLECharacteristic *pCharacteristic = nullptr;

volatile bool deviceConnected    = false;
volatile bool oldDeviceConnected = false;
bool          bleReady           = false;

uint8_t       packetBuf[PACKET_SIZE];
uint32_t      packetCounter  = 0;
uint32_t      serialLogCount = 0;
unsigned long lastSendTime   = 0;

// ═══════════════════════════════════════════════════════════════
// BLE Callbacks
// ═══════════════════════════════════════════════════════════════
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;
    packetCounter   = 0;
    serialLogCount  = 0;
    bleReady        = true;
    Serial.println("[BLE] Connected.");
  }
  void onDisconnect(BLEServer *pServer) override {
    deviceConnected = false;
    bleReady        = false;
    Serial.println("[BLE] Disconnected. Re-advertising.");
  }
};

// ═══════════════════════════════════════════════════════════════
// MUX channel select
// ═══════════════════════════════════════════════════════════════
void selectMuxChannel(uint8_t ch) {
  digitalWrite(MUX_S0, (ch >> 0) & 0x01);
  digitalWrite(MUX_S1, (ch >> 1) & 0x01);
  digitalWrite(MUX_S2, (ch >> 2) & 0x01);
  digitalWrite(MUX_S3, (ch >> 3) & 0x01);
  delayMicroseconds(MUX_SETTLE_US);
}

// ═══════════════════════════════════════════════════════════════
// MCP3201 read — unchanged from original
// ═══════════════════════════════════════════════════════════════
uint16_t readMCP3201() {
  hspi.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(ADC_CS, LOW);
  delayMicroseconds(1);
  uint8_t b1 = hspi.transfer(0x00);
  uint8_t b2 = hspi.transfer(0x00);
  digitalWrite(ADC_CS, HIGH);
  hspi.endTransaction();
  uint16_t raw = ((uint16_t)b1 << 8) | b2;
  return (raw >> 1) & 0x0FFF;
}

// ═══════════════════════════════════════════════════════════════
// Read one sensor
// ═══════════════════════════════════════════════════════════════
uint16_t readSensor(uint8_t muxChannel) {
  selectMuxChannel(muxChannel);
  return readMCP3201();
}

// ═══════════════════════════════════════════════════════════════
// Pack 12-bit value into BLE buffer
// ═══════════════════════════════════════════════════════════════
inline void packSensor(uint8_t slotIndex, uint16_t value) {
  packetBuf[slotIndex * 2]     = (value >> 8) & 0xFF;
  packetBuf[slotIndex * 2 + 1] =  value       & 0xFF;
}

// ═══════════════════════════════════════════════════════════════
// Setup
// ═══════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  delay(800);

  Serial.println("\n╔══════════════════════════════════════════╗");
  Serial.println("║  ImpactInsoles — 12-FSR PCB Version     ║");
  Serial.println("║  ECE445 Group 68 · UIUC 2025 (ESP32-S3) ║");
  Serial.println("╚══════════════════════════════════════════╝\n");

  pinMode(MUX_S0, OUTPUT);
  pinMode(MUX_S1, OUTPUT);
  pinMode(MUX_S2, OUTPUT);
  pinMode(MUX_S3, OUTPUT);

  pinMode(ADC_CS, OUTPUT);
  digitalWrite(ADC_CS, HIGH);

  hspi.begin(ADC_SCLK, ADC_MISO, /*MOSI=*/-1, ADC_CS);
  memset(packetBuf, 0, PACKET_SIZE);

  // Boot self-test
  Serial.println("Boot self-test:");
  Serial.println("───────────────────────────────────────────");
  for (int i = 0; i < NUM_SENSORS; i++) {
    Serial.printf("  sensor%02d (MUX ch%2d): %4d\n",
                  i + 1, MUX_CH[i], readSensor(MUX_CH[i]));
  }
  Serial.println();

  // BLE init
  BLEDevice::init(DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  BLEAdvertising *pAdv = BLEDevice::getAdvertising();
  pAdv->addServiceUUID(SERVICE_UUID);
  pAdv->setScanResponse(true);
  pAdv->setMinPreferred(0x06);
  pAdv->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.printf("Advertising as \"%s\"\n\n", DEVICE_NAME);
}

// ═══════════════════════════════════════════════════════════════
// Main Loop
// ═══════════════════════════════════════════════════════════════
void loop() {

  // Reconnection handling
  if (!deviceConnected && oldDeviceConnected) {
    delay(400);
    pServer->startAdvertising();
    oldDeviceConnected = false;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = true;
  }

  // Rate limit
  unsigned long now = millis();
  if (now - lastSendTime < SEND_INTERVAL_MS) return;
  lastSendTime = now;

  // Read all 12 sensors into packet buffer
  uint16_t vals[NUM_SENSORS];
  for (int i = 0; i < NUM_SENSORS; i++) {
    vals[i] = readSensor(MUX_CH[i]);
    packSensor(i, vals[i]);
  }

  // Pack counter into bytes 24–27
  packetBuf[24] = (packetCounter >> 24) & 0xFF;
  packetBuf[25] = (packetCounter >> 16) & 0xFF;
  packetBuf[26] = (packetCounter >>  8) & 0xFF;
  packetBuf[27] =  packetCounter        & 0xFF;

  // Send over BLE only if connected and stack is ready
  if (deviceConnected && bleReady) {
    pCharacteristic->setValue(packetBuf, PACKET_SIZE);
    pCharacteristic->notify();
  }

  // Always increment counter
  packetCounter++;
}