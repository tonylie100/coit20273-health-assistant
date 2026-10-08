import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  icon: string;
  label: string;
  value: string;
  unit?: string;
  progress?: number;
  live?: boolean;
};

export default function HealthMetricCard({
  icon,
  label,
  value,
  unit,
  progress,
  live,
}: Props) {
  const safeProgress =
    progress === undefined
      ? undefined
      : Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            {icon}
          </Text>
        </View>

        {live ? (
          <View style={styles.live}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        ) : safeProgress !== undefined ? (
          <Text style={styles.percent}>
            {Math.round(safeProgress)}%
          </Text>
        ) : null}
      </View>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value}
        </Text>

        {unit ? (
          <Text style={styles.unit}>
            {unit}
          </Text>
        ) : null}
      </View>

      {safeProgress !== undefined ? (
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${safeProgress}%`,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCEEEA',
    padding: 15,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#EFF8F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 17,
  },

  live: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F6EF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#18A26C',
    marginRight: 4,
  },

  liveText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#18745F',
  },

  percent: {
    fontSize: 9,
    fontWeight: '900',
    color: '#398C7B',
  },

  label: {
    fontSize: 10,
    color: '#60798B',
    marginTop: 11,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },

  value: {
    fontSize: 24,
    fontWeight: '900',
    color: '#092B45',
  },

  unit: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7D909C',
    marginLeft: 4,
    marginBottom: 4,
  },

  track: {
    height: 5,
    borderRadius: 4,
    backgroundColor: '#E8F0EE',
    marginTop: 9,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4AA18D',
  },
});