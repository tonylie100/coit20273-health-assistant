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
  const hasProgress =
    progress !== undefined && Number.isFinite(progress);

  const safeProgress = hasProgress
    ? Math.min(100, Math.max(0, progress as number))
    : undefined;

  const progressValue =
    safeProgress !== undefined
      ? Math.round(safeProgress)
      : null;

  return (
    <View
      style={[
        styles.container,
        live && styles.containerLive,
      ]}
    >
      <View style={styles.top}>
        <View
          style={[
            styles.icon,
            live && styles.iconLive,
          ]}
        >
          <Text
            style={styles.iconText}
            accessibilityLabel={`${label} metric`}
          >
            {icon}
          </Text>
        </View>

        {live ? (
          <View
            style={styles.live}
            accessibilityLabel="Live simulated metric"
          >
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>DEMO LIVE</Text>
          </View>
        ) : progressValue !== null ? (
          <View style={styles.percentBadge}>
            <Text style={styles.percent}>
              {progressValue}%
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>

        {unit ? (
          <Text style={styles.unit} numberOfLines={1}>
            {unit}
          </Text>
        ) : null}
      </View>

      {safeProgress !== undefined ? (
        <View style={styles.progressSection}>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityLabel={`${label} progress`}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: progressValue ?? 0,
            }}
          >
            <View
              style={[
                styles.fill,
                { width: `${safeProgress}%` },
              ]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#182238',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A3650',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  containerLive: {
    borderColor: '#285E63',
  },

  top: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#243451',
    borderWidth: 1,
    borderColor: '#344664',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconLive: {
    backgroundColor: '#173E42',
    borderColor: '#286A68',
  },

  iconText: {
    fontSize: 19,
    color: '#F2F6FF',
  },

  live: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#153B35',
    borderWidth: 1,
    borderColor: '#27675A',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#46D6A0',
    marginRight: 5,
  },

  liveText: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '900',
    color: '#72E7BC',
    letterSpacing: 0.3,
  },

  percentBadge: {
    minHeight: 25,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#243451',
    borderWidth: 1,
    borderColor: '#344664',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  percent: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: '#86B9FF',
  },

  label: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    color: '#A6B4CC',
    marginTop: 13,
  },

  valueRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },

  value: {
    flexShrink: 1,
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    color: '#F5F7FF',
    letterSpacing: -0.5,
  },

  unit: {
    flexShrink: 0,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    color: '#899BB8',
    marginLeft: 5,
    marginBottom: 5,
  },

  progressSection: {
    marginTop: 12,
  },

  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#2B3852',
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    minWidth: 0,
    borderRadius: 4,
    backgroundColor: '#68B8FF',
  },
});