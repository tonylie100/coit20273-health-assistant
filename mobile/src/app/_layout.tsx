import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function RootLayout() {
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inLoginScreen = segments[0] === 'login';

      if (!user && !inLoginScreen) {
        router.replace('/login');
      }

      if (user && inLoginScreen) {
        router.replace('/');
      }
    });

    return unsubscribe;
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="chatbot"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="mental-health"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="health-data"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}