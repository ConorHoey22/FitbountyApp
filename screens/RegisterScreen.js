import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  




  
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }
  
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          shouldCreateSession: false
        }
      });
  
      if (error) throw error;
  
      // Insert into userProfiles
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('userProfiles')
          .insert([
            {
              id: data.user.id,
              first_name: '',
              goal: answers.goal,
              unitMeasurement: '',
              startingWeight: '',
              currentWeight: '',
              workoutSessionsGoal: '',
              stepGoal: '',
              cardioGoal: '',
              created_at: new Date().toISOString(),
              totalXP: 0,
              userLevel: 0,
              calories: '',
              protein: '' ,
              carbohydrates: '',
              fats: '',
              UserHasEnteredTheirProfileDataTrigger: false,
              UserHasWeeklyPlanSetup: false,
              UserHasMacros:false,

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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button title={loading ? 'Loading...' : 'Register'} onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
