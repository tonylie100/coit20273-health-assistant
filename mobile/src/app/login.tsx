import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';

type Mode = 'signin' | 'signup';

const C = {
  navy: '#062B4B',
  deep: '#0B3D68',
  blue: '#1769AA',
  sky: '#2D9CDB',
  cyan: '#63CEF5',
  page: '#F4F9FD',
  white: '#FFFFFF',
  ink: '#123047',
  muted: '#718899',
  soft: '#EAF5FC',
  border: '#D7E8F2',
  success: '#25A56B',
  danger: '#D95C5C',
};

function validatePassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function firebaseMessage(error: any) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect. Please check your details and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'A network connection is required. Please check your connection.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}

function HeartLogo({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.logoHalo, small && styles.logoHaloSmall]}>
      <View style={[styles.logoRing, small && styles.logoRingSmall]}>
        <View style={[styles.logoCore, small && styles.logoCoreSmall]}>
          <Text style={[styles.logoHeart, small && styles.logoHeartSmall]}>♥</Text>
        </View>
      </View>
      <View style={styles.logoPulseDot} />
    </View>
  );
}

function PulseLine() {
  return (
    <View style={styles.pulse}>
      <View style={styles.pulseFlat} />
      <View style={styles.pulseRise} />
      <View style={styles.pulsePeak} />
      <View style={styles.pulseFall} />
      <View style={styles.pulseFlatRight} />
    </View>
  );
}

function Veins() {
  return (
    <View pointerEvents="none" style={styles.veins}>
      <View style={styles.veinMain} />
      <View style={styles.veinA} />
      <View style={styles.veinB} />
      <View style={styles.veinC} />
      <View style={styles.veinD} />
      <View style={styles.veinDotA} />
      <View style={styles.veinDotB} />
    </View>
  );
}

