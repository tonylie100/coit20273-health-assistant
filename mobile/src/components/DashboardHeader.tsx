
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  onProfilePress: () => void;
  profileInitial?: string;
  userName?: string | null;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardHeader({
  onProfilePress,
  profileInitial = 'P',
  userName,
}: Props) {
  const greeting = getGreeting();

  const safeInitial =
    profileInitial.trim().charAt(0).toUpperCase() || 'P';

  const displayName = userName?.trim()
    ? userName.trim()
    : 'there';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.greetingRow}>
          <Text
            style={styles.greeting}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {greeting}, {displayName}
          </Text>

          <View
            style={styles.statusBadge}
            accessibilityLabel="Wellness dashboard active"
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              WELLNESS ACTIVE
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          Your health, at a glance
        </Text>

        <Text style={styles.subtitle}>
          AI-powered insights from your latest wellness data
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open your health profile"
        accessibilityHint="View and update your health profile"
        hitSlop={8}
        style={({ pressed }) => [
          styles.profileButton,
          pressed && styles.profileButtonPressed,
        ]}
        onPress={onProfilePress}
      >
        <Text style={styles.profileLetter}>
          {safeInitial}
        </Text>

        <View style={styles.profileStatusDot} />
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
    marginBottom: 26,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 7,
    marginBottom: 9,
  },

  greeting: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#A4B1C8',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#153B35',
    borderWidth: 1,
    borderColor: '#285C52',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginLeft: 9,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#48D6A0',
    marginRight: 6,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.45,
    color: '#80E6BD',
  },

  title: {
    fontSize: 27,
    lineHeight: 35,
    fontWeight: '800',
    color: '#F4F6FF',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#8F9EB8',
    marginTop: 5,
  },

  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#263B58',
    borderWidth: 1,
    borderColor: '#3C5271',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 3,
  },

  profileButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  profileLetter: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#BBD7FF',
  },

  profileStatusDot: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48D6A0',
    borderWidth: 2,
    borderColor: '#182238',
  },
});