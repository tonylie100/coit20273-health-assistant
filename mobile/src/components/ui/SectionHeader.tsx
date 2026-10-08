import React from 'react';

import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      <View
        style={styles.textContainer}
      >
        <Text
          style={styles.title}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel &&
      onActionPress ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={
            onActionPress
          }
          style={
            styles.action
          }
        >
          <Text
            style={styles.actionText}
          >
            {actionLabel}
          </Text>

          <Text
            style={styles.arrow}
          >
            →
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },

  title: {
    ...typography.h2,
    color: colors.textStrong,
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 3,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },

  actionText: {
    ...typography.label,
    color: colors.primary,
  },

  arrow: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4,
  },
});