import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
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

import { colors, radii, shadows, spacing, typography } from '../theme';

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
  heart: colors.heart,
  oxygen: colors.oxygen,
  temperature: colors.temperature,
  steps: colors.steps,
  calories: colors.calories,
  activity: colors.activity,
  water: colors.water,
  sleep: colors.sleep,
};

export default function LiveHealthScreen() {
  const [health, setHealth] = useState<HealthState>(getHealthState());
  const [running, setRunning] = useState(isHealthStreamRunning());
  const [startedAt, setStartedAt] = useState<string | null>(
    getMonitoringStartedAt()
  );

  /*
   * The live screen subscribes to the same shared health state
   * used by the dashboard and AI assistant.
   *
   * Demo wearable
   *      ↓
   * healthStream
   *      ↓
   * healthState
   *      ↓
   * Live Health UI
   */
  useEffect(() => {
    const unsubscribe = subscribeToHealthState((state) => {
      setHealth({ ...state });
      setRunning(isHealthStreamRunning());
      setStartedAt(getMonitoringStartedAt());
    });

    return unsubscribe;
  }, []);

  /*
   * Keep session duration, freshness and stream status moving
   * even when a particular health value has not changed.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setRunning(isHealthStreamRunning());
      setStartedAt(getMonitoringStartedAt());
      setHealth({ ...getHealthState() });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleMonitoring = () => {
    if (running) {
      stopHealthStream();
      setRunning(false);
      setStartedAt(null);
      return;
    }

    startHealthStream();
    setRunning(true);
    setStartedAt(getMonitoringStartedAt());
  };

  const wellnessScore = health.wellnessScore ?? 0;
  const wellnessLabel = getWellnessLabel(health.wellnessScore);

  const heartStatus = getHeartStatus(health.heartRate);
  const oxygenStatus = getOxygenStatus(health.oxygenSaturation);

  const freshness = getFreshnessLabel(health.lastUpdated);

  const sessionDuration = useMemo(() => {
    if (!startedAt || !running) return 'Not active';

    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    );

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }, [startedAt, running, health.lastUpdated]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Live Health</Text>
            <Text style={styles.headerSubtitle}>
              Real-time wellness monitoring
            </Text>
          </View>

          <View
            style={[
              styles.headerStatus,
              running && styles.headerStatusLive,
            ]}
          >
            <View
              style={[
                styles.headerStatusDot,
                running && styles.headerStatusDotLive,
              ]}
            />
            <Text
              style={[
                styles.headerStatusText,
                running && styles.headerStatusTextLive,
              ]}
            >
              {running ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* LIVE CONNECTION HERO */}
        <View style={styles.deviceHero}>
          <View style={styles.deviceHeroTop}>
            <View
              style={[
                styles.deviceIcon,
                running && styles.deviceIconLive,
              ]}
            >
              <Text style={styles.deviceIconText}>⌚</Text>
            </View>

            <View style={styles.deviceHeroInfo}>
              <View style={styles.deviceNameRow}>
                <Text style={styles.deviceName}>
                  {health.deviceName || 'Demo Wearable'}
                </Text>

                <View
                  style={[
                    styles.connectedBadge,
                    running
                      ? styles.connectedBadgeLive
                      : styles.connectedBadgeOffline,
                  ]}
                >
                  <View
                    style={[
                      styles.connectedDot,
                      running && styles.connectedDotLive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.connectedText,
                      running && styles.connectedTextLive,
                    ]}
                  >
                    {running ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>

              <Text style={styles.deviceDescription}>
                {running
                  ? 'Receiving simulated wearable readings in real time'
                  : 'Start monitoring to receive simulated wearable readings'}
              </Text>
            </View>
          </View>

          <View style={styles.deviceHeroDivider} />

          <View style={styles.sessionRow}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>MONITORING SESSION</Text>
              <Text style={styles.sessionValue}>{sessionDuration}</Text>
            </View>

            <View style={styles.sessionMeta}>
              <View style={styles.freshnessRow}>
                <View
                  style={[
                    styles.freshnessDot,
                    running && styles.freshnessDotLive,
                  ]}
                />
                <Text style={styles.freshnessText}>{freshness}</Text>
              </View>

              <Text style={styles.demoLabel}>DEMO DATA</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.monitorButton,
              running && styles.monitorButtonStop,
              pressed && styles.monitorButtonPressed,
            ]}
            onPress={toggleMonitoring}
            accessibilityRole="button"
            accessibilityLabel={
              running ? 'Stop health monitoring' : 'Start health monitoring'
            }
          >
            <View
              style={[
                styles.monitorButtonDot,
                running && styles.monitorButtonDotStop,
              ]}
            />
            <Text style={styles.monitorButtonText}>
              {running ? 'Stop monitoring' : 'Start monitoring'}
            </Text>
          </Pressable>
        </View>

        {/* LIVE STATUS STRIP */}
        {running ? (
          <View style={styles.liveStrip}>
            <View style={styles.liveStripLeft}>
              <View style={styles.liveStripIcon}>
                <Text style={styles.liveStripIconText}>⌁</Text>
              </View>

              <View style={styles.liveStripContent}>
                <Text style={styles.liveStripTitle}>
                  Live monitoring is active
                </Text>
                <Text style={styles.liveStripText}>
                  Health values update automatically and are shared with the
                  wellness dashboard and AI assistant.
                </Text>
              </View>
            </View>

            <View style={styles.livePulse}>
              <View style={styles.livePulseDot} />
            </View>
          </View>
        ) : (
          <View style={styles.waitingStrip}>
            <View style={styles.waitingStripIcon}>
              <Text style={styles.waitingStripIconText}>⌚</Text>
            </View>

            <View style={styles.waitingStripContent}>
              <Text style={styles.waitingStripTitle}>
                Monitoring is paused
              </Text>
              <Text style={styles.waitingStripText}>
                Start the demo wearable to see the live health experience.
              </Text>
            </View>
          </View>
        )}

        {/* DEMO NOTICE */}
        <View style={styles.demoNotice}>
          <View style={styles.demoNoticeIcon}>
            <Text style={styles.demoNoticeIconText}>i</Text>
          </View>

          <View style={styles.demoNoticeContent}>
            <View style={styles.demoNoticeTitleRow}>
              <Text style={styles.demoNoticeTitle}>
                Demo wearable simulation
              </Text>

              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>SIMULATED</Text>
              </View>
            </View>

            <Text style={styles.demoNoticeText}>
              These readings are simulated for the project prototype. They are
              not collected from a physical wearable device and should not be
              treated as clinical measurements.
            </Text>
          </View>
        </View>

        {/* MAIN HEART RATE */}
        <SectionHeading
          eyebrow="PRIMARY VITAL"
          title="Heart rate"
          subtitle="Current simulated heart-rate reading"
        />

        <View style={styles.heartCard}>
          <View style={styles.heartTop}>
            <View style={styles.heartIconCircle}>
              <Text style={styles.heartIcon}>♥</Text>
            </View>

            <View style={styles.heartMain}>
              <View style={styles.heartValueRow}>
                <Text style={styles.heartValue}>
                  {health.heartRate ?? '--'}
                </Text>
                <Text style={styles.heartUnit}>BPM</Text>
              </View>

              <View style={styles.heartStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: heartStatus.color },
                  ]}
                />
                <Text
                  style={[
                    styles.heartStatus,
                    { color: heartStatus.color },
                  ]}
                >
                  {heartStatus.label}
                </Text>
              </View>
            </View>

            {running && (
              <View style={styles.pulseBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseText}>LIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.chartArea}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>LIVE SIGNAL PREVIEW</Text>
              {running ? (
                <Text style={styles.chartLiveText}>Updating</Text>
              ) : null}
            </View>

            <MiniHeartChart active={running} />
          </View>

          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>
              Prototype signal visualisation
            </Text>
            <Text style={styles.chartFooterValue}>
              {freshness}
            </Text>
          </View>
        </View>

        {/* LIVE METRICS */}
        <SectionHeading
          eyebrow="LIVE READINGS"
          title="Current health metrics"
          subtitle="Updated automatically while monitoring is active"
        />

        <View style={styles.metricsGrid}>
          <LiveMetricCard
            icon="🫁"
            label="Oxygen"
            value={
              health.oxygenSaturation !== null
                ? `${health.oxygenSaturation}`
                : '--'
            }
            unit="%"
            status={oxygenStatus.label}
            statusColor={oxygenStatus.color}
            color="oxygen"
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
            status="Simulated reading"
            color="temperature"
          />

          <LiveMetricCard
            icon="👟"
            label="Steps"
            value={formatNumber(health.steps)}
            unit=""
            status={`${progress(health.steps, health.stepGoal)}% of goal`}
            color="steps"
            progress={progress(health.steps, health.stepGoal)}
          />

          <LiveMetricCard
            icon="🔥"
            label="Calories"
            value={Math.round(health.caloriesBurned).toString()}
            unit="kcal"
            status="Burned today"
            color="calories"
          />

          <LiveMetricCard
            icon="⚡"
            label="Active time"
            value={health.activeMinutes.toString()}
            unit="min"
            status="Movement today"
            color="activity"
          />

          <LiveMetricCard
            icon="📍"
            label="Distance"
            value={health.distanceKm.toFixed(2)}
            unit="km"
            status="Distance today"
            color="steps"
          />

          <LiveMetricCard
            icon="💧"
            label="Hydration"
            value={health.waterIntake.toFixed(1)}
            unit="L"
            status={`${progress(
              health.waterIntake,
              health.waterGoalLitres
            )}% of goal`}
            color="water"
            progress={progress(
              health.waterIntake,
              health.waterGoalLitres
            )}
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
            status={`${progress(
              health.sleepHours ?? 0,
              health.sleepGoalHours
            )}% of goal`}
            color="sleep"
            progress={progress(
              health.sleepHours ?? 0,
              health.sleepGoalHours
            )}
          />
        </View>

        {/* WELLNESS SCORE */}
        <SectionHeading
          eyebrow="HEALTH SUMMARY"
          title="Today's wellness"
          subtitle="A transparent project wellness indicator based on available readings"
        />

        <View style={styles.wellnessCard}>
          <View style={styles.wellnessScoreCircle}>
            <Text style={styles.wellnessScore}>
              {health.wellnessScore !== null ? wellnessScore : '--'}
            </Text>
            <Text style={styles.wellnessOutOf}>/100</Text>
          </View>

          <View style={styles.wellnessContent}>
            <View style={styles.wellnessTitleRow}>
              <Text style={styles.wellnessTitle}>
                {wellnessLabel}
              </Text>

              {running && (
                <View style={styles.updatedBadge}>
                  <View style={styles.updatedDot} />
                  <Text style={styles.updatedText}>Updating live</Text>
                </View>
              )}
            </View>

            <Text style={styles.wellnessDescription}>
              The prototype score combines available activity, sleep,
              hydration and recovery-related information into one simple
              wellness indicator.
            </Text>

            <View style={styles.wellnessProgressTrack}>
              <View
                style={[
                  styles.wellnessProgress,
                  {
                    width: `${Math.max(
                      2,
                      Math.min(100, wellnessScore)
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.wellnessUpdated}>
              {health.wellnessScore !== null
                ? `Latest score • ${freshness}`
                : 'Waiting for enough health data'}
            </Text>
          </View>
        </View>

        {/* SIGNALS */}
        <SectionHeading
          eyebrow="SYSTEM STATUS"
          title="Monitoring signals"
          subtitle="Current data availability"
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
              health.heartRate !== null ? 'Receiving' : 'Waiting'
            }
            active={health.heartRate !== null}
          />

          <SignalRow
            icon="🫁"
            title="Oxygen saturation"
            value={
              health.oxygenSaturation !== null
                ? 'Receiving'
                : 'Waiting'
            }
            active={health.oxygenSaturation !== null}
          />

          <SignalRow
            icon="📡"
            title="Health data stream"
            value={running ? 'Live updates' : 'Stopped'}
            active={running}
            last
          />
        </View>

        {/* AI HEALTH SIGNAL */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>✦</Text>
            </View>

            <View style={styles.aiHeaderText}>
              <View style={styles.aiEyebrowRow}>
                <Text style={styles.aiEyebrow}>AI HEALTH SIGNAL</Text>

                <View
                  style={[
                    styles.aiContextBadge,
                    running
                      ? styles.aiContextBadgeLive
                      : styles.aiContextBadgeWaiting,
                  ]}
                >
                  <View
                    style={[
                      styles.aiContextDot,
                      running && styles.aiContextDotLive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.aiContextText,
                      running && styles.aiContextTextLive,
                    ]}
                  >
                    {running ? 'LIVE CONTEXT' : 'WAITING'}
                  </Text>
                </View>
              </View>

              <Text style={styles.aiTitle}>
                Your live health context
              </Text>
            </View>
          </View>

          <Text style={styles.aiFreshness}>
            {running
              ? `Context available • ${freshness}`
              : 'Start monitoring to provide live context'}
          </Text>

          <Text style={styles.aiBody}>
            {getLiveInsight(health, running)}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.aiButton,
              pressed && styles.aiButtonPressed,
            ]}
            onPress={() => router.push('/chatbot')}
          >
            <View style={styles.aiButtonContent}>
              <Text style={styles.aiButtonText}>
                Ask AI about my health
              </Text>
              <Text style={styles.aiButtonSubtext}>
                Use the latest available health context
              </Text>
            </View>

            <Text style={styles.aiButtonArrow}>→</Text>
          </Pressable>
        </View>

        {/* BOTTOM ACTIONS */}
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.secondaryActionPressed,
            ]}
            onPress={() => router.push('/health-data')}
          >
            <Text style={styles.secondaryActionIcon}>＋</Text>

            <View style={styles.secondaryActionContent}>
              <Text style={styles.secondaryActionTitle}>
                Add health data
              </Text>
              <Text style={styles.secondaryActionSubtitle}>
                Record manual readings
              </Text>
            </View>

            <Text style={styles.secondaryActionArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.secondaryActionPressed,
            ]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.secondaryActionIcon}>⌂</Text>

            <View style={styles.secondaryActionContent}>
              <Text style={styles.secondaryActionTitle}>
                Back to dashboard
              </Text>
              <Text style={styles.secondaryActionSubtitle}>
                View your full health overview
              </Text>
            </View>

            <Text style={styles.secondaryActionArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          Demo wellness information is for prototype and general
          informational purposes only. It is not a medical diagnosis or
          substitute for professional medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

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

function LiveMetricCard({
  icon,
  label,
  value,
  unit,
  status,
  statusColor,
  color,
  progress: progressValue,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  statusColor?: string;
  color: MetricColor;
  progress?: number;
}) {
  const accent = metricColors[color];

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricCardTop}>
        <View
          style={[
            styles.metricIcon,
            { backgroundColor: `${accent}15` },
          ]}
        >
          <Text style={styles.metricIconText}>{icon}</Text>
        </View>

        <View
          style={[
            styles.metricIndicator,
            { backgroundColor: `${accent}18` },
          ]}
        >
          <View
            style={[
              styles.metricIndicatorDot,
              { backgroundColor: accent },
            ]}
          />
        </View>
      </View>

      <Text style={styles.metricLabel}>{label}</Text>

      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>

        {unit ? (
          <Text style={styles.metricUnit}>{unit}</Text>
        ) : null}
      </View>

      <Text
        style={[
          styles.metricStatus,
          statusColor ? { color: statusColor } : null,
        ]}
      >
        {status}
      </Text>

      {progressValue !== undefined ? (
        <View style={styles.metricProgressTrack}>
          <View
            style={[
              styles.metricProgress,
              {
                width: `${Math.min(
                  100,
                  Math.max(0, progressValue)
                )}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
      ) : null}
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
    <View
      style={[
        styles.signalRow,
        !last && styles.signalRowBorder,
      ]}
    >
      <View style={styles.signalLeft}>
        <View
          style={[
            styles.signalIcon,
            active && styles.signalIconActive,
          ]}
        >
          <Text style={styles.signalIconText}>{icon}</Text>
        </View>

        <View style={styles.signalCopy}>
          <Text style={styles.signalTitle}>{title}</Text>
          <Text style={styles.signalValue}>{value}</Text>
        </View>
      </View>

      <View
        style={[
          styles.signalStatus,
          active
            ? styles.signalStatusActive
            : styles.signalStatusInactive,
        ]}
      >
        <View
          style={[
            styles.signalStatusDot,
            active && styles.signalStatusDotActive,
          ]}
        />

        <Text
          style={[
            styles.signalStatusText,
            active && styles.signalStatusTextActive,
          ]}
        >
          {active ? 'Ready' : 'Waiting'}
        </Text>
      </View>
    </View>
  );
}

