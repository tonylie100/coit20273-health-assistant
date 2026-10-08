import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import {
  getHealthState,
  updateHealthState,
  subscribeToHealthState,
  type HealthState,
} from '../services/healthState';

import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from '../theme';

type Mood =
  | 'Great'
  | 'Good'
  | 'Okay'
  | 'Low'
  | 'Stressed';

type QuickFeeling =
  | 'Calm'
  | 'Motivated'
  | 'Tired'
  | 'Overwhelmed'
  | 'Anxious'
  | 'Happy';

const MOODS: {
  value: Mood;
  emoji: string;
  description: string;
}[] = [
  {
    value: 'Great',
    emoji: '😄',
    description: 'Feeling really good',
  },
  {
    value: 'Good',
    emoji: '🙂',
    description: 'Doing well',
  },
  {
    value: 'Okay',
    emoji: '😐',
    description: 'Just getting through',
  },
  {
    value: 'Low',
    emoji: '😔',
    description: 'Feeling a little down',
  },
  {
    value: 'Stressed',
    emoji: '😣',
    description: 'Feeling under pressure',
  },
];

const FEELINGS: {
  value: QuickFeeling;
  emoji: string;
}[] = [
  { value: 'Calm', emoji: '🌿' },
  { value: 'Motivated', emoji: '⚡' },
  { value: 'Tired', emoji: '😴' },
  { value: 'Overwhelmed', emoji: '🌊' },
  { value: 'Anxious', emoji: '💭' },
  { value: 'Happy', emoji: '✨' },
];

