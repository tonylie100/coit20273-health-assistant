import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

import {
  getHealthState,
  getWellnessLabel,
  subscribeToHealthState,
  type HealthState,
} from '../services/healthState';

import {
  isHealthStreamRunning,
  startHealthStream,
  stopHealthStream,
  getMonitoringStartedAt,
} from '../services/healthStream';

const C = {
  bg: '#080F18',
  sidebar: '#101827',
  card: '#182238',
  card2: '#202A43',
  border: '#2A3650',
  text: '#F4F6FF',
  secondary: '#B2BED1',
  muted: '#8393AA',
  green: '#49D6A0',
  greenBg: '#153B35',
  greenBorder: '#27675A',
  orange: '#FF9A62',
  orangeBg: '#493126',
  red: '#F16C76',
  redBg: '#40232F',
  blue: '#78BFFF',
  blueBg: '#172D46',
  purple: '#B5A4FF',
  purpleBg: '#302A4C',
  heart: '#F07887',
  oxygen: '#78BFFF',
  temperature: '#FFB86B',
  steps: '#49D6A0',
  calories: '#FF9A62',
  activity: '#68C8C0',
  water: '#78BFFF',
  sleep: '#B5A4FF',
};

type MetricColor =
  | 'heart'
  | 'oxygen'
  | 'temperature'
  | 'steps'
  | 'calories'
  | 'activity'
  | 'water'
  | 'sleep';

const metricColors: Record<MetricColor, string> = {
  heart: C.heart,
  oxygen: C.oxygen,
  temperature: C.temperature,
  steps: C.steps,
  calories: C.calories,
  activity: C.activity,
  water: C.water,
  sleep: C.sleep,
};

