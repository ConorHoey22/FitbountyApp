import React, { useRef, useEffect , useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Timer from '../components/Timer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import RestTimer from '../components/RestTimer';
import { getProfile } from '../lib/GetProfile';

export default function WorkoutModeScreen({ currentAmount = 43, totalAmount = 100 }) {
  const progress = Math.min(currentAmount / totalAmount, 1);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [profileUnitMeasurement , SetProfileUnitMeasurement] = useState();

  const workouts = [
    { id: 1, name: 'Leg Press', sets: 3, reps: '8-12', pr: 33  , restTimer: 180 },
    { id: 2, name: 'Squats', sets: 4, reps: '8-12', pr: 45 , restTimer: 180 },
    { id: 3, name: 'Leg Extension', sets: 3, reps: '12-15', pr: 28 , restTimer: 180 },
    { id: 4, name: 'Hamstring Curl', sets: 3, reps: '10-12', pr: 25 , restTimer: 180 },
  ];



const restTimerRef = useRef(null);
const [currentWorkout, setCurrentWorkout] = useState(null);
const [currentSetIndex, setCurrentSetIndex] = useState(null);
const [enteredWeight, setEnteredWeight] = useState({});


// Add this state
const [showRestTimer, setShowRestTimer] = useState(false);

  useEffect(() => {
    const load = async () => {


      try {
        setLoading(true);
  
        const {
          data: { session },
        } = await supabase.auth.getSession();
  
        if (!session?.user) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }

      



      const profileData = await getProfile(session.user.id);

            //Get Profile
            setProfile(profileData);

            SetProfileUnitMeasurement(profileData.unitMeasurement);
            
    }
            catch (err) {
              console.error('Home Screen load error:', err.message);
            } finally {
              setLoading(false);
            }
  
  
          }
  
    load();
  }, []); 

  const [completedSets, setCompletedSets] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);




  if (!profile) {
    return (
      <View style={styles.center}>
          <Text style={styles.progressText}>No profile found</Text>
      </View>
    );
  }

  // const toggleSetCompletion = (workout, setIndex) => {
  //   setCurrentWorkout(workout);
  //   setCurrentSetIndex(setIndex);
  //   setCompletedSets(prev => ({
  //     ...prev,
  //     [workout.id]: {
  //       ...prev[workout.id],
  //       [setIndex]: !prev[workout.id]?.[setIndex],
  //     },
  //   }));
  
  //   // Start rest timer when marking a set complete
  //   if (!completedSets[workout.id]?.[setIndex]) {
  //     restTimerRef.current?.start();
  //   }
  // };

  // const toggleSetCompletion = (workout, setIndex) => {
  //   setCurrentWorkout(workout);
  //   setCurrentSetIndex(setIndex);
  
  //   const alreadyCompleted = completedSets[workout.id]?.[setIndex];
  
  //   setCompletedSets(prev => ({
  //     ...prev,
  //     [workout.id]: {
  //       ...prev[workout.id],
  //       [setIndex]: !alreadyCompleted,
  //     },
  //   }));
  
  //   if (!alreadyCompleted) {
  //     setShowRestTimer(true);  // 👈 show it
  //     restTimerRef.current?.start(workout.restTimer);
  //   } else {
  //     setShowRestTimer(false); // 👈 hide if unchecking
  //   }
  // };


  const toggleSetCompletion = (workout, setIndex) => {
    setCurrentWorkout(workout);
    setCurrentSetIndex(setIndex);
  
    // Reads the CURRENT value of completedSets for this specific workout set
    // BEFORE any state update happens.
    // e.g. if set 1 was already ticked, this will be `true`
    // if set 1 was never ticked, this will be `undefined` (falsy)
    // We capture it here because once setCompletedSets runs below,
    // the state updates and we lose the original value
    const alreadyCompleted = completedSets[workout.id]?.[setIndex];
  
    setCompletedSets(prev => ({
      ...prev,
      [workout.id]: {
        ...prev[workout.id],
        // Uses the captured alreadyCompleted value to toggle
        // if it was true  → sets to false (untick)
        // if it was false/undefined → sets to true (tick)
        [setIndex]: !alreadyCompleted,
      },
    }));
  
    // Because we captured alreadyCompleted BEFORE the state update:
    // if it was false/undefined → user is COMPLETING a set → start timer
    // if it was true → user is UN-COMPLETING a set → hide timer
    if (!alreadyCompleted) {
      // Force unmount the RestTimer component so it resets fully
      // This handles the case where a previous timer is already running
      setShowRestTimer(false);
  
      setTimeout(() => {
        // Remount it fresh after 50ms so the ref and state are clean
        // Then immediately start counting down with this workout's rest duration
        setShowRestTimer(true);
        restTimerRef.current?.start(workout.restTimer);
      }, 50);
    } else {
      // User unticked a completed set, so hide the timer entirely
      setShowRestTimer(false);
    }
  };
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
        <View style={styles.timerContentCard}>

        <View style={styles.workoutCard}>
          
           <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerTextContainer}>


