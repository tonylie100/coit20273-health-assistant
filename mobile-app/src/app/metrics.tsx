import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

export default function MetricsScreen() {
  const [stepCount, setStepCount] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submitMetrics = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch(
        'http://192.168.0.237:3000/api/v1/metrics',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 2,
            step_count: Number(stepCount),
            sleep_hours: Number(sleepHours),
            heart_rate_avg: Number(heartRate),
            water_intake: Number(waterIntake),
            calories_burned: Number(caloriesBurned),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit health metrics');
      }

      setMessage('Health metrics submitted successfully.');

      setStepCount('');
      setSleepHours('');
      setHeartRate('');
      setWaterIntake('');
      setCaloriesBurned('');
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Unable to submit health metrics.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health Metrics</Text>

      <Text style={styles.subtitle}>
        Enter your daily health information
      </Text>

      <Text style={styles.label}>Steps</Text>
      <TextInput
        style={styles.input}
        value={stepCount}
        onChangeText={setStepCount}
        keyboardType="numeric"
        placeholder="e.g. 8500"
      />

      <Text style={styles.label}>Sleep Hours</Text>
      <TextInput
        style={styles.input}
        value={sleepHours}
        onChangeText={setSleepHours}
        keyboardType="decimal-pad"
        placeholder="e.g. 7.5"
      />

      <Text style={styles.label}>Average Heart Rate</Text>
      <TextInput
        style={styles.input}
        value={heartRate}
        onChangeText={setHeartRate}
        keyboardType="numeric"
        placeholder="e.g. 72"
      />

      <Text style={styles.label}>Water Intake (L)</Text>
      <TextInput
        style={styles.input}
        value={waterIntake}
        onChangeText={setWaterIntake}
        keyboardType="decimal-pad"
        placeholder="e.g. 2.5"
      />

      <Text style={styles.label}>Calories Burned</Text>
      <TextInput
        style={styles.input}
        value={caloriesBurned}
        onChangeText={setCaloriesBurned}
        keyboardType="numeric"
        placeholder="e.g. 450"
      />

      <Pressable
        style={styles.button}
        onPress={submitMetrics}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>
            Submit Health Metrics
          </Text>
        )}
      </Pressable>

      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  button: {
    marginTop: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});