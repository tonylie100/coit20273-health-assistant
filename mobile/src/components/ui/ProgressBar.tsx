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
} from '../../theme';

type ProgressBarProps = {
  progress: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  trackColor?: string;
  fillColor?: string;
};

export default function ProgressBar({
  progress,
  height = 7,
  style,
  trackColor = colors.surfaceMuted,
  fillColor = colors.primary,
}: ProgressBarProps) {
  const safeProgress = Math.min(
    100,
    Math.max(0, progress)
  );

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor:
            trackColor,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${safeProgress}%`,
            height,
            backgroundColor:
              fillColor,
            borderRadius: radii.pill,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },

  fill: {
    minWidth: 2,
  },
});