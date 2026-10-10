import React, { useEffect, useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import {
  getHealthState,
  subscribeToHealthState,
  updateHealthState,
  type HealthState,
} from '../services/healthState';

const C = {
  background: '#0B1220', card: '#182238', cardSoft: '#202D42',
  text: '#F4F6FF', secondary: '#B2BED1', muted: '#8393AA',
  border: '#2A3650', green: '#49D6A0', greenSoft: '#173D37',
  blue: '#79B7FF', purple: '#B5A4FF',
};

function GoalCard({
  title, description, value, unit, current, color, onChange,
}: {
  title: string; description: string; value: string; unit: string;
  current: number; color: string; onChange: (value: string) => void;
}) {
  const target = Number(value);
  const progress = Number.isFinite(target) && target > 0
    ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconDot, { backgroundColor: color }]} />
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Text style={styles.percent}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.targetRow}>
        <Text style={styles.currentValue}>Current: {current.toLocaleString()} {unit}</Text>
        <View style={styles.targetInputWrap}>
          <Text style={styles.targetLabel}>Daily target</Text>
          <TextInput
            accessibilityLabel={`${title} daily target`}
            value={value}
            onChangeText={onChange}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={styles.targetInput}
          />
          <Text style={styles.targetUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  const [health, setHealth] = useState<HealthState>(getHealthState());
  const [stepsTarget, setStepsTarget] = useState(String(getHealthState().stepGoal));
  const [waterTarget, setWaterTarget] = useState(String(getHealthState().waterGoalLitres));
  const [sleepTarget, setSleepTarget] = useState(String(getHealthState().sleepGoalHours));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getHealthState();
    setHealth(current);
    setStepsTarget(String(current.stepGoal));
    setWaterTarget(String(current.waterGoalLitres));
    setSleepTarget(String(current.sleepGoalHours));
    return subscribeToHealthState(setHealth);
  }, []);

  const sleepCurrent = health.sleepHours ?? 0;
  const saveGoals = () => {
    const steps = Number(stepsTarget);
    const water = Number(waterTarget);
    const sleep = Number(sleepTarget);
    if (!Number.isFinite(steps) || steps <= 0 || !Number.isFinite(water) || water <= 0 || !Number.isFinite(sleep) || sleep <= 0) {
      Alert.alert('Check your targets', 'Enter positive numbers for all three daily targets.');
      return;
    }
    updateHealthState({ stepGoal: Math.round(steps), waterGoalLitres: water, sleepGoalHours: sleep });
    setSaved(true);
    Alert.alert('Goals saved', 'Your daily wellness targets have been updated.');
  };

  const allGoals = useMemo(() => [health.stepGoal, health.waterGoalLitres, health.sleepGoalHours], [health.stepGoal, health.waterGoalLitres, health.sleepGoalHours]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>YOUR WELLNESS PLAN</Text>
            <Text style={styles.title}>My Goals</Text>
            <Text style={styles.subtitle}>Set daily targets and track progress using the health data currently available.</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>DAILY TARGETS</Text>
          <Text style={styles.summaryTitle}>Small steps, steady progress</Text>
          <Text style={styles.summaryText}>You have {allGoals.length} configurable goals. Progress updates as your shared health data changes.</Text>
          <View style={styles.summaryPills}>
            <Text style={styles.pill}>Activity</Text><Text style={styles.pill}>Hydration</Text><Text style={styles.pill}>Sleep</Text>
          </View>
        </View>

        <GoalCard title="Daily steps" description="Build movement into your day" value={stepsTarget} unit="steps" current={health.steps} color={C.green} onChange={(v) => { setStepsTarget(v); setSaved(false); }} />
        <GoalCard title="Hydration" description="Track your water intake" value={waterTarget} unit="L" current={health.waterIntake} color={C.blue} onChange={(v) => { setWaterTarget(v); setSaved(false); }} />
        <GoalCard title="Sleep" description="Aim for a consistent sleep routine" value={sleepTarget} unit="hours" current={sleepCurrent} color={C.purple} onChange={(v) => { setSleepTarget(v); setSaved(false); }} />

        <Text style={styles.note}>Progress is based on the values currently available in PulseWell. Missing sleep or hydration data is treated as zero progress, not as a measured zero. Demo wearable readings are simulated and are not clinical measurements.</Text>
        <Pressable accessibilityRole="button" onPress={saveGoals} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
          <Text style={styles.saveButtonText}>{saved ? 'Save changes' : 'Save daily goals'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/health-data')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Enter manual health data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  content: { padding: 24, paddingBottom: 40, maxWidth: 1000, width: '100%', alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, gap: 14 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.cardSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  backText: { color: C.text, fontSize: 30, lineHeight: 34 },
  headerCopy: { flex: 1 },
  eyebrow: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, marginBottom: 7 },
  title: { color: C.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: C.secondary, fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 620 },
  summaryCard: { backgroundColor: C.greenSoft, borderColor: '#27675A', borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 16 },
  summaryEyebrow: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  summaryTitle: { color: C.text, fontSize: 20, fontWeight: '800', marginTop: 8 },
  summaryText: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 7 },
  summaryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  pill: { color: C.text, backgroundColor: '#244C45', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, fontSize: 11, overflow: 'hidden' },
  card: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconDot: { width: 10, height: 10, borderRadius: 5 },
  cardCopy: { flex: 1 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  cardDescription: { color: C.secondary, fontSize: 11, marginTop: 4 },
  percent: { color: C.text, fontSize: 18, fontWeight: '900' },
  progressTrack: { height: 8, backgroundColor: '#303D56', borderRadius: 8, overflow: 'hidden', marginTop: 18 },
  progressFill: { height: 8, borderRadius: 8 },
  targetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' },
  currentValue: { color: C.secondary, fontSize: 11 },
  targetInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetLabel: { color: C.muted, fontSize: 10 },
  targetInput: { minWidth: 66, color: C.text, backgroundColor: C.cardSoft, borderWidth: 1, borderColor: C.border, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, textAlign: 'right', fontSize: 12 },
  targetUnit: { color: C.secondary, fontSize: 10 },
  note: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 6, marginBottom: 16 },
  saveButton: { backgroundColor: C.green, borderRadius: 13, paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { color: '#071711', fontSize: 13, fontWeight: '900' },
  secondaryButton: { borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 13, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  secondaryButtonText: { color: C.text, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
