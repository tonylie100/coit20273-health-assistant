import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radii,
  spacing,
  typography,
} from '../../theme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: AppButtonProps) {
  const isDisabled =
    disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,

        variant === 'primary' &&
          styles.primary,

        variant === 'secondary' &&
          styles.secondary,

        variant === 'outline' &&
          styles.outline,

        variant === 'ghost' &&
          styles.ghost,

        variant === 'danger' &&
          styles.danger,

        fullWidth &&
          styles.fullWidth,

        isDisabled &&
          styles.disabled,

        pressed &&
          !isDisabled &&
          styles.pressed,

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' ||
            variant === 'ghost'
              ? colors.primary
              : colors.textInverse
          }
        />
      ) : (
        <Text
          style={[
            styles.text,

            variant === 'primary' &&
              styles.primaryText,

            variant === 'secondary' &&
              styles.secondaryText,

            variant === 'outline' &&
              styles.outlineText,

            variant === 'ghost' &&
              styles.ghostText,

            variant === 'danger' &&
              styles.dangerText,

            isDisabled &&
              styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  primary: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.primaryLight,
  },

  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  danger: {
    backgroundColor: colors.danger,
  },

  fullWidth: {
    width: '100%',
  },

  text: {
    ...typography.button,
  },

  primaryText: {
    color: colors.textInverse,
  },

  secondaryText: {
    color: colors.primaryDark,
  },

  outlineText: {
    color: colors.primary,
  },

  ghostText: {
    color: colors.primary,
  },

  dangerText: {
    color: colors.textInverse,
  },

  disabled: {
    opacity: 0.45,
  },

  disabledText: {
    color: colors.textInverse,
  },

  pressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});