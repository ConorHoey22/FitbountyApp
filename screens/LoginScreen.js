import React, { useEffect, useState } from 'react';
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
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

    return () => {
      isMounted = false;
    };
  }, []);

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

      // Get profile
      const profile = await getProfile(data.user.id);
      
      if (!profile) {
        // First login: no profile yet
        navigation.reset({
          index: 0,
          routes: [{ name: 'CreateUserPlan' }],
        });
      } else {
        // Normal login
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppTabs' }],
        });
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Natural Gradient Background - Deep Blue/Teal */}
      <LinearGradient
        colors={['#1e3a8a', '#0f766e', '#065f46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header with Natural Icon */}
              <View style={styles.header}>
             
                
                <Text style={styles.title}>FitBounty</Text>
                <Text style={styles.subtitle}>Track your fitness journey</Text>
              </View>

              {/* Login Card */}
              <LinearGradient
                colors={['#1E293B', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardOuter}
              >
                <LinearGradient
                  colors={['#0F172A', '#0F172A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardInner}
                >
                  <Text style={styles.cardTitle}>Welcome Back!</Text>
                  <Text style={styles.cardSubtitle}>Sign in to continue</Text>

                  {/* Form */}
                  <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                      <View style={styles.labelRow}>
                        <Ionicons name="mail-outline" size={18} color="#10b981" />
                        <Text style={styles.label}>Email</Text>
                      </View>
                      <View style={[
                        styles.inputContainer,
                        emailFocused && styles.inputContainerFocused,
                        error && styles.inputContainerError
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="your@email.com"
                          placeholderTextColor="#6B7280"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            setError('');
                          }}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                      <View style={styles.labelRow}>
                        <Ionicons name="lock-closed-outline" size={18} color="#10b981" />
                        <Text style={styles.label}>Password</Text>
                      </View>
                      <View style={[
                        styles.inputContainer,
                        passwordFocused && styles.inputContainerFocused,
                        error && styles.inputContainerError
                      ]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your password"
                          placeholderTextColor="#6B7280"
                          secureTextEntry
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            setError('');
                          }}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Error Message */}
                    {error ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    {/* Natural Gradient Login Button */}
                    <TouchableOpacity 
                      style={styles.loginButtonWrapper}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={loading ? ['#6b7280', '#4b5563'] : ['#10b981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginButton}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.loginButtonText}>Log In</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Social Buttons */}
                    <View style={styles.socialContainer}>
                      <TouchableOpacity style={styles.socialButton}>
                        <LinearGradient
                          colors={['#3b82f6', '#2563eb']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name="logo-google" size={22} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.socialButton}>
                        <LinearGradient
                          colors={['#64748b', '#475569']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.socialButton}>
                        <LinearGradient
                          colors={['#3b82f6', '#2563eb']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.socialButtonGradient}
                        >
                          <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </LinearGradient>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                >
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  iconText: {
    fontSize: 45,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  cardOuter: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  cardInner: {
    borderRadius: 22,
    padding: 28,
    backgroundColor: '#0F172A',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#A0A3A8',
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: '#1C1F26',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputContainerFocused: {
    borderColor: '#10b981',
    backgroundColor: '#0F172A',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  loginButtonWrapper: {
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#A0A3A8',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  socialButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});