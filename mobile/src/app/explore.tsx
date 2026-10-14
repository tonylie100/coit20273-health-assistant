import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getHealthState,
  subscribeToHealthState,
  type HealthState,
} from '../services/healthState';

type RecommendationPriority = 'High' | 'Medium' | 'Low';

type Recommendation = {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  priority: RecommendationPriority;
  category: string;
};

function getPriorityStyle(priority: RecommendationPriority) {
  switch (priority) {
    case 'High':
      return {
        backgroundColor: '#FFF1F0',
        textColor: '#C0392B',
      };

    case 'Medium':
      return {
        backgroundColor: '#FFF7E8',
        textColor: '#A15C00',
      };

    default:
      return {
        backgroundColor: '#EAF7F2',
        textColor: '#16805C',
      };
  }
}

function buildRecommendations(health: HealthState): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const sleepHours = health.sleepHours ?? 0;
  const energyLevel = health.energyLevel ?? 5;
  const wellnessScore = health.wellnessScore ?? 0;

  const hydrationGoal = health.waterGoalLitres || 2.5;
  const sleepGoal = health.sleepGoalHours || 8;
  const stepGoal = health.stepGoal || 8000;

  const hydrationProgress =
    hydrationGoal > 0
      ? health.waterIntake / hydrationGoal
      : 0;

  const sleepProgress =
    sleepGoal > 0
      ? sleepHours / sleepGoal
      : 0;

  const activityProgress =
    stepGoal > 0
      ? health.steps / stepGoal
      : 0;

  if (hydrationProgress < 0.5) {
    recommendations.push({
      id: 'hydration-high',
      icon: '💧',
      title: 'Hydration needs attention',
      description: `You have recorded ${health.waterIntake.toFixed(
        1
      )} L against a ${hydrationGoal.toFixed(
        1
      )} L daily goal. Consider drinking water regularly throughout the day.`,
      action: 'Drink water',
      priority: 'High',
      category: 'Hydration',
    });
  } else if (hydrationProgress < 0.8) {
    recommendations.push({
      id: 'hydration-medium',
      icon: '💧',
      title: 'Keep your hydration on track',
      description: `You are making progress toward your ${hydrationGoal.toFixed(
        1
      )} L goal. A few more glasses can help you stay on target.`,
      action: 'Continue hydration',
      priority: 'Medium',
      category: 'Hydration',
    });
  } else {
    recommendations.push({
      id: 'hydration-good',
      icon: '💧',
      title: 'Hydration is on track',
      description:
        'Your recorded water intake is close to your daily target. Keep maintaining consistent hydration.',
      action: 'Maintain',
      priority: 'Low',
      category: 'Hydration',
    });
  }

  if (sleepProgress < 0.75) {
    recommendations.push({
      id: 'sleep-high',
      icon: '🌙',
      title: 'Prioritise recovery',
      description: `Your current sleep is ${sleepHours.toFixed(
        1
      )} hours compared with a ${sleepGoal.toFixed(
        1
      )}-hour target. Consider protecting your sleep routine tonight.`,
      action: 'View sleep guidance',
      priority: 'High',
      category: 'Sleep',
    });
  } else if (sleepProgress < 1) {
    recommendations.push({
      id: 'sleep-medium',
      icon: '🌙',
      title: 'Improve sleep consistency',
      description:
        'Your sleep is progressing toward the target. A consistent bedtime and reduced late-night screen time may support recovery.',
      action: 'Improve routine',
      priority: 'Medium',
      category: 'Sleep',
    });
  } else {
    recommendations.push({
      id: 'sleep-good',
      icon: '🌙',
      title: 'Sleep target achieved',
      description:
        'Your recorded sleep meets or exceeds the current target. Continue maintaining a consistent recovery routine.',
      action: 'Maintain',
      priority: 'Low',
      category: 'Sleep',
    });
  }

  if (activityProgress < 0.5) {
    recommendations.push({
      id: 'activity-high',
      icon: '🚶',
      title: 'Add some movement',
      description: `You have recorded ${health.steps.toLocaleString()} steps today. A short walk or light activity could help move you toward your daily target.`,
      action: 'Start moving',
      priority: 'High',
      category: 'Activity',
    });
  } else if (activityProgress < 1) {
    recommendations.push({
      id: 'activity-medium',
      icon: '🏃',
      title: 'Keep building activity',
      description: `You are ${Math.round(
        activityProgress * 100
      )}% toward your current step goal. A short additional walk could help close the gap.`,
      action: 'Continue activity',
      priority: 'Medium',
      category: 'Activity',
    });
  } else {
    recommendations.push({
      id: 'activity-good',
      icon: '🏃',
      title: 'Activity goal reached',
      description:
        'Your recorded activity has reached the current step target. Focus on balanced movement and recovery.',
      action: 'Maintain',
      priority: 'Low',
      category: 'Activity',
    });
  }

  if (energyLevel <= 3) {
    recommendations.push({
      id: 'energy-high',
      icon: '🔋',
      title: 'Recovery may be important today',
      description:
        'Your recorded energy level is low. Consider balancing activity with rest and paying attention to how you feel.',
      action: 'Review recovery',
      priority: 'High',
      category: 'Recovery',
    });
  } else if (energyLevel <= 6) {
    recommendations.push({
      id: 'energy-medium',
      icon: '🔋',
      title: 'Balance activity and recovery',
      description:
        'Your energy level is moderate. Keep activity comfortable and allow enough time for recovery.',
      action: 'Balance today',
      priority: 'Medium',
      category: 'Recovery',
    });
  } else {
    recommendations.push({
      id: 'energy-good',
      icon: '🔋',
      title: 'Energy level looks positive',
      description:
        'Your recorded energy level is relatively strong. Continue balancing activity, hydration and recovery.',
      action: 'Maintain',
      priority: 'Low',
      category: 'Recovery',
    });
  }

  // Keep wellnessScore intentionally read here so the recommendation
  // engine remains aware of the overall wellness context.
  if (wellnessScore < 40) {
    recommendations.unshift({
      id: 'wellness-priority',
      icon: '🧭',
      title: 'Focus on your core wellness habits',
      description:
        'Your current overall wellness score is lower than usual. Prioritise manageable basics such as hydration, sleep, movement and recovery.',
      action: 'Review wellness',
      priority: 'High',
      category: 'Overall wellness',
    });
  }

  return recommendations;
}

