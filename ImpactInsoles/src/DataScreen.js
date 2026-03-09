import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { mockStartDataStream, MOCK_MODE } from './BLEManager';

const CHARACTERISTIC_UUID = 'abcd1234-ab12-ab12-ab12-abcdef123456';
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';

function getValueColor(value) {
  if (value < 64) return '#0066CC';
  if (value < 128) return '#00AA88';
  if (value < 192) return '#FFB020';
  return '#FF3B30';
}

export default function DataScreen({ navigation, route }) {
  const { device, manager } = route?.params || {};
  
  const [sensors, setSensors] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [isConnected, setIsConnected] = useState(true);
  const stopStreamRef = useRef(null);

  useEffect(() => {
    startDataStream();
    return () => {
      if (stopStreamRef.current) stopStreamRef.current();
    };
  }, []);

  const startDataStream = () => {
    if (MOCK_MODE) {
      // Mock data stream
      const stop = mockStartDataStream((data) => {
        setSensors(data.sensors);
      });
      stopStreamRef.current = stop;
    } else {
      // Real BLE stream
      if (device && manager) {
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          (error, characteristic) => {
            if (error) {
              console.error('BLE error:', error);
              setIsConnected(false);
              return;
            }
            
            if (characteristic?.value) {
              // Decode base64 to byte array
              const base64 = characteristic.value;
              const bytes = atob(base64).split('').map(c => c.charCodeAt(0));
              setSensors(bytes.slice(0, 8));
            }
          }
        );
      }
    }
  };

  const handleBack = () => {
    if (stopStreamRef.current) stopStreamRef.current();
    if (device && !MOCK_MODE) {
      device.cancelConnection();
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backBtn}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIVE DATA</Text>
        {MOCK_MODE && <Text style={styles.mockTag}>MOCK</Text>}
      </View>

      <View style={styles.content}>
        
        {/* Connection Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, isConnected && styles.statusDotActive]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {/* Primary Sensor (Potentiometer) */}
        <View style={styles.primaryCard}>
          <Text style={styles.primaryLabel}>SENSOR 0 (POTENTIOMETER)</Text>
          <Text style={[styles.primaryValue, { color: getValueColor(sensors[0]) }]}>
            {sensors[0]}
          </Text>
          <Text style={styles.primaryRange}>0 – 255</Text>
        </View>

        {/* All Sensors Grid */}
        <Text style={styles.sectionTitle}>ALL SENSORS</Text>
        <View style={styles.grid}>
          {sensors.map((value, i) => (
            <View key={i} style={styles.gridItem}>
              <Text style={styles.gridLabel}>S{i}</Text>
              <Text style={[styles.gridValue, { color: getValueColor(value) }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 TIP</Text>
          <Text style={styles.infoText}>
            Turn your potentiometer to see values change in real-time.
            Sensor 0 shows the real reading, sensors 1-7 are simulated.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C14' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2235',
  },
  backBtn: { color: '#FF6B35', fontSize: 13, fontWeight: '700', letterSpacing: 1, width: 70 },
  headerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 4 },
  mockTag: {
    color: '#FF6B35',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 55,
    textAlign: 'center',
  },

  content: { flex: 1, padding: 20 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8A8FA8' },
  statusDotActive: { backgroundColor: '#00E5A0' },
  statusText: { fontSize: 13, color: '#8A8FA8', fontWeight: '600' },

  // Primary sensor
  primaryCard: {
    backgroundColor: '#151821',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2235',
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryLabel: { fontSize: 10, color: '#8A8FA8', letterSpacing: 2, marginBottom: 16 },
  primaryValue: {
    fontSize: 72,
    fontWeight: '900',
    fontFamily: 'System',
    marginBottom: 8,
  },
  primaryRange: { fontSize: 12, color: '#8A8FA8', fontFamily: 'System' },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  gridItem: {
    width: '23%',
    backgroundColor: '#151821',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2235',
    padding: 14,
    alignItems: 'center',
  },
  gridLabel: { fontSize: 9, color: '#8A8FA8', letterSpacing: 1, marginBottom: 6, fontWeight: '600' },
  gridValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'System',
  },

  // Info
  infoCard: {
    backgroundColor: '#151821',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF6B3530',
    padding: 16,
  },
  infoTitle: { fontSize: 11, fontWeight: '900', color: '#FF6B35', letterSpacing: 2, marginBottom: 8 },
  infoText: { fontSize: 12, color: '#C0C4D6', lineHeight: 18 },
});
