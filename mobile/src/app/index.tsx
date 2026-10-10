import React, { useEffect, useMemo, useState } from 'react';
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

import DashboardHeader from '../components/DashboardHeader';
import LiveDeviceBanner from '../components/LiveDeviceBanner';
import WellnessHero from '../components/WellnessHero';
import HealthMetricCard from '../components/HealthMetricCard';
import GoalProgress from '../components/GoalProgress';
import QuickActionCard from '../components/QuickActionCard';

import {
  getHealthState,
  getHealthInsight,
  getWellnessLabel,
  subscribeToHealthState,
  type HealthState,
} from '../services/healthState';

import {
  isHealthStreamRunning,
  startHealthStream,
} from '../services/healthStream';

const colors = {
  background: '#0B1220',
  surface: '#182238',
  surfaceSoft: '#202D42',
  surfaceRaised: '#26334B',
  primary: '#4CC99A',
  primaryDark: '#83E6BE',
  primaryLight: '#173D37',
  primaryPale: '#202D42',
  text: '#F4F6FF',
  textSecondary: '#B2BED1',
  muted: '#9BAAC0',
  mutedLight: '#8393AA',
  border: '#2A3650',
  borderStrong: '#347A69',
  success: '#49D6A0',
  warning: '#F1B766',
  warningSoft: '#493724',
  purple: '#B5A4FF',
  purpleSoft: '#302A4C',
  orange: '#FF9A62',
  orangeSoft: '#493126',
  blue: '#79B7FF',
  blueSoft: '#233A5C',
};

