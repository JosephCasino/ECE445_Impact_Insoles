import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Ellipse, Circle, Path, G, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { mockStartDataStream, MOCK_MODE } from './BLEManager';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function pressureToColor(value) {
  const n = value / 255;
  if (n < 0.10) return '#0D1020';
  if (n < 0.30) return '#1A3A6E';
  if (n < 0.50) return '#0066CC';
  if (n < 0.68) return '#00AA88';
  if (n < 0.84) return '#FFB020';
  return '#FF3B30';
}

function pressureToOpacity(value) {
  return Math.max(0.15, value / 255);
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────
// Cadence hook
// ─────────────────────────────────────────────────────────────
function useCadence(isStepEvent) {
  const timestamps = useRef([]);
  const [cadence, setCadence] = useState(0);
  useEffect(() => {
    if (!isStepEvent) return;
    const now = Date.now();
    timestamps.current.push(now);
    timestamps.current = timestamps.current.filter(t => now - t < 10000);
    if (timestamps.current.length >= 2) {
      const ts = timestamps.current;
      const intervals = ts.slice(1).map((t, i) => t - ts[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setCadence(Math.round(60000 / avg));
    }
  }, [isStepEvent]);
  return cadence;
}

// ─────────────────────────────────────────────────────────────
// Live Insole Heatmap
// Shows 8 sensor zones on an insole outline, colored by current pressure
// ─────────────────────────────────────────────────────────────
function LiveInsoleHeatmap({ sensors }) {
  // sensors: [heelL, heelR, archL, archR, ballL, ballR, toeL, toeR]
  const zones = [
    { label: 'TL', value: sensors[6], cx: 64,  cy: 30,  rx: 18, ry: 15 },
    { label: 'TR', value: sensors[7], cx: 116, cy: 30,  rx: 18, ry: 15 },
    { label: 'BL', value: sensors[4], cx: 60,  cy: 78,  rx: 22, ry: 18 },
    { label: 'BR', value: sensors[5], cx: 120, cy: 78,  rx: 22, ry: 18 },
    { label: 'AL', value: sensors[2], cx: 54,  cy: 140, rx: 17, ry: 26 },
    { label: 'AR', value: sensors[3], cx: 126, cy: 140, rx: 17, ry: 26 },
    { label: 'HL', value: sensors[0], cx: 64,  cy: 212, rx: 26, ry: 22 },
    { label: 'HR', value: sensors[1], cx: 116, cy: 212, rx: 26, ry: 22 },
  ];

  return (
    <Svg width={180} height={260} viewBox="0 0 180 260">
      {/* Insole outline */}
      <Path
        d="M90 8 C55 8,22 26,20 65 C18 98,28 128,32 158 C36 188,38 208,50 228 C60 244,76 254,90 254 C104 254,120 244,130 228 C142 208,144 188,148 158 C152 128,162 98,160 65 C158 26,125 8,90 8 Z"
        fill="#151821"
        stroke="#2A2F45"
        strokeWidth="1.5"
      />
      {/* Pressure zones */}
      {zones.map((z, i) => (
        <G key={i}>
          <Ellipse
            cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
            fill={pressureToColor(z.value)}
            opacity={pressureToOpacity(z.value)}
          />
          <SvgText
            x={z.cx} y={z.cy + 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#FFFFFF"
            opacity={0.85}
          >
            {z.value}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Post-run Foot Silhouette Heatmap
// Shows a foot shape with 8 zones colored by PEAK pressure
// ─────────────────────────────────────────────────────────────
function FootSilhouetteHeatmap({ peakSensors }) {
  const s = peakSensors;
  // Zone positions on a 200x360 foot silhouette canvas
  const zones = [
    { label: 'TOE L',  value: s[6], cx: 70,  cy: 38,  rx: 24, ry: 19 },
    { label: 'TOE R',  value: s[7], cx: 130, cy: 38,  rx: 24, ry: 19 },
    { label: 'BALL L', value: s[4], cx: 65,  cy: 102, rx: 27, ry: 23 },
    { label: 'BALL R', value: s[5], cx: 135, cy: 102, rx: 27, ry: 23 },
    { label: 'ARCH L', value: s[2], cx: 58,  cy: 192, rx: 21, ry: 34 },
    { label: 'ARCH R', value: s[3], cx: 142, cy: 192, rx: 21, ry: 34 },
    { label: 'HEEL L', value: s[0], cx: 72,  cy: 300, rx: 32, ry: 27 },
    { label: 'HEEL R', value: s[1], cx: 128, cy: 300, rx: 32, ry: 27 },
  ];

  return (
    <View style={footStyles.wrapper}>
      <Svg width={200} height={360} viewBox="0 0 200 360">
        {/* Foot silhouette */}
        <Path
          d="M100 12
             C62 12,28 34,26 84
             C24 126,34 164,38 208
             C42 248,44 278,57 304
             C68 326,86 340,100 340
             C114 340,132 326,143 304
             C156 278,158 248,162 208
             C166 164,176 126,174 84
             C172 34,138 12,100 12 Z"
          fill="#151821"
          stroke="#2A2F45"
          strokeWidth="2"
        />

        {/* Heat zones with glow effect using stacked ellipses */}
        {zones.map((z, i) => {
          const color = pressureToColor(z.value);
          const opacity = pressureToOpacity(z.value);
          return (
            <G key={i}>
              {/* Outer glow */}
              <Ellipse
                cx={z.cx} cy={z.cy}
                rx={z.rx + 8} ry={z.ry + 8}
                fill={color}
                opacity={opacity * 0.3}
              />
              {/* Mid glow */}
              <Ellipse
                cx={z.cx} cy={z.cy}
                rx={z.rx + 2} ry={z.ry + 2}
                fill={color}
                opacity={opacity * 0.6}
              />
              {/* Core */}
              <Ellipse
                cx={z.cx} cy={z.cy}
                rx={z.rx} ry={z.ry}
                fill={color}
                opacity={Math.min(1, opacity + 0.1)}
              />
              {/* Value label */}
              <SvgText
                x={z.cx} y={z.cy + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#FFFFFF"
              >
                {z.value}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Zone labels beside the foot */}
      <View style={footStyles.sideLabels}>
        <View style={footStyles.labelGroup}>
          <Text style={footStyles.sideLabel}>Toe</Text>
          <Text style={footStyles.sideLabel}>Ball</Text>
          <Text style={footStyles.sideLabel}>Arch</Text>
          <Text style={footStyles.sideLabel}>Heel</Text>
        </View>
      </View>

      {/* Color scale legend */}
      <View style={footStyles.legendRow}>
        <Text style={footStyles.legendText}>LOW</Text>
        <View style={footStyles.legendBar}>
          {['#1A3A6E','#0066CC','#00AA88','#FFB020','#FF3B30'].map((c, i) => (
            <View key={i} style={[footStyles.legendSegment, { backgroundColor: c }]} />
          ))}
        </View>
        <Text style={footStyles.legendText}>HIGH</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Main DataScreen — 3 phases: ready → recording → results
// ─────────────────────────────────────────────────────────────
export default function DataScreen({ navigation, route }) {
  const device = route?.params?.device;

  const [phase, setPhase]               = useState('ready');
  const [sensors, setSensors]           = useState([0,0,0,0,0,0,0,0]);
  const [isStepEvent, setIsStepEvent]   = useState(false);
  const [stepCount, setStepCount]       = useState(0);
  const [elapsed, setElapsed]           = useState(0);
  const [peakSensors, setPeakSensors]   = useState([0,0,0,0,0,0,0,0]);
  const [finalCadence, setFinalCadence] = useState(0);

  const stopStreamRef = useRef(null);
  const timerRef      = useRef(null);
  const stepFlash     = useRef(new Animated.Value(0)).current;
  const cadence       = useCadence(isStepEvent);

  // Green flash bar on each step
  useEffect(() => {
    if (!isStepEvent) return;
    Animated.sequence([
      Animated.timing(stepFlash, { toValue: 1, duration: 60,  useNativeDriver: true }),
      Animated.timing(stepFlash, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [isStepEvent]);

  // Elapsed timer
  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleStart = () => {
    setPhase('recording');
    setStepCount(0);
    setElapsed(0);
    setSensors([0,0,0,0,0,0,0,0]);
    setPeakSensors([0,0,0,0,0,0,0,0]);

    if (MOCK_MODE) {
      const stop = mockStartDataStream((data) => {
        setSensors(data.sensors);
        setIsStepEvent(data.isStepEvent);
        if (data.isStepEvent) setStepCount(c => c + 1);
        setPeakSensors(prev => prev.map((p, i) => Math.max(p, data.sensors[i])));
      });
      stopStreamRef.current = stop;
    }
  };

  const handleStop = () => {
    if (stopStreamRef.current) stopStreamRef.current();
    stopStreamRef.current = null;
    setFinalCadence(cadence);
    setPhase('results');
  };

  const handleNewRun = () => {
    setPhase('ready');
    setSensors([0,0,0,0,0,0,0,0]);
    setPeakSensors([0,0,0,0,0,0,0,0]);
    setStepCount(0);
    setElapsed(0);
    setFinalCadence(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopStreamRef.current) stopStreamRef.current();
      clearInterval(timerRef.current);
    };
  }, []);

  // Auto-generated insight from peak pressure pattern
  const getInsight = () => {
    const heel = Math.max(peakSensors[0], peakSensors[1]);
    const arch = Math.max(peakSensors[2], peakSensors[3]);
    const ball = Math.max(peakSensors[4], peakSensors[5]);
    const toe  = Math.max(peakSensors[6], peakSensors[7]);
    if (heel > ball && heel > toe)
      return 'Heavy heel strike detected. A more midfoot landing can reduce joint stress and improve running economy.';
    if (toe > heel && ball > heel)
      return 'Forefoot dominant pattern. This is efficient for speed, but watch for calf fatigue on longer efforts.';
    if (arch > heel && arch > ball)
      return 'Unusual arch loading detected. Check that your insoles are seated correctly in your shoes.';
    return 'Balanced foot strike across all zones. Your form looks solid — keep it up!';
  };

  // ── READY ─────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RECORD RUN</Text>
          {MOCK_MODE
            ? <Text style={styles.mockTag}>MOCK</Text>
            : <View style={{ width: 55 }} />}
        </View>

        <View style={styles.readyContent}>
          <Text style={styles.readyEmoji}>👟</Text>
          <Text style={styles.readyTitle}>Ready to Record</Text>
          <Text style={styles.readySubtitle}>
            Put on your insoles and press Start when you begin your run.
            After you stop, you'll see a full impact heatmap of your foot.
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>📡  {device?.name ?? 'Mock Device'}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>⚡  {MOCK_MODE ? '10 Hz Mock' : '100 Hz BLE'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>▶  START RUN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── RECORDING ─────────────────────────────────────────────
  if (phase === 'recording') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Step flash bar at top */}
        <Animated.View style={[styles.flashBar, { opacity: stepFlash }]} />

        <View style={styles.header}>
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recLabel}>REC</Text>
          </View>
          <Text style={styles.headerTitle}>RECORDING</Text>
          <View style={{ width: 55 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.recordingContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Time + Steps — the two primary live stats */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ELAPSED</Text>
              <Text style={styles.statValueLarge}>{formatTime(elapsed)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={[styles.statValueLarge, { color: '#FF6B35' }]}>{stepCount}</Text>
            </View>
          </View>

          {/* Live insole heatmap */}
          <View style={styles.liveHeatmapCard}>
            <Text style={styles.cardTitle}>LIVE PRESSURE MAP</Text>
            <Text style={styles.cardSub}>
              T=Toe · B=Ball · A=Arch · H=Heel · L/R=Left/Right
            </Text>
            <View style={styles.insoleRow}>
              <LiveInsoleHeatmap sensors={sensors} />

              {/* Pressure scale beside insole */}
              <View style={styles.pressureScale}>
                <Text style={styles.scaleLabel}>HIGH</Text>
                <View style={styles.scaleBar}>
                  {['#FF3B30','#FFB020','#00AA88','#0066CC','#1A3A6E'].map((c, i) => (
                    <View key={i} style={[styles.scaleSegment, { backgroundColor: c }]} />
                  ))}
                </View>
                <Text style={styles.scaleLabel}>LOW</Text>
              </View>
            </View>
          </View>

          {/* Stop button */}
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop} activeOpacity={0.85}>
            <Text style={styles.stopBtnText}>⏹  STOP & VIEW RESULTS</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNewRun}>
          <Text style={styles.backBtn}>← NEW RUN</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RUN RESULTS</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary row */}
        <View style={styles.summaryRow}>
          {[
            { label: 'STEPS',   value: stepCount,           color: '#FFFFFF'  },
            { label: 'TIME',    value: formatTime(elapsed),  color: '#FFFFFF'  },
            { label: 'CADENCE', value: finalCadence || '—', color: '#00E5A0' },
          ].map((s, i) => (
            <View key={i} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{s.label}</Text>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              {s.label === 'CADENCE' && (
                <Text style={styles.summaryUnit}>BPM</Text>
              )}
            </View>
          ))}
        </View>

        {/* Foot silhouette heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IMPACT HEATMAP</Text>
          <Text style={styles.sectionSub}>
            Peak pressure recorded at each zone across your entire run.
            Brighter = more impact.
          </Text>
          <View style={styles.heatmapCard}>
            <FootSilhouetteHeatmap peakSensors={peakSensors} />
          </View>
        </View>

        {/* Zone breakdown bars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ZONE BREAKDOWN</Text>
          {[
            { label: 'Heel', l: peakSensors[0], r: peakSensors[1] },
            { label: 'Arch', l: peakSensors[2], r: peakSensors[3] },
            { label: 'Ball', l: peakSensors[4], r: peakSensors[5] },
            { label: 'Toe',  l: peakSensors[6], r: peakSensors[7] },
          ].map((z, i) => {
            const avg = Math.round((z.l + z.r) / 2);
            const color = pressureToColor(avg);
            return (
              <View key={i} style={styles.zoneRow}>
                <Text style={styles.zoneLabel}>{z.label}</Text>
                <View style={styles.zoneTrack}>
                  <View style={[styles.zoneFill, {
                    width: `${(avg / 255) * 100}%`,
                    backgroundColor: color,
                  }]} />
                </View>
                <Text style={[styles.zoneVal, { color }]}>{avg}</Text>
              </View>
            );
          })}
        </View>

        {/* Auto insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightHeading}>💡  INSIGHT</Text>
          <Text style={styles.insightBody}>{getInsight()}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleNewRun} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>▶  RECORD ANOTHER RUN</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0C14' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#1E2235',
  },
  backBtn:     { color: '#FF6B35', fontSize: 13, fontWeight: '700', letterSpacing: 1, width: 70 },
  headerTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 4 },
  mockTag: {
    color: '#FF6B35', fontSize: 10, fontWeight: '700', letterSpacing: 1,
    borderWidth: 1, borderColor: '#FF6B35', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, textAlign: 'center', width: 55,
  },

  flashBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, backgroundColor: '#00E5A0', zIndex: 10,
  },

  recBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, width: 55 },
  recDot:    { width: 9, height: 9, borderRadius: 5, backgroundColor: '#FF3B30' },
  recLabel:  { color: '#FF3B30', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Ready screen
  readyContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 20,
  },
  readyEmoji:    { fontSize: 64 },
  readyTitle:    { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  readySubtitle: {
    fontSize: 14, color: '#8A8FA8', textAlign: 'center', lineHeight: 22,
  },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    backgroundColor: '#151821', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1E2235',
  },
  chipText: { color: '#8A8FA8', fontSize: 12, fontWeight: '600' },

  // Recording screen
  recordingContent: { padding: 20 },
  statRow:          { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#151821', borderRadius: 16,
    borderWidth: 1, borderColor: '#1E2235',
    paddingVertical: 20, alignItems: 'center',
  },
  statLabel:      { fontSize: 9, color: '#8A8FA8', letterSpacing: 2, marginBottom: 8 },
  statValueLarge: { fontSize: 36, fontWeight: '900', color: '#FFFFFF' },

  liveHeatmapCard: {
    backgroundColor: '#151821', borderRadius: 16,
    borderWidth: 1, borderColor: '#1E2235',
    padding: 18, marginBottom: 24, alignItems: 'center',
  },
  cardTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3, marginBottom: 4 },
  cardSub:   { fontSize: 11, color: '#8A8FA8', marginBottom: 16, textAlign: 'center' },
  insoleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  // Vertical pressure scale
  pressureScale: { alignItems: 'center', gap: 6 },
  scaleLabel:    { fontSize: 9, color: '#8A8FA8', letterSpacing: 1 },
  scaleBar:      { width: 12, height: 120, borderRadius: 6, overflow: 'hidden', flexDirection: 'column' },
  scaleSegment:  { flex: 1 },

  // Buttons
  primaryBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', width: '100%',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  stopBtn: {
    borderWidth: 1, borderColor: '#FF3B30', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', width: '100%',
    backgroundColor: '#1E2235',
  },
  stopBtnText: { color: '#FF3B30', fontSize: 14, fontWeight: '900', letterSpacing: 2 },

  // Results screen
  resultsContent: { padding: 20 },
  summaryRow:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1, backgroundColor: '#151821', borderRadius: 14,
    borderWidth: 1, borderColor: '#1E2235',
    padding: 14, alignItems: 'center',
  },
  summaryLabel: { fontSize: 9, color: '#8A8FA8', letterSpacing: 2, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  summaryUnit:  { fontSize: 9, color: '#8A8FA8', marginTop: 2, letterSpacing: 1 },

  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3, marginBottom: 4 },
  sectionSub:   { fontSize: 12, color: '#8A8FA8', marginBottom: 14, lineHeight: 18 },

  heatmapCard: {
    backgroundColor: '#151821', borderRadius: 16,
    borderWidth: 1, borderColor: '#1E2235',
    padding: 20, alignItems: 'center',
  },

  zoneRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  zoneLabel: { width: 34, fontSize: 12, color: '#8A8FA8', fontWeight: '600' },
  zoneTrack: { flex: 1, height: 10, backgroundColor: '#1E2235', borderRadius: 5, overflow: 'hidden' },
  zoneFill:  { height: '100%', borderRadius: 5 },
  zoneVal:   { width: 30, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  insightCard: {
    backgroundColor: '#151821', borderRadius: 14,
    borderWidth: 1, borderColor: '#FF6B3530',
    padding: 18, marginBottom: 20,
  },
  insightHeading: { fontSize: 11, fontWeight: '900', color: '#FF6B35', letterSpacing: 2, marginBottom: 8 },
  insightBody:    { fontSize: 13, color: '#C0C4D6', lineHeight: 20 },
});

const footStyles = StyleSheet.create({
  wrapper:    { alignItems: 'center' },
  sideLabels: {
    position: 'absolute', right: -40, top: 0, bottom: 0,
    justifyContent: 'space-around', paddingVertical: 20,
  },
  labelGroup: { gap: 48, alignItems: 'flex-start' },
  sideLabel:  { fontSize: 10, color: '#8A8FA8', letterSpacing: 1 },
  legendRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  legendText: { fontSize: 10, color: '#8A8FA8' },
  legendBar:  { flexDirection: 'row', width: 130, height: 8, borderRadius: 4, overflow: 'hidden' },
  legendSegment: { flex: 1 },
});