export default function LiveHealthScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const isCompact = width < 480;

  const [health, setHealth] = useState<HealthState>(
    getHealthState(),
  );
  const [running, setRunning] = useState(
    isHealthStreamRunning(),
  );
  const [startedAt, setStartedAt] = useState<string | null>(
    getMonitoringStartedAt(),
  );

  // Keep the latest 30 heart-rate readings from the current session.
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const previousStreamState = useRef(isHealthStreamRunning());

  useEffect(() => {
    const unsubscribe = subscribeToHealthState((state) => {
      const streamRunning = isHealthStreamRunning();
      const wasRunning = previousStreamState.current;

      // If a new stream starts elsewhere, begin a fresh chart history.
      if (streamRunning && !wasRunning) {
        setHeartRateHistory([]);
      }

      previousStreamState.current = streamRunning;

      setHealth({ ...state });
      setRunning(streamRunning);
      setStartedAt(getMonitoringStartedAt());

      // Capture actual readings emitted by the existing demo stream.
      if (streamRunning && state.heartRate !== null) {
        setHeartRateHistory((previous) => {
          const next = [...previous, state.heartRate as number];
          return next.slice(-30);
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRunning(isHealthStreamRunning());
      setStartedAt(getMonitoringStartedAt());
      setHealth({ ...getHealthState() });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleMonitoring = () => {
    if (isHealthStreamRunning()) {
      stopHealthStream();
      previousStreamState.current = false;
      setRunning(false);
      setStartedAt(null);
    } else {
      setHeartRateHistory([]);
      previousStreamState.current = true;
      startHealthStream();
      setRunning(true);
      setStartedAt(getMonitoringStartedAt());
    }
  };

    const sessionDuration = (() => {
    if (!running || !startedAt) return '00:00';

    const startedAtMs = new Date(startedAt).getTime();

    if (!Number.isFinite(startedAtMs)) return '00:00';

    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - startedAtMs) / 1000)
    );

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  })();

  const freshness = getFreshnessLabel(health.lastUpdated);
  const heartStatus = getHeartStatus(health.heartRate);
  const oxygenStatus = getOxygenStatus(health.oxygenSaturation);
  const wellnessLabel = getWellnessLabel(health.wellnessScore);


  const hasHealthData =
    health.heartRate !== null ||
    health.oxygenSaturation !== null ||
    health.sleepHours !== null ||
    health.steps > 0 ||
    health.waterIntake > 0;

  const wellnessScore = health.wellnessScore;

const wellnessFactors = [
  {
    label: 'Heart rate',
    available: health.heartRate !== null,
    value:
      health.heartRate !== null
        ? `${health.heartRate} BPM`
        : 'Unavailable',
  },
  {
    label: 'Activity',
    available: health.steps > 0,
    value:
      health.steps > 0
        ? `${formatNumber(health.steps)} steps`
        : 'Unavailable',
  },
  {
    label: 'Sleep',
    available: health.sleepHours !== null,
    value:
      health.sleepHours !== null
        ? `${health.sleepHours.toFixed(1)} hours`
        : 'Unavailable',
  },
  {
    label: 'Hydration',
    available: health.waterIntake > 0,
    value:
      health.waterIntake > 0
        ? `${health.waterIntake.toFixed(1)} L`
        : 'Unavailable',
  },
];

const availableWellnessFactors =
  wellnessFactors.filter((factor) => factor.available).length;

const contentPadding = isCompact ? 14 : isWide ? 28 : 20;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: contentPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <View style={styles.headerCenter}>
              <View style={styles.eyebrowRow}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: running ? C.green : C.muted,
                    },
                  ]}
                />
                <Text style={styles.eyebrow}>
                  REAL-TIME WELLNESS
                </Text>
              </View>

              <Text style={styles.headerTitle}>Live Health</Text>
              <Text style={styles.headerSubtitle}>
                Monitor your latest wellness signals in one place
              </Text>
            </View>

            <View
              style={[
                styles.pill,
                running ? styles.pillLive : styles.pillIdle,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: running ? C.green : C.muted,
                  },
                ]}
              />
              <Text
                style={[
                  styles.pillText,
                  running && { color: C.green },
                ]}
              >
                {running ? 'LIVE' : 'PAUSED'}
              </Text>
            </View>
          </View>

          {/* DEVICE + STATUS */}
          <View style={[styles.topGrid, isWide && styles.topGridWide]}>
            <View
              style={[
                styles.deviceCard,
                isWide && styles.deviceCardWide,
              ]}
            >
              <View style={styles.deviceHeader}>
                <View
                  style={[
                    styles.deviceIcon,
                    running && styles.deviceIconLive,
                  ]}
                >
                  <Text style={styles.deviceIconText}>⌚</Text>
                </View>

                <View style={styles.deviceCopy}>
                  <View style={styles.deviceNameRow}>
                    <Text style={styles.deviceName}>
                      {health.deviceName || 'Demo Wearable'}
                    </Text>

                    <View
                      style={[
                        styles.pill,
                        running ? styles.pillLive : styles.pillIdle,
                      ]}
                    >
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: running
                              ? C.green
                              : C.muted,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.pillText,
                          running && { color: C.green },
                        ]}
                      >
                        {running ? 'Monitoring' : 'Paused'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.bodyMuted}>
                    {running
                      ? 'Simulated wearable values are updating in real time.'
                      : 'Start the demo stream to experience continuous health updates.'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.sessionRow}>
                <View>
                  <Text style={styles.caption}>
                    MONITORING SESSION
                  </Text>
                  <Text style={styles.sessionTime}>
                    {sessionDuration}
                  </Text>
                </View>

                <View style={styles.sessionMeta}>
                  <Text style={styles.freshness}>{freshness}</Text>
                  <Text style={styles.caption}>SIMULATED DATA</Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  running
                    ? 'Stop health monitoring'
                    : 'Start health monitoring'
                }
                onPress={toggleMonitoring}
                style={({ pressed }) => [
                  styles.monitorButton,
                  running && styles.monitorButtonStop,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.monitorButtonIcon}>
                  {running ? '■' : '▶'}
                </Text>
                <Text style={styles.monitorButtonText}>
                  {running
                    ? 'Stop monitoring'
                    : 'Start live monitoring'}
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.statusCard,
                isWide && styles.statusCardWide,
              ]}
            >
              <View style={styles.statusHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusEyebrow}>
                    MONITORING STATUS
                  </Text>
                  <Text style={styles.statusTitle}>
                    {running
                      ? 'Everything is updating'
                      : 'Ready when you are'}
                  </Text>
                </View>

                <View style={styles.statusCheck}>
                  <Text style={styles.statusCheckText}>
                    {running ? '✓' : '○'}
                  </Text>
                </View>
              </View>

              <StatusRow
                label="Wearable stream"
                value={running ? 'Active' : 'Paused'}
                active={running}
              />
              <StatusRow
                label="Health context"
                value={hasHealthData ? 'Available' : 'Waiting'}
                active={hasHealthData}
              />
              <StatusRow
                label="AI context"
                value={hasHealthData ? 'Ready' : 'Waiting'}
                active={hasHealthData}
              />

              <Text style={styles.statusFooter}>
                Latest values are shared with the dashboard and AI assistant.
              </Text>
            </View>
          </View>

          {/* DEMO NOTICE */}
          <View style={styles.demoNotice}>
            <View style={styles.demoIcon}>
              <Text style={styles.demoIconText}>i</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.deviceNameRow}>
                <Text style={styles.cardHeading}>
                  Demo wearable simulation
                </Text>
                <Text style={styles.simulatedBadge}>SIMULATED</Text>
              </View>
              <Text style={styles.bodyMuted}>
                These values are generated by the prototype simulation. They do
                not come from a physical wearable and are not clinical measurements.
              </Text>
            </View>
          </View>

          {/* HEART RATE */}
          <SectionHeading
            eyebrow="PRIMARY SIGNAL"
            title="Heart rate"
            subtitle="Your current simulated heart-rate reading"
          />

          <View style={styles.heartCard}>
            <View
              style={[
                styles.heartTop,
                !isWide && styles.heartTopCompact,
              ]}
            >
              <View style={styles.heartIdentity}>
                <View style={styles.heartIconCircle}>
                  <Text style={styles.heartIcon}>♥</Text>
                </View>

                <View style={styles.heartCopy}>
                  <Text style={styles.caption}>CURRENT HEART RATE</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.heartValue}>
                      {health.heartRate ?? '--'}
                    </Text>
                    <Text style={styles.valueUnit}>BPM</Text>
                  </View>
                  <Text
                    style={[
                      styles.readingStatus,
                      { color: heartStatus.color },
                    ]}
                  >
                    ● {heartStatus.label}
                  </Text>
                </View>
              </View>

              <View style={styles.heartMeta}>
                <Text
                  style={[
                    styles.simulatedBadge,
                    running && styles.liveBadge,
                  ]}
                >
                  {running ? '● LIVE' : 'PAUSED'}
                </Text>
                <Text style={styles.freshness}>{freshness}</Text>
              </View>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.caption}>
                    SIGNAL VISUALISATION
                  </Text>
                  <Text style={styles.cardHeading}>
                    Prototype live signal
                  </Text>
                </View>
                <Text
                  style={[
                    styles.chartStatus,
                    { color: running ? C.green : C.muted },
                  ]}
                >
                  {running ? 'Updating' : 'Waiting'}
                </Text>
              </View>

              <MiniHeartChart
                active={running}
                values={heartRateHistory}
              />

              <View style={styles.chartFooter}>
                <Text style={styles.caption}>
                  Session readings only — not historical clinical data
                </Text>
                <Text style={styles.chartLegend}>● Simulated</Text>
              </View>
            </View>
          </View>

          {/* METRICS */}
          <SectionHeading
            eyebrow="LIVE READINGS"
            title="Current health metrics"
            subtitle="The latest values available from the shared health state"
          />

          <View style={styles.metricsGrid}>
            <LiveMetricCard
              icon="🫁"
              label="Oxygen"
              value={
                health.oxygenSaturation !== null
                  ? String(health.oxygenSaturation)
                  : '--'
              }
              unit="%"
              status={
                health.oxygenSaturation !== null
                  ? oxygenStatus.label
                  : 'Waiting for reading'
              }
              statusColor={
                health.oxygenSaturation !== null
                  ? oxygenStatus.color
                  : undefined
              }
              color="oxygen"
              wide={isWide}
            />

            <LiveMetricCard
              icon="🌡"
              label="Temperature"
              value={
                health.temperatureC !== null
                  ? health.temperatureC.toFixed(1)
                  : '--'
              }
              unit="°C"
              status={
                health.temperatureC !== null
                  ? 'Simulated reading'
                  : 'Waiting for reading'
              }
              color="temperature"
              wide={isWide}
            />

            <LiveMetricCard
              icon="👟"
              label="Steps"
              value={formatNumber(health.steps)}
              unit=""
              status={`${progress(health.steps, health.stepGoal)}% of daily goal`}
              color="steps"
              progressValue={progress(health.steps, health.stepGoal)}
              wide={isWide}
            />

            <LiveMetricCard
              icon="🔥"
              label="Calories"
              value={Math.round(health.caloriesBurned).toString()}
              unit="kcal"
              status="Estimated activity total"
              color="calories"
              wide={isWide}
            />

            <LiveMetricCard
              icon="⚡"
              label="Active time"
              value={Math.round(health.activeMinutes).toString()}
              unit="min"
              status="Movement today"
              color="activity"
              wide={isWide}
            />

            <LiveMetricCard
              icon="📍"
              label="Distance"
              value={health.distanceKm.toFixed(2)}
              unit="km"
              status="Distance today"
              color="steps"
              wide={isWide}
            />

            <LiveMetricCard
              icon="💧"
              label="Hydration"
              value={health.waterIntake.toFixed(1)}
              unit="L"
              status={`${progress(health.waterIntake, health.waterGoalLitres)}% of daily goal`}
              color="water"
              progressValue={progress(
                health.waterIntake,
                health.waterGoalLitres,
              )}
              wide={isWide}
            />

            <LiveMetricCard
              icon="😴"
              label="Sleep"
              value={
                health.sleepHours !== null
                  ? health.sleepHours.toFixed(1)
                  : '--'
              }
              unit="hrs"
              status={`${progress(health.sleepHours ?? 0, health.sleepGoalHours)}% of target`}
              color="sleep"
              progressValue={progress(
                health.sleepHours ?? 0,
                health.sleepGoalHours,
              )}
              wide={isWide}
            />
          </View>

          {/* WELLNESS SCORE */}
          <SectionHeading
            eyebrow="WELLNESS SUMMARY"
            title="Today's wellness"
            subtitle="A prototype indicator based on the available health information"
          />

          <View
            style={[
              styles.wellnessCard,
              !isWide && styles.wellnessCardCompact,
            ]}
          >
            <View style={styles.scoreColumn}>
              <View style={styles.scoreRing}>
                <View style={styles.scoreInner}>
                  <Text style={styles.scoreValue}>
                    {wellnessScore !== null
                      ? Math.round(wellnessScore)
                      : '--'}
                  </Text>
                  <Text style={styles.scoreOutOf}>/100</Text>
                </View>
              </View>
              <Text style={styles.caption}>WELLNESS SCORE</Text>
            </View>

            <View style={styles.wellnessCopy}>
              <Text style={styles.wellnessLabel}>
                {wellnessScore !== null
                  ? wellnessLabel
                  : 'Waiting for data'}
              </Text>
              <Text style={styles.cardHeading}>
                {wellnessScore !== null
                  ? 'Your current wellness snapshot'
                  : 'Start monitoring to build your snapshot'}
              </Text>
              <Text style={styles.bodyMuted}>
                This score uses your existing prototype calculation. It is a
                wellness indicator, not a clinical assessment.
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        wellnessScore !== null
                          ? Math.max(0, Math.min(100, wellnessScore))
                          : 0
                      }%`,
                    },
                  ]}
                />
              </View>

              <Text style={styles.caption}>
  DATA COVERAGE
</Text>

<Text style={styles.bodyMuted}>
  {availableWellnessFactors} of 4 factors available
</Text>

<View style={styles.wellnessFactors}>
  {wellnessFactors.map((factor) => (
    <View
      key={factor.label}
      style={styles.wellnessFactorRow}
    >
      <View style={styles.wellnessFactorCopy}>
        <View
          style={[
            styles.wellnessFactorDot,
            {
              backgroundColor: factor.available
                ? C.green
                : C.muted,
            },
          ]}
        />

        <Text style={styles.wellnessFactorLabel}>
          {factor.label}
        </Text>
      </View>

      <Text
        style={[
          styles.wellnessFactorValue,
          !factor.available &&
            styles.wellnessFactorUnavailable,
        ]}
      >
        {factor.value}
      </Text>
    </View>
  ))}
</View>

<Text style={styles.bodyMuted}>
  The score uses available inputs in the existing prototype
  calculation. It is a wellness indicator, not a clinical
  assessment.
</Text>
            </View>
          </View>

          {/* MONITORING SIGNALS */}
          <SectionHeading
            eyebrow="SYSTEM STATUS"
            title="Monitoring signals"
            subtitle="A quick view of what the prototype currently has available"
          />

          <View style={styles.signalCard}>
            <SignalRow
              icon="⌚"
              title="Wearable connection"
              value={running ? 'Demo stream active' : 'Monitoring paused'}
              active={running}
            />
            <SignalRow
              icon="♥"
              title="Heart rate"
              value={
                health.heartRate !== null
                  ? 'Reading available'
                  : 'Waiting for reading'
              }
              active={health.heartRate !== null}
            />
            <SignalRow
              icon="🫁"
              title="Oxygen saturation"
              value={
                health.oxygenSaturation !== null
                  ? 'Reading available'
                  : 'Waiting for reading'
              }
              active={health.oxygenSaturation !== null}
            />
            <SignalRow
              icon="◌"
              title="Health data stream"
              value={running ? 'Live updates' : 'Stopped'}
              active={running}
            />
            <SignalRow
              icon="✦"
              title="AI health context"
              value={hasHealthData ? 'Available to assistant' : 'Waiting for data'}
              active={hasHealthData}
              last
            />
          </View>

          {/* AI INSIGHT */}
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIcon}>
                <Text style={styles.aiIconText}>✦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiEyebrow}>AI HEALTH ASSISTANT</Text>
                <Text style={styles.aiTitle}>Your health context</Text>
              </View>
              <Text style={styles.aiBadge}>
                {running ? 'LIVE CONTEXT' : 'WAITING'}
              </Text>
            </View>

            <Text style={styles.aiFreshness}>
              {running
                ? `Latest context · ${freshness}`
                : 'Start monitoring to provide live context'}
            </Text>
            <Text style={styles.aiBody}>
              {getLiveInsight(health, running)}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ask AI about my health"
              onPress={() => router.push('/chatbot')}
              style={({ pressed }) => [
                styles.aiButton,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.aiButtonIcon}>
                <Text style={styles.aiButtonIconText}>✦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiButtonTitle}>
                  Ask AI about my health
                </Text>
                <Text style={styles.aiButtonSubtitle}>
                  Use the latest available health context
                </Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.actions}>
            <ActionCard
              icon="＋"
              title="Add health data"
              subtitle="Record a manual wellness reading"
              onPress={() => router.push('/health-data')}
            />
            <ActionCard
              icon="✦"
              title="Talk to AI"
              subtitle="Ask about your current wellness context"
              onPress={() => router.push('/chatbot')}
            />
            <ActionCard
              icon="⌂"
              title="Dashboard"
              subtitle="Return to your health overview"
              onPress={() => router.push('/')}
            />
          </View>

          {/* DISCLAIMER */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerIcon}>i</Text>
            <Text style={styles.disclaimerText}>
              Demo wellness information is for general informational purposes
              only. Simulated readings are not clinical measurements. This
              application does not provide a medical diagnosis or replace
              professional medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function StatusRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusRowLabel}>
        <View
          style={[
            styles.dot,
            { backgroundColor: active ? C.green : C.muted },
          ]}
        />
        <Text style={styles.statusRowText}>{label}</Text>
      </View>
      <Text
        style={[
          styles.statusRowValue,
          active && { color: C.green },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function LiveMetricCard({
  icon,
  label,
  value,
  unit,
  status,
  statusColor,
  color,
  progressValue,
  wide,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  statusColor?: string;
  color: MetricColor;
  progressValue?: number;
  wide: boolean;
}) {
  const accent = metricColors[color];

  return (
    <View
      style={[
        styles.metricCard,
        wide ? styles.metricWide : styles.metricMobile,
      ]}
    >
      <View style={styles.metricTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: `${accent}20` },
          ]}
        >
          <Text style={styles.metricIconText}>{icon}</Text>
        </View>
        <View style={[styles.metricDot, { backgroundColor: accent }]} />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {!!unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>

      <Text
        style={[
          styles.metricStatus,
          statusColor && { color: statusColor },
        ]}
      >
        {status}
      </Text>

      {progressValue !== undefined && (
        <View style={styles.metricProgressTrack}>
          <View
            style={[
              styles.metricProgressFill,
              {
                width: `${Math.max(0, Math.min(100, progressValue))}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

