import React from 'react';

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {
  colors,
  radii,
  shadows,
  spacing,
} from '../../theme';

type AppCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
};

export default function AppCard({
  children,
  style,
  padded = true,
  elevated = false,
}: AppCardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated ? shadows.elevated : shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },

  padded: {
    padding: spacing.lg,
  },
});