function formatUpdated(value: string | null) {
  if (!value) return 'Waiting for data';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Waiting for data';
  }

  return `Updated ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getDataMode(connected: boolean, isDemo: boolean) {
  if (connected && isDemo) {
    return {
      title: 'Demo wearable active',
      description: 'Simulated readings are updating for this prototype.',
      label: 'SIMULATED LIVE',
    };
  }

  return {
    title: 'Manual health mode',
    description: 'Add health information or start the demo monitor.',
    label: 'MANUAL',
  };
}

function getMetricAvailability(health: HealthState) {
  return [
    health.heartRate !== null,
    health.oxygenSaturation !== null,
    health.sleepHours !== null,
    health.steps > 0,
    health.waterIntake > 0,
    health.activeMinutes > 0,
  ].filter(Boolean).length;
}

function getReadinessText(score: number | null, hasData: boolean) {
  if (!hasData) return 'Ready when you are';
  if (score === null) return 'Building your picture';
  if (score >= 80) return 'Looking strong today';
  if (score >= 60) return 'A steady day so far';
  return 'A few areas need attention';
}

function MetricPlaceholder({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.metricPlaceholder}>
      <View style={[styles.metricPlaceholderDot, { backgroundColor: color }]} />
      <Text style={styles.metricPlaceholderLabel}>{label}</Text>
      <View style={styles.metricPlaceholderValueRow}>
        <Text style={styles.metricPlaceholderValue}>{value}</Text>
        <Text style={styles.metricPlaceholderUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sidebarItem,
        active && styles.sidebarItemActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.sidebarIcon, active && styles.sidebarIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.sidebarActiveMark} />}
    </Pressable>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const isWide = width >= 1100;
  const isTablet = width >= 700 && width < 1100;
  const isCompact = width < 600;

  const [health, setHealth] = useState<HealthState>(getHealthState());

  useEffect(() => {
    return subscribeToHealthState(setHealth);
  }, []);

  const wellnessLabel = useMemo(
    () => getWellnessLabel(health.wellnessScore),
    [health.wellnessScore],
  );

  const insight = useMemo(() => getHealthInsight(health), [health]);

  const live = health.deviceConnected && health.isDemoDevice;

  const mode = useMemo(
    () => getDataMode(health.deviceConnected, health.isDemoDevice),
    [health.deviceConnected, health.isDemoDevice],
  );

  const availableMetrics = useMemo(
    () => getMetricAvailability(health),
    [health],
  );

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
          ? `${health.steps.toLocaleString()} steps`
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

  const availableWellnessFactors = wellnessFactors.filter(
    (factor) => factor.available,
  ).length;

  const hasHealthData = availableMetrics > 0 || health.wellnessScore !== null;

  const readinessText = getReadinessText(health.wellnessScore, hasHealthData);

  const stepsProgress =
    health.stepGoal > 0
      ? Math.min(100, Math.max(0, (health.steps / health.stepGoal) * 100))
      : 0;

  const waterProgress =
    health.waterGoalLitres > 0
      ? Math.min(
          100,
          Math.max(0, (health.waterIntake / health.waterGoalLitres) * 100),
        )
      : 0;

  const sleepProgress =
    health.sleepGoalHours > 0 && health.sleepHours !== null
      ? Math.min(
          100,
          Math.max(0, (health.sleepHours / health.sleepGoalHours) * 100),
        )
      : 0;

  const startMonitoring = () => {
    if (!isHealthStreamRunning()) startHealthStream();
    router.push('/live-health');
  };

  const openHealthData = () => router.push('/health-data');
  const openGoals = () => router.push('/goals');
  const openChatbot = () => router.push('/chatbot');
  const openMentalHealth = () => router.push('/mental-health');
  const openProfile = () => router.push('/profile');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appLayout}>
        {isWide && (
          <View style={styles.sidebar}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>✦</Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>PulseWell</Text>
                <Text style={styles.brandSubtitle}>PERSONAL HEALTH AI</Text>
              </View>
            </View>

            <Text style={styles.navCaption}>WORKSPACE</Text>

            <SidebarItem
              icon="▦"
              label="Dashboard"
              active
              onPress={() => router.replace('/')}
            />
            <SidebarItem
              icon="＋"
              label="Manual health"
              onPress={openHealthData}
            />
            <SidebarItem
              icon="◎"
              label="My goals"
              onPress={openGoals}
            />
            <SidebarItem
              icon="⌁"
              label="Health trends"
              onPress={() => router.push('/live-health')}
            />
            <SidebarItem
              icon="✦"
              label="AI assistant"
              onPress={openChatbot}
            />
            <SidebarItem
              icon="♡"
              label="Mental wellness"
              onPress={openMentalHealth}
            />
            <SidebarItem
              icon="◷"
              label="Live monitoring"
              onPress={() => router.push('/live-health')}
            />

            <View style={styles.sidebarSpacer} />

            <View style={styles.sidebarHelpCard}>
              <Text style={styles.sidebarHelpIcon}>✦</Text>
              <Text style={styles.sidebarHelpTitle}>Your wellness, in context</Text>
              <Text style={styles.sidebarHelpText}>
                Review your available data and take one small step at a time.
              </Text>
              <Pressable onPress={openChatbot} style={styles.sidebarHelpButton}>
                <Text style={styles.sidebarHelpButtonText}>Ask your AI →</Text>
              </Pressable>
            </View>

            <Pressable onPress={openProfile} style={styles.sidebarProfile}>
              <View style={styles.sidebarAvatar}>
                <Text style={styles.sidebarAvatarText}>P</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sidebarProfileName}>My profile</Text>
                <Text style={styles.sidebarProfileCaption}>Account & preferences</Text>
              </View>
              <Text style={styles.sidebarChevron}>›</Text>
            </Pressable>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            isCompact && styles.contentCompact,
            isTablet && styles.contentTablet,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.shell, isWide && styles.shellWide]}>
            <View style={styles.topBar}>
              <View style={styles.topBarCopy}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greeting}>YOUR WELLNESS DASHBOARD</Text>
                  <View style={styles.livePill}>
                    <View
                      style={[
                        styles.livePillDot,
                        !live && styles.livePillDotManual,
                      ]}
                    />
                    <Text style={styles.livePillText}>
                      {live ? 'DEMO STREAM ACTIVE' : 'WELLNESS READY'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.pageTitle}>Your health, at a glance</Text>
                <Text style={styles.pageSubtitle}>
                  Personalised insights from your available wellness data.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open profile"
                onPress={openProfile}
                style={({ pressed }) => [
                  styles.profileButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.profileInitial}>P</Text>
                <View style={styles.profileOnlineDot} />
              </Pressable>
            </View>

            {!isWide && (
              <View style={styles.mobileNav}>
                <Pressable
                  onPress={() => router.replace('/')}
                  style={[styles.mobileNavItem, styles.mobileNavItemActive]}
                >
                  <Text style={styles.mobileNavIcon}>▦</Text>
                  <Text style={styles.mobileNavTextActive}>Dashboard</Text>
                </Pressable>
                <Pressable onPress={openHealthData} style={styles.mobileNavItem}>
                  <Text style={styles.mobileNavIcon}>＋</Text>
                  <Text style={styles.mobileNavText}>Manual health</Text>
                </Pressable>
                <Pressable onPress={openChatbot} style={styles.mobileNavItem}>
                  <Text style={styles.mobileNavIcon}>✦</Text>
                  <Text style={styles.mobileNavText}>AI assistant</Text>
                </Pressable>
                <Pressable onPress={openMentalHealth} style={styles.mobileNavItem}>
                  <Text style={styles.mobileNavIcon}>♡</Text>
                  <Text style={styles.mobileNavText}>Wellness</Text>
                </Pressable>
              </View>
            )}

            {/* MANUAL / SIMULATED DATA STATUS */}
            <View style={[styles.productStatus, live && styles.productStatusLive]}>
              <View style={styles.productStatusLeft}>
                <View style={[styles.statusOrb, live ? styles.statusOrbLive : styles.statusOrbManual]}>
                  <Text style={styles.statusOrbText}>{live ? '⌁' : '＋'}</Text>
                </View>

                <View style={styles.productStatusCopy}>
                  <Text style={styles.productStatusTitle}>{mode.title}</Text>
                  <Text style={styles.productStatusDescription}>
                    {mode.description}
                  </Text>
                </View>
              </View>

              <View style={[styles.modeBadge, live ? styles.modeBadgeLive : styles.modeBadgeManual]}>
                <Text style={[styles.modeBadgeText, live ? styles.modeBadgeTextLive : styles.modeBadgeTextManual]}>
                  {mode.label}
                </Text>
              </View>
            </View>

            {/* WELLNESS AND DEVICE */}
            <View style={[styles.primaryGrid, isWide && styles.primaryGridWide]}>
              <View style={[styles.heroColumn, isWide && styles.heroColumnWide]}>
                <WellnessHero
                  score={health.wellnessScore}
                  label={wellnessLabel}
                  insight={insight}
                />

                <View style={styles.dataCoverageCard}>
                  <Text style={styles.dataCoverageTitle}>DATA COVERAGE</Text>
                  <Text style={styles.dataCoverageSubtitle}>
                    {availableWellnessFactors} of 4 wellness factors available
                  </Text>

                  {wellnessFactors.map((factor) => (
                    <View key={factor.label} style={styles.dataCoverageRow}>
                      <View style={styles.dataCoverageLabelGroup}>
                        <View
                          style={[
                            styles.dataCoverageDot,
                            {
                              backgroundColor: factor.available
                                ? colors.success
                                : colors.muted,
                            },
                          ]}
                        />
                        <Text style={styles.dataCoverageLabel}>
                          {factor.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.dataCoverageValue,
                          !factor.available && styles.dataCoverageUnavailable,
                        ]}
                      >
                        {factor.value}
                      </Text>
                    </View>
                  ))}

                  <Text style={styles.dataCoverageFootnote}>
                    The wellness score uses available inputs in the prototype's
                    existing calculation. It is a general wellness indicator,
                    not a clinical assessment.
                  </Text>
                </View>
              </View>

              <View style={[styles.deviceColumn, isWide && styles.deviceColumnWide]}>
                <LiveDeviceBanner
                  connected={live}
                  deviceName={health.deviceName}
                  lastUpdated={health.lastUpdated}
                  onPress={() => router.push('/live-health')}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    live ? 'View simulated live health readings' : 'Start simulated health monitoring'
                  }
                  style={({ pressed }) => [
                    styles.monitorCta,
                    live ? styles.monitorCtaLive : styles.monitorCtaReady,
                    pressed && styles.pressed,
                  ]}
                  onPress={startMonitoring}
                >
                  <View style={styles.monitorCtaIcon}>
                    <Text style={styles.monitorCtaIconText}>{live ? '↗' : '▶'}</Text>
                  </View>

                  <View style={styles.monitorCtaCopy}>
                    <Text style={styles.monitorCtaTitle}>
                      {live ? 'View live health' : 'Start health monitoring'}
                    </Text>
                    <Text style={styles.monitorCtaSubtitle}>
                      {live ? 'Simulated readings · updates every 3 seconds' : 'Start the demo wearable stream'}
                    </Text>
                  </View>

                  <Text style={styles.monitorCtaArrow}>→</Text>
                </Pressable>

                <View style={styles.sourceNote}>
                  <View style={styles.sourceNoteDot} />
                  <Text style={styles.sourceNoteText}>
                    {live
                      ? 'DEMO DATA · Not connected to a physical wearable'
                      : 'Manual entries and demo monitoring are supported'}
                  </Text>
                </View>
              </View>
            </View>

            {/* METRICS HEADER */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderCopy}>
                <View style={styles.sectionEyebrowRow}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.eyebrow}>TODAY</Text>
                </View>
                <Text style={styles.sectionTitle}>Health at a glance</Text>
                <Text style={styles.sectionSubtitle}>
                  {hasHealthData
                    ? `${availableMetrics} of 6 core metrics available`
                    : 'Your current wellness picture will appear here'}
                </Text>
              </View>

              <View style={styles.updatedBadge}>
                <View style={[styles.updatedDot, live && styles.updatedDotLive]} />
                <Text style={styles.updatedText}>{formatUpdated(health.lastUpdated)}</Text>
              </View>
            </View>

            {/* METRIC CARDS */}
            <View style={styles.metricGrid}>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="♥"
                  label="Heart rate"
                  value={health.heartRate !== null ? String(health.heartRate) : '—'}
                  unit="BPM"
                  live={live}
                />
              </View>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="⌁"
                  label="Steps"
                  value={health.steps > 0 ? health.steps.toLocaleString() : '—'}
                  progress={stepsProgress}
                />
              </View>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="☾"
                  label="Sleep"
                  value={health.sleepHours !== null ? health.sleepHours.toFixed(1) : '—'}
                  unit="hrs"
                  progress={sleepProgress}
                />
              </View>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="◊"
                  label="Hydration"
                  value={health.waterIntake > 0 ? health.waterIntake.toFixed(1) : '—'}
                  unit="L"
                  progress={waterProgress}
                />
              </View>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="△"
                  label="Active time"
                  value={health.activeMinutes > 0 ? String(health.activeMinutes) : '—'}
                  unit="min"
                />
              </View>
              <View style={[styles.metricCell, isWide && styles.metricCellWide]}>
                <HealthMetricCard
                  icon="◌"
                  label="Oxygen"
                  value={health.oxygenSaturation !== null ? String(health.oxygenSaturation) : '—'}
                  unit="%"
                  live={live}
                />
              </View>
            </View>

            {/* CHECK-IN */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open health check-in"
              onPress={hasHealthData ? openChatbot : openHealthData}
              style={({ pressed }) => [
                styles.readinessCard,
                hasHealthData && styles.readinessCardActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.readinessIcon}>
                <Text style={styles.readinessIconText}>✦</Text>
              </View>

              <View style={styles.readinessCopy}>
                <Text style={styles.readinessEyebrow}>WELLNESS CHECK-IN</Text>
                <Text style={styles.readinessTitle}>{readinessText}</Text>
                <Text style={styles.readinessText}>
                  {hasHealthData
                    ? insight
                    : 'Add your health information or start the demo monitor to receive a personalised insight.'}
                </Text>
              </View>

              <View style={styles.readinessAction}>
                <Text style={styles.readinessActionText}>
                  {hasHealthData ? 'ASK AI' : 'START'}
                </Text>
              </View>
            </Pressable>

            {/* DAILY GOALS + AI INSIGHT */}
            <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
              <View style={[styles.card, isWide && styles.cardWide]}>
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.cardEyebrowRow}>
                      <View style={[styles.cardAccent, styles.cardAccentGreen]} />
                      <Text style={styles.cardEyebrow}>PROGRESS</Text>
                    </View>
                    <Text style={styles.cardTitle}>Daily goals</Text>
                    <Text style={styles.cardSubtitle}>Small actions that build your day</Text>
                  </View>

                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>TODAY</Text>
                  </View>
                </View>

                <View style={styles.goalList}>
                  <GoalProgress
                    icon="⌁"
                    title="Steps"
                    current={health.steps}
                    target={health.stepGoal}
                    unit=""
                  />
                  <GoalProgress
                    icon="◊"
                    title="Hydration"
                    current={health.waterIntake}
                    target={health.waterGoalLitres}
                    unit="L"
                  />
                  <GoalProgress
                    icon="☾"
                    title="Sleep"
                    current={health.sleepHours ?? 0}
                    target={health.sleepGoalHours}
                    unit="h"
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Update my health data"
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                  onPress={openHealthData}
                >
                  <Text style={styles.secondaryButtonText}>Update my health data</Text>
                  <Text style={styles.secondaryButtonArrow}>→</Text>
                </Pressable>
              </View>

              <View style={[styles.card, styles.aiCard, isWide && styles.cardWide]}>
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.cardEyebrowRow}>
                      <View style={[styles.cardAccent, styles.cardAccentPurple]} />
                      <Text style={[styles.cardEyebrow, styles.cardEyebrowPurple]}>
                        AI GUIDANCE
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>Your personal insight</Text>
                    <Text style={styles.cardSubtitle}>Based on your latest available context</Text>
                  </View>

                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                </View>

                <View style={styles.aiMessage}>
                  <View style={styles.aiMessageIcon}>
                    <Text style={styles.aiMessageIconText}>✦</Text>
                  </View>
                  <Text style={styles.aiMessageText}>{insight}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ask AI about my health"
                  style={({ pressed }) => [styles.aiButton, pressed && styles.pressed]}
                  onPress={openChatbot}
                >
                  <View style={styles.aiButtonCopy}>
                    <Text style={styles.aiButtonTitle}>Ask AI about my health</Text>
                    <Text style={styles.aiButtonSubtitle}>
                      Get a personalised conversation
                    </Text>
                  </View>
                  <View style={styles.aiButtonArrowCircle}>
                    <Text style={styles.aiButtonArrow}>→</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* HEALTH TRENDS PLACEHOLDER */}
            <View style={styles.trendsCard}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={styles.cardEyebrowRow}>
                    <View style={[styles.cardAccent, styles.cardAccentBlue]} />
                    <Text style={[styles.cardEyebrow, styles.cardEyebrowBlue]}>
                      HEALTH TRENDS
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Your activity overview</Text>
                  <Text style={styles.cardSubtitle}>
                    Trends will appear when historical health records are available.
                  </Text>
                </View>
                <View style={styles.trendsBadge}>
                  <Text style={styles.trendsBadgeText}>HISTORY</Text>
                </View>
              </View>

              <View style={styles.trendsPlaceholderGrid}>
                <MetricPlaceholder
                  label="Heart rate"
                  value={health.heartRate !== null ? String(health.heartRate) : '—'}
                  unit="BPM"
                  color={colors.orange}
                />
                <MetricPlaceholder
                  label="Daily steps"
                  value={health.steps > 0 ? health.steps.toLocaleString() : '—'}
                  unit="steps"
                  color={colors.primary}
                />
                <MetricPlaceholder
                  label="Sleep duration"
                  value={health.sleepHours !== null ? health.sleepHours.toFixed(1) : '—'}
                  unit="hours"
                  color={colors.purple}
                />
              </View>

              <Text style={styles.trendsFootnote}>
                This summary uses current values only; it does not invent historical readings.
              </Text>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.quickSection}>
              <View style={styles.sectionHeaderCompact}>
                <View style={styles.sectionEyebrowRow}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.eyebrow}>SHORTCUTS</Text>
                </View>
                <Text style={styles.sectionTitle}>What would you like to do?</Text>
                <Text style={styles.sectionSubtitle}>
                  Jump straight into your next health action.
                </Text>
              </View>

              <View style={styles.actionGrid}>
                <View style={styles.actionCell}>
                  <QuickActionCard
                    icon="⌚"
                    title={live ? 'Live monitor' : 'Start monitoring'}
                    subtitle={live ? 'View current readings' : 'Start demo wearable'}
                    primary
                    onPress={startMonitoring}
                  />
                </View>
                <View style={styles.actionCell}>
                  <QuickActionCard
                    icon="＋"
                    title="Log health"
                    subtitle="Record today’s metrics"
                    onPress={openHealthData}
                  />
                </View>
                <View style={styles.actionCell}>
                  <QuickActionCard
                    icon="◉"
                    title="Mental wellness"
                    subtitle="Check in with yourself"
                    onPress={openMentalHealth}
                  />
                </View>
                <View style={styles.actionCell}>
                  <QuickActionCard
                    icon="✦"
                    title="Talk to AI"
                    subtitle="Ask about your health"
                    onPress={openChatbot}
                  />
                </View>
              </View>
            </View>

            {/* PRIVACY / SAFETY NOTE */}
            <View style={styles.trustCard}>
              <View style={styles.trustIcon}>
                <Text style={styles.trustIconText}>✓</Text>
              </View>

              <View style={styles.trustCopy}>
                <Text style={styles.trustTitle}>Built around your wellness context</Text>
                <Text style={styles.trustText}>
                  Your dashboard brings together available health information,
                  simulated live readings, goals and AI wellness guidance.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View live health"
                style={({ pressed }) => [styles.trustButton, pressed && styles.pressed]}
                onPress={() => router.push('/live-health')}
              >
                <Text style={styles.trustButtonText}>View monitor</Text>
                <Text style={styles.trustButtonArrow}>→</Text>
              </Pressable>
            </View>

            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerIcon}>i</Text>
              <Text style={styles.disclaimer}>
                Wellness guidance is for general information only and is not a medical diagnosis.
                Demo wearable readings are simulated, not measurements from a physical device.
              </Text>
            </View>

            {!isWide && (
              <View style={styles.bottomNavigation}>
                <Pressable onPress={() => router.replace('/')} style={styles.bottomNavItem}>
                  <Text style={styles.bottomNavIconActive}>▦</Text>
                  <Text style={styles.bottomNavTextActive}>Home</Text>
                </Pressable>
                <Pressable onPress={openHealthData} style={styles.bottomNavItem}>
                  <Text style={styles.bottomNavIcon}>＋</Text>
                  <Text style={styles.bottomNavText}>Log data</Text>
                </Pressable>
                <Pressable onPress={openChatbot} style={styles.bottomNavItem}>
                  <Text style={styles.bottomNavIcon}>✦</Text>
                  <Text style={styles.bottomNavText}>AI chat</Text>
                </Pressable>
                <Pressable onPress={openProfile} style={styles.bottomNavItem}>
                  <Text style={styles.bottomNavIcon}>○</Text>
                  <Text style={styles.bottomNavText}>Profile</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: colors.background,
  },
  contentCompact: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  contentTablet: {
    paddingHorizontal: 20,
  },
    shell: {
    width: '100%',
    maxWidth: 1480,
    minWidth: 0,
    alignSelf: 'center',
  },
  shellWide: {
    width: '100%',
    maxWidth: 1480,
    minWidth: 0,
  },

  /* SIDEBAR */
  sidebar: {
    width: 248,
    backgroundColor: '#111A2B',
    borderRightWidth: 1,
    borderRightColor: '#26334A',
    paddingHorizontal: 17,
    paddingTop: 30,
    paddingBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
    paddingHorizontal: 5,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#21483F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandMarkText: {
    color: '#83E6BE',
    fontSize: 22,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#F4F6FF',
    fontSize: 16,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: '#8393AA',
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 3,
    fontWeight: '800',
  },
  navCaption: {
    color: '#72839D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 12,
    marginLeft: 10,
  },
  sidebarItem: {
    minHeight: 47,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: '#1B3B38',
  },
  sidebarIcon: {
    width: 28,
    fontSize: 18,
    color: '#8393AA',
  },
  sidebarIconActive: {
    color: '#83E6BE',
  },
  sidebarLabel: {
    flex: 1,
    color: '#A9B6C9',
    fontSize: 12,
    fontWeight: '600',
  },
  sidebarLabelActive: {
    color: '#F4F6FF',
    fontWeight: '800',
  },
  sidebarActiveMark: {
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#4CC99A',
    position: 'absolute',
    right: 0,
  },
  sidebarSpacer: {
    flex: 1,
    minHeight: 24,
  },
  sidebarHelpCard: {
    borderWidth: 1,
    borderColor: '#303B53',
    backgroundColor: '#1A263B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  sidebarHelpIcon: {
    color: '#B5A4FF',
    fontSize: 21,
    marginBottom: 8,
  },
  sidebarHelpTitle: {
    color: '#F4F6FF',
    fontSize: 12,
    fontWeight: '800',
  },
  sidebarHelpText: {
    color: '#9BAAC0',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },
  sidebarHelpButton: {
    backgroundColor: '#2C2850',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 12,
  },
  sidebarHelpButtonText: {
    color: '#C9BEFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#29364D',
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  sidebarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#263F5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  sidebarAvatarText: {
    color: '#E8F0FF',
    fontWeight: '900',
  },
  sidebarProfileName: {
    color: '#E8EEF9',
    fontSize: 11,
    fontWeight: '800',
  },
  sidebarProfileCaption: {
    color: '#8393AA',
    fontSize: 9,
    marginTop: 3,
  },
  sidebarChevron: {
    color: '#8393AA',
    fontSize: 23,
  },

  /* TOP BAR */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
  },
  topBarCopy: {
    flex: 1,
    minWidth: 0,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
  },
  greeting: {
    color: '#A2B2CA',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#153A34',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  livePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#49D6A0',
    marginRight: 6,
  },
  livePillDotManual: {
    backgroundColor: '#F1B766',
  },
  livePillText: {
    color: '#A5EBD0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  pageTitle: {
    color: '#F4F6FF',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  pageSubtitle: {
    color: '#9BAAC0',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#223B5B',
    borderWidth: 2,
    borderColor: '#2D4C70',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  profileInitial: {
    color: '#E8F0FF',
    fontSize: 17,
    fontWeight: '900',
  },
  profileOnlineDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#49D6A0',
    right: 0,
    bottom: 1,
    borderWidth: 2,
    borderColor: '#0B1220',
  },

  /* MOBILE NAVIGATION */
  mobileNav: {
    flexDirection: 'row',
    backgroundColor: '#141E31',
    borderWidth: 1,
    borderColor: '#2A3650',
    borderRadius: 14,
    padding: 5,
    marginBottom: 17,
    gap: 3,
  },
  mobileNavItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNavItemActive: {
    backgroundColor: '#21463E',
  },
  mobileNavIcon: {
    color: '#A2B2CA',
    fontSize: 15,
    marginBottom: 3,
  },
  mobileNavText: {
    color: '#A2B2CA',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  mobileNavTextActive: {
    color: '#83E6BE',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },

  /* DATA MODE BANNER */
  productStatus: {
    minHeight: 74,
    borderRadius: 17,
    backgroundColor: '#182238',
    borderWidth: 1,
    borderColor: '#2A3650',
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productStatusLive: {
    borderColor: '#347A69',
    backgroundColor: '#172B31',
  },
  productStatusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  statusOrb: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  statusOrbLive: {
    backgroundColor: '#214C42',
  },
  statusOrbManual: {
    backgroundColor: '#26334A',
  },
  statusOrbText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DCE8F8',
  },
  productStatusCopy: {
    flex: 1,
    minWidth: 0,
  },
  productStatusTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    color: '#F4F6FF',
  },
  productStatusDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: '#A2B2CA',
    marginTop: 3,
  },
  modeBadge: {
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modeBadgeLive: {
    backgroundColor: '#214C42',
  },
  modeBadgeManual: {
    backgroundColor: '#29354A',
  },
  modeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  modeBadgeTextLive: {
    color: '#9DEACB',
  },
  modeBadgeTextManual: {
    color: '#C2CDDC',
  },

  /* PRIMARY AREA */
  primaryGrid: {
    width: '100%',
    gap: 13,
  },
  primaryGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dataCoverageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  dataCoverageTitle: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dataCoverageSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 6,
    marginBottom: 12,
  },
  dataCoverageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  dataCoverageLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  dataCoverageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 9,
  },
  dataCoverageLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  dataCoverageValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  dataCoverageUnavailable: {
    color: colors.muted,
    fontWeight: '600',
  },
  dataCoverageFootnote: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  heroColumn: {
    width: '100%',
  },
  heroColumnWide: {
    flex: 1.55,
  },
  deviceColumn: {
    width: '100%',
  },
  deviceColumnWide: {
    flex: 0.95,
  },
  monitorCta: {
    minHeight: 69,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    borderWidth: 1,
  },
  monitorCtaLive: {
    backgroundColor: '#173D37',
    borderColor: '#347A69',
  },
  monitorCtaReady: {
    backgroundColor: '#C96D31',
    borderColor: '#E48A4B',
  },
  monitorCtaIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  monitorCtaIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  monitorCtaCopy: {
    flex: 1,
    minWidth: 0,
  },
  monitorCtaTitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  monitorCtaSubtitle: {
    fontSize: 9,
    lineHeight: 13,
    color: '#FFE3D0',
    marginTop: 3,
  },
  monitorCtaArrow: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginLeft: 7,
  },
  sourceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 3,
  },
  sourceNoteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1B766',
    marginRight: 7,
  },
  sourceNoteText: {
    flex: 1,
    color: '#8393AA',
    fontSize: 8,
    lineHeight: 13,
    letterSpacing: 0.15,
  },

  /* SECTION HEADERS */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 13,
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionHeaderCompact: {
    marginBottom: 12,
  },
  sectionEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 7,
  },
  eyebrow: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#83E6BE',
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: '#F4F6FF',
    marginTop: 5,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: '#9BAAC0',
    marginTop: 3,
  },
  updatedBadge: {
    minHeight: 29,
    borderRadius: 15,
    backgroundColor: '#182238',
    borderWidth: 1,
    borderColor: '#2A3650',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  updatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: '#F1B766',
  },
  updatedDotLive: {
    backgroundColor: '#49D6A0',
  },
  updatedText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#B2BED1',
  },

  /* METRICS */
    metricGrid: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 22,
  },
  metricCell: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 0,
  },
  metricCellWide: {
    flexGrow: 1,
    flexBasis: '15%',
    flexShrink: 1,
    minWidth: 0,
  },

  /* CHECK-IN */
  readinessCard: {
    minHeight: 83,
    borderRadius: 17,
    backgroundColor: '#182238',
    borderWidth: 1,
    borderColor: '#2A3650',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  readinessCardActive: {
    backgroundColor: '#202238',
    borderColor: '#40385F',
  },
  readinessIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#302A4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  readinessIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#C2B5FF',
  },
  readinessCopy: {
    flex: 1,
    minWidth: 0,
  },
  readinessEyebrow: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#B5A4FF',
  },
  readinessTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    color: '#F4F6FF',
    marginTop: 3,
  },
  readinessText: {
    fontSize: 9,
    lineHeight: 14,
    color: '#AEB9CD',
    marginTop: 3,
  },
  readinessAction: {
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#302A4C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginLeft: 9,
  },
  readinessActionText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#C2B5FF',
  },

  /* GOALS + AI CARDS */
  contentGrid: {
    width: '100%',
  },
  contentGridWide: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    width: '100%',
    backgroundColor: '#182238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3650',
    padding: 18,
    marginBottom: 14,
  },
  cardWide: {
    flex: 1,
    marginBottom: 0,
    minWidth: 0,
  },
  aiCard: {
    backgroundColor: '#211F36',
    borderColor: '#40385F',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  cardEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  cardAccentGreen: {
    backgroundColor: '#4CC99A',
  },
  cardAccentPurple: {
    backgroundColor: '#B5A4FF',
  },
  cardAccentBlue: {
    backgroundColor: '#79B7FF',
  },
  cardEyebrow: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: '#83E6BE',
  },
  cardEyebrowPurple: {
    color: '#C2B5FF',
  },
  cardEyebrowBlue: {
    color: '#9ACBFF',
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    color: '#F4F6FF',
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 9,
    lineHeight: 14,
    color: '#9BAAC0',
    marginTop: 3,
  },
  todayBadge: {
    backgroundColor: '#173D37',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  todayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: '#83E6BE',
  },
  goalList: {
    marginTop: 1,
    marginBottom: 8,
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 11,
    backgroundColor: '#173D37',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#83E6BE',
  },
  secondaryButtonArrow: {
    fontSize: 15,
    fontWeight: '900',
    color: '#83E6BE',
  },
  aiBadge: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: '#302A4C',
    borderWidth: 1,
    borderColor: '#514575',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#C2B5FF',
  },
  aiMessage: {
    minHeight: 83,
    borderRadius: 15,
    backgroundColor: '#292640',
    borderWidth: 1,
    borderColor: '#40385F',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiMessageIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#393154',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  aiMessageIconText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#C2B5FF',
  },
  aiMessageText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: '#D2CDEB',
  },
  aiButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#246F61',
    borderWidth: 1,
    borderColor: '#378B78',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  aiButtonCopy: {
    flex: 1,
    minWidth: 0,
  },
  aiButtonTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiButtonSubtitle: {
    fontSize: 8,
    lineHeight: 12,
    color: '#D9F1EA',
    marginTop: 2,
  },
  aiButtonArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 9,
  },
  aiButtonArrow: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* TREND SUMMARY */
  trendsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3650',
    backgroundColor: '#182238',
    padding: 18,
    marginTop: 15,
    marginBottom: 17,
  },
  trendsBadge: {
    borderRadius: 10,
    backgroundColor: '#233A5C',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  trendsBadgeText: {
    color: '#9ACBFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  trendsPlaceholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricPlaceholder: {
    flex: 1,
    minWidth: 130,
    borderRadius: 13,
    backgroundColor: '#202D42',
    borderWidth: 1,
    borderColor: '#2A3650',
    padding: 13,
  },
  metricPlaceholderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 9,
  },
  metricPlaceholderLabel: {
    color: '#A2B2CA',
    fontSize: 9,
    fontWeight: '700',
  },
  metricPlaceholderValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 5,
  },
  metricPlaceholderValue: {
    color: '#F4F6FF',
    fontSize: 22,
    fontWeight: '900',
  },
  metricPlaceholderUnit: {
    color: '#9BAAC0',
    fontSize: 9,
  },
  trendsFootnote: {
    color: '#8393AA',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 12,
  },

  /* QUICK ACTIONS */
  quickSection: {
    marginTop: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCell: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
  },

  /* TRUST + DISCLAIMER */
  trustCard: {
    minHeight: 83,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#2A3650',
    backgroundColor: '#182238',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  trustIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#173D37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#83E6BE',
  },
  trustCopy: {
    flex: 1,
    minWidth: 0,
  },
  trustTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    color: '#F4F6FF',
  },
  trustText: {
    fontSize: 9,
    lineHeight: 14,
    color: '#9BAAC0',
    marginTop: 3,
  },
  trustButton: {
    minHeight: 35,
    borderRadius: 10,
    backgroundColor: '#173D37',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustButtonText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#83E6BE',
  },
  trustButtonArrow: {
    fontSize: 12,
    fontWeight: '900',
    color: '#83E6BE',
    marginLeft: 5,
  },
  disclaimerCard: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 11,
    paddingHorizontal: 8,
    gap: 7,
  },
  disclaimerIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#26334A',
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 9,
    fontWeight: '900',
    color: '#A2B2CA',
  },
  disclaimer: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 13,
    color: '#8393AA',
  },

  /* MOBILE BOTTOM NAV */
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A3650',
    backgroundColor: '#141E31',
    paddingVertical: 9,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 10,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bottomNavIcon: {
    color: '#9BAAC0',
    fontSize: 17,
  },
  bottomNavIconActive: {
    color: '#83E6BE',
    fontSize: 17,
  },
  bottomNavText: {
    color: '#9BAAC0',
    fontSize: 8,
    marginTop: 3,
  },
  bottomNavTextActive: {
    color: '#83E6BE',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 3,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});