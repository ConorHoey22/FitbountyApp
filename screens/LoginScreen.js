import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Animated,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;


  const images = [require('../lib/assets/FBLogo.png')];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted && data?.session) {
          navigation.reset({ index: 0, routes: [{ name: 'AppTabs' }] });
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    bootstrap();
    return () => { isMounted = false; };
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleBtn, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const profile = await getProfile(data.user.id);
      navigation.reset({
        index: 0,
        routes: [{ name: profile ? 'AppTabs' : 'CreateUserPlan' }],
      });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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

      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BETA</Text>
            </View>
           
            <Image
              source={require('../lib/assets/FBLogo.png')}
              style={styles.image}
            />

            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={[
                styles.inputContainer,
                emailFocused && styles.inputFocused,
                error && styles.inputError,
              ]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={emailFocused ? ACCENT : '#4a4a5a'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#4a4a5a"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[
                styles.inputContainer,
                passwordFocused && styles.inputFocused,
                error && styles.inputError,
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? ACCENT : '#4a4a5a'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#4a4a5a"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#4a4a5a"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#FF4D6D" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: scaleBtn }] }}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonLoading]}
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={1}
              >
                {loading ? (
                  <ActivityIndicator color="#0E0E12" size="small" />
                ) : (
                  <Text style={styles.buttonText}>SIGN IN →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.subtitle}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              {[
                { icon: 'logo-google', label: 'G' },
                { icon: 'logo-apple', label: 'A' },
              ].map(({ icon, label }) => (
                <TouchableOpacity key={icon} style={styles.socialButton} activeOpacity={0.75}>
                  <Ionicons name={icon} size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ACCENT = '#C6F135';
const BG = '#0E0E12';
const SURFACE = '#18181F';
const BORDER = '#2a2a35';
const BORDER_FOCUS = '#C6F135';
const BORDER_ERROR = '#FF4D6D';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    marginBottom: 36,
    marginTop: 10,
  },
  
  image: {
    width: 320,
    height: 220,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 18,
  },
  
  subtitle: {
    fontSize: 15,
    color: '#ffffff',
    letterSpacing: 0.2,
    // marginTop: 10,
  },
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
    paddingVertical: 48,
  },
  container: {
    paddingHorizontal: 28,
  },

  // Header
  header: {
    marginBottom: 36,
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
    fontSize: 12,
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
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  eyeIcon: {
    paddingLeft: 10,
  },

  // Forgot
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    color: ACCENT,
    // fontSize: 13,
    // fontWeight: '600',
    fontSize: 1,
    color: '#ffffff',
    letterSpacing: 0.2,
    fontWeight: '600',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BORDER_ERROR + '18',
    borderLeftWidth: 3,
    borderLeftColor: BORDER_ERROR,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: BORDER_ERROR,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // Button
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
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

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    color: '#ffffff',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#0E0E12',
    borderWidth: 1.5,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
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