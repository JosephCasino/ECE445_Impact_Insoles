import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MOCK_MODE } from './BLEManager';

// Real BLE imports (only used when MOCK_MODE = false)
let BleManager;
if (!MOCK_MODE) {
  try {
    const BLE = require('react-native-ble-plx');
    BleManager = BLE.BleManager;
  } catch (e) {
    console.log('BLE library not loaded - using mock mode');
  }
}

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const DEVICE_NAME = 'ImpactInsoles';

export default function HomeScreen({ navigation }) {
  const [status, setStatus] = useState('idle');
  const [device, setDevice] = useState(null);

  const handleConnect = async () => {
    if (MOCK_MODE) {
      // Mock connection - just navigate
      setStatus('connected');
      setTimeout(() => {
        navigation.navigate('Data', { device: { name: 'Mock Device' } });
      }, 500);
      return;
    }

    // Real BLE connection
    try {
      setStatus('scanning');
      const manager = new BleManager();

      manager.startDeviceScan([SERVICE_UUID], null, (error, scannedDevice) => {
        if (error) {
          console.error(error);
          setStatus('error');
          return;
        }

        if (scannedDevice && scannedDevice.name === DEVICE_NAME) {
          manager.stopDeviceScan();
          setStatus('connecting');
          
          scannedDevice.connect()
            .then(dev => dev.discoverAllServicesAndCharacteristics())
            .then(dev => {
              setDevice(dev);
              setStatus('connected');
              navigation.navigate('Data', { device: dev, manager });
            })
            .catch(err => {
              console.error(err);
              setStatus('error');
            });
        }
      });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>IMPACT</Text>
        <Text style={styles.titleAccent}>INSOLES</Text>
        <Text style={styles.subtitle}>Simple Sensor Display</Text>

        {MOCK_MODE && (
          <View style={styles.mockBadge}>
            <Text style={styles.mockText}>⚡ MOCK MODE</Text>
          </View>
        )}

        <View style={styles.statusBox}>
          <View style={[styles.dot, status === 'connected' && styles.dotConnected]} />
          <Text style={styles.statusText}>
            {status === 'idle' ? 'Ready to connect' :
             status === 'scanning' ? 'Scanning...' :
             status === 'connecting' ? 'Connecting...' :
             status === 'connected' ? 'Connected!' :
             'Connection failed'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleConnect}
          disabled={status === 'scanning' || status === 'connecting'}
        >
          <Text style={styles.buttonText}>
            {status === 'idle' ? 'CONNECT' :
             status === 'scanning' ? 'SCANNING...' :
             status === 'connecting' ? 'CONNECTING...' :
             status === 'connected' ? 'GO TO DATA' :
             'RETRY'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C14' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  title: { fontSize: 48, fontWeight: '900', color: '#FFFFFF', letterSpacing: 6 },
  titleAccent: { fontSize: 48, fontWeight: '900', color: '#FF6B35', letterSpacing: 6, marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#8A8FA8', letterSpacing: 2, marginBottom: 40 },
  
  mockBadge: {
    backgroundColor: '#FF6B3520',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FF6B3540',
    marginBottom: 24,
  },
  mockText: { fontSize: 11, color: '#FF6B35', letterSpacing: 1 },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8A8FA8' },
  dotConnected: { backgroundColor: '#00E5A0' },
  statusText: { fontSize: 13, color: '#8A8FA8', fontWeight: '600' },

  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 48,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});
