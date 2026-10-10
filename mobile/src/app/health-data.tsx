import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

import {
  getHealthState,
  updateHealthState,
} from '../services/healthState';

import {
  submitHealthData,
  type HealthDataPayload,
} from '../services/apiService';

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

const moods: {
  label: Mood;
  emoji: string;
  description: string;
}[] = [
  {
    label: 'Great',
    emoji: '😄',
    description: 'Feeling excellent',
  },
  {
    label: 'Good',
    emoji: '🙂',
    description: 'Feeling positive',
  },
  {
    label: 'Okay',
    emoji: '😐',
    description: 'Doing alright',
  },
  {
    label: 'Low',
    emoji: '😔',
    description: 'A little down',
  },
  {
    label: 'Stressed',
    emoji: '😣',
    description: 'Feeling stressed',
  },
];

export default function HealthDataScreen() {
  const { width } = useWindowDimensions();

  const isWide = width >= 980;

  const currentHealth = getHealthState();

  const [userId, setUserId] = useState(
    currentHealth.userId?.toString() || '1'
  );

  // Display name identifies the person; User ID remains the record key.
  const [userName, setUserName] = useState('');

  const [steps, setSteps] = useState(
    currentHealth.steps > 0
      ? currentHealth.steps.toString()
      : ''
  );

  const [heartRate, setHeartRate] = useState(
    currentHealth.heartRate !== null
      ? currentHealth.heartRate.toString()
      : ''
  );

  const [sleepHours, setSleepHours] =
    useState(
      currentHealth.sleepHours !== null
        ? currentHealth.sleepHours.toString()
        : ''
    );

  const [waterIntake, setWaterIntake] =
    useState(
      currentHealth.waterIntake > 0
        ? currentHealth.waterIntake.toString()
        : ''
    );

  const [caloriesBurned, setCaloriesBurned] =
    useState(
      currentHealth.caloriesBurned > 0
        ? Math.round(
            currentHealth.caloriesBurned
          ).toString()
        : ''
    );

  const [mood, setMood] = useState<Mood | null>(
    (currentHealth.mood as Mood) || null
  );

  const [symptoms, setSymptoms] = useState(
    currentHealth.symptoms || ''
  );

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const completion = useMemo(() => {
    const fields = [
      steps,
      heartRate,
      sleepHours,
      waterIntake,
      caloriesBurned,
      mood,
    ];

    const completed = fields.filter(Boolean).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [
    steps,
    heartRate,
    sleepHours,
    waterIntake,
    caloriesBurned,
    mood,
  ]);

  const remainingFields = Math.max(
    0,
    6 -
      Math.round(
        (completion / 100) * 6
      )
  );

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validate = () => {
    const userIdValue = Number(userId);
    const stepsValue = Number(steps);
    const heartRateValue = Number(heartRate);
    const sleepValue = Number(sleepHours);
    const waterValue = Number(waterIntake);
    const caloriesValue = Number(
      caloriesBurned
    );

    if (!userName.trim()) {
      return 'Please enter the name of the person whose record you are updating.';
    }

    if (
      !userId.trim() ||
      !Number.isInteger(userIdValue) ||
      userIdValue <= 0
    ) {
      return 'Please enter a valid positive User ID.';
    }

    if (
      steps &&
      (!Number.isFinite(stepsValue) ||
        stepsValue < 0)
    ) {
      return 'Steps must be zero or greater.';
    }

    if (
      heartRate &&
      (!Number.isFinite(heartRateValue) ||
        heartRateValue <= 0)
    ) {
      return 'Heart rate must be greater than zero.';
    }

    if (
      sleepHours &&
      (!Number.isFinite(sleepValue) ||
        sleepValue < 0 ||
        sleepValue > 24)
    ) {
      return 'Sleep hours must be between 0 and 24.';
    }

    if (
      waterIntake &&
      (!Number.isFinite(waterValue) ||
        waterValue < 0)
    ) {
      return 'Water intake cannot be negative.';
    }

    if (
      caloriesBurned &&
      (!Number.isFinite(
        caloriesValue
      ) ||
        caloriesValue < 0)
    ) {
      return 'Calories burned cannot be negative.';
    }

    return null;
  };

  const handleSave = async () => {
    clearMessages();

    const validationError = validate();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const userIdValue = Number(userId);

    const stepsValue = steps
      ? Number(steps)
      : 0;

    const heartRateValue = heartRate
      ? Number(heartRate)
      : null;

    const sleepValue = sleepHours
      ? Number(sleepHours)
      : null;

    const waterValue = waterIntake
      ? Number(waterIntake)
      : 0;

    const caloriesValue = caloriesBurned
      ? Number(caloriesBurned)
      : 0;

    const payload: HealthDataPayload & { user_name: string } = {
      user_id: userIdValue,
      user_name: userName.trim(),
      step_count: stepsValue,
      sleep_hours: sleepValue,
      heart_rate_avg: heartRateValue,
      water_intake: waterValue,
      calories_burned: caloriesValue,
    };

    try {
      setSubmitting(true);

      await submitHealthData(payload);

      updateHealthState({
        userId: userIdValue,
        steps: stepsValue,
        heartRate: heartRateValue,
        sleepHours: sleepValue,
        waterIntake: waterValue,
        caloriesBurned: caloriesValue,
        mood,
        symptoms,
      });

      setSuccessMessage(
        'Your health data has been saved successfully.'
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save your health data.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setSteps('');
    setHeartRate('');
    setSleepHours('');
    setWaterIntake('');
    setCaloriesBurned('');
    setMood(null);
    setSymptoms('');
    clearMessages();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            {/* HEADER */}

            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.back()}
              >
                <Text style={styles.backIcon}>
                  ‹
                </Text>
              </Pressable>

              <View style={styles.headerText}>
                <Text
                  style={styles.headerEyebrow}
                >
                  HEALTH RECORD
                </Text>

                <Text
                  style={styles.headerTitle}
                >
                  Health Data
                </Text>

                <Text
                  style={styles.headerSubtitle}
                >
                  Record and understand your
                  daily health
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Text
                  style={styles.headerIconText}
                >
                  +
                </Text>
              </View>
            </View>

            {/* CHECK-IN HERO */}

            <View style={styles.summaryCard}>
              <View
                style={styles.summaryGlowOne}
              />

              <View
                style={styles.summaryGlowTwo}
              />

              <View
                style={styles.summaryContent}
              >
                <View style={styles.summaryTop}>
                  <View
                    style={
                      styles.summaryTitleContainer
                    }
                  >
                    <View
                      style={styles.checkInBadge}
                    >
                      <View
                        style={
                          styles.checkInDot
                        }
                      />

                      <Text
                        style={
                          styles.checkInText
                        }
                      >
                        TODAY'S CHECK-IN
                      </Text>
                    </View>

                    <Text
                      style={styles.summaryTitle}
                    >
                      Keep your health record
                      up to date
                    </Text>

                    <Text
                      style={
                        styles.summaryDescription
                      }
                    >
                      Add today's readings to give
                      your dashboard and AI
                      assistant better health context.
                    </Text>
                  </View>

                  <View
                    style={styles.completionCircle}
                  >
                    <Text
                      style={
                        styles.completionValue
                      }
                    >
                      {completion}%
                    </Text>

                    <Text
                      style={
                        styles.completionLabel
                      }
                    >
                      complete
                    </Text>
                  </View>
                </View>

                <View
                  style={styles.completionTrack}
                >
                  <View
                    style={[
                      styles.completionProgress,
                      {
                        width: `${completion}%`,
                      },
                    ]}
                  />
                </View>

                <View
                  style={styles.summaryFooter}
                >
                  <Text
                    style={
                      styles.summaryFooterText
                    }
                  >
                    {completion === 100
                      ? '✓ Daily check-in complete'
                      : `${remainingFields} key ${
                          remainingFields === 1
                            ? 'field'
                            : 'fields'
                        } remaining`}
                  </Text>

                  <Text
                    style={
                      styles.summaryFooterText
                    }
                  >
                    General wellness tracking
                  </Text>
                </View>
              </View>
            </View>

            {/* STATUS */}

            {successMessage ? (
              <StatusBanner
                type="success"
                title="Saved successfully"
                message={successMessage}
              />
            ) : null}

            {errorMessage ? (
              <StatusBanner
                type="error"
                title="Unable to save"
                message={errorMessage}
              />
            ) : null}

            {/* CONTENT */}

            <View
              style={[
                styles.mainGrid,
                isWide && styles.mainGridWide,
              ]}
            >
              {/* LEFT COLUMN */}

              <View
                style={[
                  styles.primaryColumn,
                  isWide && styles.primaryColumnWide,
                ]}
              >
                <SectionHeader
                  eyebrow="ACCOUNT"
                  title="Health profile"
                  subtitle="Identify the health record being updated"
                />

                <View style={styles.card}>
                  <InputField
                    label="User Name"
                    hint="Name of the person whose health record is being updated"
                    value={userName}
                    onChangeText={(value) => {
                      clearMessages();
                      setUserName(value);
                    }}
                    keyboardType="default"
                    icon="NAME"
                    accent={colors.primary}
                  />

                  <InputField
                    label="User ID"
                    hint="Numeric project health record identifier"
                    value={userId}
                    onChangeText={(value) => {
                      clearMessages();
                      setUserId(value);
                    }}
                    keyboardType="number-pad"
                    icon="ID"
                    accent={colors.primary}
                    last
                  />
                </View>

                <SectionHeader
                  eyebrow="TODAY'S READINGS"
                  title="Health metrics"
                  subtitle="Enter the latest values you want to record"
                />

                <View
                  style={styles.metricsFormCard}
                >
                  <InputField
                    label="Heart rate"
                    hint="Average or current heart rate"
                    value={heartRate}
                    onChangeText={(value) => {
                      clearMessages();
                      setHeartRate(value);
                    }}
                    keyboardType="decimal-pad"
                    suffix="BPM"
                    icon="♥"
                    accent={colors.heart}
                  />

                  <InputField
                    label="Steps"
                    hint="Total steps for today"
                    value={steps}
                    onChangeText={(value) => {
                      clearMessages();
                      setSteps(value);
                    }}
                    keyboardType="number-pad"
                    suffix="steps"
                    icon="↗"
                    accent={colors.steps}
                  />

                  <InputField
                    label="Sleep"
                    hint="Total sleep duration"
                    value={sleepHours}
                    onChangeText={(value) => {
                      clearMessages();
                      setSleepHours(value);
                    }}
                    keyboardType="decimal-pad"
                    suffix="hours"
                    icon="☾"
                    accent={colors.sleep}
                  />

                  <InputField
                    label="Water intake"
                    hint="Total water consumed"
                    value={waterIntake}
                    onChangeText={(value) => {
                      clearMessages();
                      setWaterIntake(value);
                    }}
                    keyboardType="decimal-pad"
                    suffix="L"
                    icon="◊"
                    accent={colors.water}
                  />

                  <InputField
                    label="Calories burned"
                    hint="Estimated active calories"
                    value={caloriesBurned}
                    onChangeText={(value) => {
                      clearMessages();
                      setCaloriesBurned(value);
                    }}
                    keyboardType="number-pad"
                    suffix="kcal"
                    icon="△"
                    accent={colors.calories}
                    last
                  />
                </View>

                <SectionHeader
                  eyebrow="MENTAL WELLNESS"
                  title="How are you feeling?"
                  subtitle="Your mood helps personalise the wellness experience"
                />

                <View style={styles.moodCard}>
                  <Text
                    style={styles.moodQuestion}
                  >
                    Select the option that best
                    describes your mood today.
                  </Text>

                  <View style={styles.moodGrid}>
                    {moods.map((item) => {
                      const selected =
                        mood === item.label;

                      return (
                        <Pressable
                          key={item.label}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected,
                          }}
                          style={({ pressed }) => [
                            styles.moodOption,
                            selected &&
                              styles.moodOptionSelected,
                            pressed &&
                              styles.pressed,
                          ]}
                          onPress={() => {
                            clearMessages();
                            setMood(item.label);
                          }}
                        >
                          <View
                            style={[
                              styles.moodEmoji,
                              selected &&
                                styles.moodEmojiSelected,
                            ]}
                          >
                            <Text
                              style={
                                styles.moodEmojiText
                              }
                            >
                              {item.emoji}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.moodLabel,
                              selected &&
                                styles.moodLabelSelected,
                            ]}
                          >
                            {item.label}
                          </Text>

                          <Text
                            style={[
                              styles.moodDescription,
                              selected &&
                                styles.moodDescriptionSelected,
                            ]}
                          >
                            {item.description}
                          </Text>

                          {selected ? (
                            <View
                              style={
                                styles.selectedCheck
                              }
                            >
                              <Text
                                style={
                                  styles.selectedCheckText
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
              </View>

              {/* RIGHT COLUMN */}

              <View
                style={[
                  styles.secondaryColumn,
                  isWide &&
                    styles.secondaryColumnWide,
                ]}
              >
                <SectionHeader
                  eyebrow="OPTIONAL CHECK-IN"
                  title="Symptoms or notes"
                  subtitle="Add anything you want the assistant to consider"
                />

                <View style={styles.notesCard}>
                  <View style={styles.notesHeader}>
                    <View style={styles.notesIcon}>
                      <Text
                        style={styles.notesIconText}
                      >
                        ✎
                      </Text>
                    </View>

                    <View
                      style={
                        styles.notesHeaderText
                      }
                    >
                      <Text
                        style={styles.notesTitle}
                      >
                        How are you feeling
                        physically?
                      </Text>

                      <Text
                        style={
                          styles.notesSubtitle
                        }
                      >
                        Optional wellness context
                      </Text>
                    </View>
                  </View>

                  <TextInput
                    value={symptoms}
                    onChangeText={(value) => {
                      clearMessages();
                      setSymptoms(value);
                    }}
                    placeholder="e.g. feeling tired, mild headache, feeling energetic..."
                    placeholderTextColor={
                      colors.textSoft
                    }
                    multiline
                    textAlignVertical="top"
                    style={styles.notesInput}
                    maxLength={500}
                  />

                  <View
                    style={styles.notesFooter}
                  >
                    <Text
                      style={styles.notesHint}
                    >
                      Share only information
                      you're comfortable recording.
                    </Text>

                    <Text
                      style={
                        styles.characterCount
                      }
                    >
                      {symptoms.length}/500
                    </Text>
                  </View>
                </View>

                <View style={styles.actionCard}>
                  <View
                    style={styles.actionHeader}
                  >
                    <View
                      style={
                        styles.actionHeaderText
                      }
                    >
                      <Text
                        style={styles.actionEyebrow}
                      >
                        READY TO UPDATE?
                      </Text>

                      <Text
                        style={styles.actionTitle}
                      >
                        Save today's health data
                      </Text>

                      <Text
                        style={
                          styles.actionSubtitle
                        }
                      >
                        Your values will update the
                        shared health context used
                        across the app.
                      </Text>
                    </View>

                    <View
                      style={styles.actionIcon}
                    >
                      <Text
                        style={
                          styles.actionIconText
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: submitting,
                      busy: submitting,
                    }}
                    style={({ pressed }) => [
                      styles.saveButton,
                      submitting &&
                        styles.saveButtonDisabled,
                      pressed &&
                        !submitting &&
                        styles.pressed,
                    ]}
                    onPress={handleSave}
                    disabled={submitting}
                  >
                    <Text
                      style={
                        styles.saveButtonIcon
                      }
                    >
                      {submitting ? '…' : '↑'}
                    </Text>

                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      {submitting
                        ? 'Saving health data...'
                        : "Save today's health data"}
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.clearButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={handleClear}
                    disabled={submitting}
                  >
                    <Text
                      style={
                        styles.clearButtonText
                      }
                    >
                      Clear form
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.flowCard}>
                  <View
                    style={styles.flowHeader}
                  >
                    <View
                      style={styles.flowIcon}
                    >
                      <Text
                        style={
                          styles.flowIconText
                        }
                      >
                        ↗
                      </Text>
                    </View>

                    <View
                      style={
                        styles.flowHeaderText
                      }
                    >
                      <Text
                        style={styles.flowTitle}
                      >
                        Your data flow
                      </Text>

                      <Text
                        style={
                          styles.flowSubtitle
                        }
                      >
                        How this information is used
                        in the app
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.flowSteps}
                  >
                    <FlowStep
                      number="01"
                      title="Health Data"
                      subtitle="Manual entry"
                    />

                    <FlowConnector />

                    <FlowStep
                      number="02"
                      title="Health State"
                      subtitle="Shared context"
                    />

                    <FlowConnector />

                    <FlowStep
                      number="03"
                      title="Dashboard"
                      subtitle="Live overview"
                    />

                    <FlowConnector />

                    <FlowStep
                      number="04"
                      title="AI Assistant"
                      subtitle="Personalised insight"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* DISCLAIMER */}

            <View
              style={styles.disclaimerCard}
            >
              <View
                style={styles.disclaimerIcon}
              >
                <Text
                  style={
                    styles.disclaimerIconText
                  }
                >
                  i
                </Text>
              </View>

              <Text
                style={styles.disclaimer}
              >
                Health information in this project
                is intended for general wellness and
                educational purposes. It does not
                provide a medical diagnosis or replace
                professional medical advice.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* STATUS BANNER                                                              */
/* -------------------------------------------------------------------------- */

function StatusBanner({
  type,
  title,
  message,
}: {
  type: 'success' | 'error';
  title: string;
  message: string;
}) {
  const isSuccess = type === 'success';

  return (
    <View
      style={[
        styles.statusBanner,
        isSuccess
          ? styles.successBanner
          : styles.errorBanner,
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          isSuccess
            ? styles.successIcon
            : styles.errorIcon,
        ]}
      >
        <Text
          style={styles.statusIconText}
        >
          {isSuccess ? '✓' : '!'}
        </Text>
      </View>

      <View
        style={styles.bannerContent}
      >
        <Text
          style={styles.statusTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.statusText}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* INPUT FIELD                                                                */
/* -------------------------------------------------------------------------- */

function InputField({
  label,
  hint,
  value,
  onChangeText,
  keyboardType,
  suffix,
  icon,
  accent = colors.primary,
  last = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType:
    | 'default'
    | 'number-pad'
    | 'decimal-pad';
  suffix?: string;
  icon: string;
  accent?: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.inputBlock,
        !last && styles.inputBlockBorder,
      ]}
    >
      <View style={styles.inputHeader}>
        <View
          style={[
            styles.inputIcon,
            {
              backgroundColor: `${accent}16`,
            },
          ]}
        >
          <Text
            style={[
              styles.inputIconText,
              {
                color: accent,
              },
            ]}
          >
            {icon}
          </Text>
        </View>

        <View
          style={styles.inputLabelContainer}
        >
          <Text style={styles.inputLabel}>
            {label}
          </Text>

          <Text style={styles.inputHint}>
            {hint}
          </Text>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={styles.input}
          placeholder="Enter value"
          placeholderTextColor={
            colors.textSoft
          }
          selectTextOnFocus
        />

        {suffix ? (
          <View style={styles.suffix}>
            <Text style={styles.suffixText}>
              {suffix}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* DATA FLOW                                                                  */
/* -------------------------------------------------------------------------- */

function FlowStep({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.flowStep}>
      <View
        style={styles.flowNumberActive}
      >
        <Text
          style={styles.flowNumberTextActive}
        >
          {number}
        </Text>
      </View>

      <Text
        style={styles.flowStepTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.flowStepSubtitle}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function FlowConnector() {
  return (
    <View style={styles.flowConnector}>
      <View style={styles.flowLine} />

      <Text
        style={styles.flowConnectorText}
      >
        →
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal:
      spacing.screenHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: 48,
  },

  shell: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },

  pressed: {
    opacity: 0.78,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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

  headerEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.2,
  },

  headerTitle: {
    ...typography.h1,
    color: colors.textStrong,
    marginTop: 1,
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
    marginLeft: 10,
  },

  headerIconText: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '800',
  },

  /* HERO */

  summaryCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
    borderRadius: radii.xxl,
    marginBottom: spacing.sectionGap,
    ...shadows.elevated,
  },

  summaryContent: {
    padding: spacing.xl,
  },

  summaryGlowOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      'rgba(130,220,204,0.08)',
    right: -90,
    top: -110,
  },

  summaryGlowTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor:
      'rgba(130,220,204,0.045)',
    left: -70,
    bottom: -70,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  summaryTitleContainer: {
    flex: 1,
    paddingRight: 16,
  },

  checkInBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  checkInDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#91DED0',
    marginRight: 5,
  },

  checkInText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    color: '#BCE8DF',
    letterSpacing: 0.8,
  },

  summaryTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: 10,
  },

  summaryDescription: {
    ...typography.bodySmall,
    color: '#D1ECE7',
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 700,
  },

  completionCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  completionValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  completionLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#A9CEC8',
    marginTop: 1,
  },

  completionTrack: {
    height: 7,
    borderRadius: 99,
    backgroundColor:
      'rgba(255,255,255,0.13)',
    overflow: 'hidden',
    marginTop: 18,
  },

  completionProgress: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#8DDED0',
  },

  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  summaryFooterText: {
    ...typography.caption,
    color: '#A8CEC8',
  },

  /* STATUS */

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },

  successBanner: {
    backgroundColor: colors.successLight,
    borderColor: colors.successBorder,
  },

  errorBanner: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
  },

  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  successIcon: {
    backgroundColor: colors.success,
  },

  errorIcon: {
    backgroundColor: colors.danger,
  },

  statusIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  bannerContent: {
    flex: 1,
  },

  statusTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  statusText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  /* MAIN GRID */

  mainGrid: {
    width: '100%',
  },

  mainGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },

  primaryColumn: {
    width: '100%',
  },

  primaryColumnWide: {
    flex: 1.15,
  },

  secondaryColumn: {
    width: '100%',
  },

  secondaryColumnWide: {
    flex: 0.85,
  },

  /* SECTIONS */

  sectionHeader: {
    marginTop: 2,
    marginBottom: 11,
  },

  sectionEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.15,
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

  /* CARDS */

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  metricsFormCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  /* INPUTS */

  inputBlock: {
    paddingVertical: 17,
  },

  inputBlockBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  inputIconText: {
    fontSize: 15,
    fontWeight: '900',
  },

  inputLabelContainer: {
    flex: 1,
  },

  inputLabel: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  inputHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  inputWrapper: {
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '700',
  },

  suffix: {
    paddingHorizontal: 13,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    height: 30,
    justifyContent: 'center',
  },

  suffixText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '900',
  },

  /* MOOD */

  moodCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  moodQuestion: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 15,
  },

  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  moodOption: {
    flexGrow: 1,
    flexBasis: 100,
    minWidth: 90,
    minHeight: 106,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 9,
    paddingHorizontal: 6,
  },

  moodOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },

  moodEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moodEmojiSelected: {
    backgroundColor: '#FFFFFF',
  },

  moodEmojiText: {
    fontSize: 21,
  },

  moodLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '900',
    marginTop: 6,
  },

  moodLabelSelected: {
    color: colors.primaryDark,
  },

  moodDescription: {
    fontSize: 7,
    lineHeight: 10,
    color: colors.textSoft,
    marginTop: 2,
    textAlign: 'center',
  },

  moodDescriptionSelected: {
    color: colors.primary,
  },

  selectedCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCheckText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  /* NOTES */

  notesCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  notesIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  notesIconText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },

  notesHeaderText: {
    flex: 1,
  },

  notesTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  notesSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  notesInput: {
    minHeight: 125,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    padding: 14,
    color: colors.textStrong,
    fontSize: 14,
    lineHeight: 20,
  },

  notesFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  notesHint: {
    flex: 1,
    fontSize: 8,
    lineHeight: 12,
    color: colors.textSoft,
    paddingRight: 10,
  },

  characterCount: {
    ...typography.caption,
    color: colors.textSoft,
  },

  /* ACTION */

  actionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.sectionGap,
    ...shadows.elevated,
  },

  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  actionHeaderText: {
    flex: 1,
    marginRight: 12,
  },

  actionEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1,
  },

  actionTitle: {
    ...typography.h3,
    color: colors.textStrong,
    marginTop: 3,
  },

  actionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 4,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconText: {
    color: colors.success,
    fontSize: 19,
    fontWeight: '900',
  },

  saveButton: {
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.card,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },

  saveButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },

  clearButtonText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '800',
  },

  /* DATA FLOW */

  flowCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.sectionGap,
    ...shadows.card,
  },

  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 19,
  },

  flowIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  flowIconText: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '800',
  },

  flowHeaderText: {
    marginLeft: 11,
    flex: 1,
  },

  flowTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  flowSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  flowSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  flowStep: {
    flex: 1,
    alignItems: 'center',
    minWidth: 55,
  },

  flowNumberActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },

  flowNumberTextActive: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDark,
  },

  flowStepTitle: {
    ...typography.caption,
    color: colors.textStrong,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
  },

  flowStepSubtitle: {
    fontSize: 7,
    lineHeight: 10,
    color: colors.textSoft,
    marginTop: 2,
    textAlign: 'center',
  },

  flowConnector: {
    width: 25,
    paddingTop: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  flowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 17,
    height: 1,
    backgroundColor: colors.border,
  },

  flowConnectorText: {
    color: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: 2,
    fontSize: 12,
    fontWeight: '800',
  },

  /* DISCLAIMER */

  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    marginTop: 2,
  },

  disclaimerIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  disclaimerIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.info,
  },

  disclaimer: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
    color: colors.textSoft,
  },
});