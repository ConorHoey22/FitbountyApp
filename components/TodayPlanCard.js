// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import AddTodayPlanModal from './AddTodayPlanModal';

// import TrackerBar from '../components/TrackerBar';

// const { width } = Dimensions.get('window');
// const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// export default function TodayPlanCard({ profile }) {
//   const navigation = useNavigation();
//   const [checks, setChecks] = useState({ cardio: 0, steps: 0, gym: false });
//   const [todayPlan, setTodayPlan] = useState(null);


//   const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);
 

//   const todayName = daysOfWeek[new Date().getDay()];
//   const workoutToday = todayPlan?.type === 'Workout';

//   useEffect(() => {
//     const loadChecks = async () => {
//       if (saved) {
//         const parsed = JSON.parse(saved);
      
//         setChecks({
//           cardio: Number(parsed.cardio) || 0,
//           steps: Number(parsed.steps) || 0,
//           gym: Boolean(parsed.gym),
//         });
//       }

//       const json = await AsyncStorage.getItem('weeklyPlan');
//       if (json) {
//         const plan = JSON.parse(json);
//         if (plan[todayName]) setTodayPlan(plan[todayName]);
//       }
//     };
  
//     loadChecks();
//   }, []);

//   const cardioGoal = todayPlan?.cardio || 0;
//   const stepsGoal = todayPlan?.steps || profile.stepGoal;
//   const workoutGoal = workoutToday ? 1 : 0;

//   const cardioProgress = cardioGoal ? checks.cardio / cardioGoal : 0;

//   const safeSteps = typeof checks.steps === 'number' ? checks.steps : 0;
//   const stepsProgress = stepsGoal ? safeSteps / stepsGoal : 0;

//   const workoutProgress = workoutGoal ? (checks.gym ? 1 : 0) : 0;

//   const goals = [
//     { title: 'Cardio', value: cardioGoal ? `${checks.cardio}/${cardioGoal} min` : 'Rest', progress: cardioProgress },
//     { title: 'Steps', value: `${safeSteps}/${stepsGoal}`, progress: stepsProgress },
//     { title: 'Workout', value: workoutToday ? `${checks.gym ? 1 : 0}/1` : 'Rest', progress: workoutProgress },
//   ];

//   return (
//     <View style={styles.cardContainer}>    
          
//           <View style={styles.cardHeader}>

//           <View style={styles.goalsRow}>
//             <Text style={styles.actionText}>Plan For Today  </Text>  

//             <TouchableOpacity style={styles.addButton} onPress={() => SetUpdateTodayPlanValuesModalVisible(true)} >
//                <Ionicons name="add-outline" size={18} color="#fff" />
   

//             </TouchableOpacity>
//          </View>


//           </View>

      
//       <View style={styles.goalsRow}>
//         {goals.map((goal, index) => (
//           <View key={index} style={styles.goalCard}>
//             <TrackerBar size={50} strokeWidth={5} currentAmount={goal.progress} totalAmount={1} />
//             <Text style={styles.goalTitle}>{goal.title}</Text>
//             <Text style={styles.goalValue}>{goal.value}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => navigation.navigate('PlanYourWeekScreen')}
//         >
//           <Ionicons name="add-outline" size={18} color="#fff" />
//           <Text style={styles.actionText}>Update Plan</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => navigation.navigate('PlanYourWeekScreen')}
//         >
//           <Ionicons name="calendar-outline" size={18} color="#fff" />
//           <Text style={styles.actionText}>Update Weekly Plan</Text>
//         </TouchableOpacity>
//       </View>

//       <AddTodayPlanModal
//                 visible={updateTodayPlanValuesModalVisible}

//                 // caloriesConsumed={caloriesConsumed}
//                 // proteinConsumed={proteinConsumed}
//                 // carbohydratesConsumed={carbohydratesConsumed}
//                 // fatsConsumed={fatsConsumed}
              
//                 // setCaloriesConsumed={SetCaloriesConsumed}
//                 // setProteinConsumed={SetProteinConsumed}
//                 // setCarbohydratesConsumed={SetCarbohydratesConsumed}
//                 // setFatsConsumed={SetFatsConsumed}
              
//                 onClose={() => SetUpdateTodayPlanValuesModalVisible(false)}
//               />


//     </View>

    

    
//   );
// }

// const styles = StyleSheet.create({
//   cardContainer: {
//     backgroundColor: '#1E293B',
//     borderRadius: 16,
//     padding: 16,
//     width: width * 0.95, // almost full width
//     alignSelf: 'center', // center horizontally
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 4,
//   },

//   cardHeader:
//   {
//     marginBottom:10
//   },

//   // goalsRow: {
//   //   flexDirection: 'row',
//   //   justifyContent: 'space-around', // center the goal cards evenly
//   //   marginBottom: 14,
//   // },
//   goalsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   goalCard: {
//     backgroundColor: '#0F172A',
//     width: 90,
//     height: 130,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 8,
//     borderWidth: 1,
//     marginBottom:10,
//     borderColor: 'rgba(255,255,255,0.05)',
//   },
//   addButton: {
//     backgroundColor: '#4CAF50',
//     padding: 8,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   goalTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#F1F5F9',
//     marginTop: 6,
//     textAlign: 'center',
//   },

