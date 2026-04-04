// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// export default function WorkoutsScreen() {

//   const navigation = useNavigation();
//   const workouts = [
//     { id: 1, name: 'Morning Cardio', duration: '30 min', calories: 250 },
//     { id: 2, name: 'Strength Training', duration: '45 min', calories: 300 },
//     { id: 3, name: 'Yoga Session', duration: '20 min', calories: 120 },
//     { id: 4, name: 'HIIT Workout', duration: '25 min', calories: 280 },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Workouts</Text>
//       <Text style={styles.subtitle}>Track your fitness activities</Text>
      
//       <ScrollView style={styles.workoutList} showsVerticalScrollIndicator={false}>
//         {workouts.map((workout) => (
//           <TouchableOpacity key={workout.id} style={styles.workoutCard}>
//             <View style={styles.workoutInfo}>
//               <Text style={styles.workoutName}>{workout.name}</Text>
//               <Text style={styles.workoutDetails}>
//                 {workout.duration} • {workout.calories} cal
//               </Text>
//             </View>
//             <TouchableOpacity style={styles.workoutButton} onPress={() => navigation.navigate('WorkoutModeScreen')}> 
//               <Text style={styles.workoutButtonText}>Start</Text>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     padding: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   workoutList: {
//     flex: 1,
//   },
//   workoutCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//   },
//   workoutInfo: {
//     flex: 1,
//   },
//   workoutName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 5,
//   },
//   workoutDetails: {
//     fontSize: 14,
//     color: '#666',
//   },
//   workoutButton: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   workoutButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutsScreen() {
  const navigation = useNavigation();
  
  const workouts = [
    { id: 1, name: 'Morning Cardio', duration: '30 min', calories: 250, icon: 'bicycle-outline', color: '#10b981' },
    { id: 2, name: 'Strength Training', duration: '45 min', calories: 300, icon: 'barbell-outline', color: '#3b82f6' },
    { id: 3, name: 'Yoga Session', duration: '20 min', calories: 120, icon: 'body-outline', color: '#14b8a6' },
    { id: 4, name: 'HIIT Workout', duration: '25 min', calories: 280, icon: 'flash-outline', color: '#f59e0b' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Natural Gradient Background */}
      <LinearGradient
        colors={['#1e3a8a', '#0f766e', '#065f46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Workouts</Text>
              <Text style={styles.subtitle}>Track your fitness activities</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Workout List */}
          <ScrollView 
            style={styles.workoutList} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {workouts.map((workout) => (
              <TouchableOpacity key={workout.id}>
                <LinearGradient
                  colors={['#1E293B', '#1E293B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.workoutCardOuter}
                >
                  <LinearGradient
                    colors={['#0F172A', '#0F172A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.workoutCardInner}
                  >
                    <View style={styles.workoutInfo}>
                      <View style={[styles.iconContainer, { backgroundColor: workout.color + '20' }]}>
                        <Ionicons name={workout.icon} size={28} color={workout.color} />
                      </View>
                      
                      <View style={styles.workoutDetails}>
                        <Text style={styles.workoutName}>{workout.name}</Text>
                        <View style={styles.detailsRow}>
                          <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={14} color="#6ee7b7" />
                            <Text style={styles.detailText}>{workout.duration}</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Ionicons name="flame-outline" size={14} color="#fcd34d" />
                            <Text style={styles.detailText}>{workout.calories} cal</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.workoutButtonWrapper}
                      onPress={() => navigation.navigate('WorkoutModeScreen')}
                    > 
                      <LinearGradient
                        colors={[workout.color, workout.color + 'dd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.workoutButton}
                      >
                        <Ionicons name="play-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.workoutButtonText}>Start</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </View>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  workoutList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  workoutCardOuter: {
    borderRadius: 16,
    padding: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  workoutCardInner: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  workoutButtonWrapper: {
    marginLeft: 12,
  },
  workoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  workoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});