function getOverallMessage(wellnessScore: number | null) {
  const score = wellnessScore ?? 0;

  if (score >= 80) {
    return {
      title: 'You are doing well',
      description:
        'Your current wellness signals are generally positive. Keep maintaining consistent habits and recovery.',
    };
  }

  if (score >= 60) {
    return {
      title: 'A few areas need attention',
      description:
        'Your current wellness picture is reasonably balanced, with a few opportunities to improve your daily routine.',
    };
  }

  return {
    title: 'Focus on the basics today',
    description:
      'Your current wellness score suggests giving extra attention to hydration, recovery, activity and how you are feeling.',
  };
}

export default function ExploreScreen() {
  const [health, setHealth] = useState<HealthState>(() =>
    getHealthState()
  );

  useEffect(() => {
    return subscribeToHealthState((nextHealth) => {
      setHealth(nextHealth);
    });
  }, []);

  const recommendations = useMemo(
    () => buildRecommendations(health),
    [health]
  );

  const overallMessage = useMemo(
    () => getOverallMessage(health.wellnessScore),
    [health.wellnessScore]
  );

  const highPriorityCount = recommendations.filter(
    (item) => item.priority === 'High'
  ).length;

  const lastUpdated = health.lastUpdated
    ? new Date(health.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Waiting';

  const wellnessScore = health.wellnessScore ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              PERSONALISED WELLNESS
            </Text>

            <Text style={styles.title}>
              Recommendations
            </Text>

            <Text style={styles.subtitle}>
              Practical guidance based on your current wellness
              context.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✦</Text>
          </View>
        </View>

        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />

          <View style={styles.liveBannerText}>
            <Text style={styles.liveTitle}>
              Demo health context
            </Text>

            <Text style={styles.liveSubtitle}>
              Recommendations update as your prototype health
              data changes.
            </Text>
          </View>

          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>
              SIMULATED
            </Text>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.overviewScore}>
              <Text style={styles.scoreValue}>
                {Math.round(wellnessScore)}
              </Text>

              <Text style={styles.scoreLabel}>
                Wellness
              </Text>
            </View>

            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>
                {overallMessage.title}
              </Text>

              <Text style={styles.overviewDescription}>
                {overallMessage.description}
              </Text>
            </View>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewFooter}>
            <Text style={styles.updatedText}>
              Health context updated {lastUpdated}
            </Text>

            {highPriorityCount > 0 && (
              <View style={styles.prioritySummary}>
                <Text style={styles.prioritySummaryText}>
                  {highPriorityCount} priority{' '}
                  {highPriorityCount === 1
                    ? 'area'
                    : 'areas'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              For you today
            </Text>

            <Text style={styles.sectionSubtitle}>
              Suggestions generated from your current data
            </Text>
          </View>
        </View>

        <View style={styles.recommendations}>
          {recommendations.map((recommendation) => {
            const priorityStyle = getPriorityStyle(
              recommendation.priority
            );

            return (
              <View
                key={recommendation.id}
                style={styles.recommendationCard}
              >
                <View style={styles.recommendationTop}>
                  <View style={styles.recommendationIcon}>
                    <Text style={styles.recommendationIconText}>
                      {recommendation.icon}
                    </Text>
                  </View>

                  <View style={styles.recommendationHeading}>
                    <View style={styles.titleRow}>
                      <Text
                        style={styles.recommendationTitle}
                      >
                        {recommendation.title}
                      </Text>

                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              priorityStyle.backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            {
                              color:
                                priorityStyle.textColor,
                            },
                          ]}
                        >
                          {recommendation.priority}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.categoryText}>
                      {recommendation.category}
                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.recommendationDescription}
                >
                  {recommendation.description}
                </Text>

                <View style={styles.recommendationFooter}>
                  <Text style={styles.actionText}>
                    {recommendation.action}
                  </Text>

                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Safety & support
            </Text>

            <Text style={styles.sectionSubtitle}>
              Important boundaries for wellness guidance
            </Text>
          </View>
        </View>

        <View style={styles.safetyCard}>
          <View style={styles.safetyIcon}>
            <Text style={styles.safetyIconText}>⚕</Text>
          </View>

          <View style={styles.safetyContent}>
            <Text style={styles.safetyTitle}>
              Wellness guidance, not diagnosis
            </Text>

            <Text style={styles.safetyText}>
              This prototype provides general wellness
              suggestions based on the information available in
              the app. It does not diagnose medical conditions or
              replace professional medical advice.
            </Text>

            <Text style={styles.safetyEmergency}>
              If you experience severe, sudden or concerning
              symptoms, seek appropriate medical care or
              emergency assistance.
            </Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>
            Continue your health journey
          </Text>

          <Pressable
            onPress={() => router.push('/live-health')}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Text>♥</Text>
            </View>

            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>
                View live health
              </Text>

              <Text style={styles.actionButtonSubtitle}>
                See your current simulated health signals
              </Text>
            </View>

            <Text style={styles.actionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/mental-health')}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Text>☀</Text>
            </View>

            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>
                Check your wellbeing
              </Text>

              <Text style={styles.actionButtonSubtitle}>
                Record mood, stress and energy
              </Text>
            </View>

            <Text style={styles.actionArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/chatbot')}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.actionButtonIcon}>
              <Text>✦</Text>
            </View>

            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>
                Ask your AI assistant
              </Text>

              <Text style={styles.actionButtonSubtitle}>
                Discuss your current wellness context
              </Text>
            </View>

            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteIcon}>ⓘ</Text>

          <Text style={styles.bottomNoteText}>
            Recommendations are generated from the health
            information currently available in this prototype and
            may change as new values are recorded.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F7',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#178566',
    marginBottom: 7,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#102A24',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7C76',
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E1F3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 23,
    color: '#178566',
  },

  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7F2',
    borderWidth: 1,
    borderColor: '#D3ECE3',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },

  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#20A978',
    marginRight: 11,
  },

  liveBannerText: {
    flex: 1,
  },

  liveTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#12684F',
  },

  liveSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: '#4C7165',
  },

  demoBadge: {
    backgroundColor: '#D8EEE6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginLeft: 8,
  },

  demoBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#167458',
  },

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#E7EEEB',
    shadowColor: '#102A24',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  overviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewScore: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#EAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  scoreValue: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '800',
    color: '#16805C',
  },

  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#548276',
    marginTop: 2,
  },

  overviewContent: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A24',
  },

  overviewDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7C76',
  },

  overviewDivider: {
    height: 1,
    backgroundColor: '#EDF1EF',
    marginVertical: 15,
  },

  overviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  updatedText: {
    flex: 1,
    fontSize: 10,
    color: '#87958F',
  },

  prioritySummary: {
    backgroundColor: '#FFF1F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  prioritySummaryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C0392B',
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A24',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#7B8984',
  },

  recommendations: {
    gap: 12,
    marginBottom: 26,
  },

  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EEEB',
  },

  recommendationTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recommendationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F6F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  recommendationIconText: {
    fontSize: 21,
  },

  recommendationHeading: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  recommendationTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#18332C',
    paddingRight: 8,
  },

  categoryText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: '#8A9892',
  },

  priorityBadge: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  priorityText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  recommendationDescription: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 20,
    color: '#64756F',
  },

  recommendationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFF3F1',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16805C',
  },

  arrow: {
    fontSize: 22,
    lineHeight: 20,
    color: '#16805C',
  },

  safetyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9EF',
    borderWidth: 1,
    borderColor: '#F2E4C8',
    borderRadius: 19,
    padding: 16,
    marginBottom: 24,
  },

  safetyIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFF0D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  safetyIconText: {
    fontSize: 20,
    color: '#A15C00',
  },

  safetyContent: {
    flex: 1,
  },

  safetyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#754A10',
  },

  safetyText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#795F37',
  },

  safetyEmergency: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
    color: '#704B18',
  },

  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EEEB',
    marginBottom: 18,
  },

  actionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#18332C',
    marginBottom: 8,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },

  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#EAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  actionButtonText: {
    flex: 1,
  },

  actionButtonTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18332C',
  },

  actionButtonSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#7B8984',
  },

  actionArrow: {
    fontSize: 23,
    color: '#16805C',
    marginLeft: 8,
  },

  pressed: {
    opacity: 0.65,
  },

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    marginTop: 2,
  },

  bottomNoteIcon: {
    fontSize: 13,
    color: '#87958F',
    marginRight: 7,
  },

  bottomNoteText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: '#87958F',
  },
});