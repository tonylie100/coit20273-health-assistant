import React from 'react';

import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
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
      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <Text
            style={styles.actionText}
            numberOfLines={1}
          >
            {actionLabel}
          </Text>

          <Text
            style={styles.arrow}
            accessibilityElementsHidden
          >
            →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
  },

  title: {
    ...typography.h2,
    color: colors.textStrong,
    fontWeight: '800',
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 19,
  },

  action: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },

  actionPressed: {
    opacity: 0.65,
  },

  actionText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '800',
  },

  arrow: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 5,
  },
});