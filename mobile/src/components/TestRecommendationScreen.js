import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { generateRecommendations } from '../services/recommendationService';
import { saveToken } from '../services/authStore';

export default function TestRecommendationScreen() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Set a mock token first, then trigger standard payload
  const handleTestNormal = async () => {
    setLoading(true);
    setError(null);
    try {
      await saveToken('mock_valid_jwt_token');
      const payload = {
        user_id: 1,
        step_count: 8500,
        sleep_hours: 7.5,
        heart_rate_avg: 68,
        water_ml: 2200,
      };
      const result = await generateRecommendations(payload);
      setResponse(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger safety override guardrail payload
  const handleTestSafetyOverride = async () => {
    setLoading(true);
    setError(null);
    try {
      await saveToken('mock_valid_jwt_token');
      const payload = {
        user_id: 1,
        step_count: 2000,
        sleep_hours: 4.0,
        heart_rate_avg: 165, // High heart rate triggers safety guardrail
        water_ml: 1000,
      };
      const result = await generateRecommendations(payload);
      setResponse(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Recommendation API Test</Text>

      <View style={styles.buttonGroup}>
        <Button title="Test Normal Flow" onPress={handleTestNormal} />
        <View style={styles.spacer} />
        <Button title="Test Safety Guardrail" color="orange" onPress={handleTestSafetyOverride} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {response && response.status === 'safety_override' && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ SAFETY WARNING OVERRIDE</Text>
          <Text style={styles.cardText}>{response.recommendation?.exercise}</Text>
          <Text style={styles.cardText}>{response.recommendation?.diet}</Text>
        </View>
      )}

      {response && response.success && response.data && (
        <View style={styles.successBox}>
          <Text style={styles.subHeader}>Generated Recommendations ({response.count}):</Text>
          {response.data.map((item, index) => (
            <View key={index} style={styles.recCard}>
              <Text style={styles.recCategory}>{item.category} [{item.priority.toUpperCase()}]</Text>
              <Text style={styles.recTitle}>{item.title}</Text>
              <Text style={styles.recMessage}>{item.message}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  buttonGroup: { marginBottom: 20 },
  spacer: { height: 10 },
  loader: { marginVertical: 20 },
  errorBox: { padding: 15, backgroundColor: '#ffe6e6', borderRadius: 8, marginVertical: 10 },
  errorText: { color: '#d9534f', fontWeight: 'bold' },
  warningCard: { padding: 15, backgroundColor: '#fff3cd', borderColor: '#ffebaba', borderWidth: 1, borderRadius: 8, marginVertical: 10 },
  warningTitle: { color: '#856404', fontWeight: 'bold', marginBottom: 5 },
  successBox: { marginTop: 10 },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  recCard: { padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef' },
  recCategory: { fontSize: 12, color: '#6c757d', fontWeight: 'bold' },
  recTitle: { fontSize: 15, fontWeight: 'bold', marginVertical: 2 },
  recMessage: { fontSize: 14, color: '#333' },
});