import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | null
  >(null);
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [errorMessage, setErrorMessage] = useState('');

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validatePassword = (value: string) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    );
  };

  const validateFields = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter your email and password.');
      return false;
    }

    if (!trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    /*
     * Password complexity is intentionally checked only when
     * creating a new account.
     *
     * Existing Firebase users can still sign in using their
     * existing password.
     */
    if (mode === 'create' && !validatePassword(password)) {
      setErrorMessage(
        'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    clearError();

    if (!validateFields()) {
      return;
    }

    try {
      setLoading(true);

      const trimmedEmail = email.trim();

      if (mode === 'signin') {
        await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
      } else {
        await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password
        );
      }

      router.replace('/');
    } catch (error: any) {
      const firebaseCode = error?.code;

      if (
        firebaseCode === 'auth/invalid-credential' ||
        firebaseCode === 'auth/wrong-password' ||
        firebaseCode === 'auth/user-not-found'
      ) {
        setErrorMessage(
          'The email or password is incorrect. Please try again.'
        );
      } else if (firebaseCode === 'auth/email-already-in-use') {
        setErrorMessage(
          'An account with this email already exists. Try signing in instead.'
        );
      } else if (firebaseCode === 'auth/weak-password') {
        setErrorMessage(
          'Please choose a stronger password with at least 8 characters, including uppercase, lowercase, number, and special character.'
        );
      } else if (firebaseCode === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else if (firebaseCode === 'auth/network-request-failed') {
        setErrorMessage(
          'Network connection failed. Please check your connection and try again.'
        );
      } else {
        setErrorMessage(
          error?.message || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: 'signin' | 'create') => {
    if (loading) {
      return;
    }

    setMode(nextMode);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundGlowOne} />
        <View style={styles.backgroundGlowTwo} />

        <View style={styles.content}>
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.brandIcon}>
              <View style={styles.brandPulse} />
              <Text style={styles.brandIconText}>♥</Text>
            </View>

            <Text style={styles.brandName}>AI Health Assistant</Text>

            <Text style={styles.brandTagline}>
              Your personal wellness companion
            </Text>
          </View>

          {/* Product value */}
          <View style={styles.valueCard}>
            <View style={styles.valueIcon}>
              <Text style={styles.valueIconText}>✦</Text>
            </View>

            <View style={styles.valueCopy}>
              <Text style={styles.valueTitle}>
                Understand your health at a glance
              </Text>

              <Text style={styles.valueDescription}>
                Track wellness signals, understand trends, and get
                personalised guidance in one place.
              </Text>
            </View>
          </View>

          {/* Authentication card */}
          <View style={styles.authCard}>
            <Text style={styles.heading}>
              {mode === 'signin'
                ? 'Welcome back'
                : 'Create your account'}
            </Text>

            <Text style={styles.subheading}>
              {mode === 'signin'
                ? 'Sign in to continue your wellness journey.'
                : 'Set up your account to start your wellness journey.'}
            </Text>

            {/* Mode switch */}
            <View style={styles.modeSwitcher}>
              <Pressable
                onPress={() => switchMode('signin')}
                style={[
                  styles.modeButton,
                  mode === 'signin' && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'signin' &&
                      styles.modeButtonTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchMode('create')}
                style={[
                  styles.modeButton,
                  mode === 'create' && styles.modeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'create' &&
                      styles.modeButtonTextActive,
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>

              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' &&
                    styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Text style={styles.inputIconText}>@</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#98A7A2"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearError();
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                  returnKeyType="next"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>

                {mode === 'create' && (
                  <Text style={styles.passwordHint}>
                    8+ chars • A-Z • a-z • 0-9 • symbol
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' &&
                    styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <Text style={styles.lockIcon}>⌑</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#98A7A2"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearError();
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  textContentType="password"
                />

                <Pressable
                  style={styles.visibilityButton}
                  onPress={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  hitSlop={8}
                >
                  <Text style={styles.visibilityText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Password requirements */}
            {mode === 'create' && password.length > 0 && (
              <View style={styles.passwordRequirements}>
                <PasswordRequirement
                  label="8 or more characters"
                  valid={password.length >= 8}
                />

                <PasswordRequirement
                  label="Uppercase letter"
                  valid={/[A-Z]/.test(password)}
                />

                <PasswordRequirement
                  label="Lowercase letter"
                  valid={/[a-z]/.test(password)}
                />

                <PasswordRequirement
                  label="Number"
                  valid={/\d/.test(password)}
                />

                <PasswordRequirement
                  label="Special character"
                  valid={/[^A-Za-z0-9]/.test(password)}
                />
              </View>
            )}

            {/* Error */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>!</Text>
                </View>

                <Text style={styles.errorText}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Submit */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed &&
                  !loading &&
                  styles.primaryButtonPressed,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.primaryButtonText}>
                    {mode === 'signin'
                      ? 'Signing in...'
                      : 'Creating account...'}
                  </Text>
                </>
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
                </Text>
              )}
            </Pressable>

            {/* Supporting text */}
            <View style={styles.secureRow}>
              <View style={styles.secureDot} />

              <Text style={styles.secureText}>
                Your account is protected with Firebase
                authentication.
              </Text>
            </View>
          </View>

          {/* Product features */}
          <View style={styles.featureRow}>
            <FeatureItem
              icon="♥"
              title="Wellness"
              description="Daily insights"
            />

            <View style={styles.featureDivider} />

            <FeatureItem
              icon="◷"
              title="Live"
              description="Health signals"
            />

            <View style={styles.featureDivider} />

            <FeatureItem
              icon="✦"
              title="AI"
              description="Personal guidance"
            />
          </View>

          <Text style={styles.footerText}>
            AI Health Assistant provides wellness support and does
            not replace professional medical advice.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordRequirement({
  label,
  valid,
}: {
  label: string;
  valid: boolean;
}) {
  return (
    <View style={styles.requirement}>
      <View
        style={[
          styles.requirementIndicator,
          valid && styles.requirementIndicatorValid,
        ]}
      >
        <Text
          style={[
            styles.requirementIndicatorText,
            valid && styles.requirementIndicatorTextValid,
          ]}
        >
          {valid ? '✓' : '•'}
        </Text>
      </View>

      <Text
        style={[
          styles.requirementText,
          valid && styles.requirementTextValid,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>

      <Text style={styles.featureTitle}>{title}</Text>

      <Text style={styles.featureDescription}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F8F6',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },

  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    position: 'relative',
  },

  backgroundGlowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#DCEFE8',
    opacity: 0.65,
    top: -90,
    right: -100,
  },

  backgroundGlowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E7F3EF',
    opacity: 0.8,
    bottom: 100,
    left: -110,
  },

  brandSection: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 24,
  },

  brandIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#247A68',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#1D6B5B',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
    position: 'relative',
  },

  brandPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    opacity: 0.2,
  },

  brandIconText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
  },

  brandName: {
    color: '#173A33',
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  brandTagline: {
    color: '#6B7E78',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },

  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4EF',
    borderWidth: 1,
    borderColor: '#D5E9E1',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },

  valueIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  valueIconText: {
    color: '#247A68',
    fontSize: 21,
    fontWeight: '800',
  },

  valueCopy: {
    flex: 1,
  },

  valueTitle: {
    color: '#23463E',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },

  valueDescription: {
    color: '#668078',
    fontSize: 12,
    lineHeight: 18,
  },

  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E3ECE9',
    shadowColor: '#183E35',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
  },

  heading: {
    color: '#183A33',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  subheading: {
    color: '#71817D',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },

  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F2F6F4',
    borderRadius: 13,
    padding: 4,
    marginBottom: 22,
  },

  modeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  modeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#173D34',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  modeButtonText: {
    color: '#71817D',
    fontSize: 13,
    fontWeight: '700',
  },

  modeButtonTextActive: {
    color: '#247A68',
  },

  fieldGroup: {
    marginBottom: 17,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  label: {
    color: '#314E47',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  passwordHint: {
    color: '#8A9995',
    fontSize: 9.5,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  inputWrapper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBFA',
    borderWidth: 1,
    borderColor: '#DCE6E2',
    borderRadius: 14,
    paddingHorizontal: 13,
  },

  inputWrapperFocused: {
    borderColor: '#4B9B88',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2E7D6B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  inputIcon: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },

  inputIconText: {
    color: '#5B8E82',
    fontSize: 18,
    fontWeight: '800',
  },

  lockIcon: {
    color: '#5B8E82',
    fontSize: 20,
    fontWeight: '700',
  },

  input: {
    flex: 1,
    minHeight: 52,
    color: '#203E37',
    fontSize: 15,
    paddingVertical: 0,
  },

  visibilityButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  visibilityText: {
    color: '#247A68',
    fontSize: 12,
    fontWeight: '800',
  },

  passwordRequirements: {
    backgroundColor: '#F6FAF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2ECE8',
    padding: 11,
    marginTop: -4,
    marginBottom: 15,
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },

  requirementIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E7ECEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  requirementIndicatorValid: {
    backgroundColor: '#D8EEE6',
  },

  requirementIndicatorText: {
    color: '#889691',
    fontSize: 11,
    fontWeight: '800',
  },

  requirementIndicatorTextValid: {
    color: '#247A68',
  },

  requirementText: {
    color: '#7D8B87',
    fontSize: 11,
  },

  requirementTextValid: {
    color: '#3D7668',
    fontWeight: '600',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F2',
    borderWidth: 1,
    borderColor: '#F2D3CE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  errorIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#C95C4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  errorIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  errorText: {
    flex: 1,
    color: '#8E4137',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#247A68',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 2,
    shadowColor: '#1E6657',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  primaryButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },

  primaryButtonDisabled: {
    opacity: 0.72,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 8,
  },

  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#57A38F',
    marginRight: 7,
  },

  secureText: {
    color: '#7C8D88',
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECE9',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },

  featureItem: {
    flex: 1,
    alignItems: 'center',
  },

  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#EDF6F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  featureIconText: {
    color: '#2E7D6B',
    fontSize: 15,
    fontWeight: '800',
  },

  featureTitle: {
    color: '#36564E',
    fontSize: 11,
    fontWeight: '800',
  },

  featureDescription: {
    color: '#899791',
    fontSize: 9.5,
    marginTop: 2,
    textAlign: 'center',
  },

  featureDivider: {
    width: 1,
    backgroundColor: '#E7EEEB',
    marginVertical: 3,
  },

  footerText: {
    color: '#8A9894',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 18,
  },
});