function MiniHeartChart({ active }: { active: boolean }) {
  /*
   * This is deliberately a visual prototype signal rather than
   * a fabricated clinical history. The real source remains the
   * shared health state.
   */
  const bars = active
    ? [38, 52, 44, 68, 54, 76, 62, 84, 58, 72, 64, 90, 68, 78, 60]
    : [32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32];

  return (
    <View style={styles.chart}>
      {bars.map((height, index) => (
        <View
          key={index}
          style={[
            styles.chartBar,
            {
              height,
              opacity: active ? 0.35 + index / 35 : 0.18,
            },
          ]}
        />
      ))}

      <View style={styles.chartLine}>
        <View style={styles.chartLineSegment} />
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function progress(value: number, goal: number) {
  if (!goal || goal <= 0) return 0;

  return Math.round(
    Math.min(100, (value / goal) * 100)
  );
}

function getFreshnessLabel(lastUpdated: string | null) {
  if (!lastUpdated) {
    return 'Waiting for health data';
  }

  const updatedAt = new Date(lastUpdated).getTime();

  if (!Number.isFinite(updatedAt)) {
    return 'Waiting for health data';
  }

  const secondsAgo = Math.max(
    0,
    Math.floor((Date.now() - updatedAt) / 1000)
  );

  if (secondsAgo < 5) {
    return 'Updated just now';
  }

  if (secondsAgo < 60) {
    return `Updated ${secondsAgo}s ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);

  if (minutesAgo < 60) {
    return `Updated ${minutesAgo}m ago`;
  }

  return 'Health data may be out of date';
}

function getHeartStatus(value: number | null) {
  if (value === null) {
    return {
      label: 'Waiting for reading',
      color: colors.textMuted,
    };
  }

  if (value >= 60 && value <= 100) {
    return {
      label: 'Within prototype reference',
      color: colors.success,
    };
  }

  return {
    label: 'Outside prototype reference',
    color: colors.warning,
  };
}

function getOxygenStatus(value: number | null) {
  if (value === null) {
    return {
      label: 'Waiting',
      color: colors.textMuted,
    };
  }

  if (value >= 95) {
    return {
      label: 'Within prototype reference',
      color: colors.success,
    };
  }

  return {
    label: 'Review reading',
    color: colors.warning,
  };
}

function getLiveInsight(
  health: HealthState,
  running: boolean
) {
  if (!running) {
    return 'Start monitoring to let the assistant use your latest simulated wearable readings as part of your health context.';
  }

  if (
    health.heartRate !== null &&
    health.heartRate > 100
  ) {
    return 'Your current simulated heart-rate reading is above the simple prototype reference range. Slow down if you are active and pay attention to how you feel. If you feel unwell, seek appropriate professional advice.';
  }

  if (
    health.sleepHours !== null &&
    health.sleepHours < 6
  ) {
    return 'Your available sleep data is below the target used by this prototype. Recovery and consistent sleep could be a useful focus today.';
  }

  if (
    health.waterIntake > 0 &&
    health.waterIntake < 1.5
  ) {
    return 'Your current hydration is below the daily target used by this prototype. Consider drinking water regularly throughout the day.';
  }

  if (
    health.steps > 0 &&
    health.steps >= health.stepGoal
  ) {
    return 'You have reached your current activity target. Keep balancing movement with hydration and recovery.';
  }

  return 'Your live monitoring session is active. The latest simulated readings are being shared across the health dashboard and can be used by the AI assistant.';
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: 40,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: colors.textStrong,
    marginTop: -3,
  },

  headerCenter: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    ...typography.h1,
    color: colors.textStrong,
  },

  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },

  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.pill,
  },

  headerStatusLive: {
    backgroundColor: colors.successLight,
  },

  headerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.offline,
  },

  headerStatusDotLive: {
    backgroundColor: colors.live,
  },

  headerStatusText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textMuted,
  },

  headerStatusTextLive: {
    color: colors.success,
  },

  /* DEVICE HERO */

  deviceHero: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.elevated,
  },

  deviceHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceIconLive: {
    backgroundColor: colors.successLight,
  },

  deviceIconText: {
    fontSize: 27,
  },

  deviceHeroInfo: {
    flex: 1,
    marginLeft: 15,
  },

  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  deviceName: {
    ...typography.h3,
    color: colors.textStrong,
  },

  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },

  connectedBadgeLive: {
    backgroundColor: colors.successLight,
  },

  connectedBadgeOffline: {
    backgroundColor: colors.surfaceMuted,
  },

  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.offline,
    marginRight: 5,
  },

  connectedDotLive: {
    backgroundColor: colors.live,
  },

  connectedText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },

  connectedTextLive: {
    color: colors.success,
  },

  deviceDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 5,
    lineHeight: 18,
  },

  deviceHeroDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  sessionInfo: {
    flex: 1,
  },

  sessionLabel: {
    ...typography.overline,
    color: colors.textSoft,
  },

  sessionValue: {
    ...typography.h3,
    color: colors.textStrong,
    marginTop: 3,
  },

  sessionMeta: {
    alignItems: 'flex-end',
  },

  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  freshnessDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.offline,
    marginRight: 5,
  },

  freshnessDotLive: {
    backgroundColor: colors.live,
  },

  freshnessText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },

  demoLabel: {
    ...typography.overline,
    color: colors.textSoft,
    marginTop: 5,
    letterSpacing: 1,
  },

  monitorButton: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 46,
  },

  monitorButtonStop: {
    backgroundColor: colors.danger,
  },

  monitorButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  monitorButtonDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    marginRight: 7,
  },

  monitorButtonDotStop: {
    backgroundColor: '#FFFFFF',
  },

  monitorButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },

  /* LIVE STRIPS */

  liveStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#CFE9E2',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  liveStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  liveStripIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#D7F1E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  liveStripIconText: {
    color: colors.success,
    fontSize: 20,
    fontWeight: '800',
  },

  liveStripContent: {
    flex: 1,
  },

  liveStripTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  liveStripText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },

  livePulse: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D7F1E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.live,
  },

  waitingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  waitingStripIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  waitingStripIconText: {
    fontSize: 18,
  },

  waitingStripContent: {
    flex: 1,
  },

  waitingStripTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  waitingStripText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },

  /* DEMO */

  demoNotice: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: '#CBE4EC',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
  },

  demoNoticeIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  demoNoticeIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  demoNoticeContent: {
    flex: 1,
  },

  demoNoticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  demoNoticeTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  demoBadge: {
    backgroundColor: '#DDEFF3',
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  demoBadgeText: {
    ...typography.overline,
    fontSize: 8,
    color: colors.info,
    letterSpacing: 0.7,
  },

  demoNoticeText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },

  /* SECTION */

  sectionHeading: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  sectionEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 3,
  },

  sectionTitle: {
    ...typography.h2,
    color: colors.textStrong,
  },

  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 3,
  },

  /* HEART */

  heartCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  heartTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heartIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FCECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heartIcon: {
    color: colors.heart,
    fontSize: 27,
  },

  heartMain: {
    flex: 1,
    marginLeft: 15,
  },

  heartValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  heartValue: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    color: colors.textStrong,
    letterSpacing: -1,
  },

  heartUnit: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '700',
  },

  heartStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    marginRight: 6,
  },

  heartStatus: {
    ...typography.caption,
    fontWeight: '700',
  },

  pulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.live,
    marginRight: 5,
  },

  pulseText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '800',
  },

  chartArea: {
    height: 118,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'flex-end',
  },

  chartHeader: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chartLabel: {
    ...typography.overline,
    fontSize: 8,
    color: colors.textSoft,
    letterSpacing: 0.9,
  },

  chartLiveText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },

  chart: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },

  chartBar: {
    width: 7,
    borderRadius: 5,
    backgroundColor: colors.heart,
  },

  chartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
  },

  chartLineSegment: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },

  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  chartFooterText: {
    ...typography.caption,
    color: colors.textSoft,
  },

  chartFooterValue: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },

  /* METRICS */

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sectionGap,
  },

  metricCard: {
    width: '48.5%',
    minHeight: 156,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },

  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricIconText: {
    fontSize: 18,
  },

  metricIndicator: {
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricIndicatorDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },

  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },

  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },

  metricValue: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.textStrong,
    letterSpacing: -0.5,
  },

  metricUnit: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginLeft: 4,
  },

  metricStatus: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 3,
  },

  metricProgressTrack: {
    height: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 99,
    marginTop: 12,
    overflow: 'hidden',
  },

  metricProgress: {
    height: 5,
    borderRadius: 99,
  },

  /* WELLNESS */

  wellnessCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  wellnessScoreCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: '#D2ECE6',
  },

  wellnessScore: {
    fontSize: 31,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  wellnessOutOf: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -1,
  },

  wellnessContent: {
    flex: 1,
    marginLeft: 18,
  },

  wellnessTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  wellnessTitle: {
    ...typography.h3,
    color: colors.textStrong,
  },

  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },

  updatedDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.live,
    marginRight: 5,
  },

  updatedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },

  wellnessDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 6,
  },

  wellnessProgressTrack: {
    height: 7,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 13,
  },

  wellnessProgress: {
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },

  wellnessUpdated: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 6,
  },

  /* SIGNALS */

  signalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  signalRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  signalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  signalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  signalIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  signalIconActive: {
    backgroundColor: colors.primarySoft,
  },

  signalIconText: {
    fontSize: 16,
  },

  signalCopy: {
    flex: 1,
  },

  signalTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '700',
  },

  signalValue: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  signalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },

  signalStatusActive: {
    backgroundColor: colors.successLight,
  },

  signalStatusInactive: {
    backgroundColor: colors.surfaceMuted,
  },

  signalStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.offline,
    marginRight: 5,
  },

  signalStatusDotActive: {
    backgroundColor: colors.live,
  },

  signalStatusText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },

  signalStatusTextActive: {
    color: colors.success,
  },

  /* AI */

  aiCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
    ...shadows.elevated,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  aiHeaderText: {
    marginLeft: 11,
    flex: 1,
  },

  aiEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  aiEyebrow: {
    ...typography.overline,
    color: '#A9DED3',
    letterSpacing: 1.1,
  },

  aiContextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  aiContextBadgeLive: {
    backgroundColor: 'rgba(255,255,255,0.13)',
  },

  aiContextBadgeWaiting: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  aiContextDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginRight: 4,
  },

  aiContextDotLive: {
    backgroundColor: '#8FE0C8',
  },

  aiContextText: {
    ...typography.overline,
    fontSize: 7,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.7,
  },

  aiContextTextLive: {
    color: '#BDEDE2',
  },

  aiTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginTop: 3,
  },

  aiFreshness: {
    ...typography.caption,
    color: '#A9DED3',
    marginTop: 13,
  },

  aiBody: {
    ...typography.body,
    color: '#D9EFEB',
    lineHeight: 21,
    marginTop: 8,
  },

  aiButton: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  aiButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  aiButtonContent: {
    flex: 1,
  },

  aiButtonText: {
    ...typography.button,
    color: colors.primaryDark,
  },

  aiButtonSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  aiButtonArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 10,
  },

  /* BOTTOM ACTIONS */

  bottomActions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  secondaryAction: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },

  secondaryActionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  secondaryActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 23,
    color: colors.primary,
    marginRight: 12,
  },

  secondaryActionContent: {
    flex: 1,
  },

  secondaryActionTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  secondaryActionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  secondaryActionArrow: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
    marginLeft: 10,
  },

  disclaimer: {
    ...typography.caption,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 20,
  },
});