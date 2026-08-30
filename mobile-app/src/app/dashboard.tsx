import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

type DashboardData = {
  message: string;
  summary: {
    total_records: string;
    total_steps: string;
    average_steps: string;
    average_heart_rate: string;
    average_sleep_hours: string;
    total_calories_burned: string;
  };
  latestHealthData: {
    record_date: string;
    steps: number;
    heart_rate: number;
    sleep_hours: string;
    calories_burned: string;
  } | null;
  activeGoals: {
    goal_id: number;
    goal_type: string;
    target_value: string;
    status: string;
  }[];
};

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/dashboard/user/2'
      );

      if (!response.ok) {
        throw new Error('Unable to retrieve dashboard');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text>{error || 'Dashboard data unavailable.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Health Dashboard</Text>
      <Text style={styles.status}>● Connected to Health API</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Steps</Text>
          <Text style={styles.cardValue}>
            {data.summary.total_steps}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Average Steps</Text>
          <Text style={styles.cardValue}>
            {data.summary.average_steps}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Avg Heart Rate</Text>
          <Text style={styles.cardValue}>
            {data.summary.average_heart_rate} bpm
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Avg Sleep</Text>
          <Text style={styles.cardValue}>
            {data.summary.average_sleep_hours} hrs
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Calories Burned</Text>
          <Text style={styles.cardValue}>
            {data.summary.total_calories_burned}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Records</Text>
          <Text style={styles.cardValue}>
            {data.summary.total_records}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Latest Health Data</Text>

      {data.latestHealthData && (
        <View style={styles.largeCard}>
          <Text>
            Date: {data.latestHealthData.record_date?.slice(0, 10)}
          </Text>
          <Text>Steps: {data.latestHealthData.steps}</Text>
          <Text>
            Heart Rate: {data.latestHealthData.heart_rate} bpm
          </Text>
          <Text>
            Sleep: {data.latestHealthData.sleep_hours} hrs
          </Text>
          <Text>
            Calories: {data.latestHealthData.calories_burned}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Active Goals</Text>

      {data.activeGoals.map((goal) => (
        <View key={goal.goal_id} style={styles.largeCard}>
          <Text style={styles.goalTitle}>{goal.goal_type}</Text>
          <Text>Target: {goal.target_value}</Text>
          <Text>Status: {goal.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  status: {
    fontSize: 14,
    marginBottom: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },

  cardLabel: {
    fontSize: 14,
    marginBottom: 6,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },

  largeCard: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
  },

  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
});