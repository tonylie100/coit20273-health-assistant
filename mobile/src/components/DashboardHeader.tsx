import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  onProfilePress: () => void;
};

export default function DashboardHeader({
  onProfilePress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>
          Good day 👋
        </Text>

        <Text style={styles.title}>
          AI Health Assistant
        </Text>

        <Text style={styles.subtitle}>
          Your personal real-time wellness companion
        </Text>
      </View>

      <Pressable
        style={styles.profileButton}
        onPress={onProfilePress}
      >
        <Text style={styles.profileLetter}>
          P
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  textContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 12,
    color: '#647A88',
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#082B45',
  },

  subtitle: {
    fontSize: 12,
    color: '#738794',
    marginTop: 4,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DDF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },

  profileLetter: {
    fontSize: 15,
    fontWeight: '900',
    color: '#176B5C',
  },
});