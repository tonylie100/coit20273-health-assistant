import React, { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  calculateBMI,
  getHealthState,
  updateHealthState,
  type HealthState,
} from '../services/healthState';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  suffix?: string;
  helper?: string;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  suffix,
  helper,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA9A4"
          keyboardType="decimal-pad"
        />

        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>

      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

type OptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Option({ label, selected, onPress }: OptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionActive,
        pressed && styles.optionPressed,
      ]}
    >
      <View
        style={[
          styles.optionIndicator,
          selected && styles.optionIndicatorActive,
        ]}
      >
        {selected ? <View style={styles.optionIndicatorInner} /> : null}
      </View>

      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionNumber}>
        <Text style={styles.sectionNumberText}>{number}</Text>
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
    </View>
  );
}

function getBmiCategory(bmi: number | null) {
  if (bmi === null) {
    return {
      label: 'Not available',
      description: 'Enter your height and weight to calculate BMI.',
    };
  }

  if (bmi < 18.5) {
    return {
      label: 'Below typical range',
      description:
        'BMI is a general screening measure and should be interpreted in context.',
    };
  }

  if (bmi < 25) {
    return {
      label: 'Within typical range',
      description:
        'Your BMI falls within the commonly used screening range for adults.',
    };
  }

  if (bmi < 30) {
    return {
      label: 'Above typical range',
      description:
        'BMI is a screening measure and does not by itself describe overall health.',
    };
  }

  return {
    label: 'Higher BMI range',
    description:
      'BMI is only one screening measure and should not be treated as a diagnosis.',
  };
}

function getProfileCompletion(values: {
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activity: string;
  goal: string;
  stepGoal: string;
  waterGoal: string;
  sleepGoal: string;
}) {
  const fields = [
    values.age,
    values.height,
    values.weight,
    values.targetWeight,
    values.activity,
    values.goal,
    values.stepGoal,
    values.waterGoal,
    values.sleepGoal,
  ];

  const completed = fields.filter(
    (value) => value.trim().length > 0
  ).length;

  return Math.round((completed / fields.length) * 100);
}

function formatNumber(value: string, decimals = 1) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return '';
  }

  return parsed.toFixed(decimals).replace(/\.0+$/, '');
}