function StepsIcon() {
  return (
    <View style={styles.stepsIcon}>
      <View style={styles.stepOne} />
      <View style={styles.stepTwo} />
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  password,
  visible,
  onToggle,
  error,
  disabled,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  password?: boolean;
  visible?: boolean;
  onToggle?: () => void;
  error?: boolean;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.inputShell,
          focused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        <View style={[styles.fieldIcon, focused && styles.fieldIconFocused]}>
          <Text style={styles.fieldIconText}>{password ? '♥' : '@'}</Text>
        </View>

        <TextInput
          style={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9AAEBA"
          onChangeText={onChangeText}
          secureTextEntry={password && !visible}
          keyboardType={password ? 'default' : 'email-address'}
          autoComplete={password ? 'password' : 'email'}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          selectionColor={C.blue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {password && onToggle ? (
          <Pressable
            style={styles.showButton}
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <Text style={styles.showText}>{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Requirement({ ok, children }: { ok: boolean; children: string }) {
  return (
    <View style={styles.requirement}>
      <View style={[styles.requirementDot, ok && styles.requirementDotOk]}>
        <Text style={[styles.requirementMark, ok && styles.requirementMarkOk]}>
          {ok ? '✓' : '•'}
        </Text>
      </View>
      <Text style={[styles.requirementText, ok && styles.requirementTextOk]}>
        {children}
      </Text>
    </View>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = mode === 'signin';

  const rules = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const strong = validatePassword(password);
  const match = confirmPassword.length > 0 && password === confirmPassword;

  const changeMode = (next: Mode) => {
    if (loading) return;
    setMode(next);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setTerms(false);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const submit = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    if (!signIn) {
      if (!strong) {
        setError('Please meet all password security requirements.');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }

      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }

      if (!terms) {
        setError('Please acknowledge the wellness and privacy notice.');
        return;
      }
    }

    try {
      setLoading(true);

      if (signIn) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }

      router.replace('/');
    } catch (err: any) {
      setError(firebaseMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <View style={styles.authCard}>
      <View style={styles.cardAccent} />

      <View style={styles.formHeader}>
        <View style={styles.eyebrow}>
          <View style={styles.eyebrowHeart}>
            <Text style={styles.eyebrowHeartText}>♥</Text>
          </View>
          <Text style={styles.eyebrowText}>SECURE WELLNESS ACCESS</Text>
        </View>

        <Text style={styles.formTitle}>
          {signIn ? 'Welcome back' : 'Create your account'}
        </Text>

        <Text style={styles.formSubtitle}>
          {signIn
            ? 'Continue your personal wellness journey with a clearer view of your everyday health.'
            : 'Create your personal wellness space and start building a clearer picture of your everyday health.'}
        </Text>
      </View>

      <View style={styles.modeSwitch}>
        <Pressable
          onPress={() => changeMode('signin')}
          style={[styles.modeButton, signIn && styles.modeButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: signIn }}
        >
          <Text style={[styles.modeText, signIn && styles.modeTextActive]}>
            Sign in
          </Text>
        </Pressable>

        <Pressable
          onPress={() => changeMode('signup')}
          style={[styles.modeButton, !signIn && styles.modeButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: !signIn }}
        >
          <Text style={[styles.modeText, !signIn && styles.modeTextActive]}>
            Create account
          </Text>
        </Pressable>
      </View>

      <Field
        label="Email address"
        value={email}
        placeholder="you@example.com"
        onChangeText={setEmail}
        error={!!error}
        disabled={loading}
      />

      <Field
        label="Password"
        value={password}
        placeholder={signIn ? 'Enter your password' : 'Create a strong password'}
        onChangeText={setPassword}
        password
        visible={showPassword}
        onToggle={() => setShowPassword((v) => !v)}
        error={!!error}
        disabled={loading}
      />

      {!signIn ? (
        <>
          <View style={styles.passwordCard}>
            <View style={styles.passwordHeader}>
              <Text style={styles.passwordTitle}>Password security</Text>
              {strong ? (
                <View style={styles.strongBadge}>
                  <Text style={styles.strongBadgeText}>STRONG</Text>
                </View>
              ) : null}
            </View>

            <Requirement ok={rules.length}>At least 8 characters</Requirement>
            <Requirement ok={rules.upper && rules.lower}>
              Uppercase and lowercase letters
            </Requirement>
            <Requirement ok={rules.number}>At least one number</Requirement>
            <Requirement ok={rules.symbol}>At least one special character</Requirement>
          </View>

          <Field
            label="Confirm password"
            value={confirmPassword}
            placeholder="Enter your password again"
            onChangeText={setConfirmPassword}
            password
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            error={confirmPassword.length > 0 && !match}
            disabled={loading}
          />

          {confirmPassword.length > 0 ? (
            <View style={styles.matchRow}>
              <View style={[styles.matchDot, match ? styles.matchGood : styles.matchBad]} />
              <Text style={[styles.matchText, match ? styles.matchTextGood : styles.matchTextBad]}>
                {match ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => setTerms((v) => !v)}
            style={styles.termsRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: terms }}
          >
            <View style={[styles.checkbox, terms && styles.checkboxChecked]}>
              {terms ? <Text style={styles.checkboxText}>✓</Text> : null}
            </View>

            <Text style={styles.termsText}>
              I understand that AI Health Assistant provides wellness support,
              personalises my experience using account data, and does not
              replace professional medical care.
            </Text>
          </Pressable>
        </>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && !loading && styles.primaryPressed,
          loading && styles.primaryDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={signIn ? 'Sign in' : 'Create account'}
      >
        <View style={styles.primaryContent}>
          <View style={styles.primaryHeart}>
            <Text style={styles.primaryHeartText}>♥</Text>
          </View>

          <Text style={styles.primaryText}>
            {loading
              ? 'Please wait…'
              : signIn
                ? 'Sign in to your account'
                : 'Create my account'}
          </Text>

          {!loading ? <Text style={styles.primaryArrow}>→</Text> : null}
        </View>
      </Pressable>

      <View style={styles.securityRow}>
        <View style={styles.securityBadge}>
          <Text style={styles.securityCheck}>✓</Text>
        </View>

        <View>
          <Text style={styles.securityTitle}>Secure account access</Text>
          <Text style={styles.securityText}>Protected with Firebase Authentication</Text>
        </View>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>WELLNESS AT A GLANCE</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.healthStrip}>
        <View style={styles.healthItem}>
          <View style={styles.healthIcon}>
            <Text style={styles.healthHeart}>♥</Text>
          </View>
          <Text style={styles.healthValue}>HEART</Text>
          <Text style={styles.healthLabel}>signals</Text>
        </View>

        <View style={styles.healthDivider} />

        <View style={styles.healthItem}>
          <View style={styles.healthIcon}>
            <StepsIcon />
          </View>
          <Text style={styles.healthValue}>STEPS</Text>
          <Text style={styles.healthLabel}>activity</Text>
        </View>

        <View style={styles.healthDivider} />

        <View style={styles.healthItem}>
          <View style={styles.healthIcon}>
            <Text style={styles.healthAi}>✦</Text>
          </View>
          <Text style={styles.healthValue}>AI</Text>
          <Text style={styles.healthLabel}>insights</Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        AI Health Assistant supports general wellness awareness and does not
        provide medical diagnosis or replace professional medical advice.
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.pageOrbOne} />
      <View style={styles.pageOrbTwo} />
      <View style={styles.pageRing} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, wide && styles.scrollWide]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {wide ? (
            <View style={styles.desktopShell}>
              <View style={styles.hero}>
                <Veins />

                <View style={styles.heroGlow} />
                <View style={styles.heroGlowSmall} />

                <View style={styles.brandRow}>
                  <HeartLogo small />

                  <View>
                    <Text style={styles.brandName}>AI Health Assistant</Text>
                    <Text style={styles.brandSub}>
                      Personal wellness, intelligently connected
                    </Text>
                  </View>
                </View>

                <View style={styles.heroContent}>
                  <View style={styles.kickerRow}>
                    <View style={styles.kickerDot} />
                    <Text style={styles.kicker}>AI-POWERED WELLNESS</Text>
                  </View>

                  <Text style={styles.heroTitle}>
                    Your health,
                    {'\n'}
                    <Text style={styles.heroAccent}>beautifully connected.</Text>
                  </Text>

                  <PulseLine />

                  <Text style={styles.heroDescription}>
                    Bring your daily health signals, habits and intelligent
                    guidance together in one calm, easy-to-understand wellness
                    experience.
                  </Text>

                  <View style={styles.featureList}>
                    <Feature
                      icon={<Text style={styles.featureSymbol}>♥</Text>}
                      title="Understand your wellness"
                      text="See activity, sleep, hydration and recovery together."
                    />

                    <Feature
                      icon={<StepsIcon />}
                      title="Follow everyday activity"
                      text="Keep movement and wellness goals visible at a glance."
                    />

                    <Feature
                      icon={<Text style={styles.featureSymbol}>✦</Text>}
                      title="Personal AI guidance"
                      text="Ask questions using your latest wellness context."
                    />
                  </View>
                </View>

                <View style={styles.heroFooter}>
                  <View style={styles.footerPulse}>
                    <View style={styles.footerPulseDot} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.footerTitle}>Wellness, not diagnosis</Text>
                    <Text style={styles.footerText}>
                      Designed for everyday health awareness.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.formPanel}>{form}</View>
            </View>
          ) : (
            <View style={styles.mobile}>
              <View style={styles.mobileBrand}>
                <HeartLogo small />

                <View style={{ flex: 1 }}>
                  <Text style={styles.mobileBrandName}>AI Health Assistant</Text>
                  <Text style={styles.mobileBrandSub}>
                    Your personal wellness companion
                  </Text>
                </View>
              </View>

              <View style={styles.mobileHero}>
                <Veins />

                <View style={styles.mobileKicker}>
                  <View style={styles.kickerDot} />
                  <Text style={styles.mobileKickerText}>AI-POWERED WELLNESS</Text>
                </View>

                <Text style={styles.mobileHeroTitle}>
                  Your health,
                  {'\n'}
                  beautifully connected.
                </Text>

                <PulseLine />

                <Text style={styles.mobileHeroText}>
                  Wellness signals, personal insights and supportive AI guidance
                  in one calm space.
                </Text>

                <View style={styles.mobileHealthRow}>
                  <Text style={styles.mobileHealthItem}>♥ Heart</Text>
                  <Text style={styles.mobileHealthItem}>• Steps</Text>
                  <Text style={styles.mobileHealthItem}>✦ AI</Text>
                </View>
              </View>

              {form}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.page,
    overflow: 'hidden',
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  scrollWide: {
    paddingHorizontal: 36,
    paddingVertical: 34,
  },

  pageOrbOne: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: '#DDEFFA',
    top: -240,
    right: -130,
    opacity: 0.75,
  },

  pageOrbTwo: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#E7F4FB',
    bottom: -190,
    left: -140,
  },

  pageRing: {
    position: 'absolute',
    width: 570,
    height: 570,
    borderRadius: 285,
    borderWidth: 1,
    borderColor: '#D8EAF4',
    top: '20%',
    left: '34%',
    opacity: 0.65,
  },

  desktopShell: {
    width: '100%',
    maxWidth: 1160,
    minHeight: 720,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#D8E8F1',

    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.18,
    shadowRadius: 52,
    elevation: 14,
  },

  hero: {
    flex: 1.12,
    minHeight: 720,
    paddingHorizontal: 54,
    paddingVertical: 48,
    backgroundColor: C.navy,
    position: 'relative',
    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    right: -230,
    top: 35,
    backgroundColor: C.blue,
    opacity: 0.26,
  },

  heroGlowSmall: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    left: -120,
    bottom: -40,
    backgroundColor: C.sky,
    opacity: 0.11,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    zIndex: 2,
  },

  brandName: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  brandSub: {
    color: '#A7CDE3',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },

  heroContent: {
    marginTop: 72,
    maxWidth: 510,
    zIndex: 2,
  },

  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  kickerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.cyan,
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 9,
  },

  kicker: {
    color: '#8FD7F5',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: C.white,
    fontSize: 46,
    lineHeight: 53,
    fontWeight: '800',
    letterSpacing: -1.8,
    marginTop: 17,
  },

  heroAccent: {
    color: '#6CCCF4',
  },

  pulse: {
    width: 178,
    height: 28,
    marginTop: 17,
    position: 'relative',
  },

  pulseFlat: {
    position: 'absolute',
    left: 0,
    top: 14,
    width: 44,
    height: 2,
    backgroundColor: C.cyan,
  },

  pulseRise: {
    position: 'absolute',
    left: 40,
    top: 10,
    width: 23,
    height: 2,
    backgroundColor: C.cyan,
    transform: [{ rotate: '-18deg' }],
  },

  pulsePeak: {
    position: 'absolute',
    left: 55,
    top: 7,
    width: 40,
    height: 2,
    backgroundColor: C.cyan,
    transform: [{ rotate: '-62deg' }],
  },

  pulseFall: {
    position: 'absolute',
    left: 86,
    top: 13,
    width: 32,
    height: 2,
    backgroundColor: C.cyan,
    transform: [{ rotate: '30deg' }],
  },

  pulseFlatRight: {
    position: 'absolute',
    right: 0,
    top: 14,
    width: 66,
    height: 2,
    backgroundColor: C.cyan,
  },

  heroDescription: {
    color: '#BCD9E8',
    fontSize: 14,
    lineHeight: 23,
    maxWidth: 455,
    marginTop: 17,
  },

  featureList: {
    marginTop: 34,
    gap: 18,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },

  featureIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: 'rgba(45,156,219,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(99,206,245,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureSymbol: {
    color: '#80D8F7',
    fontSize: 14,
    fontWeight: '900',
  },

  featureCopy: {
    flex: 1,
  },

  featureTitle: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },

  featureText: {
    color: '#9FC3D7',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
    maxWidth: 410,
  },

  heroFooter: {
    position: 'absolute',
    left: 54,
    right: 54,
    bottom: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },

  footerPulse: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,206,245,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.cyan,
  },

  footerTitle: {
    color: C.white,
    fontSize: 10,
    fontWeight: '800',
  },

  footerText: {
    color: '#9FC3D7',
    fontSize: 9,
    marginTop: 2,
  },

  logoHalo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  logoHaloSmall: {
    width: 50,
    height: 50,
    borderRadius: 17,
  },

  logoRing: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: 'rgba(45,156,219,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoRingSmall: {
    width: 39,
    height: 39,
    borderRadius: 13,
  },

  logoCore: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: C.sky,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 5,
  },

  logoCoreSmall: {
    width: 31,
    height: 31,
    borderRadius: 11,
  },

  logoHeart: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
  },

  logoHeartSmall: {
    fontSize: 15,
  },

  logoPulseDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.cyan,
    top: -2,
    right: 5,
    borderWidth: 2,
    borderColor: C.navy,
  },

  veins: {
    position: 'absolute',
    width: 270,
    height: 310,
    right: -42,
    bottom: 5,
    opacity: 0.08,
  },

  veinMain: {
    position: 'absolute',
    width: 3,
    height: 260,
    right: 98,
    bottom: -5,
    backgroundColor: C.cyan,
    borderRadius: 4,
    transform: [{ rotate: '17deg' }],
  },

  veinA: {
    position: 'absolute',
    width: 92,
    height: 2,
    right: 81,
    bottom: 91,
    backgroundColor: C.cyan,
    transform: [{ rotate: '41deg' }],
  },

  veinB: {
    position: 'absolute',
    width: 82,
    height: 2,
    right: 29,
    bottom: 139,
    backgroundColor: C.cyan,
    transform: [{ rotate: '-34deg' }],
  },

  veinC: {
    position: 'absolute',
    width: 69,
    height: 2,
    right: 104,
    bottom: 180,
    backgroundColor: C.cyan,
    transform: [{ rotate: '40deg' }],
  },

  veinD: {
    position: 'absolute',
    width: 62,
    height: 2,
    right: 59,
    bottom: 218,
    backgroundColor: C.cyan,
    transform: [{ rotate: '-41deg' }],
  },

  veinDotA: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    right: 158,
    bottom: 121,
    backgroundColor: C.cyan,
  },

  veinDotB: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    right: 20,
    bottom: 164,
    backgroundColor: C.cyan,
  },

  formPanel: {
    width: 510,
    backgroundColor: '#FBFDFE',
    paddingHorizontal: 55,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  authCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  cardAccent: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.sky,
    marginBottom: 19,
    shadowColor: C.sky,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
  },

  formHeader: {
    marginBottom: 22,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },

  eyebrowHeart: {
    width: 21,
    height: 21,
    borderRadius: 7,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eyebrowHeartText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '900',
  },

  eyebrowText: {
    color: C.blue,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.35,
  },

  formTitle: {
    color: C.ink,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '800',
    letterSpacing: -0.9,
  },

  formSubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  modeSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#EDF5FA',
    borderWidth: 1,
    borderColor: '#E0EDF5',
    marginBottom: 23,
  },

  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeButtonActive: {
    backgroundColor: C.white,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 2,
  },

  modeText: {
    color: '#7890A0',
    fontSize: 11,
    fontWeight: '700',
  },

  modeTextActive: {
    color: C.deep,
    fontWeight: '900',
  },

  field: {
    marginBottom: 15,
  },

  fieldLabel: {
    color: C.ink,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 7,
  },

  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 1,
  },

  inputFocused: {
    borderColor: C.sky,
    shadowColor: C.sky,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 13,
    elevation: 3,
  },

  inputError: {
    borderColor: '#E38B8B',
  },

  inputDisabled: {
    opacity: 0.6,
  },

  fieldIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  fieldIconFocused: {
    backgroundColor: '#DCEFFB',
  },

  fieldIconText: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '900',
  },

  input: {
    flex: 1,
    minHeight: 52,
    color: C.ink,
    fontSize: 13,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },

  showButton: {
    minWidth: 47,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  showText: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '900',
  },

  passwordCard: {
    backgroundColor: '#F1F8FC',
    borderWidth: 1,
    borderColor: '#DCECF5',
    borderRadius: 14,
    padding: 13,
    marginTop: -3,
    marginBottom: 15,
  },

  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  passwordTitle: {
    color: C.ink,
    fontSize: 10,
    fontWeight: '800',
  },

  strongBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#E3F7ED',
  },

  strongBadgeText: {
    color: C.success,
    fontSize: 8,
    fontWeight: '900',
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  requirementDot: {
    width: 16,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#E5EDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  requirementDotOk: {
    backgroundColor: '#DDF4E8',
  },

  requirementMark: {
    color: '#8CA0AD',
    fontSize: 9,
    fontWeight: '900',
  },

  requirementMarkOk: {
    color: C.success,
  },

  requirementText: {
    color: '#7C909D',
    fontSize: 9,
    fontWeight: '600',
  },

  requirementTextOk: {
    color: '#4F7667',
  },

  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
    marginBottom: 14,
  },

  matchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  matchGood: {
    backgroundColor: C.success,
  },

  matchBad: {
    backgroundColor: C.danger,
  },

  matchText: {
    fontSize: 9,
    fontWeight: '700',
  },

  matchTextGood: {
    color: C.success,
  },

  matchTextBad: {
    color: C.danger,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginBottom: 15,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B8CCD8',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },

  checkboxText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
  },

  termsText: {
    flex: 1,
    color: C.muted,
    fontSize: 9,
    lineHeight: 14,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#F1D3D3',
    marginBottom: 14,
  },

  errorIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIconText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '900',
  },

  errorText: {
    flex: 1,
    color: '#8B4747',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '600',
  },

  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: C.blue,
    justifyContent: 'center',
    shadowColor: C.deep,
    shadowOffset: { width: 0, height: 11 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },

  primaryPressed: {
    backgroundColor: C.deep,
    transform: [{ scale: 0.99 }],
  },

  primaryDisabled: {
    opacity: 0.65,
  },

  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  primaryHeart: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  primaryHeartText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
  },

  primaryText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },

  primaryArrow: {
    color: C.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 9,
    marginTop: -2,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },

  securityBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityCheck: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '900',
  },

  securityTitle: {
    color: '#607A89',
    fontSize: 9,
    fontWeight: '800',
  },

  securityText: {
    color: '#9AAAB4',
    fontSize: 8,
    marginTop: 1,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 22,
    marginBottom: 13,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1ECF2',
  },

  dividerText: {
    color: '#96A8B2',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  healthStrip: {
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0ECF3',
    backgroundColor: '#F7FBFD',
    flexDirection: 'row',
    alignItems: 'center',
  },

  healthItem: {
    flex: 1,
    alignItems: 'center',
  },

  healthIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  healthHeart: {
    color: C.blue,
    fontSize: 11,
    fontWeight: '900',
  },

  healthAi: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '900',
  },

  healthValue: {
    color: C.deep,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  healthLabel: {
    color: '#93A5B0',
    fontSize: 7,
    marginTop: 2,
  },

  healthDivider: {
    width: 1,
    height: 37,
    backgroundColor: '#DFEAF0',
  },

  stepsIcon: {
    width: 16,
    height: 17,
    position: 'relative',
  },

  stepOne: {
    position: 'absolute',
    width: 7,
    height: 11,
    borderRadius: 5,
    backgroundColor: C.blue,
    left: 1,
    top: 0,
    transform: [{ rotate: '-18deg' }],
  },

  stepTwo: {
    position: 'absolute',
    width: 7,
    height: 11,
    borderRadius: 5,
    backgroundColor: C.blue,
    right: 1,
    bottom: 0,
    transform: [{ rotate: '-18deg' }],
  },

  disclaimer: {
    color: '#94A5AF',
    fontSize: 8,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 14,
  },

  mobile: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 3,
    marginBottom: 16,
  },

  mobileBrandName: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '800',
  },

  mobileBrandSub: {
    color: C.muted,
    fontSize: 9,
    marginTop: 2,
  },

  mobileHero: {
    minHeight: 220,
    backgroundColor: C.navy,
    borderRadius: 25,
    paddingHorizontal: 23,
    paddingVertical: 23,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',

    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.22,
    shadowRadius: 21,
    elevation: 7,
  },

  mobileKicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  mobileKickerText: {
    color: '#8FD7F5',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  mobileHeroTitle: {
    color: C.white,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 12,
  },

  mobileHeroText: {
    color: '#B9D6E6',
    fontSize: 10,
    lineHeight: 16,
    maxWidth: 350,
    marginTop: 4,
  },

  mobileHealthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    marginTop: 14,
  },

  mobileHealthItem: {
    color: '#8CCFEF',
    fontSize: 9,
    fontWeight: '800',
  },
});
