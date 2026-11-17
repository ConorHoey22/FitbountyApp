
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
  Image,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { Ionicons } from '@expo/vector-icons';
import AuthBackground from '../components/AuthBackground';
import { APP_BG_GRADIENT } from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import { font } from '../utils/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

      {/* Background */}
      <AuthBackground colors={BG_GRADIENT} />

      {/* Top bar: badge + sign up link */}
      <View style={styles.topBar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BETA</Text>
        </View>
    
      </View>

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
            <Image
              source={require('../lib/assets/FBLogo.png')}
              style={styles.image}
            />
          </View>

          {/* Form Card */}
          <GlassCard style={styles.card} gradient={CARD_GRADIENT}>
            {/* Email */}
          
 
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>

        </TouchableOpacity>
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
                  color={emailFocused ? ACCENT : WHITE}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={PLACEHOLDER}
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
                  color={passwordFocused ? ACCENT : WHITE}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={PLACEHOLDER}
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
                    color={WHITE}
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
                  <ActivityIndicator color={ON_ACCENT} size="small" />
                ) : (
                  <Text style={styles.buttonText}>SIGN IN →</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.topBarLink} onPress={() => navigation.navigate('Register')}>
                Don't have an account? <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>Register here!</Text>
              </Text>
              <View style={styles.dividerLine} />
            </View>

        
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Palette — black + glass card + soft lime (matches Home) ─────
const BG_GRADIENT = APP_BG_GRADIENT; // shared — components/ScreenBackground.js
const CARD_GRADIENT = ['rgba(139,92,246,0.20)', 'rgba(37,99,235,0.06)', 'rgba(37,99,235,0)']; // purple → blue → clear (same as Home cards)
const TEXT = '#FFFFFF';                      // headings / labels / input text
const WHITE = '#FFFFFF';
const MUTED = '#9A9A9E';                     // secondary text / icons
const PLACEHOLDER = '#FFFFFF';              // placeholder text — white
const INPUT_BG = 'rgba(255,255,255,0.06)';   // translucent input fill
const INPUT_BORDER = 'rgba(255,255,255,0.10)';
const INPUT_FOCUS_BG = 'rgba(255,255,255,0.09)';
const DIVIDER = 'rgba(255,255,255,0.10)';
const ACCENT = '#E4F15F';                    // soft lime — main button, focus, links
const ON_ACCENT = '#1A1A1C';                 // text on lime
const BORDER_ERROR = '#EF4444';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  image: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  subtitle: {
    fontSize: 15,
    ...font('400'),
    color: WHITE,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    paddingHorizontal: 28,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
  },
  topBarLink: {
    color: MUTED,
    fontSize: 13,
    ...font('400'),
    letterSpacing: 0.2,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: -SCREEN_WIDTH * 0.30,
    marginTop: -120,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: WHITE + '26',
    borderWidth: 1,
    borderColor: WHITE + '66',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: WHITE,
    fontSize: 10,
    ...font('700'),
    letterSpacing: 2,
  },
  title: {
    fontSize: 44,
    ...font('900'),
    color: WHITE,
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 10,
  },
  

  // Card
  // Glass look + edge come from GlassCard
  card: {
    padding: 24,
  },
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    color: TEXT,
    fontSize: 12,
    ...font('700'),
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: ACCENT,
    backgroundColor: INPUT_FOCUS_BG,
  },
  inputError: {
    borderColor: BORDER_ERROR,
  },
  // No colour here — it would override the icon's color prop (white / lime when focused)
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    ...font('400'),
    color: TEXT,
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
    fontSize: 1,
    color: MUTED,
    letterSpacing: 0.2,
    ...font('600'),
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
    ...font('500'),
    flex: 1,
  },

  // Button
  button: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: ON_ACCENT,
    fontSize: 14,
    ...font('900'),
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
    backgroundColor: DIVIDER,
  },
  dividerText: {
    color: MUTED,
    fontSize: 12,
    ...font('400'),
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
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer link (used inline in topBar now)
  footerLink: {
    color: ACCENT,
    fontSize: 13,
    ...font('700'),
  },
});