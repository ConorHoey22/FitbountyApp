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
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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

  const handleRegister = async () => {
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
            },
          ]);

        if (profileError) {
          console.error('Profile insert error:', profileError.message);
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
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

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW ACCOUNT</Text>
          </View>
          <Text style={styles.title}>Create{'\n'}Account</Text>
          <Text style={styles.subtitle}>
            Start your fitness journey today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#4a4a5a"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                focusedField === 'email' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              placeholder="Min. 8 characters"
              placeholderTextColor="#4a4a5a"
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
                focusedField === 'password' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              placeholder="Repeat your password"
              placeholderTextColor="#4a4a5a"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[
                styles.input,
                focusedField === 'confirm' && styles.inputFocused,
                confirmPassword.length > 0 && password !== confirmPassword
                  ? styles.inputError
                  : null,
              ]}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
            />
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const ACCENT = '#C6F135';       // electric lime
const BG = '#0E0E12';           // near-black
const SURFACE = '#18181F';      // card surface
const BORDER = '#2a2a35';       // default border
const BORDER_FOCUS = '#C6F135'; // focused border
const BORDER_ERROR = '#FF4D6D'; // error border

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

  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },

  // Header
  header: {
    marginBottom: 40,
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
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B80',
    letterSpacing: 0.2,
  },

  // Form
  form: {
    gap: 4,
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    color: '#5a5a6e',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1.5,
    borderColor: BORDER,
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  inputFocused: {
    borderColor: BORDER_FOCUS,
    backgroundColor: '#1c1c24',
  },
  inputError: {
    borderColor: BORDER_ERROR,
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
    marginTop: 36,
  },
  footerText: {
    color: '#5a5a6e',
    fontSize: 14,
  },
  footerLink: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
});