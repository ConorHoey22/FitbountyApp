import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && data?.session) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitBounty</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Text>Don't have an account?</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}> Register</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  error: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  link: {
    color: '#007AFF',
    marginLeft: 6
  }
});

