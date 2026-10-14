
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  connected: boolean;
  deviceName: string | null;
  lastUpdated: string | null;
  onPress: () => void;
};

function formatTime(timestamp: string | null) {
  if (!timestamp) return 'Waiting for data';

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Waiting for data';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function LiveDeviceBanner({
  connected,
  deviceName,
  lastUpdated,
  onPress,
}: Props) {
  const displayName = connected
    ? deviceName || 'Demo Wearable'
    : 'Health Device';

  const updateText = connected
    ? `Last update: ${formatTime(lastUpdated)}`
    : 'No live device currently active';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        connected
          ? `${displayName} is active with simulated readings. Open live health data.`
          : 'Health device is not active. Open live health data.'
      }
      accessibilityHint="Opens the live health screen"
      style={({ pressed }) => [
        styles.container,
        connected && styles.containerActive,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.deviceIcon,
            connected && styles.deviceIconActive,
          ]}
        >
          <Text style={styles.deviceIconText}>⌚</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {displayName}
            </Text>

            {connected && (
              <View
                style={styles.liveBadge}
                accessibilityLabel="Simulated live data"
              >
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>DEMO LIVE</Text>
              </View>
            )}
          </View>

          <Text style={styles.subtitle} numberOfLines={2}>
            {connected
              ? 'Streaming simulated real-time health data'
              : 'Start the demo monitor to see simulated readings'}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.statusDot,
                connected
                  ? styles.statusDotActive
                  : styles.statusDotInactive,
              ]}
            />

            <Text
              style={[
                styles.updated,
                connected
                  ? styles.updatedActive
                  : styles.updatedInactive,
              ]}
            >
              {updateText}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.arrowContainer,
          connected && styles.arrowContainerActive,
        ]}
      >
        <Text
          style={[
            styles.arrow,
            connected && styles.arrowActive,
          ]}
        >
          ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    minHeight: 112,
    borderRadius: 22,
    backgroundColor: '#182238',
    borderWidth: 1,
    borderColor: '#2A3650',
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  containerActive: {
    backgroundColor: '#1A2C3D',
    borderColor: '#28645D',
  },

  containerPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.995 }],
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#26344D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: '#354560',
  },

  deviceIconActive: {
    backgroundColor: '#204640',
    borderColor: '#34766A',
  },

  deviceIconText: {
    fontSize: 25,
    color: '#F3F6FF',
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    rowGap: 6,
  },

  title: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
    color: '#F4F6FF',
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#A3B2C8',
    marginTop: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusDotActive: {
    backgroundColor: '#49D6A0',
  },

  statusDotInactive: {
    backgroundColor: '#8493A8',
  },

  updated: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  updatedActive: {
    color: '#9EDCC5',
  },

  updatedInactive: {
    color: '#A0ADC1',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#153D36',
    borderWidth: 1,
    borderColor: '#28675A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#49D6A0',
    marginRight: 5,
  },

  liveText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    color: '#83E7C0',
    letterSpacing: 0.35,
  },

  arrowContainer: {
    width: 34,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#26334A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  arrowContainerActive: {
    backgroundColor: '#254640',
  },

  arrow: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
    color: '#A6B4C9',
  },

  arrowActive: {
    color: '#7FE0B9',
  },
});