export default function ProfileScreen() {
  const [health, setHealth] = useState<HealthState>(() =>
    getHealthState()
  );

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [goal, setGoal] = useState('');
  const [stepGoal, setStepGoal] = useState('');
  const [waterGoal, setWaterGoal] = useState('');
  const [sleepGoal, setSleepGoal] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getHealthState();

    setHealth(current);

    setAge(
      current.age !== null ? String(current.age) : ''
    );

    setHeight(
      current.heightCm !== null
        ? String(current.heightCm)
        : ''
    );

    setWeight(
      current.weightKg !== null
        ? String(current.weightKg)
        : ''
    );

    setTargetWeight(
      current.targetWeightKg !== null
        ? String(current.targetWeightKg)
        : ''
    );

    setActivity(current.activityLevel ?? '');
    setGoal(current.fitnessGoal ?? '');
    setStepGoal(String(current.stepGoal));
    setWaterGoal(String(current.waterGoalLitres));
    setSleepGoal(String(current.sleepGoalHours));
  }, []);

  const bmi = useMemo(
    () => calculateBMI(health.heightCm, health.weightKg),
    [health.heightCm, health.weightKg]
  );

  const bmiCategory = useMemo(
    () => getBmiCategory(bmi),
    [bmi]
  );

  const completion = useMemo(
    () =>
      getProfileCompletion({
        age,
        height,
        weight,
        targetWeight,
        activity,
        goal,
        stepGoal,
        waterGoal,
        sleepGoal,
      }),
    [
      age,
      height,
      weight,
      targetWeight,
      activity,
      goal,
      stepGoal,
      waterGoal,
      sleepGoal,
    ]
  );

  const weightDifference = useMemo(() => {
    const current = Number(weight);
    const target = Number(targetWeight);

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(target) ||
      current <= 0 ||
      target <= 0
    ) {
      return null;
    }

    return current - target;
  }, [weight, targetWeight]);

  const hasUnsavedChanges = useMemo(() => {
    const current = getHealthState();

    const currentAge =
      current.age !== null ? String(current.age) : '';

    const currentHeight =
      current.heightCm !== null
        ? String(current.heightCm)
        : '';

    const currentWeight =
      current.weightKg !== null
        ? String(current.weightKg)
        : '';

    const currentTargetWeight =
      current.targetWeightKg !== null
        ? String(current.targetWeightKg)
        : '';

    return (
      age !== currentAge ||
      height !== currentHeight ||
      weight !== currentWeight ||
      targetWeight !== currentTargetWeight ||
      activity !== (current.activityLevel ?? '') ||
      goal !== (current.fitnessGoal ?? '') ||
      stepGoal !== String(current.stepGoal) ||
      waterGoal !== String(current.waterGoalLitres) ||
      sleepGoal !== String(current.sleepGoalHours)
    );
  }, [
    age,
    height,
    weight,
    targetWeight,
    activity,
    goal,
    stepGoal,
    waterGoal,
    sleepGoal,
  ]);

  const validate = () => {
    if (age !== '') {
      const value = Number(age);

      if (!Number.isFinite(value) || value <= 0 || value > 120) {
        Alert.alert(
          'Check your age',
          'Please enter an age between 1 and 120.'
        );
        return false;
      }
    }

    if (height !== '') {
      const value = Number(height);

      if (!Number.isFinite(value) || value <= 0 || value > 250) {
        Alert.alert(
          'Check your height',
          'Please enter a valid height in centimetres.'
        );
        return false;
      }
    }

    if (weight !== '') {
      const value = Number(weight);

      if (!Number.isFinite(value) || value <= 0 || value > 500) {
        Alert.alert(
          'Check your weight',
          'Please enter a valid current weight.'
        );
        return false;
      }
    }

    if (targetWeight !== '') {
      const value = Number(targetWeight);

      if (!Number.isFinite(value) || value <= 0 || value > 500) {
        Alert.alert(
          'Check your target weight',
          'Please enter a valid target weight.'
        );
        return false;
      }
    }

    if (stepGoal !== '') {
      const value = Number(stepGoal);

      if (!Number.isFinite(value) || value <= 0) {
        Alert.alert(
          'Check your step goal',
          'Please enter a step goal greater than zero.'
        );
        return false;
      }
    }

    if (waterGoal !== '') {
      const value = Number(waterGoal);

      if (!Number.isFinite(value) || value <= 0) {
        Alert.alert(
          'Check your water goal',
          'Please enter a water goal greater than zero.'
        );
        return false;
      }
    }

    if (sleepGoal !== '') {
      const value = Number(sleepGoal);

      if (!Number.isFinite(value) || value <= 0 || value > 24) {
        Alert.alert(
          'Check your sleep goal',
          'Please enter a sleep goal between 1 and 24 hours.'
        );
        return false;
      }
    }

    return true;
  };

  const save = () => {
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const updated = updateHealthState({
        age: age === '' ? null : Number(age),

        heightCm:
          height === '' ? null : Number(height),

        weightKg:
          weight === '' ? null : Number(weight),

        targetWeightKg:
          targetWeight === ''
            ? null
            : Number(targetWeight),

        activityLevel: activity || null,

        fitnessGoal: goal || null,

        stepGoal:
          Number(stepGoal) > 0
            ? Number(stepGoal)
            : 8000,

        waterGoalLitres:
          Number(waterGoal) > 0
            ? Number(waterGoal)
            : 2.5,

        sleepGoalHours:
          Number(sleepGoal) > 0
            ? Number(sleepGoal)
            : 8,
      });

      setHealth(updated);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.back,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>PERSONAL PROFILE</Text>

            <Text style={styles.title}>Health Profile</Text>

            <Text style={styles.subtitle}>
              Your baseline information helps personalise your
              wellness experience.
            </Text>
          </View>

          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>●</Text>
          </View>
        </View>

        <View style={styles.completionCard}>
          <View style={styles.completionTop}>
            <View style={styles.completionIcon}>
              <Text style={styles.completionIconText}>✓</Text>
            </View>

            <View style={styles.completionCopy}>
              <Text style={styles.completionTitle}>
                Profile completeness
              </Text>

              <Text style={styles.completionSubtitle}>
                {completion}% of your wellness profile is set up
              </Text>
            </View>

            <Text style={styles.completionValue}>
              {completion}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completion}%` },
              ]}
            />
          </View>

          <Text style={styles.completionHint}>
            A more complete profile helps the dashboard and AI
            assistant provide more relevant context.
          </Text>
        </View>

        {bmi !== null ? (
          <View style={styles.bmiCard}>
            <View style={styles.bmiTop}>
              <View style={styles.bmiIcon}>
                <Text style={styles.bmiIconText}>⚖</Text>
              </View>

              <View style={styles.bmiHeaderCopy}>
                <Text style={styles.bmiLabel}>BODY METRIC</Text>
                <Text style={styles.bmiTitle}>
                  Current BMI
                </Text>
              </View>

              <View style={styles.bmiValueContainer}>
                <Text style={styles.bmiValue}>{bmi}</Text>
              </View>
            </View>

            <View style={styles.bmiDivider} />

            <View style={styles.bmiBottom}>
              <View style={styles.bmiStatus}>
                <View style={styles.bmiStatusDot} />

                <Text style={styles.bmiStatusText}>
                  {bmiCategory.label}
                </Text>
              </View>

              <Text style={styles.bmiNote}>
                {bmiCategory.description}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.bmiEmptyCard}>
            <View style={styles.bmiEmptyIcon}>
              <Text style={styles.bmiEmptyIconText}>+</Text>
            </View>

            <View style={styles.bmiEmptyCopy}>
              <Text style={styles.bmiEmptyTitle}>
                Complete your baseline
              </Text>

              <Text style={styles.bmiEmptyText}>
                Add your height and weight below to calculate
                your BMI.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <SectionHeader
            number="01"
            title="Personal information"
            description="Your basic health baseline"
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field
                label="Age"
                value={age}
                onChangeText={(value) => {
                  setAge(value);
                  setSaved(false);
                }}
                placeholder="26"
                suffix="years"
              />
            </View>

            <View style={styles.column}>
              <Field
                label="Height"
                value={height}
                onChangeText={(value) => {
                  setHeight(value);
                  setSaved(false);
                }}
                placeholder="178"
                suffix="cm"
              />
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field
                label="Current weight"
                value={weight}
                onChangeText={(value) => {
                  setWeight(value);
                  setSaved(false);
                }}
                placeholder="70"
                suffix="kg"
              />
            </View>

            <View style={styles.column}>
              <Field
                label="Target weight"
                value={targetWeight}
                onChangeText={(value) => {
                  setTargetWeight(value);
                  setSaved(false);
                }}
                placeholder="68"
                suffix="kg"
              />
            </View>
          </View>

          {weightDifference !== null ? (
            <View style={styles.goalInsight}>
              <View style={styles.goalInsightIcon}>
                <Text style={styles.goalInsightIconText}>↗</Text>
              </View>

              <View style={styles.goalInsightCopy}>
                <Text style={styles.goalInsightTitle}>
                  Weight goal
                </Text>

                <Text style={styles.goalInsightText}>
                  {Math.abs(weightDifference).toFixed(1)} kg{' '}
                  {weightDifference > 0
                    ? 'above your target'
                    : weightDifference < 0
                      ? 'below your target'
                      : 'from your target'}
                  .
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <SectionHeader
            number="02"
            title="Activity & fitness"
            description="Tell us how you want to stay active"
          />

          <Text style={styles.groupLabel}>Activity level</Text>

          <View style={styles.optionGrid}>
            {['Low', 'Moderate', 'High'].map((item) => (
              <Option
                key={item}
                label={item}
                selected={activity === item}
                onPress={() => {
                  setActivity(item);
                  setSaved(false);
                }}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, styles.secondGroup]}>
            Fitness goal
          </Text>

          <View style={styles.goalOptions}>
            {[
              'Maintain fitness',
              'Improve fitness',
              'Weight management',
            ].map((item) => (
              <Option
                key={item}
                label={item}
                selected={goal === item}
                onPress={() => {
                  setGoal(item);
                  setSaved(false);
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader
            number="03"
            title="Daily targets"
            description="Set the targets your dashboard will track"
          />

          <Field
            label="Daily step goal"
            value={stepGoal}
            onChangeText={(value) => {
              setStepGoal(value);
              setSaved(false);
            }}
            placeholder="8000"
            suffix="steps"
            helper="Used to calculate your daily activity progress."
          />

          <Field
            label="Daily water goal"
            value={waterGoal}
            onChangeText={(value) => {
              setWaterGoal(value);
              setSaved(false);
            }}
            placeholder="2.5"
            suffix="L"
            helper="Your hydration progress is compared with this target."
          />

          <Field
            label="Sleep goal"
            value={sleepGoal}
            onChangeText={(value) => {
              setSleepGoal(value);
              setSaved(false);
            }}
            placeholder="8"
            suffix="hours"
            helper="Used when interpreting your recovery and sleep progress."
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryEyebrow}>
                YOUR CURRENT SETUP
              </Text>

              <Text style={styles.summaryTitle}>
                Wellness targets
              </Text>
            </View>

            <View style={styles.summaryCheck}>
              <Text style={styles.summaryCheckText}>✓</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🚶</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(stepGoal, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Steps / day</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💧</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(waterGoal)} L
              </Text>
              <Text style={styles.summaryLabel}>Water / day</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🌙</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(sleepGoal, 1)} h
              </Text>
              <Text style={styles.summaryLabel}>Sleep / night</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.save,
            !hasUnsavedChanges && !saved && styles.saveDisabled,
            pressed && styles.savePressed,
          ]}
          onPress={save}
          disabled={saving || (!hasUnsavedChanges && !saved)}
        >
          <View style={styles.saveIcon}>
            <Text style={styles.saveIconText}>
              {saved ? '✓' : '↓'}
            </Text>
          </View>

          <Text style={styles.saveText}>
            {saving
              ? 'Saving profile...'
              : saved
                ? 'Health Profile Saved'
                : 'Save Health Profile'}
          </Text>
        </Pressable>

        {hasUnsavedChanges ? (
          <View style={styles.unsavedNotice}>
            <View style={styles.unsavedDot} />
            <Text style={styles.unsavedText}>
              You have changes that haven't been saved yet.
            </Text>
          </View>
        ) : null}

        <View style={styles.personalisationCard}>
          <View style={styles.personalisationIcon}>
            <Text style={styles.personalisationIconText}>✦</Text>
          </View>

          <View style={styles.personalisationCopy}>
            <Text style={styles.personalisationTitle}>
              Personalised health experience
            </Text>

            <Text style={styles.personalisationText}>
              Your profile helps the dashboard, recommendations
              and AI assistant understand your goals and interpret
              your wellness data in context.
            </Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>ⓘ</Text>

          <Text style={styles.disclaimerText}>
            BMI and wellness targets are provided for general
            wellness tracking. They are not medical diagnoses or
            personalised medical treatment plans.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F9F7',
  },

  container: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 48,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  back: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFEAE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#16372E',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: '#176B5C',
    marginTop: -3,
  },

  headerCopy: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#21836D',
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color: '#102F28',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#72837D',
  },

  profileIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E3F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  profileIconText: {
    fontSize: 20,
    color: '#16805C',
  },

  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E1EBE7',
    marginBottom: 16,
  },

  completionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  completionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E7F6F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  completionIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#16805C',
  },

  completionCopy: {
    flex: 1,
  },

  completionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#17382F',
  },

  completionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#788982',
  },

  completionValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#16805C',
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EAF0ED',
    overflow: 'hidden',
    marginTop: 14,
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#2E9278',
  },

  completionHint: {
    marginTop: 9,
    fontSize: 10,
    lineHeight: 15,
    color: '#82918B',
  },

  bmiCard: {
    backgroundColor: '#EAF8F4',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#CDE9E0',
    padding: 17,
    marginBottom: 17,
  },

  bmiTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bmiIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#D7F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  bmiIconText: {
    fontSize: 20,
    color: '#16765F',
  },

  bmiHeaderCopy: {
    flex: 1,
  },

  bmiLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#368071',
  },

  bmiTitle: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '800',
    color: '#17473B',
  },

  bmiValueContainer: {
    minWidth: 66,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bmiValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#176B5C',
  },

  bmiDivider: {
    height: 1,
    backgroundColor: '#D2EAE2',
    marginVertical: 14,
  },

  bmiBottom: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bmiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 1,
  },

  bmiStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1E9273',
    marginRight: 6,
  },

  bmiStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#236B5C',
  },

  bmiNote: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: '#607E76',
  },

  bmiEmptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E1EBE7',
    padding: 17,
    marginBottom: 17,
  },

  bmiEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  bmiEmptyIconText: {
    fontSize: 23,
    fontWeight: '700',
    color: '#16805C',
  },

  bmiEmptyCopy: {
    flex: 1,
  },

  bmiEmptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#18372F',
  },

  bmiEmptyText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: '#788982',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E1EBE7',
    padding: 17,
    marginBottom: 17,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionNumber: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#E8F6F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionNumberText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#21816B',
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#18382F',
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 10,
    color: '#7C8D87',
  },

  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },

  column: {
    flex: 1,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F665F',
    marginBottom: 6,
  },

  inputWrapper: {
    height: 47,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E5E1',
    borderRadius: 13,
    backgroundColor: '#FBFDFC',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 13,
    color: '#18382F',
    fontSize: 13,
    fontWeight: '600',
  },

  inputSuffix: {
    paddingRight: 12,
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9892',
  },

  helper: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 14,
    color: '#8A9892',
  },

  goalInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8F5',
    borderRadius: 13,
    padding: 11,
    marginTop: -2,
  },

  goalInsightIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#DDF1E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  goalInsightIconText: {
    fontSize: 16,
    color: '#16805C',
  },

  goalInsightCopy: {
    flex: 1,
  },

  goalInsightTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#276B5B',
  },

  goalInsightText: {
    marginTop: 2,
    fontSize: 10,
    color: '#71847D',
  },

  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F665F',
    marginBottom: 8,
  },

  secondGroup: {
    marginTop: 4,
  },

  optionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 17,
  },

  goalOptions: {
    gap: 8,
  },

  option: {
    flex: 1,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F9F8',
    borderWidth: 1,
    borderColor: '#E1EAE7',
    borderRadius: 13,
    paddingHorizontal: 10,
  },

  optionActive: {
    backgroundColor: '#E7F6F0',
    borderColor: '#8BCDBB',
  },

  optionPressed: {
    opacity: 0.7,
  },

  optionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#A7B8B2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  optionIndicatorActive: {
    borderColor: '#21836D',
  },

  optionIndicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#21836D',
  },

  optionText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#64766F',
  },

  optionTextActive: {
    color: '#176B5C',
    fontWeight: '800',
  },

  summaryCard: {
    backgroundColor: '#173C33',
    borderRadius: 21,
    padding: 18,
    marginBottom: 17,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#91CFC0',
  },

  summaryTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  summaryCheck: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#286A5A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCheckText: {
    color: '#B8E5D8',
    fontSize: 16,
    fontWeight: '900',
  },

  summaryGrid: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 8,
  },

  summaryItem: {
    flex: 1,
    backgroundColor: '#20483E',
    borderRadius: 14,
    padding: 11,
    minHeight: 82,
  },

  summaryIcon: {
    fontSize: 16,
  },

  summaryValue: {
    marginTop: 7,
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 9,
    color: '#9CC7BD',
  },

  save: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: '#21836D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: '#155B4B',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  saveDisabled: {
    backgroundColor: '#9AB8AF',
    shadowOpacity: 0,
    elevation: 0,
  },

  savePressed: {
    opacity: 0.78,
  },

  saveIcon: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  saveIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  unsavedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },

  unsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D18A22',
    marginRight: 6,
  },

  unsavedText: {
    fontSize: 9,
    color: '#8B7A5F',
  },

  personalisationCard: {
    flexDirection: 'row',
    backgroundColor: '#EAF7F2',
    borderWidth: 1,
    borderColor: '#D4ECE3',
    borderRadius: 18,
    padding: 15,
    marginTop: 17,
  },

  personalisationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#D6EFE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  personalisationIconText: {
    fontSize: 18,
    color: '#16805C',
  },

  personalisationCopy: {
    flex: 1,
  },

  personalisationTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#176B5C',
  },

  personalisationText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: '#637D75',
  },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    marginTop: 14,
  },

  disclaimerIcon: {
    fontSize: 12,
    color: '#899792',
    marginRight: 7,
  },

  disclaimerText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: '#899792',
  },

  pressed: {
    opacity: 0.7,
  },
});