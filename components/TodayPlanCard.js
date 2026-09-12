// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import UpdatePlanIndividualSelectionModal from './UpdatePlanIndividualSelectionModal';
// import AddTodayPlanModal from './AddTodayPlanModal';
// import EditWeeklyActivityModal from './EditWeeklyStatsModal';


// const { width } = Dimensions.get('window');



// const daysOfWeek = [
//   'Sunday',
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
// ];

// // ─── Palette ─────────────────────────────────────────────────────
// const ACCENT = '#C6F135';
// const ACCENT2   = '#2563EB';
// const ACCENT3 = '#F97316'
// const ACCENT4 = '#E11D48';
// const ACCENT5= '#22C55E';
// const CARD_BG = '#22222E';
// const GOAL_IN = '#252532';
// const BORDER = '#42425A';
// const ACCENTB = '#000000';
// const ACCENTW = '#FFFFFF';


// export default function TodayPlanCard({ profile, onActivitySaved }) {
//   const navigation = useNavigation();

//   const [checks, setChecks] = useState({
//     cardio: 0,
//     steps: 0,
//     gym: false,
//   });

//   const [todayPlan, setTodayPlan] = useState(null);

//   const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);
//   const [editWeeklyActivityValuesModalVisible, SetEditWeeklyActivityValuesModalVisible] = useState(false);

//   const [refreshKey, setRefreshKey] = useState(0);

//   const todayName = daysOfWeek[new Date().getDay()];
//   const workoutToday = todayPlan?.type === 'Workout';

//   const cardioGoal = todayPlan?.cardio || 0;
//   const stepsGoal = todayPlan?.steps
//     ? Math.round(todayPlan.steps / 7)
//     : (profile.stepGoal || 0);
//   const workoutGoal = workoutToday ? 1 : 0;

//   // Has the user already hit their WEEKLY cardio goal (e.g. did it on a
//   // rest day instead of their scheduled cardio day)? If so, today's
//   // scheduled cardio target is no longer needed.
//   const weeklyCardioTarget = profile.cardioGoal || 0;
//   const weeklyCardioMet =
//     weeklyCardioTarget > 0 &&
//     (profile.weeklyCardioCount || 0) >= weeklyCardioTarget;

//   // Same idea for workouts — if the weekly workout session goal is
//   // already met, today's scheduled workout is no longer needed.
//   const weeklyWorkoutTarget = profile.workoutSessionsGoal || 0;
//   const weeklyWorkoutMet =
//     weeklyWorkoutTarget > 0 &&
//     (profile.weeklyWorkoutCount || 0) >= weeklyWorkoutTarget;

//   // inside your Home screen component
// const [updatePlanVisible, setUpdatePlanVisible] = useState(false);

//   const cardioProgress = cardioGoal
//     ? checks.cardio / cardioGoal
//     : 0;

//   // const safeSteps =
//   //   typeof checks.steps === 'number'
//   //     ? checks.steps
//   //     : 0;


//   const stepsProgress = stepsGoal
//     ? checks.steps / stepsGoal
//     : 0;

//   const workoutProgress = workoutGoal
//     ? checks.gym
//       ? 1
//       : 0
//     : 0;

//   const goals = [
//     {
//       title: 'Cardio',
//       value: weeklyCardioMet
//         ? 'Goal reached ✓'
//         : cardioGoal
//           ? `${checks.cardio}/${cardioGoal} min`
//           : 'Rest day',
//       progress: weeklyCardioMet ? 1 : cardioProgress,
//       icon: weeklyCardioMet ? 'checkmark-circle-outline' : 'heart-outline',
//       color: weeklyCardioMet ? ACCENT5 : ACCENT4,
//     },
//     {
//       title: 'Steps',
//       value: `${checks.steps} / ${stepsGoal}`,
//       progress: stepsProgress,
//       icon: 'footsteps-outline',
//       color: ACCENT2,
//     },
//     {
//       title: 'Workout',
//       value: weeklyWorkoutMet
//         ? 'Goal reached ✓'
//         : workoutToday
//           ? `${checks.gym ? 1 : 0} / 1`
//           : 'Rest day',
//       progress: weeklyWorkoutMet ? 1 : workoutProgress,
//       icon: weeklyWorkoutMet ? 'checkmark-circle-outline' : 'barbell-outline',
//       color: ACCENT5,
//     },
//   ];

