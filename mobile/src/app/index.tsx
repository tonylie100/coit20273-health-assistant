import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import TestRecommendationScreen from '../components/TestRecommendationScreen';

export default function HomeScreen() {
  const [showTest, setShowTest] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Health Assistant</Text>

      <Text style={styles.subtitle}>
        Home Page
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/chatbot')}
      >
        <Text style={styles.buttonText}>
          Open AI Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/mental-health')}
      >
        <Text style={styles.buttonText}>
          Mental Health
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/health-data')}
      >
        <Text style={styles.buttonText}>
          Health Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={() => setShowTest(!showTest)}
      >
        <Text style={styles.buttonText}>
          {showTest ? 'Hide API Test' : 'Test Recommendations API'}
        </Text>
      </TouchableOpacity>

      {showTest && (
        <View style={styles.testWrapper}>
          <TestRecommendationScreen />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#2E7D6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },

  testButton: {
    backgroundColor: '#3182CE',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  testWrapper: {
    width: '100%',
    marginTop: 20,
  },
});