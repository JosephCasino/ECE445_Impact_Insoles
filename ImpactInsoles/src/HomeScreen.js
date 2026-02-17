import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { mockScan, mockConnect, MOCK_MODE } from './BLEManager';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | found | connecting | connected
  const [device, setDevice] = useState(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  // Pulse animation during scanning
  useEffect(() => {
    if (status === 'scanning') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const handleScan = () => {
    setStatus('scanning');
    setDevice(null);

    if (MOCK_MODE) {
      mockScan((foundDevice) => {
        setDevice(foundDevice);
        setStatus('found');
      });
    }
    // Real BLE: replace mockScan with startScan from BLEManager
  };

  const handleConnect = async () => {
    if (!device) return;
    setStatus('connecting');

    if (MOCK_MODE) {
      const connected = await mockConnect(device);
      setStatus('connected');
      // Navigate after short delay so user sees "Connected" state
      setTimeout(() => {
        navigation.navigate('Data', { device: connected });
      }, 600);
    }
    // Real BLE: replace mockConnect with connectToDevice from BLEManager
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':       return 'Ready to scan';
      case 'scanning':   return 'Scanning for device...';
      case 'found':      return `Found: ${device?.name}`;
      case 'connecting': return 'Connecting...';
      case 'connected':  return 'Connected!';
      default:           return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'found':     return '#00E5A0';
      case 'connected': return '#00E5A0';
      case 'scanning':  return '#FF6B35';
      default:          return '#8A8FA8';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background accent */}
      <View style={styles.bgAccent} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>IMPACT</Text>
          <Text style={styles.appNameAccent}>INSOLES</Text>
          <Text style={styles.tagline}>Running Biomechanics Monitor</Text>
        </View>

        {/* Scan button with pulse ring */}
        <View style={styles.scanArea}>
          {/* Pulse ring (visible during scanning) */}
          {status === 'scanning' && (
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          )}

          <TouchableOpacity
            style={[
              styles.scanButton,
              status === 'found' && styles.scanButtonFound,
              status === 'connected' && styles.scanButtonConnected,
            ]}
            onPress={status === 'idle' ? handleScan : status === 'found' ? handleConnect : null}
            activeOpacity={0.85}
          >
            <Text style={styles.scanIcon}>
              {status === 'idle'       ? '⟳' :
               status === 'scanning'  ? '◉' :
               status === 'found'     ? '↗' :
               status === 'connecting'? '…' :
               status === 'connected' ? '✓' : '⟳'}
            </Text>
            <Text style={styles.scanButtonLabel}>
              {status === 'idle'        ? 'SCAN' :
               status === 'scanning'   ? 'SCANNING' :
               status === 'found'      ? 'CONNECT' :
               status === 'connecting' ? 'CONNECTING' :
               'CONNECTED'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Device info card (shown when found) */}
        {device && (status === 'found' || status === 'connecting' || status === 'connected') && (
          <View style={styles.deviceCard}>
            <Text style={styles.deviceCardLabel}>DEVICE DETECTED</Text>
            <Text style={styles.deviceName}>{device.name}</Text>
            <View style={styles.deviceMeta}>
              <Text style={styles.deviceMetaText}>ID: {device.id}</Text>
              <Text style={styles.deviceMetaText}>Signal: {device.rssi} dBm</Text>
            </View>
          </View>
        )}

        {/* Reset button */}
        {status !== 'idle' && status !== 'scanning' && status !== 'connected' && (
          <TouchableOpacity onPress={() => { setStatus('idle'); setDevice(null); }} style={styles.resetButton}>
            <Text style={styles.resetText}>SCAN AGAIN</Text>
          </TouchableOpacity>
        )}

        {/* Mock mode badge */}
        {MOCK_MODE && (
          <View style={styles.mockBadge}>
            <Text style={styles.mockBadgeText}>⚡ MOCK MODE — No hardware needed</Text>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C14',
  },
  bgAccent: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FF6B3520',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    lineHeight: 52,
  },
  appNameAccent: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF6B35',
    letterSpacing: 8,
    lineHeight: 52,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    color: '#8A8FA8',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Scan button
  scanArea: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#FF6B3560',
  },
  scanButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#151821',
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonFound: {
    borderColor: '#00E5A0',
    backgroundColor: '#00E5A015',
  },
  scanButtonConnected: {
    borderColor: '#00E5A0',
    backgroundColor: '#00E5A025',
  },
  scanIcon: {
    fontSize: 36,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanButtonLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Device card
  deviceCard: {
    width: '100%',
    backgroundColor: '#151821',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2235',
    padding: 20,
    marginBottom: 20,
  },
  deviceCardLabel: {
    fontSize: 10,
    color: '#8A8FA8',
    letterSpacing: 2,
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  deviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceMetaText: {
    fontSize: 12,
    color: '#8A8FA8',
  },

  // Reset
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  resetText: {
    fontSize: 12,
    color: '#8A8FA8',
    letterSpacing: 2,
    textDecorationLine: 'underline',
  },

  // Mock badge
  mockBadge: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#FF6B3520',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FF6B3540',
  },
  mockBadgeText: {
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1,
  },
});
