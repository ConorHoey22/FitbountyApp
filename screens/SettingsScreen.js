import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      Alert.alert('Logout Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Register')}
      >
        Notifications
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 16 }} />
      ) : (
        <Text style={styles.link} onPress={handleLogout}>
          Log out
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    marginLeft: 6,
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});