function SignalRow({
  icon,
  title,
  value,
  active,
  last = false,
}: {
  icon: string;
  title: string;
  value: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.signalRow, !last && styles.signalRowBorder]}>
      <View style={styles.signalRowLeft}>
        <View style={[styles.signalIcon, active && styles.signalIconActive]}>
          <Text style={styles.signalIconText}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.signalTitle}>{title}</Text>
          <Text style={styles.bodyMuted}>{value}</Text>
        </View>
      </View>

      <View
        style={[
          styles.signalBadge,
          active ? styles.signalBadgeActive : styles.signalBadgeIdle,
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: active ? C.green : C.muted },
          ]}
        />
        <Text
          style={[
            styles.signalBadgeText,
            active && { color: C.green },
          ]}
        >
          {active ? 'Ready' : 'Waiting'}
        </Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

/**
 * Displays only heart-rate readings captured during this monitoring session.
 * These values are generated by the existing demo stream, not a physical device.
 */
function MiniHeartChart({
  active,
  values,
}: {
  active: boolean;
  values: number[];
}) {
  const minRate = values.length > 0 ? Math.min(...values) : 0;
  const maxRate = values.length > 0 ? Math.max(...values) : 0;
  const range = Math.max(maxRate - minRate, 1);

  return (
    <View style={styles.chart}>
      <View style={[styles.chartGridLine, { top: 20 }]} />
      <View style={[styles.chartGridLine, { top: 52 }]} />
      <View style={[styles.chartGridLine, { bottom: 8 }]} />

      {values.length > 0 ? (
        <View style={styles.chartBars}>
          {values.map((rate, index) => {
            const normalized = (rate - minRate) / range;
            const height = 20 + normalized * 60;

            return (
              <View
                key={`${index}-${rate}`}
                style={[
                  styles.chartBar,
                  {
                    height,
                    opacity:
                      0.45 +
                      (index / Math.max(values.length - 1, 1)) * 0.55,
                  },
                ]}
              />
            );
          })}
        </View>
      ) : (
        <View style={styles.chartEmpty}>
          <Text style={styles.chartEmptyText}>
            {active
              ? 'Collecting session readings…'
              : 'Start monitoring to collect readings'}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function progress(value: number, goal: number) {
  if (!goal || goal <= 0) return 0;
  return Math.round(Math.min(100, Math.max(0, (value / goal) * 100)));
}

function getFreshnessLabel(lastUpdated: string | null) {
  if (!lastUpdated) return 'Waiting for health data';

  const updatedAt = new Date(lastUpdated).getTime();
  if (!Number.isFinite(updatedAt)) return 'Waiting for health data';

  const secondsAgo = Math.max(
    0,
    Math.floor((Date.now() - updatedAt) / 1000),
  );

  if (secondsAgo < 5) return 'Updated just now';
  if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `Updated ${minutesAgo}m ago`;

  return 'Health data may be out of date';
}

function getHeartStatus(value: number | null) {
  if (value === null) {
    return { label: 'Waiting for reading', color: C.muted };
  }

  if (value >= 60 && value <= 100) {
    return { label: 'Within prototype reference', color: C.green };
  }

  return { label: 'Outside prototype reference', color: C.orange };
}

function getOxygenStatus(value: number | null) {
  if (value === null) {
    return { label: 'Waiting', color: C.muted };
  }

  if (value >= 95) {
    return { label: 'Within prototype reference', color: C.green };
  }

  return { label: 'Review reading', color: C.orange };
}

function getLiveInsight(health: HealthState, running: boolean) {
  if (!running) {
    return 'Start monitoring to let the assistant use the latest simulated wearable readings as part of your wellness context.';
  }

  if (health.heartRate !== null && health.heartRate > 100) {
    return 'The current simulated heart-rate reading is above the simple prototype reference range. If you are active, allow yourself time to recover and pay attention to how you feel.';
  }

  if (health.sleepHours !== null && health.sleepHours < 6) {
    return 'Your available sleep data is below the target used by this prototype. Recovery and consistent sleep could be a useful focus today.';
  }

  if (health.waterIntake > 0 && health.waterIntake < 1.5) {
    return 'Your current hydration is below the daily target used by this prototype. Consider drinking water regularly throughout the day.';
  }

  if (health.steps > 0 && health.steps >= health.stepGoal) {
    return 'You have reached your current activity target. Keep balancing movement with hydration and recovery.';
  }

  if (health.wellnessScore !== null && health.wellnessScore >= 75) {
    return 'Your current wellness snapshot is positive across the available prototype data. Keep building consistency across activity, hydration and recovery.';
  }

  return 'Your live monitoring session is active. The latest simulated readings are shared across the health dashboard and can be used by the AI assistant.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  content: { paddingTop: 24, paddingBottom: 50 },
  shell: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 31, lineHeight: 31, color: C.text, marginTop: -3 },
  headerCenter: { flex: 1, minWidth: 0, marginLeft: 14 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  eyebrow: { color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  headerTitle: { fontSize: 25, lineHeight: 31, fontWeight: '900', color: C.text },
  headerSubtitle: { fontSize: 11, lineHeight: 17, color: C.secondary, marginTop: 3 },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  pillLive: { backgroundColor: C.greenBg },
  pillIdle: { backgroundColor: C.card2 },
  pillText: { fontSize: 9, fontWeight: '900', color: C.secondary },

  topGrid: { width: '100%' },
  topGridWide: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  deviceCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 12,
  },
  deviceCardWide: { flex: 1.4, marginBottom: 0 },
  deviceHeader: { flexDirection: 'row', alignItems: 'center' },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.card2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconLive: { backgroundColor: C.greenBg },
  deviceIconText: { fontSize: 27 },
  deviceCopy: { flex: 1, minWidth: 0, marginLeft: 13 },
  deviceNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  deviceName: { fontSize: 14, fontWeight: '900', color: C.text },
  bodyMuted: { color: C.secondary, fontSize: 10, lineHeight: 16, marginTop: 4 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 17 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sessionMeta: { alignItems: 'flex-end' },
  caption: { color: C.muted, fontSize: 8, lineHeight: 12, fontWeight: '900', letterSpacing: 0.8 },
  sessionTime: { fontSize: 19, fontWeight: '900', color: C.text, marginTop: 3 },
  freshness: { fontSize: 9, color: C.green, fontWeight: '700', marginBottom: 5 },
  monitorButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#C96D31',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 16,
  },
  monitorButtonStop: { backgroundColor: '#A9444E' },
  monitorButtonIcon: { color: '#FFFFFF', fontSize: 12, marginRight: 9 },
  monitorButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },

  statusCard: { backgroundColor: '#123F3D', borderRadius: 22, padding: 18, marginBottom: 12 },
  statusCardWide: { flex: 1, marginBottom: 0 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  statusEyebrow: { color: '#9ADACD', fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  statusTitle: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '900', marginTop: 4 },
  statusCheck: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  statusCheckText: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  statusRowLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusRowText: { color: '#D4E6E3', fontSize: 10 },
  statusRowValue: { color: '#A6C6C0', fontSize: 9, fontWeight: '900' },
  statusFooter: { color: '#A9D3CB', fontSize: 9, lineHeight: 15, marginTop: 13 },

  demoNotice: {
    flexDirection: 'row',
    backgroundColor: C.blueBg,
    borderWidth: 1,
    borderColor: '#294967',
    borderRadius: 15,
    padding: 13,
    marginVertical: 18,
  },
  demoIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#2B6F91', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  demoIconText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  cardHeading: { color: C.text, fontSize: 11, fontWeight: '900' },
  simulatedBadge: { color: C.blue, backgroundColor: '#203D5A', overflow: 'hidden', borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8, fontWeight: '900' },

  sectionHeading: { marginTop: 7, marginBottom: 12 },
  sectionEyebrow: { color: C.green, fontSize: 8, fontWeight: '900', letterSpacing: 1.3, marginBottom: 4 },
  sectionTitle: { color: C.text, fontSize: 21, lineHeight: 27, fontWeight: '900' },
  sectionSubtitle: { color: C.secondary, fontSize: 10, lineHeight: 16, marginTop: 3 },

  heartCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 18, marginBottom: 23 },
  heartTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heartTopCompact: { alignItems: 'flex-start', gap: 12 },
  heartIdentity: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  heartIconCircle: { width: 55, height: 55, borderRadius: 17, backgroundColor: '#402632', alignItems: 'center', justifyContent: 'center' },
  heartIcon: { color: C.heart, fontSize: 26 },
  heartCopy: { marginLeft: 12, flex: 1, minWidth: 0 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  heartValue: { color: C.text, fontSize: 36, lineHeight: 42, fontWeight: '900', letterSpacing: -1 },
  valueUnit: { color: C.secondary, fontSize: 10, fontWeight: '800', marginLeft: 5 },
  readingStatus: { fontSize: 9, fontWeight: '800', marginTop: 3 },
  heartMeta: { alignItems: 'flex-end', marginLeft: 8 },
  liveBadge: { color: C.green, backgroundColor: C.greenBg },
  chartCard: { backgroundColor: C.card2, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, marginTop: 22 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartStatus: { fontSize: 9, fontWeight: '900' },
  chart: { height: 100, marginTop: 10, justifyContent: 'flex-end', overflow: 'hidden' },
  chartGridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: C.border },
  chartBars: { height: 85, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  chartEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chartEmptyText: { color: C.muted, fontSize: 10, textAlign: 'center' },
  chartBar: { width: 5, borderRadius: 5, backgroundColor: C.heart },
  chartPulseLine: { position: 'absolute', top: '51%', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: C.heart, opacity: 0.35 },
  chartFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  chartLegend: { color: C.heart, fontSize: 8, fontWeight: '800' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  metricCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14, marginBottom: 10 },
  metricMobile: { width: '48.5%', minHeight: 150 },
  metricWide: { width: '24%', minHeight: 158 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricIconText: { fontSize: 18 },
  metricDot: { width: 7, height: 7, borderRadius: 4 },
  metricLabel: { color: C.secondary, fontSize: 10, fontWeight: '800' },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  metricValue: { color: C.text, fontSize: 26, lineHeight: 31, fontWeight: '900' },
  metricUnit: { color: C.secondary, fontSize: 9, fontWeight: '800', marginLeft: 4 },
  metricStatus: { color: C.muted, fontSize: 8, lineHeight: 13, marginTop: 5 },
  metricProgressTrack: { height: 5, backgroundColor: '#303D56', borderRadius: 5, marginTop: 10, overflow: 'hidden' },
  metricProgressFill: { height: 5, borderRadius: 5 },

  wellnessCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 23 },
  wellnessCardCompact: { alignItems: 'flex-start', padding: 15 },
  scoreColumn: { alignItems: 'center' },
  scoreRing: { width: 108, height: 108, borderRadius: 54, borderWidth: 7, borderColor: '#267766', backgroundColor: '#193C43', alignItems: 'center', justifyContent: 'center' },
  scoreInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: C.green, fontSize: 30, lineHeight: 35, fontWeight: '900' },
  scoreOutOf: { color: C.secondary, fontSize: 10, fontWeight: '700' },
  wellnessCopy: { flex: 1, minWidth: 0, marginLeft: 17 },
  wellnessLabel: { color: C.green, fontSize: 14, fontWeight: '900' },
  progressTrack: { height: 7, backgroundColor: '#303D56', borderRadius: 6, marginTop: 13, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: C.green, borderRadius: 6 },

  // Wellness factor breakdown
  wellnessFactors: {
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  wellnessFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 5,
  },
  wellnessFactorCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wellnessFactorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  wellnessFactorLabel: {
    color: C.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  wellnessFactorValue: {
    color: C.text,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },
  wellnessFactorUnavailable: {
    color: C.muted,
    fontWeight: '600',
  },

  signalCard: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, marginBottom: 23 },
  signalRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  signalRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  signalRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  signalIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  signalIconActive: { backgroundColor: C.greenBg },
  signalIconText: { fontSize: 16 },
  signalTitle: { color: C.text, fontSize: 10, fontWeight: '900', marginBottom: 3 },
  signalBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  signalBadgeActive: { backgroundColor: C.greenBg },
  signalBadgeIdle: { backgroundColor: C.card2 },
  signalBadgeText: { color: C.secondary, fontSize: 8, fontWeight: '900' },

  aiCard: { backgroundColor: '#1B263C', borderWidth: 1, borderColor: '#34415B', borderRadius: 22, padding: 20, marginBottom: 20, overflow: 'hidden' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  aiIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: C.purpleBg, alignItems: 'center', justifyContent: 'center' },
  aiIconText: { color: C.purple, fontSize: 22 },
  aiEyebrow: { color: C.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  aiTitle: { color: C.text, fontSize: 16, fontWeight: '900', marginTop: 4 },
  aiBadge: { color: C.purple, fontSize: 8, fontWeight: '900', backgroundColor: C.purpleBg, overflow: 'hidden', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  aiFreshness: { color: C.secondary, fontSize: 9, marginTop: 15 },
  aiBody: { color: '#D6DEEF', fontSize: 12, lineHeight: 20, marginTop: 9 },
  aiButton: { minHeight: 58, borderRadius: 14, backgroundColor: '#302A4C', padding: 11, flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  aiButtonIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#433B68', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  aiButtonIconText: { color: C.purple, fontSize: 17 },
  aiButtonTitle: { color: C.text, fontSize: 10, fontWeight: '900' },
  aiButtonSubtitle: { color: C.secondary, fontSize: 9, marginTop: 3 },
  arrow: { color: C.purple, fontSize: 19, fontWeight: '900', marginLeft: 10 },

  actions: { gap: 10, marginBottom: 20 },
  actionCard: { minHeight: 72, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  actionIconText: { color: C.green, fontSize: 19, fontWeight: '900' },
  actionTitle: { color: C.text, fontSize: 10, fontWeight: '900' },
  actionSubtitle: { color: C.secondary, fontSize: 9, lineHeight: 14, marginTop: 3 },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.card2, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, marginBottom: 8 },
  disclaimerIcon: { color: C.secondary, backgroundColor: C.card, overflow: 'hidden', borderRadius: 8, width: 22, height: 22, textAlign: 'center', lineHeight: 22, fontWeight: '900', marginRight: 9 },
  disclaimerText: { flex: 1, color: C.muted, fontSize: 9, lineHeight: 15 },
});