// components/AppLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import TopActionBar from './TopActionBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function AppLayout({ children, title }) {
  const navigation = useNavigation();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0E1116' }}>
      <View style={styles.container}>
        <TopActionBar
          title={"FitBounty"}
          onNotificationPress={() => navigation.navigate('Home')}
          onProfilePress={() => navigation.navigate('ProfileScreen')}
        />
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: {
    flex: 1,
    backgroundColor: '#0E1116',
  },
  
  safeArea: {
   flex:1,
   backgroundColor: '#3B82F6', // Status Bar Color
  },

});