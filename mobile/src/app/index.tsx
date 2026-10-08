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
  background: '#F5FAF9',
  surface: '#FFFFFF',
  border: '#DDEBE8',
  text: '#082B45',
  muted: '#70838F',
  mutedStrong: '#526A78',
  primary: '#247D6D',
  primaryDark: '#176557',
  primarySoft: '#DFF2EC',
  success: '#1C9A70',
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [health, setHealth] = useState<HealthState>(
    getHealthState(),
  );

  useEffect(() => {
    return subscribeToHealthState(setHealth);
  }, []);

  const wellnessLabel = useMemo(
    () => getWellnessLabel(health.wellnessScore),
    [health.wellnessScore],
  );

  const insight = useMemo(
    () => getHealthInsight(health),
    [health],
  );

  const live =
    health.deviceConnected &&
    health.isDemoDevice;

  const stepsProgress =
    health.stepGoal > 0
      ? Math.min(
          100,
          (health.steps / health.stepGoal) * 100,
        )
      : 0;

  const waterProgress =
    health.waterGoalLitres > 0
      ? Math.min(
          100,
          (health.waterIntake /
            health.waterGoalLitres) *
            100,
        )
      : 0;

  const sleepProgress =
    health.sleepGoalHours > 0 &&
    health.sleepHours !== null
      ? Math.min(
          100,
          (health.sleepHours /
            health.sleepGoalHours) *
            100,
        )
      : 0;

  const startMonitoring = () => {
    if (!isHealthStreamRunning()) {
      startHealthStream();
    }

    router.push('/live-health');
  };

  const formatUpdated = (
    value: string | null,
  ) => {
    if (!value) {
      return 'Waiting for an update';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Waiting for an update';
    }

    return `Updated ${date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    )}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <DashboardHeader
            onProfilePress={() =>
              router.push('/profile')
            }
          />

          <View
            style={[
              styles.heroRow,
              isWide && styles.heroRowWide,
            ]}
          >
            <View
              style={[
                styles.heroMain,
                isWide && styles.heroMainWide,
              ]}
            >
              <WellnessHero
                score={health.wellnessScore}
                label={wellnessLabel}
                insight={insight}
              />
            </View>

            <View
              style={[
                styles.deviceWrap,
                isWide &&
                  styles.deviceWrapWide,
              ]}
            >
              <LiveDeviceBanner
                connected={live}
                deviceName={
                  health.deviceName
                }
                lastUpdated={
                  health.lastUpdated
                }
                onPress={() =>
                  router.push(
                    '/live-health',
                  )
                }
              />

              <View
                style={styles.sourceStrip}
              >
                <View
                  style={styles.sourceIcon}
                >
                  <Text
                    style={
                      styles.sourceIconText
                    }
                  >
                    i
                  </Text>
                </View>

                <View
                  style={styles.sourceCopy}
                >
                  <Text
                    style={styles.sourceTitle}
                  >
                    {live
                      ? 'Demo wearable active'
                      : 'Manual health mode'}
                  </Text>

                  <Text
                    style={styles.sourceText}
                  >
                    {live
                      ? 'Live values are simulated for this prototype.'
                      : 'Enter health data or start the demo wearable.'}
                  </Text>
                </View>

                {live ? (
                  <View
                    style={styles.livePill}
                  >
                    <View
                      style={
                        styles.liveDot
                      }
                    />

                    <Text
                      style={
                        styles.livePillText
                      }
                    >
                      LIVE
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.eyebrow}>
                TODAY
              </Text>

              <Text style={styles.sectionTitle}>
                Health at a glance
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Your latest available wellness
                metrics
              </Text>
            </View>

            <Text style={styles.updated}>
              {formatUpdated(
                health.lastUpdated,
              )}
            </Text>
          </View>

          <View style={styles.metricGrid}>
            <HealthMetricCard
              icon="♥"
              label="Heart rate"
              value={
                health.heartRate !== null
                  ? String(
                      health.heartRate,
                    )
                  : '--'
              }
              unit="BPM"
              live={live}
            />

            <HealthMetricCard
              icon="⌁"
              label="Steps"
              value={
                health.steps > 0
                  ? health.steps.toLocaleString()
                  : '--'
              }
              progress={stepsProgress}
            />

            <HealthMetricCard
              icon="☾"
              label="Sleep"
              value={
                health.sleepHours !==
                null
                  ? health.sleepHours.toFixed(
                      1,
                    )
                  : '--'
              }
              unit="hrs"
              progress={sleepProgress}
            />

            <HealthMetricCard
              icon="◊"
              label="Hydration"
              value={
                health.waterIntake > 0
                  ? health.waterIntake.toFixed(
                      1,
                    )
                  : '--'
              }
              unit="L"
              progress={waterProgress}
            />

            <HealthMetricCard
              icon="△"
              label="Active time"
              value={
                health.activeMinutes > 0
                  ? String(
                      health.activeMinutes,
                    )
                  : '--'
              }
              unit="min"
            />

            <HealthMetricCard
              icon="◌"
              label="Oxygen"
              value={
                health.oxygenSaturation !==
                null
                  ? String(
                      health.oxygenSaturation,
                    )
                  : '--'
              }
              unit="%"
              live={live}
            />
          </View>

          <View
            style={[
              styles.twoColumn,
              isWide &&
                styles.twoColumnWide,
            ]}
          >
            <View
              style={[
                styles.panel,
                isWide &&
                  styles.panelWide,
              ]}
            >
              <View
                style={styles.panelHeader}
              >
                <View>
                  <Text
                    style={styles.eyebrow}
                  >
                    PROGRESS
                  </Text>

                  <Text
                    style={styles.panelTitle}
                  >
                    Daily goals
                  </Text>
                </View>

                <Text
                  style={styles.panelMeta}
                >
                  Today
                </Text>
              </View>

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
                current={
                  health.waterIntake
                }
                target={
                  health.waterGoalLitres
                }
                unit="L"
              />

              <GoalProgress
                icon="☾"
                title="Sleep"
                current={
                  health.sleepHours ?? 0
                }
                target={
                  health.sleepGoalHours
                }
                unit="h"
              />
            </View>

            <View
              style={[
                styles.panel,
                styles.insightPanel,
                isWide &&
                  styles.panelWide,
              ]}
            >
              <View
                style={styles.panelHeader}
              >
                <View>
                  <Text
                    style={styles.eyebrow}
                  >
                    AI GUIDANCE
                  </Text>

                  <Text
                    style={styles.panelTitle}
                  >
                    Personalised insight
                  </Text>
                </View>

                <View
                  style={styles.aiBadge}
                >
                  <Text
                    style={styles.aiBadgeText}
                  >
                    AI
                  </Text>
                </View>
              </View>

              <Text
                style={styles.insightText}
              >
                {insight}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.aiButton,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={() =>
                  router.push('/chatbot')
                }
              >
                <Text
                  style={styles.aiButtonText}
                >
                  Ask AI about my health
                </Text>

                <Text
                  style={styles.aiButtonArrow}
                >
                  →
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={styles.sectionHeadingCompact}
          >
            <View>
              <Text style={styles.eyebrow}>
                SHORTCUTS
              </Text>

              <Text
                style={styles.sectionTitle}
              >
                Quick actions
              </Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <QuickActionCard
              icon="⌚"
              title={
                live
                  ? 'Live monitor'
                  : 'Start monitoring'
              }
              subtitle={
                live
                  ? 'View current readings'
                  : 'Start demo wearable'
              }
              primary
              onPress={startMonitoring}
            />

            <QuickActionCard
              icon="＋"
              title="Log health"
              subtitle="Record today’s metrics"
              onPress={() =>
                router.push(
                  '/health-data',
                )
              }
            />

            <QuickActionCard
              icon="◉"
              title="Mental wellness"
              subtitle="Check your wellbeing"
              onPress={() =>
                router.push(
                  '/mental-health',
                )
              }
            />

            <QuickActionCard
              icon="✦"
              title="Talk to AI"
              subtitle="Ask about your health"
              onPress={() =>
                router.push('/chatbot')
              }
            />
          </View>

          <View
            style={styles.footerCard}
          >
            <View
              style={styles.footerIcon}
            >
              <Text
                style={
                  styles.footerIconText
                }
              >
                ✓
              </Text>
            </View>

            <View
              style={styles.footerCopy}
            >
              <Text
                style={styles.footerTitle}
              >
                Wellness companion
              </Text>

              <Text
                style={styles.footerText}
              >
                Your dashboard combines
                available health information,
                demo live readings and AI
                wellness guidance.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.footerButton,
                pressed &&
                  styles.pressed,
              ]}
              onPress={() =>
                router.push(
                  '/live-health',
                )
              }
            >
              <Text
                style={
                  styles.footerButtonText
                }
              >
                View live health
              </Text>
            </Pressable>
          </View>

          <Text
            style={styles.disclaimer}
          >
            Wellness guidance is for general
            informational purposes and is not a
            medical diagnosis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 42,
  },

  shell: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },

  heroRow: {
    width: '100%',
  },

  heroRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },

  heroMain: {
    width: '100%',
  },

  heroMainWide: {
    flex: 1.55,
  },

  deviceWrap: {
    width: '100%',
  },

  deviceWrapWide: {
    flex: 0.95,
  },

  sourceStrip: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#F0F8F6',
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  sourceIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCEFEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  sourceIconText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },

  sourceCopy: {
    flex: 1,
  },

  sourceTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },

  sourceText: {
    fontSize: 9,
    lineHeight: 13,
    color: colors.muted,
    marginTop: 2,
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      colors.primarySoft,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 8,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      colors.success,
    marginRight: 4,
  },

  livePillText: {
    fontSize: 7,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionHeadingCompact: {
    marginTop: 4,
    marginBottom: 11,
  },

  eyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.primary,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
  },

  sectionSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 2,
  },

  updated: {
    fontSize: 9,
    color: colors.muted,
    paddingBottom: 2,
  },

  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  twoColumn: {
    width: '100%',
  },

  twoColumnWide: {
    flexDirection: 'row',
    gap: 14,
  },

  panel: {
    width: '100%',
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },

  panelWide: {
    flex: 1,
    marginBottom: 0,
  },

  insightPanel: {
    backgroundColor: '#F9FCFB',
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 14,
  },

  panelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    marginTop: 2,
  },

  panelMeta: {
    fontSize: 9,
    color: colors.muted,
  },

  aiBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFF1DF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B66C16',
  },

  insightText: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.mutedStrong,
    minHeight: 58,
  },

  aiButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor:
      colors.primary,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: 14,
  },

  aiButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiButtonArrow: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  footerCard: {
    marginTop: 16,
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  footerIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },

  footerCopy: {
    flex: 1,
  },

  footerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.text,
  },

  footerText: {
    fontSize: 9,
    lineHeight: 14,
    color: colors.muted,
    marginTop: 2,
  },

  footerButton: {
    minHeight: 36,
    borderRadius: 11,
    backgroundColor: '#E8F5F1',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  footerButtonText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDark,
  },

  pressed: {
    opacity: 0.78,
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 8,
    lineHeight: 13,
    color: '#87969E',
    marginTop: 13,
  },
});