{/* Workout Timer */}
                <Timer></Timer>
              </View>
            </View>
      
            {showRestTimer && (
              <View style={styles.progressContainer}>
               <RestTimer
                  ref={restTimerRef}
                  workoutId={currentWorkout?.id}
                  setIndex={currentSetIndex}
                  weightLifted={enteredWeight}
                  currentPR={currentWorkout?.pr}
                  onTimerComplete={() => {
                    setShowRestTimer(false); // 👈 hide when done
                    console.log('Rest complete!');
                  }}
                />
              </View>
            )}

            
          </View>
       </View>
    </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          
          {/* Workout Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="barbell-outline" size={28} color="#10b981" />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Leg Day</Text>
                <Text style={styles.headerSubtitle}>4 exercises • 13 sets</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
              <Ionicons name="add-outline" size={20} color="#10b981" />
              </Text>
            </View>
          </View>
    
          {/* Workout List */}
          <ScrollView style={styles.workoutList} showsVerticalScrollIndicator={false}>
            {workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                
                {/* Workout Header */}
                <View style={styles.workoutDetailsContainer}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>Personal Record - {workout.pr} {profileUnitMeasurement}</Text>
                  <Text style={styles.workoutDetails}>{workout.sets} Sets • {workout.reps} Reps</Text>
                </View>

                {/* Sets */}
                <View style={styles.workoutDetailsContainer}>
                  {Array.from({ length: workout.sets }).map((_, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.setRow,
                        completedSets[workout.id]?.[index] && styles.setRowCompleted
                      ]}
                    >
                      <Text style={styles.setLabel}>{index + 1}</Text>
                      
                      <View style={[
                        styles.inputContainer,
                        focusedInput === `${workout.id}-${index}-reps` && styles.inputContainerFocused,
                      ]}>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Reps" 
                          placeholderTextColor="#6B7280"
                          keyboardType="numeric"
                          onFocus={() => setFocusedInput(`${workout.id}-${index}-reps`)}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>

                      <View style={[
                        styles.inputContainer,
                        focusedInput === `${workout.id}-${index}-weight` && styles.inputContainerFocused,
                      ]}>
                        <TextInput 
                          style={styles.input} 
                          placeholder="Weight" 
                          placeholderTextColor="#6B7280"
                          keyboardType="numeric"
                          onFocus={() => setFocusedInput(`${workout.id}-${index}-weight`)}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => toggleSetCompletion(workout, index)}
                      >
                        <Ionicons
                          name={completedSets[workout.id]?.[index] ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={28}
                          color={completedSets[workout.id]?.[index] ? "#10b981" : "#6B7280"}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>


        {/* Finish button */}
          <View style={{ padding: 12 }}>
            <TouchableOpacity>
            <LinearGradient
               colors={['#10b981', '#059669']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={styles.finishButton}
            >
                <Ionicons name="checkmark-done-outline" size={22} color="#fff" />
                <Text style={styles.finishButtonText}>Finish Workout</Text>
          
              </LinearGradient>
              </TouchableOpacity>
            </View>
        

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
  timerSection: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timerContentCard:{

    padding:20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTextContainer: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  workoutList: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  workoutDetailsContainer: {
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#6ee7b7',
    fontWeight: '500',
    marginTop: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  setRowCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  setLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#1C1F26',
    borderRadius: 10,
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
  input: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  completeButton: {
    padding: 4,
  },
  finishButtonWrapper: {
    paddingVertical: 16,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});