//   goalValue: {
//     fontSize: 12,
//     color: '#CBD5E1',
//     marginTop: 2,
//     textAlign: 'center',
//   },

//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 8,
//   },

//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#3B82F6',
//     paddingVertical: 8,
//     borderRadius: 10,
//     gap: 4,
//   },

//   actionText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '600',
//   },
// });



// In TodayPlanCard.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AddTodayPlanModal from './AddTodayPlanModal';

import TrackerBar from '../components/TrackerBar';

const { width } = Dimensions.get('window');
const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function TodayPlanCard({ profile }) {
  const navigation = useNavigation();
  const [checks, setChecks] = useState({ cardio: 0, steps: 0, gym: false });
  const [todayPlan, setTodayPlan] = useState(null);


  const cardioGoal = todayPlan?.cardio || 0;
  const stepsGoal = todayPlan?.steps || profile.stepGoal;
  const workoutGoal = workoutToday ? 1 : 0;

  const cardioProgress = cardioGoal ? checks.cardio / cardioGoal : 0;

  const safeSteps = typeof checks.steps === 'number' ? checks.steps : 0;
  const stepsProgress = stepsGoal ? safeSteps / stepsGoal : 0;

  const workoutProgress = workoutGoal ? (checks.gym ? 1 : 0) : 0;

  const goals = [
    { title: 'Cardio', value: cardioGoal ? `${checks.cardio}/${cardioGoal} min` : 'Rest', progress: cardioProgress },
    { title: 'Steps', value: `${safeSteps}/${stepsGoal}`, progress: stepsProgress },
    { title: 'Workout', value: workoutToday ? `${checks.gym ? 1 : 0}/1` : 'Rest', progress: workoutProgress },
  ];


  const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);
 

  const todayName = daysOfWeek[new Date().getDay()];
  const workoutToday = todayPlan?.type === 'Workout';
const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  const loadChecks = async () => {
    try {
      const saved = await AsyncStorage.getItem('todayChecks');
      
      if (saved) {
        const parsed = JSON.parse(saved);
      
        setChecks({
          cardio: Number(parsed.cardio) || 0,
          steps: Number(parsed.steps) || 0,
          gym: Boolean(parsed.gym),
        });
      }

      const json = await AsyncStorage.getItem('weeklyPlan');
      if (json) {
        const plan = JSON.parse(json);
        if (plan[todayName]) setTodayPlan(plan[todayName]);
      }
    } catch (error) {
      console.error('Error loading checks:', error);
    }
  };

  loadChecks();
}, [todayName, refreshKey]); // Add refreshKey dependency




  return (
    <View style={styles.cardContainer}>    
          
          <View style={styles.cardHeader}>

          <View style={styles.goalsRow}>
            <Text style={styles.actionText}>Plan For Today  </Text>  

            <TouchableOpacity style={styles.addButton} onPress={() => SetUpdateTodayPlanValuesModalVisible(true)} >
               <Ionicons name="add-outline" size={18} color="#fff" />
   

            </TouchableOpacity>
         </View>


          </View>

      
      <View style={styles.goalsRow}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <TrackerBar size={50} strokeWidth={5} currentAmount={goal.progress} totalAmount={1} />
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalValue}>{goal.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PlanYourWeekScreen')}
        >
          <Ionicons name="add-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Update Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PlanYourWeekScreen')}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Update Weekly Plan</Text>
        </TouchableOpacity>
      </View>

{/* 
// Update the modal call: */}
<AddTodayPlanModal
  visible={updateTodayPlanValuesModalVisible}
  onClose={() => SetUpdateTodayPlanValuesModalVisible(false)}
  onSave={() => setRefreshKey(prev => prev + 1)} // Refresh when saved
/>

      {/* <AddTodayPlanModal
                visible={updateTodayPlanValuesModalVisible}

                // caloriesConsumed={caloriesConsumed}
                // proteinConsumed={proteinConsumed}
                // carbohydratesConsumed={carbohydratesConsumed}
                // fatsConsumed={fatsConsumed}
              
                // setCaloriesConsumed={SetCaloriesConsumed}
                // setProteinConsumed={SetProteinConsumed}
                // setCarbohydratesConsumed={SetCarbohydratesConsumed}
                // setFatsConsumed={SetFatsConsumed}
              
                onClose={() => SetUpdateTodayPlanValuesModalVisible(false)}
              /> */}


    </View>

    

    
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    width: width * 0.95, // almost full width
    alignSelf: 'center', // center horizontally
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  cardHeader:
  {
    marginBottom:10
  },

  // goalsRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around', // center the goal cards evenly
  //   marginBottom: 14,
  // },
  goalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  goalCard: {
    backgroundColor: '#0F172A',
    width: 90,
    height: 130,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    marginBottom:10,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
    marginTop: 6,
    textAlign: 'center',
  },

  goalValue: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
    textAlign: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },

  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

