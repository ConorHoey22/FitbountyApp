import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleBtn, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleBtn, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const validatePassword = (pw) => {
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (!/\d/.test(pw)) return 'Password must include a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return 'Password must include a special character (e.g. !)';
    return '';
  };

  const handleRegister = async () => {
    const pwError = validatePassword(password);
    if (pwError) {
      setPasswordError(pwError);
      return;
    }
    setPasswordError('');

    if (password !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { shouldCreateSession: false },
      });

      if (error) throw error;

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('userProfiles')
          .insert([
            {
              id: data.user.id,
              first_name: '',
              goal: '',
              unitMeasurement: '',
              startingWeight: null,
              currentWeight: null,
              workoutSessionsGoal: null,
              stepGoal: null,
              cardioGoal: null,
              created_at: new Date().toISOString(),
              totalXP: 0,
              userLevel: 0,
              calories: null,
              protein: null,
              carbohydrates: null,
              fats: null,
              UserHasEnteredTheirProfileDataTrigger: false,
              UserHasWeeklyPlanSetup: false,
              UserHasMacros: false,
              isCardioRewarded : false, 
              isWorkoutsRewarded : false, 
              isDailyStepsRewarded : false,
              workoutXPAmount : 0,
              cardioXPAmount: 0,
              stepsXPAmount: 0,
              nutritionXPAmount: 0,
              weeklyFitBKey: 0,
              weeklyCardioCount: 0,
              weeklyWorkoutCount: 0,
              dailyStepCount: 0,
              isCardioRewarded: 0,
              weeklyStepCount: 0,
            },
          ]);

        if (profileError) {
          console.error('Profile insert error:', profileError.message);
        }
      }
    } catch (err) {
      const msg = err.message?.toLowerCase().includes('password')
        ? 'Password must include a number and a special character.'
        : err.message;
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      {/* Background accent blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../lib/assets/FBLogo.png')}
              style={styles.image}
            />
          </View>

          <View style={styles.titleWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NEW ACCOUNT</Text>
            </View>
            {/* <Text style={styles.title}>Create{'\n'}Account</Text> */}
            <Text style={styles.title}>
              Start your fitness journey today
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>EMAIL</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'email' && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={focusedField === 'email' ? ACCENT : '#4a4a5a'}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={PLACEHOLDER}
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { flex: 1 }]}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputFocused,
                  passwordError && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === 'password' ? ACCENT : '#4a4a5a'}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={PLACEHOLDER}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                  style={[styles.input, { flex: 1 }]}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={PLACEHOLDER}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'confirm' && styles.inputFocused,
                  confirmPassword.length > 0 && password !== confirmPassword
                    ? styles.inputError
                    : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={focusedField === 'confirm' ? ACCENT : '#4a4a5a'}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor={PLACEHOLDER}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { flex: 1 }]}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={PLACEHOLDER}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            <Animated.View style={{ transform: [{ scale: scaleBtn }], marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonLoading]}
                onPress={handleRegister}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={1}
              >
                {loading ? (
                  <Text style={styles.buttonText}>CREATING ACCOUNT…</Text>
                ) : (
                  <Text style={styles.buttonText}>GET STARTED →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = '#C6F135';       // electric lime
const BG = '#0E0E12';           // near-black
const SURFACE = '#18181F';      // card surface
const BORDER = '#2a2a35';       // default border
const BORDER_FOCUS = '#C6F135'; // focused border
const BORDER_ERROR = '#FF4D6D'; // error border
const PLACEHOLDER = '#EDEDED';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // Background decorative blobs
  blobTopRight: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: ACCENT,
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#5B4FE8',
    opacity: 0.07,
    bottom: 60,
    left: -80,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    paddingHorizontal: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: -SCREEN_WIDTH * 0.30,
    marginTop: -120,
  },
  image: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  titleWrapper: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT + '22',
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    // lineHeight: 50,

    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E12',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: BORDER_FOCUS,
    backgroundColor: '#13131a',
  },
  inputError: {
    borderColor: BORDER_ERROR,
  },
  inputIcon: {
    color: PLACEHOLDER,
    marginRight: 10,
  },
  input: {
    paddingVertical: 15,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  errorText: {
    color: BORDER_ERROR,
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // Button
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0E0E12',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  footerLink: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
});