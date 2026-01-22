import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView , TextInput} from 'react-native';
import Timer from '../components/Timer';
import RestTimer from '../components/RestTimer';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutModeScreen({ currentAmount = 43, totalAmount = 100, l }) {
  const progress = Math.min(currentAmount / totalAmount, 1); // progress capped at 100%

  const navigation = useNavigation();



  const workouts = [
    { id: 1, name: 'Leg Press', sets: '3', reps: '8-12' , pr: 33},
    { id: 2, name: 'Leg Press', sets: '7', reps: '8-12', pr: 33},
    { id: 3, name: 'Leg Press', sets: '3', reps: '8-12', pr: 33},
    { id: 4, name: 'Leg Press', sets: '3', reps: '8-12', pr: 33},
  ];


   // Track completion for each workout/set
   const [completedSets, setCompletedSets] = useState({});



   const toggleSetCompletion = (workoutId, setIndex) => {
    setCompletedSets(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        [setIndex]: !prev[workoutId]?.[setIndex],
      },
    }));
  };

  return (
    <View style={styles.container}>

 

        {/* Length of Workout session Timer - 00:00 */}

         <Timer></Timer> 

        {/* Rest Timer - updates everytime you complete a Set   -  Conditional Rendering only */}
        {/* <RestTimer></RestTimer> */}

        {/* motivational Quotes every 5 min? */}

        {/* Call Container which will popoulate based off a json file  */}
      
    <View style={styles.container}>


      
      <ScrollView style={styles.workoutList} showsVerticalScrollIndicator={false}>
        {workouts.map((workout) => (

          <View key={workout.id} style={styles.workoutCard}>

            {/* Container 1  */}
            <View style={styles.workoutDetailsContainer}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>Personal Record - {workout.pr}kg</Text>
                  <Text style={styles.workoutDetails}>
                  {workout.sets} Sets • {workout.reps} Reps
                </Text>
            </View>


          {/* Container 2  */}
          <View style={styles.workoutDetailsContainer}>
            {Array.from({ length: workout.sets }).map((_, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setLabel}>{index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  keyboardType="numeric"
                />

              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => toggleSetCompletion(workout.id, index)} // your handler
              >
                <Ionicons
                  name={
                    completedSets[workout.id]?.[index]
                      ? "checkmark-circle"           // filled checkmark icon
                      : "checkmark-circle-outline"     // empty checkmark icon
                  }
                  size={28}
                  color={completedSets[workout.id]?.[index] ? "#4CAF50" : "#000"} // green when done, black when not
                 />
              
              </TouchableOpacity>
    
              </View>
            ))}
                      </View>
          </View>
        ))}
      </ScrollView>

        

        {/* locat storage saves PRs  - display within card so the user know what weight to use }



        {/* Submit button  */}
        
        <View>
          {/* Update button */}
          <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={() => navigation.navigate('PlanYourWeekScreen')}
          >
            <Ionicons name="create-outline" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Modal - PRs Appears When usere */}

       {/* Modal - Workout Complete Summary  - 
          list of Prs 
          Xp generated 
          How did that go  - too easy , easy , hard-  , message to coach (coach mode) ? , 
        */}

</View>

        
   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  


  workoutList: {
    flex: 1,
    backgroundColor: "#F8F9FB", // soft neutral background
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  workoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  workoutHeader: {
    marginBottom: 10,
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  workoutDetails: {
    fontSize: 14,
    color: "#4FB0FF",
    fontWeight: "500",
    marginTop: 2,
  },
  workoutSubDetails: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  setsContainer: {
    marginTop: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  setLabel: {
    flex: 0.5,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    flex: 1,
    height: 36,
    backgroundColor: "#fff",
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 6,
    color: "#000",
  },
  completeButton: {
    marginLeft: 4,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor:'#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
  },
  // completeButton: {
  //   width: 40,
  //   height: 40,
  //   backgroundColor:'#fff',
  //   // borderRadius: 20,       
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },


  button: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});