//   useEffect(() => {
//     const loadChecks = async () => {
//       try {
//         const todayDateString = new Date().toDateString();
//         const savedDate = await AsyncStorage.getItem('todayChecksDate');

//         if (savedDate !== todayDateString) {
//           // New day — reset today's checks
//           const resetChecks = { cardio: 0, steps: 0, gym: false };
//           await AsyncStorage.setItem('todayChecks', JSON.stringify(resetChecks));
//           await AsyncStorage.setItem('todayChecksDate', todayDateString);
//           setChecks(resetChecks);
//         } else {
//           const saved = await AsyncStorage.getItem('todayChecks');

//           if (saved) {
//             const parsed = JSON.parse(saved);

//             setChecks({
//               cardio: Number(parsed.cardio) || 0,
//               steps: Number(parsed.steps) || 0,
//               gym: Boolean(parsed.gym),
//             });
//           }
//         }

//         const json = await AsyncStorage.getItem('weeklyPlan');

//         if (json) {
//           const plan = JSON.parse(json);

//           if (plan[todayName]) {
//             setTodayPlan(plan[todayName]);
//           }
//         }
//       } catch (error) {
//         console.error('Error loading checks:', error);
//       }
//     };

//     loadChecks();
//   }, [todayName, refreshKey]);

//   return (
//     <View style={styles.cardContainer}>

//       {/* Header */}
//       <View style={styles.cardHeader}>

//         <View style={styles.cardHeaderLeft}>
//           <Ionicons name="today-outline" size={16} color="#ffffff"/>
//           <Text style={styles.cardHeaderText}>Today's Plan</Text>
//         </View>

//         <TouchableOpacity
//           style={styles.recordButton}
//           onPress={() => SetUpdateTodayPlanValuesModalVisible(true)}
//         >
//           <Ionicons name="add-outline" size={14} color="#ffffff" />
//           <Text style={styles.recordButtonText}>Record Activity</Text>
//         </TouchableOpacity>

//         </View>

//       {/* Goals — compact rows */}
//       <View style={styles.goalsList}>
//         {goals.map((goal, index) => (
//           <View key={index} style={styles.goalRow}>
//             <View style={[styles.goalRowIcon, { backgroundColor: goal.color + '18' }]}>
//               <Ionicons name={goal.icon} size={16} color={goal.color} />
//             </View>

//             <View style={styles.goalRowBody}>
//               <View style={styles.goalRowTopLine}>
//                 <Text style={styles.goalRowLabel}>{goal.title}</Text>
//                 <Text style={styles.goalRowLabel}>{goal.value}</Text>
//               </View>
//               <View style={styles.goalTrack}>
//                 <View style={[styles.goalTrackFill, { width: `${Math.min(goal.progress, 1) * 100}%`, backgroundColor: goal.color }]} />
//               </View>
//             </View>
//           </View>
//         ))}
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonRow}>


//       <TouchableOpacity style={styles.actionButtonOutline} onPress={() => setUpdatePlanVisible(true)}>
//           <View style={styles.actionContent}>
//              <Ionicons name="options-outline" size={16} color={ACCENTB} style={styles.actionIcon} />
//               <Text style={styles.actionTextOutline} numberOfLines={1} adjustsFontSizeToFit>
//                 Update Plan
//               </Text>
//           </View>
//     </TouchableOpacity>


//         <TouchableOpacity
//           style={styles.actionButtonOutline}
//           onPress={() => SetEditWeeklyActivityValuesModalVisible(true)}
//         >
//         <Ionicons name="create-outline" size={18} color={ACCENTB} />
//         <Text style={styles.actionTextOutline}>Edit Week</Text>
//       </TouchableOpacity>

//       </View>

//       <AddTodayPlanModal
//         visible={updateTodayPlanValuesModalVisible}
//         onClose={() =>
//           SetUpdateTodayPlanValuesModalVisible(false)
//         }
//         onSave={() => {
//           setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
//           if (onActivitySaved) onActivitySaved(); // refreshes Home
//         }}
//       />

