import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  insight: string;
  onAskAI: () => void;
};

export default function AIInsightCard({
  insight,
  onAskAI,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            ✨
          </Text>
        </View>

        <View>
          <Text style={styles.title}>
            Personalised Health Insight
          </Text>

          <Text style={styles.subtitle}>
            Based on your current health context
          </Text>
        </View>
      </View>

      <Text style={styles.insight}>
        {insight}
      </Text>

      <Pressable
        style={styles.button}
        onPress={onAskAI}
      >
        <Text style={styles.buttonText}>
          Ask AI Assistant →
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCEEEA',
    padding: 18,
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  iconText: {
    fontSize: 20,
  },

  title: {
    fontSize: 13,
    fontWeight: '900',
    color: '#173A51',
  },

  subtitle: {
    fontSize: 9,
    color: '#82939E',
    marginTop: 3,
  },

  insight: {
    fontSize: 12,
    lineHeight: 19,
    color: '#536C7D',
    marginTop: 15,
  },

  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5F6F1',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 11,
    marginTop: 14,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A725F',
  },
});