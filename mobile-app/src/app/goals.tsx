import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

type Goal = {
  goal_id: number;
  user_id: number;
  goal_type: string;
  target_value: string;
  start_date: string;
  end_date: string;
  status: string;
};

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/goals/user/2'
      );

      if (!response.ok) {
        throw new Error('Unable to retrieve goals');
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load goals.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading goals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Goals</Text>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.goal_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.goalTitle}>{item.goal_type}</Text>

            <Text>Target: {item.target_value}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Start: {item.start_date?.slice(0, 10)}</Text>
            <Text>End: {item.end_date?.slice(0, 10)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#f8f8f8',
  },

  goalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
});