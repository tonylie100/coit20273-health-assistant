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
  if (!timestamp) {
    return 'Waiting for data';
  }

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
  return (
    <Pressable
      style={[
        styles.container,
        connected && styles.containerActive,
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.watch,
            connected && styles.watchActive,
          ]}
        >
          <Text style={styles.watchText}>
            ⌚
          </Text>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {connected
                ? deviceName || 'Demo Wearable'
                : 'Health Device'}
            </Text>

            {connected ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  LIVE
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.subtitle}>
            {connected
              ? 'Streaming simulated real-time health data'
              : 'No live device currently active'}
          </Text>

          {connected ? (
            <Text style={styles.updated}>
              Last update: {formatTime(lastUpdated)}
            </Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.arrow}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCEEEA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  containerActive: {
    backgroundColor: '#ECF9F5',
    borderColor: '#A9DCCE',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  watch: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#F1F4F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  watchActive: {
    backgroundColor: '#D7F2EA',
  },

  watchText: {
    fontSize: 22,
  },

  info: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#12374E',
  },

  subtitle: {
    fontSize: 10,
    color: '#718493',
    marginTop: 3,
  },

  updated: {
    fontSize: 9,
    color: '#7C918C',
    marginTop: 4,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D6F1E9',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 8,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#19A36D',
    marginRight: 4,
  },

  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#18745F',
    letterSpacing: 0.7,
  },

  arrow: {
    fontSize: 28,
    color: '#559184',
    marginLeft: 10,
  },
});