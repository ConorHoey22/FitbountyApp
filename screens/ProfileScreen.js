// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { supabase } from '../lib/supabase';

// export default function ProfileScreen() {
//   const handleLogout = async () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const { error } = await supabase.auth.signOut();
//               if (error) {
//                 Alert.alert('Error', error.message);
//               }
//             } catch (error) {
//               Alert.alert('Error', 'Failed to logout');
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Profile</Text>
//       <Text style={styles.subtitle}>Welcome to your profile!</Text>
      
//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 40,
//     textAlign: 'center',
//   },
//   logoutButton: {
//     backgroundColor: '#ff4757',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 25,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   logoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ProfileScreen() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // Mock test data (replace with Supabase later)
    const week = [
      { date: '2025-08-18', steps: 8200 },
      { date: '2025-08-19', steps: 10200 },
      { date: '2025-08-20', steps: 6500 },
      { date: '2025-08-21', steps: 12000 },
      { date: '2025-08-22', steps: 7800 },
      { date: '2025-08-23', steps: 9500 },
      { date: '2025-08-24', steps: 5000 },
    ];

    const month = [
      { month_start: '2025-05-01', total_steps: 280000 },
      { month_start: '2025-06-01', total_steps: 300000 },
      { month_start: '2025-07-01', total_steps: 325000 },
      { month_start: '2025-08-01', total_steps: 310000 },
    ];

    setWeeklyData(week);
    setMonthlyData(month);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Progress</Text>

      {/* Weekly Steps Chart */}
      <Text style={styles.subtitle}>Steps This Week</Text>
      {weeklyData.length > 0 && (
        <BarChart
          data={{
            labels: weeklyData.map(d =>
              new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })
            ),
            datasets: [{ data: weeklyData.map(d => d.steps) }],
          }}
          width={screenWidth - 30}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}

      {/* Monthly Steps Trend */}
      <Text style={styles.subtitle}>Monthly Steps</Text>
      {monthlyData.length > 0 && (
        <LineChart
          data={{
            labels: monthlyData.map(m =>
              new Date(m.month_start).toLocaleDateString('en-GB', { month: 'short' })
            ),
            datasets: [{ data: monthlyData.map(m => m.total_steps) }],
          }}
          width={screenWidth - 30}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#4CAF50',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
});