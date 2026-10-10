
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
  const hasScore =
    score !== null && Number.isFinite(score);

  const safeScore = hasScore
    ? Math.max(0, Math.min(100, score as number))
    : 0;

  const scoreDisplay = hasScore
    ? String(Math.round(safeScore))
    : '--';

  const statusLabel = hasScore
    ? label
    : 'Awaiting data';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <View style={styles.eyebrowRow}>
            <View style={styles.statusDot} />
            <Text style={styles.eyebrow}>
              TODAY'S WELLNESS
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Your current overall wellness status
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            hasScore
              ? styles.statusPillActive
              : styles.statusPillWaiting,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              hasScore
                ? styles.statusPillTextActive
                : styles.statusPillTextWaiting,
            ]}
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.scoreWrapper}>
          <View style={styles.scoreCircleOuter}>
            <View style={styles.scoreCircle}>
              <Text
                style={[
                  styles.score,
                  !hasScore && styles.scoreUnavailable,
                ]}
              >
                {scoreDisplay}
              </Text>

              <Text style={styles.outOf}>/100</Text>
            </View>
          </View>

          <Text style={styles.scoreCaption}>
            WELLNESS SCORE
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {hasScore ? label : 'No wellness score yet'}
          </Text>

          <Text style={styles.insight}>
            {insight}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Overall wellness
          </Text>

          <Text style={styles.progressValue}>
            {hasScore
              ? `${Math.round(safeScore)}%`
              : 'Waiting'}
          </Text>
        </View>

        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel="Overall wellness score"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: hasScore ? Math.round(safeScore) : 0,
          }}
        >
          <View
            style={[
              styles.fill,
              { width: `${safeScore}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.contextStrip}>
        <View style={styles.contextIcon}>
          <Text style={styles.contextIconText}>i</Text>
        </View>

        <View style={styles.contextCopy}>
          <Text style={styles.contextTitle}>
            Wellness overview
          </Text>

          <Text style={styles.contextText}>
            Based on the health information currently available in
            your prototype.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    backgroundColor: '#182238',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D3B55',
    padding: 22,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4BD6A0',
    marginRight: 7,
  },

  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#79E0B8',
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#9BAAC2',
    marginTop: 6,
  },

  statusPill: {
    minHeight: 32,
    maxWidth: '48%',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusPillActive: {
    backgroundColor: '#153D37',
    borderWidth: 1,
    borderColor: '#28685A',
  },

  statusPillWaiting: {
    backgroundColor: '#26334A',
    borderWidth: 1,
    borderColor: '#35445E',
  },

  statusPillText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  statusPillTextActive: {
    color: '#85E7C1',
  },

  statusPillTextWaiting: {
    color: '#AFBDD1',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },

  scoreWrapper: {
    width: 124,
    flexShrink: 0,
    alignItems: 'center',
    marginRight: 20,
  },

  scoreCircleOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#173D3B',
    borderWidth: 7,
    borderColor: '#347A69',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#202E43',
    alignItems: 'center',
    justifyContent: 'center',
  },

  score: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: '#83E6BE',
    fontVariant: ['tabular-nums'],
  },

  scoreUnavailable: {
    fontSize: 29,
    color: '#A1B0C5',
  },

  outOf: {
    fontSize: 12,
    lineHeight: 16,
    color: '#A5C9BD',
    marginTop: -1,
    fontWeight: '700',
  },

  scoreCaption: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#9CBFB4',
    marginTop: 9,
    textAlign: 'center',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#F4F6FF',
    marginBottom: 8,
  },

  insight: {
    fontSize: 13,
    lineHeight: 20,
    color: '#B2BED1',
  },

  progressSection: {
    marginTop: 23,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#A9B7CC',
  },

  progressValue: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#80E2BA',
  },

  track: {
    height: 9,
    borderRadius: 5,
    backgroundColor: '#303D53',
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    minWidth: 0,
    borderRadius: 5,
    backgroundColor: '#4CC99A',
  },

  contextStrip: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30465A',
    borderRadius: 15,
    backgroundColor: '#202D42',
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: 18,
  },

  contextIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#254B48',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  contextIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#82E1BB',
  },

  contextCopy: {
    flex: 1,
    minWidth: 0,
  },

  contextTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#D8EEE6',
  },

  contextText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#9BAAC0',
    marginTop: 3,
  },
});
