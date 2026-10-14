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
          <Text
            style={styles.iconText}
            accessibilityLabel="AI insight"
          >
            ✨
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Personalised Health Insight
          </Text>

          <Text style={styles.subtitle}>
            Based on your current health context
          </Text>
        </View>

        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>
            AI INSIGHT
          </Text>
        </View>
      </View>

      <Text style={styles.insight}>
        {insight}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onAskAI}
        accessibilityRole="button"
        accessibilityLabel="Ask AI Assistant about your health insight"
      >
        <Text style={styles.buttonText}>
          Ask AI Assistant
        </Text>

        <Text style={styles.buttonArrow}>
          →
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5DFF8',
    padding: 20,
    marginBottom: 20,

    shadowColor: '#51418B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#F0EBFF',
    borderWidth: 1,
    borderColor: '#E4DCFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 21,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#302753',
  },

  subtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: '#81799B',
    marginTop: 3,
  },

  aiBadge: {
    backgroundColor: '#F0EBFF',
    borderWidth: 1,
    borderColor: '#E1D8FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },

  aiBadgeText: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    color: '#6655B7',
  },

  insight: {
    fontSize: 14,
    lineHeight: 22,
    color: '#554F6E',
    marginTop: 18,
  },

  button: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6655B7',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 18,
  },

  buttonPressed: {
    backgroundColor: '#51418F',
    opacity: 0.92,
  },

  buttonText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  buttonArrow: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 9,
  },
});