import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';

const FIREBASE_UID = 'yA8npMpLINQgXD1cgp8N5yN7LZ33';

type Profile = {
  user_id: number;
  firebase_uid: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
};

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `http://localhost:3000/api/profile/${FIREBASE_UID}`
      );

      if (!response.ok) {
        throw new Error('Unable to retrieve profile');
      }

      const data = await response.json();

      setProfile(data.profile ?? data);
    } catch (err) {
      console.error(err);
      setError('Unable to load profile from the server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error || 'Profile not found.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Personal Health Assistant</Text>

      <Text style={styles.subtitle}>User Profile</Text>

      <Text style={styles.status}>
        ● Connected to Health API
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={profile.full_name ?? ''}
        editable={false}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={profile.email ?? ''}
        editable={false}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={
          profile.age != null
            ? String(profile.age)
            : ''
        }
        editable={false}
      />

      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        value={profile.gender ?? ''}
        editable={false}
      />

      <Text style={styles.label}>Height</Text>
      <TextInput
        style={styles.input}
        value={
          profile.height != null
            ? `${profile.height} cm`
            : ''
        }
        editable={false}
      />

      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        value={
          profile.weight != null
            ? `${profile.weight} kg`
            : ''
        }
        editable={false}
      />

      {/* Navigation */}
      <View style={styles.navigation}>
        <Link
          href="/goals"
          style={styles.linkButton}
        >
          View Health Goals
        </Link>

        <Link
          href="/dashboard"
          style={styles.linkButton}
        >
          View Dashboard
        </Link>
      </View>
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
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },

  status: {
    fontSize: 14,
    marginBottom: 20,
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
    backgroundColor: '#f7f7f7',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },

  navigation: {
    marginTop: 30,
    gap: 12,
  },

  linkButton: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
});