import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  submitHealthData,
  HealthDataPayload,
} from '../services/apiService';

export default function HealthDataScreen() {
  const [userId, setUserId] = useState('');
  const [steps, setSteps] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const clearMessages = () => {
    setValidationMessage('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const clearForm = () => {
    setUserId('');
    setSteps('');
    setHeartRate('');
    setSleepHours('');
    setWaterIntake('');
    setCaloriesBurned('');
    clearMessages();
  };

  const showValidationError = (message: string) => {
    setValidationMessage(message);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    clearMessages();

    if (!userId.trim()) {
      showValidationError('Please enter User ID.');
      return;
    }

    if (!steps.trim()) {
      showValidationError('Please enter the number of steps.');
      return;
    }

    const userIdValue = Number(userId);
    const stepsValue = Number(steps);

    const heartRateValue = heartRate.trim()
      ? Number(heartRate)
      : null;

    const sleepHoursValue = sleepHours.trim()
      ? Number(sleepHours)
      : null;

    const waterIntakeValue = waterIntake.trim()
      ? Number(waterIntake)
      : 0;

    const caloriesValue = caloriesBurned.trim()
      ? Number(caloriesBurned)
      : 0;

    if (
      !Number.isInteger(userIdValue) ||
      userIdValue <= 0
    ) {
      showValidationError(
        'Please enter a valid positive numeric User ID.'
      );
      return;
    }

    if (
      !Number.isFinite(stepsValue) ||
      stepsValue < 0
    ) {
      showValidationError(
        'Please enter a valid non-negative number of steps.'
      );
      return;
    }

    if (
      heartRateValue !== null &&
      (!Number.isFinite(heartRateValue) ||
        heartRateValue <= 0)
    ) {
      showValidationError(
        'Please enter a valid positive heart rate.'
      );
      return;
    }

    if (
      sleepHoursValue !== null &&
      (
        !Number.isFinite(sleepHoursValue) ||
        sleepHoursValue < 0 ||
        sleepHoursValue > 24
      )
    ) {
      showValidationError(
        'Sleep hours must be between 0 and 24.'
      );
      return;
    }

    if (
      !Number.isFinite(waterIntakeValue) ||
      waterIntakeValue < 0
    ) {
      showValidationError(
        'Please enter a valid non-negative water intake.'
      );
      return;
    }

    if (
      !Number.isFinite(caloriesValue) ||
      caloriesValue < 0
    ) {
      showValidationError(
        'Please enter valid non-negative calories burned.'
      );
      return;
    }

    const payload: HealthDataPayload = {
      user_id: userIdValue,
      step_count: stepsValue,
      sleep_hours: sleepHoursValue,
      heart_rate_avg: heartRateValue,
      water_intake: waterIntakeValue,
      calories_burned: caloriesValue,
    };

    setIsSubmitting(true);

    try {
      const data = await submitHealthData(payload);

      setSuccessMessage(
        data.message ||
          'Health data submitted successfully.'
      );

      setValidationMessage('');
      setErrorMessage('');

      clearForm();
    } catch (error) {
      console.error(
        'Health data submission error:',
        error
      );

      setValidationMessage('');
      setSuccessMessage('');
      setErrorMessage(
        'Health data could not be submitted. Please check the backend connection and User ID.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Health Data</Text>

      <Text style={styles.subtitle}>
        Enter your daily health information
      </Text>

      <Text style={styles.label}>User ID *</Text>

      <TextInput
        style={styles.input}
        value={userId}
        onChangeText={(text) => {
          setUserId(text);
          clearMessages();
        }}
        placeholder="e.g. 1"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Steps *</Text>

      <TextInput
        style={styles.input}
        value={steps}
        onChangeText={(text) => {
          setSteps(text);
          clearMessages();
        }}
        placeholder="e.g. 8000"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Heart Rate</Text>

      <TextInput
        style={styles.input}
        value={heartRate}
        onChangeText={(text) => {
          setHeartRate(text);
          clearMessages();
        }}
        placeholder="e.g. 72"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Sleep Hours</Text>

      <TextInput
        style={styles.input}
        value={sleepHours}
        onChangeText={(text) => {
          setSleepHours(text);
          clearMessages();
        }}
        placeholder="e.g. 7.5"
        placeholderTextColor="#888888"
        keyboardType="decimal-pad"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Water Intake (L)</Text>

      <TextInput
        style={styles.input}
        value={waterIntake}
        onChangeText={(text) => {
          setWaterIntake(text);
          clearMessages();
        }}
        placeholder="e.g. 2.5"
        placeholderTextColor="#888888"
        keyboardType="decimal-pad"
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Calories Burned</Text>

      <TextInput
        style={styles.input}
        value={caloriesBurned}
        onChangeText={(text) => {
          setCaloriesBurned(text);
          clearMessages();
        }}
        placeholder="e.g. 450"
        placeholderTextColor="#888888"
        keyboardType="numeric"
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Submit Health Data
          </Text>
        )}
      </TouchableOpacity>

      {validationMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.validationText}>
            {validationMessage}
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            {successMessage}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearForm}
        disabled={isSubmitting}
      >
        <Text style={styles.clearButtonText}>
          Clear Form
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Health information is submitted to the project
        backend for processing and storage.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#222222',
  },

  submitButton: {
    backgroundColor: '#2E7D6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  messageBox: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#E5A5A5',
  },

  validationText: {
    color: '#B00020',
    fontSize: 14,
    fontWeight: '600',
  },

  errorText: {
    color: '#B00020',
    fontSize: 14,
    fontWeight: '600',
  },

  successBox: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },

  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },

  clearButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2E7D6B',
  },

  clearButtonText: {
    color: '#2E7D6B',
    fontSize: 16,
    fontWeight: '600',
  },

  note: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: '#777777',
    textAlign: 'center',
  },
});