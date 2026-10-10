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

        variant === 'live' && styles.live,
        variant === 'success' && styles.success,
        variant === 'warning' && styles.warning,
        variant === 'danger' && styles.danger,
        variant === 'info' && styles.info,
        variant === 'neutral' && styles.neutral,
      ]}
    >
      {dot ? (
        <View
          style={[
            styles.dot,

            variant === 'live' && styles.liveDot,
            variant === 'success' && styles.successDot,
            variant === 'warning' && styles.warningDot,
            variant === 'danger' && styles.dangerDot,
            variant === 'info' && styles.infoDot,
            variant === 'neutral' && styles.neutralDot,
          ]}
        />
      ) : null}

      <Text
        style={[
          styles.text,

          variant === 'live' && styles.liveText,
          variant === 'success' && styles.successText,
          variant === 'warning' && styles.warningText,
          variant === 'danger' && styles.dangerText,
          variant === 'info' && styles.infoText,
          variant === 'neutral' && styles.neutralText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  text: {
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.15,
  },

  live: {
    backgroundColor: colors.successLight,
    borderColor: '#C7E8D7',
  },

  success: {
    backgroundColor: colors.successLight,
    borderColor: '#C7E8D7',
  },

  warning: {
    backgroundColor: colors.warningLight,
    borderColor: '#F0DEB3',
  },

  danger: {
    backgroundColor: colors.dangerLight,
    borderColor: '#F0D0D0',
  },

  info: {
    backgroundColor: colors.infoLight,
    borderColor: '#CFE5EF',
  },

  neutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: '#E1E7EC',
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
    color: '#85580B',
  },

  dangerText: {
    color: '#963838',
  },

  infoText: {
    color: '#285E76',
  },

  neutralText: {
    color: colors.textMuted,
  },
});