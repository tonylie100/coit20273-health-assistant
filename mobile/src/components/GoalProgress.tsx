import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  icon: string;
  title: string;
  current: number;
  target: number;
  unit: string;
};

export default function GoalProgress({
  icon,
  title,
  current,
  target,
  unit,
}: Props) {
  const safeCurrent =
    Number.isFinite(current) ? Math.max(0, current) : 0;

  const safeTarget =
    Number.isFinite(target) ? Math.max(0, target) : 0;

  const percentage =
    safeTarget > 0
      ? Math.min(100, (safeCurrent / safeTarget) * 100)
      : 0;

  const roundedPercentage = Math.round(percentage);
  const decimals = unit === 'L' ? 1 : 0;

  const currentDisplay = safeCurrent.toFixed(decimals);
  const targetDisplay = safeTarget.toFixed(decimals);

  const isComplete =
    safeTarget > 0 && safeCurrent >= safeTarget;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.icon,
          isComplete && styles.iconComplete,
        ]}
      >
        <Text
          style={styles.iconText}
          accessibilityLabel={`${title} goal`}
        >
          {icon}
        </Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.header}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={styles.value}
            numberOfLines={1}
          >
            {currentDisplay} / {targetDisplay} {unit}
          </Text>
        </View>

        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel={`${title} goal progress`}
          accessibilityValue={{
            min: 0,
            max: 100,
            now: roundedPercentage,
          }}
        >
          <View
            style={[
              styles.fill,
              isComplete && styles.fillComplete,
              {
                width: `${percentage}%`,
              },
            ]}
          />
        </View>

        {isComplete ? (
          <Text style={styles.completeLabel}>
            Goal completed
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.percentBadge,
          isComplete && styles.percentBadgeComplete,
        ]}
      >
        <Text
          style={[
            styles.percent,
            isComplete && styles.percentComplete,
          ]}
        >
          {roundedPercentage}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EDF6F2',
    borderWidth: 1,
    borderColor: '#DCECE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconComplete: {
    backgroundColor: '#DDF2E6',
    borderColor: '#BFE3CF',
  },

  iconText: {
    fontSize: 19,
  },

  middle: {
    flex: 1,
    minWidth: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  title: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: '#24483D',
    paddingRight: 8,
  },

  value: {
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#73877E',
  },

  track: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#E8F0EB',
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    minWidth: 0,
    borderRadius: 5,
    backgroundColor: '#176557',
  },

  fillComplete: {
    backgroundColor: '#21845F',
  },

  completeLabel: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#21845F',
  },

  percentBadge: {
    minWidth: 46,
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: '#EDF6F2',
    borderWidth: 1,
    borderColor: '#DCECE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    marginLeft: 10,
  },

  percentBadgeComplete: {
    backgroundColor: '#DDF2E6',
    borderColor: '#BFE3CF',
  },

  percent: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    color: '#176557',
  },

  percentComplete: {
    color: '#176A4D',
  },
});