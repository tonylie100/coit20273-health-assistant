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
      style={[
        styles.container,
        primary && styles.primary,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.icon,
          primary && styles.iconPrimary,
        ]}
      >
        <Text style={styles.iconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.text}>
        <Text
          style={[
            styles.title,
            primary && styles.titlePrimary,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.subtitle,
            primary && styles.subtitlePrimary,
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={[
          styles.arrow,
          primary && styles.arrowPrimary,
        ]}
      >
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 210,
    minHeight: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCEEEA',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  primary: {
    backgroundColor: '#2E8070',
    borderColor: '#2E8070',
  },

  icon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EFF8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  iconPrimary: {
    backgroundColor: '#4A9988',
  },

  iconText: {
    fontSize: 19,
  },

  text: {
    flex: 1,
  },

  title: {
    fontSize: 12,
    fontWeight: '900',
    color: '#173A51',
  },

  titlePrimary: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 9,
    lineHeight: 14,
    color: '#7A8D9B',
    marginTop: 3,
  },

  subtitlePrimary: {
    color: '#D8F0E9',
  },

  arrow: {
    fontSize: 25,
    color: '#709080',
  },

  arrowPrimary: {
    color: '#FFFFFF',
  },
});