//       <UpdatePlanIndividualSelectionModal
//         visible={updatePlanVisible}
//         onClose={() => setUpdatePlanVisible(false)}
//         onSave={() => {
//           setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
//           if (onActivitySaved) onActivitySaved(); // refreshes Home
//         }}
//       />


//       <EditWeeklyActivityModal
//         visible={editWeeklyActivityValuesModalVisible}
//         onClose={() =>
//           SetEditWeeklyActivityValuesModalVisible(false)
//         }
//         onSave={() => {
//           setRefreshKey(prev => prev + 1);
//           if (onActivitySaved) onActivitySaved();
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({

//   // ── Main Card ─────────────────────────────
//   cardContainer: {
//     backgroundColor: CARD_BG,
//     borderRadius: 18,
//     padding: 16,
//     width: width * 0.95,
//     alignSelf: 'center',
//     borderWidth: 1,
//     borderColor: BORDER,
//     shadowColor: ACCENT2,
//     shadowOpacity: 0.75,
//     shadowRadius: 10,
//     elevation: 6,
//     marginTop: 10,
//   },

//   // ── Header ────────────────────────────────
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },

//   cardHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 7,
//   },

//   cardHeaderText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '700',
//     letterSpacing: 0.3,
//   },

//   addButton: {
//     width: 34,
//     height: 34,
//     borderRadius: 10,
//     backgroundColor: ACCENT,
//     justifyContent: 'center',
//     alignItems: 'center',

//     shadowColor: ACCENT,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 5,
//   },

//   recordButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: ACCENT2,
//     paddingVertical: 7,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     gap: 4,
  
//     shadowColor: ACCENT,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 4,
//   },
  
//   recordButtonText: {
//     color: '#ffffff',
//     fontSize: 11,
//     fontWeight: '800',
//     letterSpacing: 0.3,
//   },

//   // ── Goals — compact rows (replaces 3-tile grid) ──
//   goalsList: {
//     gap: 10,
//     marginBottom: 16,
//   },
//   goalRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: GOAL_IN,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: BORDER,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     gap: 10,
//   },
//   goalRowIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   goalRowBody: {
//     flex: 1,
//   },
//   goalRowTopLine: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     marginBottom: 6,
//   },
//   goalRowLabel: {

//       color: '#FFFFFF',
//       fontSize: 12,
//       fontWeight: '500',
//   },
//   goalRowValue: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '800',
//   },
//   goalTrack: {
//     height: 5,
//     borderRadius: 3,
//     backgroundColor: '#1A1A22',
//     overflow: 'hidden',
//   },
//   goalTrackFill: {
//     height: '100%',
//     borderRadius: 3,
//   },

//   // ── Buttons ───────────────────────────────
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
//     backgroundColor: ACCENTB,
//     paddingVertical: 12,
//     borderRadius: 12,
//     gap: 5,
//     elevation: 6,
//   },

//   actionText: {
//     color: '#ffffff',
//     fontSize: 13,
//     fontWeight: '900',
//     letterSpacing: 0.4,
//   },

//   actionButtonOutline: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',

//     backgroundColor: '#ffffff',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: '#ffffff',
//     gap: 5,
//   },

//   actionTextOutline: {
//     color:  '#000000',
//     fontSize: 12,
//     fontWeight: '900',
//     letterSpacing: 0.2,
//     flexShrink: 1,
//   },
//   actionContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center', // remove if you want left-aligned
//   },
//   actionIcon: {
//     marginRight: 4,
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UpdatePlanIndividualSelectionModal from './UpdatePlanIndividualSelectionModal';
import AddTodayPlanModal from './AddTodayPlanModal';
import EditWeeklyActivityModal from './EditWeeklyStatsModal';


const { width } = Dimensions.get('window');



const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ─── Palette ─────────────────────────────────────────────────────
const ACCENT = '#C6F135';
const ACCENT2   = '#2563EB';
const ACCENT3 = '#F97316'
const ACCENT4 = '#E11D48';
const ACCENT5= '#22C55E';
const CARD_BG = '#22222E';
const GOAL_IN = '#252532';
const BORDER = '#42425A';
const ACCENTB = '#000000';
const ACCENTW = '#FFFFFF';


export default function TodayPlanCard({ profile, onActivitySaved }) {
  const navigation = useNavigation();

  const [checks, setChecks] = useState({
    cardio: 0,
    steps: 0,
    gym: false,
  });

  const [todayPlan, setTodayPlan] = useState(null);

  const [updateTodayPlanValuesModalVisible, SetUpdateTodayPlanValuesModalVisible] = useState(false);
  const [editWeeklyActivityValuesModalVisible, SetEditWeeklyActivityValuesModalVisible] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const todayName = daysOfWeek[new Date().getDay()];
  const workoutToday = todayPlan?.type === 'Workout';

  const cardioGoal = todayPlan?.cardio || 0;
  const stepsGoal = todayPlan?.steps
    ? Math.round(todayPlan.steps / 7)
    : (profile.stepGoal || 0);
  const workoutGoal = workoutToday ? 1 : 0;

  // Has the user already hit their WEEKLY cardio goal (e.g. did it on a
  // rest day instead of their scheduled cardio day)? If so, today's
  // scheduled cardio target is no longer needed.
  const weeklyCardioTarget = profile.cardioGoal || 0;
  const weeklyCardioMet =
    weeklyCardioTarget > 0 &&
    (profile.weeklyCardioCount || 0) >= weeklyCardioTarget;

  // Same idea for workouts — if the weekly workout session goal is
  // already met, today's scheduled workout is no longer needed.
  const weeklyWorkoutTarget = profile.workoutSessionsGoal || 0;
  const weeklyWorkoutMet =
    weeklyWorkoutTarget > 0 &&
    (profile.weeklyWorkoutCount || 0) >= weeklyWorkoutTarget;

  // inside your Home screen component
const [updatePlanVisible, setUpdatePlanVisible] = useState(false);

  const cardioProgress = cardioGoal
    ? checks.cardio / cardioGoal
    : 0;

  // const safeSteps =
  //   typeof checks.steps === 'number'
  //     ? checks.steps
  //     : 0;


  const stepsProgress = stepsGoal
    ? checks.steps / stepsGoal
    : 0;

  const workoutProgress = workoutGoal
    ? checks.gym
      ? 1
      : 0
    : 0;

  const goals = [
    {
      title: 'Cardio',
      unitLabel: weeklyCardioMet ? 'Goal reached' : cardioGoal ? 'minutes' : 'Rest day',
      value: weeklyCardioMet
        ? '✓'
        : cardioGoal
          ? `${checks.cardio}/${cardioGoal}`
          : '—',
      progress: weeklyCardioMet ? 1 : cardioProgress,
      icon: weeklyCardioMet ? 'checkmark-circle-outline' : 'heart-outline',
      color: weeklyCardioMet ? ACCENT5 : ACCENT4,
    },
    {
      title: 'Steps',
      unitLabel: 'steps',
      value: `${checks.steps}/${stepsGoal}`,
      progress: stepsProgress,
      icon: 'footsteps-outline',
      color: ACCENT2,
    },
    {
      title: 'Workout',
      unitLabel: weeklyWorkoutMet ? 'Goal reached' : workoutToday ? 'sessions' : 'Rest day',
      value: weeklyWorkoutMet
        ? '✓'
        : workoutToday
          ? `${checks.gym ? 1 : 0}/1`
          : '—',
      progress: weeklyWorkoutMet ? 1 : workoutProgress,
      icon: weeklyWorkoutMet ? 'checkmark-circle-outline' : 'barbell-outline',
      color: ACCENT5,
    },
  ];

  useEffect(() => {
    const loadChecks = async () => {
      try {
        const todayDateString = new Date().toDateString();
        const savedDate = await AsyncStorage.getItem('todayChecksDate');

        if (savedDate !== todayDateString) {
          // New day — reset today's checks
          const resetChecks = { cardio: 0, steps: 0, gym: false };
          await AsyncStorage.setItem('todayChecks', JSON.stringify(resetChecks));
          await AsyncStorage.setItem('todayChecksDate', todayDateString);
          setChecks(resetChecks);
        } else {
          const saved = await AsyncStorage.getItem('todayChecks');

          if (saved) {
            const parsed = JSON.parse(saved);

            setChecks({
              cardio: Number(parsed.cardio) || 0,
              steps: Number(parsed.steps) || 0,
              gym: Boolean(parsed.gym),
            });
          }
        }

        const json = await AsyncStorage.getItem('weeklyPlan');

        if (json) {
          const plan = JSON.parse(json);

          if (plan[todayName]) {
            setTodayPlan(plan[todayName]);
          }
        }
      } catch (error) {
        console.error('Error loading checks:', error);
      }
    };

    loadChecks();
  }, [todayName, refreshKey]);

  return (
    <View style={styles.cardContainer}>

      {/* Header */}
      <View style={styles.cardHeader}>

        <View style={styles.cardHeaderLeft}>
          <Ionicons name="today-outline" size={16} color="#ffffff"/>
          <Text style={styles.cardHeaderText}>Today's Plan</Text>
        </View>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => SetUpdateTodayPlanValuesModalVisible(true)}
        >
          <Ionicons name="add-outline" size={14} color="#ffffff" />
          <Text style={styles.recordButtonText}>Record Activity</Text>
        </TouchableOpacity>

        </View>

      {/* Goals — icon-chip tiles */}
      <View style={styles.goalsGrid}>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalTile}>
            <View style={[styles.goalTileIconWrap, { backgroundColor: goal.color + '22' }]}>
              <Ionicons name={goal.icon} size={20} color={goal.color} />
            </View>

            <Text style={styles.goalTileTitle}>{goal.title}</Text>
            <Text style={[styles.goalTileValue, { color: goal.color }]}>{goal.value}</Text>
            <Text style={styles.goalTileUnit}>{goal.unitLabel}</Text>

            <View style={styles.goalTileTrack}>
              <View
                style={[
                  styles.goalTileTrackFill,
                  { width: `${Math.min(goal.progress, 1) * 100}%`, backgroundColor: goal.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>

        <TouchableOpacity style={styles.actionButtonOutline} onPress={() => setUpdatePlanVisible(true)}>
          <Ionicons name="options-outline" size={16} color={ACCENTW} style={styles.actionIcon} />
          <Text style={styles.actionTextOutline} numberOfLines={1} adjustsFontSizeToFit>
            Update Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() => SetEditWeeklyActivityValuesModalVisible(true)}
        >
          <Ionicons name="create-outline" size={16} color={ACCENTW} style={styles.actionIcon} />
          <Text style={styles.actionTextOutline} numberOfLines={1} adjustsFontSizeToFit>
            Edit Week
          </Text>
        </TouchableOpacity>

      </View>

      <AddTodayPlanModal
        visible={updateTodayPlanValuesModalVisible}
        onClose={() =>
          SetUpdateTodayPlanValuesModalVisible(false)
        }
        onSave={() => {
          setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
          if (onActivitySaved) onActivitySaved(); // refreshes Home
        }}
      />

      <UpdatePlanIndividualSelectionModal
        visible={updatePlanVisible}
        onClose={() => setUpdatePlanVisible(false)}
        onSave={() => {
          setRefreshKey(prev => prev + 1); // refreshes TodayPlanCard locally
          if (onActivitySaved) onActivitySaved(); // refreshes Home
        }}
      />


      <EditWeeklyActivityModal
        visible={editWeeklyActivityValuesModalVisible}
        onClose={() =>
          SetEditWeeklyActivityValuesModalVisible(false)
        }
        onSave={() => {
          setRefreshKey(prev => prev + 1);
          if (onActivitySaved) onActivitySaved();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  // ── Main Card ─────────────────────────────
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    width: width * 0.95,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    // shadowColor: ACCENT2,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },

  // ── Header ────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT2,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,

    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  recordButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Goals — icon-chip tiles (replaces compact rows) ──
  goalsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  goalTile: {
    flex: 1,
    backgroundColor: GOAL_IN,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  goalTileIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  goalTileTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  goalTileValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  goalTileUnit: {
    color: '#A0A0BC',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 6,
  },
  goalTileTrack: {
    width: '100%',
    height: 4,
    borderRadius: 3,
    backgroundColor: '#1A1A22',
    overflow: 'hidden',
  },
  goalTileTrackFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ── Buttons ───────────────────────────────
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: GOAL_IN,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    gap: 5,
  },

  actionTextOutline: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  actionIcon: {
    marginRight: 2,
  },
});