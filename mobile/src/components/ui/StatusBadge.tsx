import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radii,
  spacing,
  typography,
} from '../../theme';

type StatusVariant =
  | 'live'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

type StatusBadgeProps = {
  label: string;
  variant?: StatusVariant;
  dot?: boolean;
};

export default function StatusBadge({
  label,
  variant = 'neutral',
  dot = true,
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,

        variant === 'live' &&
          styles.live,

        variant === 'success' &&
          styles.success,

        variant === 'warning' &&
          styles.warning,

        variant === 'danger' &&
          styles.danger,

        variant === 'info' &&
          styles.info,

        variant === 'neutral' &&
          styles.neutral,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,

            variant === 'live' &&
              styles.liveDot,

            variant === 'success' &&
              styles.successDot,

            variant === 'warning' &&
              styles.warningDot,

            variant === 'danger' &&
              styles.dangerDot,

            variant === 'info' &&
              styles.infoDot,

            variant === 'neutral' &&
              styles.neutralDot,
          ]}
        />
      )}

      <Text
        style={[
          styles.text,

          variant === 'live' &&
            styles.liveText,

          variant === 'success' &&
            styles.successText,

          variant === 'warning' &&
            styles.warningText,

          variant === 'danger' &&
            styles.dangerText,

          variant === 'info' &&
            styles.infoText,

          variant === 'neutral' &&
            styles.neutralText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 26,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  text: {
    ...typography.caption,
  },

  live: {
    backgroundColor: colors.successLight,
  },

  success: {
    backgroundColor: colors.successLight,
  },

  warning: {
    backgroundColor: colors.warningLight,
  },

  danger: {
    backgroundColor: colors.dangerLight,
  },

  info: {
    backgroundColor: colors.infoLight,
  },

  neutral: {
    backgroundColor: colors.surfaceMuted,
  },

  liveDot: {
    backgroundColor: colors.live,
  },

  successDot: {
    backgroundColor: colors.success,
  },

  warningDot: {
    backgroundColor: colors.warning,
  },

  dangerDot: {
    backgroundColor: colors.danger,
  },

  infoDot: {
    backgroundColor: colors.info,
  },

  neutralDot: {
    backgroundColor: colors.offline,
  },

  liveText: {
    color: colors.primaryDark,
  },

  successText: {
    color: colors.primaryDark,
  },

  warningText: {
    color: '#94630E',
  },

  dangerText: {
    color: '#9E4141',
  },

  infoText: {
    color: '#326F88',
  },

  neutralText: {
    color: colors.textMuted,
  },
});