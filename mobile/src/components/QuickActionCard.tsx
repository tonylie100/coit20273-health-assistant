import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
};

export default function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
  primary = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      style={({ pressed }) => [
        styles.container,
        primary && styles.primary,
        pressed && styles.pressed,
        primary && pressed && styles.primaryPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.icon,
          primary && styles.iconPrimary,
        ]}
      >
        <Text
          style={styles.iconText}
          accessibilityElementsHidden
        >
          {icon}
        </Text>
      </View>

      <View style={styles.text}>
        <Text
          style={[
            styles.title,
            primary && styles.titlePrimary,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.subtitle,
            primary && styles.subtitlePrimary,
          ]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.arrowContainer,
          primary && styles.arrowContainerPrimary,
        ]}
      >
        <Text
          style={[
            styles.arrow,
            primary && styles.arrowPrimary,
          ]}
          accessibilityElementsHidden
        >
          ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 210,
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E8F2',
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#233E65',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  primary: {
    backgroundColor: '#233E65',
    borderColor: '#233E65',

    shadowColor: '#233E65',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  pressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  primaryPressed: {
    opacity: 0.92,
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#EDF3FA',
    borderWidth: 1,
    borderColor: '#DFE8F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconPrimary: {
    backgroundColor: '#345681',
    borderColor: '#496990',
  },

  iconText: {
    fontSize: 20,
  },

  text: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: '#233E65',
  },

  titlePrimary: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#74859A',
    marginTop: 4,
  },

  subtitlePrimary: {
    color: '#D9E5F4',
  },

  arrowContainer: {
    width: 30,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#F0F4F9',
  },

  arrowContainerPrimary: {
    backgroundColor: '#345681',
  },

  arrow: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '400',
    color: '#526E91',
  },

  arrowPrimary: {
    color: '#FFFFFF',
  },
});