export default function MentalHealthScreen() {
  const [health, setHealth] = useState<HealthState>(
    getHealthState(),
  );

  const [mood, setMood] = useState<Mood | null>(
    (health.mood as Mood) || null,
  );

  const [stress, setStress] = useState(
    stressToNumber(health.stressLevel),
  );

  const [energy, setEnergy] = useState(
    health.energyLevel ?? 6,
  );

  const [selectedFeelings, setSelectedFeelings] =
    useState<QuickFeeling[]>([]);

  const [reflection, setReflection] = useState(
    health.symptoms || '',
  );

  const [saved, setSaved] = useState(false);

  const [breathing, setBreathing] = useState(false);

  const [breathingPhase, setBreathingPhase] =
    useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const [breathingSeconds, setBreathingSeconds] =
    useState(4);

  const [breathingRound, setBreathingRound] =
    useState(1);

  useEffect(() => {
    const unsubscribe = subscribeToHealthState((state) => {
      setHealth({ ...state });

      setMood((currentMood) => {
        if (currentMood === null && state.mood) {
          return state.mood as Mood;
        }

        return currentMood;
      });

      if (state.energyLevel !== null) {
        setEnergy(state.energyLevel);
      }

      if (state.stressLevel) {
        setStress(
          stressToNumber(state.stressLevel),
        );
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!breathing) {
      return;
    }

    const timer = setInterval(() => {
      setBreathingSeconds((current) => {
        if (current > 1) {
          return current - 1;
        }

        if (breathingPhase === 'Inhale') {
          setBreathingPhase('Hold');
          return 4;
        }

        if (breathingPhase === 'Hold') {
          setBreathingPhase('Exhale');
          return 6;
        }

        setBreathingPhase('Inhale');

        setBreathingRound((round) =>
          round >= 5 ? 1 : round + 1,
        );

        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathing, breathingPhase]);

  const stressLabel = getStressLabel(stress);
  const energyLabel = getEnergyLabel(energy);

  const wellnessFeeling = useMemo(() => {
    if (!mood) {
      return 'Start with a quick mood check-in. There are no right or wrong answers.';
    }

    if (mood === 'Great') {
      return 'You seem to be having a positive day. Keep doing what is working for you and make space for recovery.';
    }

    if (mood === 'Good') {
      return 'You are doing well today. A little intentional self-care can help maintain that balance.';
    }

    if (mood === 'Okay') {
      return 'It is okay to have an average day. Focus on one small thing that could make the next hour better.';
    }

    if (mood === 'Low') {
      return 'Be gentle with yourself today. Small steps, rest and connection with someone you trust can help.';
    }

    return 'You may be carrying a lot today. A short breathing exercise or a conversation with someone you trust may help.';
  }, [mood]);

  const checkInSummary = useMemo(() => {
    const parts: string[] = [];

    if (mood) {
      parts.push(mood);
    }

    parts.push(`${stressLabel.toLowerCase()} stress`);
    parts.push(`${energyLabel.toLowerCase()} energy`);

    return parts.join(' · ');
  }, [mood, stressLabel, energyLabel]);

  const saveCheckIn = () => {
    const stressLevel =
      getStressLevelValue(stress);

    updateHealthState({
      mood,
      stressLevel,
      energyLevel: energy,
      symptoms: reflection,
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3500);
  };

  const toggleFeeling = (
    feeling: QuickFeeling,
  ) => {
    setSelectedFeelings((current) => {
      if (current.includes(feeling)) {
        return current.filter(
          (item) => item !== feeling,
        );
      }

      return [...current, feeling];
    });

    setSaved(false);
  };

  const startBreathing = () => {
    setBreathingPhase('Inhale');
    setBreathingSeconds(4);
    setBreathingRound(1);
    setBreathing(true);
  };

  const stopBreathing = () => {
    setBreathing(false);
    setBreathingPhase('Inhale');
    setBreathingSeconds(4);
    setBreathingRound(1);
  };

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
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Mental Wellness
            </Text>

            <Text style={styles.headerSubtitle}>
              A private space to check in with yourself
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              🧠
            </Text>
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>
                🌿
              </Text>
            </View>

            <Text style={styles.heroEyebrow}>
              YOUR WELLNESS SPACE
            </Text>

            <Text style={styles.heroTitle}>
              How are you feeling today?
            </Text>

            <Text style={styles.heroDescription}>
              Take a moment to check in with yourself.
              There are no right or wrong answers.
            </Text>
          </View>
        </View>

        {/* MOOD */}

        <SectionHeader
          eyebrow="01 · MOOD"
          title="Choose what feels closest"
          subtitle="Your mood helps personalise your wellness experience."
        />

        <View style={styles.moodCard}>
          <View style={styles.moodGrid}>
            {MOODS.map((option) => {
              const selected =
                mood === option.value;

              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.moodOption,
                    selected &&
                      styles.moodOptionSelected,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={() => {
                    setMood(option.value);
                    setSaved(false);
                  }}
                >
                  <View
                    style={[
                      styles.moodEmojiContainer,
                      selected &&
                        styles.moodEmojiContainerSelected,
                    ]}
                  >
                    <Text style={styles.moodEmoji}>
                      {option.emoji}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.moodName,
                      selected &&
                        styles.moodNameSelected,
                    ]}
                  >
                    {option.value}
                  </Text>

                  <Text
                    style={[
                      styles.moodDescription,
                      selected &&
                        styles.moodDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>

                  {selected ? (
                    <View
                      style={
                        styles.selectedIndicator
                      }
                    >
                      <Text
                        style={
                          styles.selectedIndicatorText
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* STRESS + ENERGY */}

        <SectionHeader
          eyebrow="02 · HOW YOU FEEL"
          title="Stress and energy"
          subtitle="Move the indicators to reflect how today feels."
        />

        <View style={styles.sliderCard}>
          <WellnessSlider
            icon="🌊"
            title="Stress level"
            description="How much pressure are you feeling?"
            value={stress}
            minLabel="Very calm"
            maxLabel="Very stressed"
            accent={colors.secondary}
            onChange={(value) => {
              setStress(value);
              setSaved(false);
            }}
          />

          <View style={styles.sliderDivider} />

          <WellnessSlider
            icon="⚡"
            title="Energy level"
            description="How much energy do you have right now?"
            value={energy}
            minLabel="Very low"
            maxLabel="Very high"
            accent={colors.warning}
            onChange={(value) => {
              setEnergy(value);
              setSaved(false);
            }}
          />
        </View>

        {/* STATUS */}

        <View style={styles.statusGrid}>
          <StatusCard
            icon="🌊"
            label="Stress"
            value={stressLabel}
            level={stress}
            inverse
          />

          <StatusCard
            icon="⚡"
            label="Energy"
            value={energyLabel}
            level={energy}
          />

          <StatusCard
            icon="🙂"
            label="Mood"
            value={mood || 'Not set'}
            level={
              mood ? moodScore(mood) : 0
            }
          />
        </View>

        {/* QUICK FEELINGS */}

        <SectionHeader
          eyebrow="03 · QUICK CHECK-IN"
          title="What else is on your mind?"
          subtitle="Select anything that feels relevant right now."
        />

        <View style={styles.feelingsCard}>
          <View style={styles.feelingsGrid}>
            {FEELINGS.map((item) => {
              const selected =
                selectedFeelings.includes(
                  item.value,
                );

              return (
                <Pressable
                  key={item.value}
                  style={({ pressed }) => [
                    styles.feelingChip,
                    selected &&
                      styles.feelingChipSelected,
                    pressed && styles.pressedChip,
                  ]}
                  onPress={() =>
                    toggleFeeling(item.value)
                  }
                >
                  <Text style={styles.feelingEmoji}>
                    {item.emoji}
                  </Text>

                  <Text
                    style={[
                      styles.feelingText,
                      selected &&
                        styles.feelingTextSelected,
                    ]}
                  >
                    {item.value}
                  </Text>

                  {selected ? (
                    <Text style={styles.feelingCheck}>
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* REFLECTION */}

        <SectionHeader
          eyebrow="04 · REFLECTION"
          title="Put it into words"
          subtitle="Optional. Write anything you want your wellness assistant to know."
        />

        <View style={styles.reflectionCard}>
          <View style={styles.reflectionHeader}>
            <View style={styles.reflectionIcon}>
              <Text
                style={styles.reflectionIconText}
              >
                ✎
              </Text>
            </View>

            <View style={styles.reflectionHeaderText}>
              <Text style={styles.reflectionTitle}>
                How has your day been?
              </Text>

              <Text
                style={styles.reflectionSubtitle}
              >
                Your private wellness note
              </Text>
            </View>
          </View>

          <TextInput
            value={reflection}
            onChangeText={(value) => {
              setReflection(value);
              setSaved(false);
            }}
            placeholder="Tell us what's been going on..."
            placeholderTextColor={colors.textSoft}
            multiline
            textAlignVertical="top"
            maxLength={500}
            style={styles.reflectionInput}
          />

          <View style={styles.reflectionFooter}>
            <Text style={styles.reflectionHint}>
              This can help personalise future guidance.
            </Text>

            <Text style={styles.characterCount}>
              {reflection.length}/500
            </Text>
          </View>
        </View>

        {/* PERSONALIZED INSIGHT */}

        <SectionHeader
          eyebrow="YOUR CHECK-IN"
          title="A moment for you"
          subtitle="A simple reflection based on your selections."
        />

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightIconText}>
              ✦
            </Text>
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              {mood
                ? checkInSummary
                : 'Your wellness snapshot'}
            </Text>

            <Text style={styles.insightText}>
              {wellnessFeeling}
            </Text>

            {selectedFeelings.length > 0 ? (
              <Text style={styles.selectedFeelingsText}>
                You selected:{' '}
                {selectedFeelings.join(', ')}.
              </Text>
            ) : null}
          </View>
        </View>

        {/* SAVE */}

        <View style={styles.saveCard}>
          <View style={styles.saveHeader}>
            <View style={styles.saveHeaderText}>
              <Text style={styles.saveTitle}>
                Save your check-in
              </Text>

              <Text style={styles.saveSubtitle}>
                Your mood, stress, energy and reflection
                become part of your wellness context.
              </Text>
            </View>

            <View style={styles.saveIcon}>
              <Text style={styles.saveIconText}>
                ✓
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={saveCheckIn}
          >
            <Text style={styles.saveButtonIcon}>
              {saved ? '✓' : '↓'}
            </Text>

            <Text style={styles.saveButtonText}>
              {saved
                ? 'Check-in saved'
                : 'Save wellness check-in'}
            </Text>
          </Pressable>

          {saved ? (
            <View style={styles.savedMessage}>
              <View style={styles.savedDot} />

              <Text style={styles.savedMessageText}>
                Your wellness context has been updated.
              </Text>
            </View>
          ) : null}
        </View>

        {/* BREATHING */}

        <SectionHeader
          eyebrow="RESET"
          title="Take a mindful pause"
          subtitle="A short breathing exercise when you need a reset."
        />

        <View style={styles.breathingCard}>
          <View style={styles.breathingTop}>
            <View style={styles.breathingIcon}>
              <Text style={styles.breathingIconText}>
                🌬
              </Text>
            </View>

            <View
              style={styles.breathingTitleContainer}
            >
              <Text style={styles.breathingTitle}>
                2-minute breathing reset
              </Text>

              <Text
                style={styles.breathingSubtitle}
              >
                Slow your breathing and give yourself
                a moment.
              </Text>
            </View>
          </View>

          {breathing ? (
            <View style={styles.breathingActive}>
              <View style={styles.breathingCircleOuter}>
                <View
                  style={[
                    styles.breathingCircleInner,
                    breathingPhase === 'Inhale' &&
                      styles.breathingCircleInhale,
                    breathingPhase === 'Hold' &&
                      styles.breathingCircleHold,
                    breathingPhase === 'Exhale' &&
                      styles.breathingCircleExhale,
                  ]}
                >
                  <Text
                    style={styles.breathingSeconds}
                  >
                    {breathingSeconds}
                  </Text>

                  <Text
                    style={styles.breathingPhase}
                  >
                    {breathingPhase}
                  </Text>
                </View>
              </View>

              <Text style={styles.roundText}>
                Round {breathingRound} of 5
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.stopBreathingButton,
                  pressed && styles.pressed,
                ]}
                onPress={stopBreathing}
              >
                <Text
                  style={styles.stopBreathingText}
                >
                  End session
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.startBreathingButton,
                pressed &&
                  styles.startBreathingPressed,
              ]}
              onPress={startBreathing}
            >
              <Text
                style={styles.startBreathingIcon}
              >
                ▶
              </Text>

              <Text
                style={styles.startBreathingText}
              >
                Start breathing exercise
              </Text>

              <Text
                style={styles.startBreathingArrow}
              >
                →
              </Text>
            </Pressable>
          )}
        </View>

        {/* AI SUPPORT */}

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>
                ✦
              </Text>
            </View>

            <View style={styles.aiHeaderText}>
              <Text style={styles.aiEyebrow}>
                AI WELLNESS SUPPORT
              </Text>

              <Text style={styles.aiTitle}>
                Want to talk about it?
              </Text>
            </View>
          </View>

          <Text style={styles.aiText}>
            You can talk with the AI Health Assistant
            about stress, sleep, motivation, energy,
            routines or how you're feeling.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.aiButton,
              pressed && styles.aiButtonPressed,
            ]}
            onPress={() => router.push('/chatbot')}
          >
            <Text style={styles.aiButtonText}>
              Talk to AI Assistant
            </Text>

            <Text style={styles.aiButtonArrow}>
              →
            </Text>
          </Pressable>
        </View>

        {/* SUPPORT */}

        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Text style={styles.supportIconText}>
              ♥
            </Text>
          </View>

          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>
              Need more support?
            </Text>

            <Text style={styles.supportText}>
              If you're experiencing persistent
              distress, feel unsafe, or are thinking
              about harming yourself, please reach out
              to a trusted person or qualified mental
              health professional. If there is immediate
              danger, contact your local emergency
              service.
            </Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This wellness check-in is designed for
          general wellbeing and self-reflection. It is
          not a diagnostic assessment and does not
          replace professional mental health care.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================================================================== */
/* SECTION HEADER                                                             */
/* ========================================================================== */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

/* ========================================================================== */
/* WELLNESS SLIDER                                                            */
/* ========================================================================== */

function WellnessSlider({
  icon,
  title,
  description,
  value,
  minLabel,
  maxLabel,
  accent,
  onChange,
}: {
  icon: string;
  title: string;
  description: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  accent: string;
  onChange: (value: number) => void;
}) {
  return (
    <View>
      <View style={styles.sliderHeader}>
        <View
          style={[
            styles.sliderIcon,
            {
              backgroundColor: `${accent}15`,
            },
          ]}
        >
          <Text style={styles.sliderIconText}>
            {icon}
          </Text>
        </View>

        <View style={styles.sliderHeaderText}>
          <Text style={styles.sliderTitle}>
            {title}
          </Text>

          <Text style={styles.sliderDescription}>
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.sliderValueBadge,
            {
              backgroundColor: `${accent}15`,
            },
          ]}
        >
          <Text
            style={[
              styles.sliderValue,
              {
                color: accent,
              },
            ]}
          >
            {value}/10
          </Text>
        </View>
      </View>

      <View style={styles.sliderTrackArea}>
        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFill,
              {
                width: `${value * 10}%`,
                backgroundColor: accent,
              },
            ]}
          />

          {Array.from({ length: 11 }).map(
            (_, index) => (
              <Pressable
                key={index}
                style={[
                  styles.sliderPoint,
                  {
                    left: `${index * 10}%`,
                  },
                ]}
                onPress={() => onChange(index)}
              />
            ),
          )}
        </View>
      </View>

      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>
          {minLabel}
        </Text>

        <Text style={styles.sliderLabel}>
          {maxLabel}
        </Text>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* STATUS CARD                                                                */
/* ========================================================================== */

function StatusCard({
  icon,
  label,
  value,
  level,
  inverse = false,
}: {
  icon: string;
  label: string;
  value: string;
  level: number;
  inverse?: boolean;
}) {
  const percentage = Math.min(
    100,
    Math.max(0, level * 10),
  );

  const adjusted = inverse
    ? 100 - percentage
    : percentage;

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusIcon}>
        <Text style={styles.statusIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.statusLabel}>
        {label}
      </Text>

      <Text
        style={styles.statusValue}
        numberOfLines={1}
      >
        {value}
      </Text>

      <View style={styles.statusTrack}>
        <View
          style={[
            styles.statusFill,
            {
              width: `${adjusted}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function stressToNumber(
  value: string | null,
): number {
  if (!value) {
    return 4;
  }

  if (value === 'Low') {
    return 2;
  }

  if (value === 'Moderate') {
    return 5;
  }

  if (value === 'High') {
    return 8;
  }

  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    return Math.min(
      10,
      Math.max(0, parsed),
    );
  }

  return 4;
}

function getStressLevelValue(
  value: number,
): string {
  if (value <= 3) {
    return 'Low';
  }

  if (value <= 6) {
    return 'Moderate';
  }

  return 'High';
}

function getStressLabel(
  value: number,
): string {
  if (value <= 2) {
    return 'Very calm';
  }

  if (value <= 4) {
    return 'Calm';
  }

  if (value <= 6) {
    return 'Moderate';
  }

  if (value <= 8) {
    return 'High';
  }

  return 'Very high';
}

function getEnergyLabel(
  value: number,
): string {
  if (value <= 2) {
    return 'Very low';
  }

  if (value <= 4) {
    return 'Low';
  }

  if (value <= 6) {
    return 'Balanced';
  }

  if (value <= 8) {
    return 'Energised';
  }

  return 'Very high';
}

function moodScore(
  value: Mood,
): number {
  switch (value) {
    case 'Great':
      return 9;
    case 'Good':
      return 8;
    case 'Okay':
      return 6;
    case 'Low':
      return 3;
    case 'Stressed':
      return 2;
    default:
      return 0;
  }
}

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

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
    paddingBottom: 45,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  pressedCard: {
    transform: [{ scale: 0.985 }],
  },

  pressedChip: {
    opacity: 0.8,
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

  headerText: {
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

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 21,
  },

  /* HERO */

  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xxl,
    minHeight: 215,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.sectionGap,
    ...shadows.elevated,
  },

  heroContent: {
    padding: spacing.xxl,
    zIndex: 2,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      'rgba(94,190,171,0.13)',
    right: -60,
    top: -55,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    left: -55,
    bottom: -50,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  heroIconText: {
    fontSize: 25,
  },

  heroEyebrow: {
    ...typography.overline,
    color: '#A8DED4',
    letterSpacing: 1.25,
  },

  heroTitle: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 5,
  },

  heroDescription: {
    ...typography.bodySmall,
    color: '#D4ECE8',
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 520,
  },

  /* SECTION */

  sectionHeader: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },

  sectionEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.1,
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
    lineHeight: 18,
  },

  /* MOOD */

  moodCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
  },

  moodOption: {
    width: '48.2%',
    minHeight: 145,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  moodOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  moodEmojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  moodEmojiContainerSelected: {
    backgroundColor: '#FFFFFF',
  },

  moodEmoji: {
    fontSize: 27,
  },

  moodName: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  moodNameSelected: {
    color: colors.primaryDark,
  },

  moodDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },

  moodDescriptionSelected: {
    color: colors.primary,
  },

  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  /* SLIDERS */

  sliderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sliderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sliderIconText: {
    fontSize: 20,
  },

  sliderHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  sliderTitle: {
    ...typography.bodyLarge,
    color: colors.textStrong,
    fontWeight: '800',
  },

  sliderDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  sliderValueBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sliderValue: {
    ...typography.caption,
    fontWeight: '900',
  },

  sliderTrackArea: {
    paddingTop: 21,
    paddingHorizontal: 3,
  },

  sliderTrack: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 99,
    position: 'relative',
  },

  sliderFill: {
    height: 8,
    borderRadius: 99,
  },

  sliderPoint: {
    position: 'absolute',
    width: 18,
    height: 28,
    top: -10,
    marginLeft: -9,
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  sliderLabel: {
    ...typography.caption,
    color: colors.textSoft,
  },

  sliderDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 23,
  },

  /* STATUS */

  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sectionGap,
  },

  statusCard: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 13,
    ...shadows.card,
  },

  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  statusIconText: {
    fontSize: 16,
  },

  statusLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  statusValue: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
    marginTop: 2,
    minHeight: 20,
  },

  statusTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: 9,
  },

  statusFill: {
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },

  /* FEELINGS */

  feelingsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  feelingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  feelingChip: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  feelingChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  feelingEmoji: {
    fontSize: 17,
    marginRight: 7,
  },

  feelingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
  },

  feelingTextSelected: {
    color: colors.primaryDark,
  },

  feelingCheck: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '900',
  },

  /* REFLECTION */

  reflectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  reflectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reflectionIconText: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '800',
  },

  reflectionHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  reflectionTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  reflectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  reflectionInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: 14,
    color: colors.textStrong,
    fontSize: 14,
    lineHeight: 21,
  },

  reflectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },

  reflectionHint: {
    ...typography.caption,
    color: colors.textSoft,
    flex: 1,
    marginRight: 10,
  },

  characterCount: {
    ...typography.caption,
    color: colors.textSoft,
  },

  /* INSIGHT */

  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
  },

  insightIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightIconText: {
    color: colors.primary,
    fontSize: 21,
  },

  insightContent: {
    flex: 1,
    marginLeft: 12,
  },

  insightTitle: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '800',
  },

  insightText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: 5,
  },

  selectedFeelingsText: {
    ...typography.caption,
    color: colors.primaryDark,
    lineHeight: 17,
    marginTop: 8,
    fontWeight: '700',
  },

  /* SAVE */

  saveCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
    ...shadows.elevated,
  },

  saveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  saveHeaderText: {
    flex: 1,
    marginRight: 12,
  },

  saveTitle: {
    ...typography.h3,
    color: colors.textStrong,
  },

  saveSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 3,
  },

  saveIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveIconText: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900',
  },

  saveButton: {
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  saveButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginRight: 8,
  },

  saveButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  savedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  savedDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.success,
    marginRight: 6,
  },

  savedMessageText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },

  /* BREATHING */

  breathingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  breathingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  breathingIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  breathingIconText: {
    fontSize: 21,
  },

  breathingTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  breathingTitle: {
    ...typography.h3,
    color: colors.textStrong,
  },

  breathingSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 3,
  },

  startBreathingButton: {
    height: 53,
    borderRadius: radii.md,
    backgroundColor: colors.secondaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  startBreathingPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  startBreathingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    overflow: 'hidden',
  },

  startBreathingText: {
    ...typography.button,
    color: colors.textStrong,
    flex: 1,
    marginLeft: 10,
  },

  startBreathingArrow: {
    fontSize: 19,
    color: colors.secondary,
    fontWeight: '800',
  },

  breathingActive: {
    alignItems: 'center',
    paddingTop: 4,
  },

  breathingCircleOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  breathingCircleInner: {
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  breathingCircleInhale: {
    transform: [{ scale: 1.05 }],
  },

  breathingCircleHold: {
    transform: [{ scale: 1.08 }],
  },

  breathingCircleExhale: {
    transform: [{ scale: 0.96 }],
  },

  breathingSeconds: {
    fontSize: 36,
    lineHeight: 39,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  breathingPhase: {
    ...typography.caption,
    color: '#DDF3F5',
    fontWeight: '800',
    marginTop: 2,
  },

  roundText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 14,
  },

  stopBreathingButton: {
    marginTop: 13,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },

  stopBreathingText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
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
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiIconText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  aiHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  aiEyebrow: {
    ...typography.overline,
    color: '#A9DED3',
    letterSpacing: 1.1,
  },

  aiTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginTop: 2,
  },

  aiText: {
    ...typography.bodySmall,
    color: '#D8EEEA',
    lineHeight: 20,
    marginTop: 16,
  },

  aiButton: {
    height: 50,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 17,
  },

  aiButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  aiButtonText: {
    ...typography.button,
    color: colors.primaryDark,
  },

  aiButtonArrow: {
    color: colors.primaryDark,
    fontSize: 19,
    fontWeight: '800',
  },

  /* SUPPORT */

  supportCard: {
    flexDirection: 'row',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  supportIconText: {
    color: colors.danger,
    fontSize: 18,
  },

  supportContent: {
    flex: 1,
    marginLeft: 11,
  },

  supportTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  supportText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },

  disclaimer: {
    ...typography.caption,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 18,
  },
});