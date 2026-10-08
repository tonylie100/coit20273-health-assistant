import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  score: number | null;
  label: string;
  insight: string;
};

export default function WellnessHero({
  score,
  label,
  insight,
}: Props) {
  const safeScore =
    score === null ? 0 : Math.max(0, Math.min(100, score));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>
            TODAY'S WELLNESS
          </Text>

          <Text style={styles.subtitle}>
            Your current overall wellness status
          </Text>
        </View>

        <View
          style={[
            styles.pill,
            score !== null && styles.pillActive,
          ]}
        >
          <Text
            style={[
              styles.pillText,
              score !== null && styles.pillTextActive,
            ]}
          >
            {label}
          </Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.score}>
            {score ?? '--'}
          </Text>

          <Text style={styles.outOf}>
            /100
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {score === null
              ? 'No health data yet'
              : label}
          </Text>

          <Text style={styles.insight}>
            {insight}
          </Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${safeScore}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCEEEA',
    padding: 22,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: '#2B7E6E',
  },

  subtitle: {
    fontSize: 11,
    color: '#7A8D9B',
    marginTop: 4,
  },

  pill: {
    backgroundColor: '#F1F4F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  pillActive: {
    backgroundColor: '#E2F5EF',
  },

  pillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C8B94',
  },

  pillTextActive: {
    color: '#217560',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  scoreCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#E7F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  score: {
    fontSize: 35,
    fontWeight: '900',
    color: '#176B5C',
  },

  outOf: {
    fontSize: 10,
    color: '#719089',
    marginTop: -3,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: '900',
    color: '#092B45',
    marginBottom: 7,
  },

  insight: {
    fontSize: 12,
    lineHeight: 19,
    color: '#647A8B',
  },

  track: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#E8F0EE',
    marginTop: 20,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#3E9B87',
  },
});