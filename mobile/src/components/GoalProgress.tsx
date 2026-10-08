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
  const percentage =
    target > 0
      ? Math.min(100, (current / target) * 100)
      : 0;

  const decimals = unit === 'L' ? 1 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text>{icon}</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.value}>
            {current.toFixed(decimals)} /{' '}
            {target.toFixed(decimals)} {unit}
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.percent}>
        {Math.round(percentage)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#EFF8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  middle: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#36546A',
  },

  value: {
    fontSize: 9,
    color: '#7B8E9C',
  },

  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E8F0EE',
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4BA38F',
  },

  percent: {
    width: 40,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: '900',
    color: '#398B7A',
  },
});