import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});