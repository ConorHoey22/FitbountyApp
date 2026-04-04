import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function PlanYourWeekScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [maxGymDays, setMaxGymDays] = useState(0);
  const [cardioGoal, setCardioGoal] = useState(0);

  const [selectedGymDays, setSelectedGymDays] = useState([]);
  const [cardioPlan, setCardioPlan] = useState({}); // { Monday: 30, Wednesday: 30 }

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('userProfiles')
        .select('workoutSessionsGoal, cardioGoal')
        .eq('id', user.id)
        .single();

      setMaxGymDays(data?.workoutSessionsGoal ?? 0);
      setCardioGoal(data?.cardioGoal ?? 0);
    };
    loadProfile();
  }, []);

  const toggleGymDay = (day) => {
    if (selectedGymDays.includes(day)) {
      setSelectedGymDays(selectedGymDays.filter(d => d !== day));
    } else if (selectedGymDays.length < maxGymDays) {
      setSelectedGymDays([...selectedGymDays, day]);
    }
  };

  const toggleCardioDay = (day) => {
    if (cardioPlan[day]) {
      const newPlan = { ...cardioPlan };
      delete newPlan[day];
      setCardioPlan(newPlan);
    } else {
      setCardioPlan({ ...cardioPlan, [day]: 0 });
    }
  };

  const updateCardioMinutes = (day, minutes) => {
    setCardioPlan({ ...cardioPlan, [day]: parseInt(minutes, 10) || 0 });
  };

  const totalCardioMinutes = Object.values(cardioPlan).reduce((a, b) => a + b, 0);

  
  

  const savePlan = async () => {
    try {
      const weeklyPlan = {};
      selectedGymDays.forEach(day => {
        weeklyPlan[day] = { type: 'Workout', cardio: 0 };
      });
      Object.entries(cardioPlan).forEach(([day, minutes]) => {
        weeklyPlan[day] = { type: 'Cardio', cardio: minutes };
      });
  
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  
      // Update DB first
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('userProfiles')
        .update({
          UserHasWeeklyPlanSetup: true,
          lastupdate_at: new Date().toISOString(),
        })
        .eq('id', user.id);
  
      if (error) throw error;
  
      // Only navigate after DB update succeeds
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      console.error('Save plan error:', err.message);
    }
  };
  

return (
  <View style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {step === 0 && maxGymDays > 0 && (
        <>
          <Text style={styles.title}>
            Choose {maxGymDays} Gym Days
          </Text>

          <View style={styles.grid}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCard,
                  selectedGymDays.includes(day) && styles.selectedCard
                ]}
                onPress={() => toggleGymDay(day)}
              >
                <Text style={styles.dayText}>{day.slice(0,3)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.title}>
            Cardio Plan ({cardioGoal} mins goal)
          </Text>

          {daysOfWeek.map((day) => (
            <View key={day} style={styles.cardioRow}>
              <TouchableOpacity
                style={[
                  styles.dayCardSmall,
                  cardioPlan[day] !== undefined && styles.selectedCard
                ]}
                onPress={() => toggleCardioDay(day)}
              >
                <Text style={styles.dayText}>{day.slice(0,3)}</Text>
              </TouchableOpacity>

              {cardioPlan[day] !== undefined && (
                <TextInput
                  style={styles.minutesInput}
                  placeholder="Min"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={String(cardioPlan[day])}
                  onChangeText={(val) => updateCardioMinutes(day, val)}
                />
              )}
            </View>
          ))}

          <Text style={styles.summary}>
            {totalCardioMinutes} / {cardioGoal} mins
          </Text>
        </>
      )}
    </ScrollView>

    {/* Sticky Bottom Button */}
    <View style={styles.bottomBar}>
      {step === 0 && selectedGymDays.length === maxGymDays && (
        <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(1)}>
          <Text style={styles.primaryText}>Continue</Text>
        </TouchableOpacity>
      )}

      {step === 1 && (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            totalCardioMinutes !== cardioGoal && styles.disabledButton
          ]}
          disabled={totalCardioMinutes !== cardioGoal}
          onPress={savePlan}
        >
          <Text style={styles.primaryText}>Save Plan</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>

)};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  dayCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  dayCardSmall: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedCard: {
    backgroundColor: '#22C55E',
  },

  dayText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  cardioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  minutesInput: {
    backgroundColor: '#1E293B',
    width: 80,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#fff',
    textAlign: 'center',
  },

  summary: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },

  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#374151',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

// 


// import React, { useState, useEffect } from 'react';
// import { 
// View, 
// Text, 
// TouchableOpacity, 
// StyleSheet, 
// TextInput, 
// ScrollView, 
// StatusBar,
// KeyboardAvoidingView,
// Platform
// } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { supabase } from '../lib/supabase';

// const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// export default function PlanYourWeekScreen({ navigation }) {

// const [step, setStep] = useState(0);
// const [maxGymDays, setMaxGymDays] = useState(0);
// const [cardioGoal, setCardioGoal] = useState(0);

// const [selectedGymDays, setSelectedGymDays] = useState([]);
// const [cardioPlan, setCardioPlan] = useState({});

// useEffect(() => {
// const loadProfile = async () => {

// const { data: { user } } = await supabase.auth.getUser();

// const { data } = await supabase
// .from('userProfiles')
// .select('workoutSessionsGoal, cardioGoal')
// .eq('id', user.id)
// .single();

// setMaxGymDays(data?.workoutSessionsGoal ?? 0);
// setCardioGoal(data?.cardioGoal ?? 0);

// };

// loadProfile();

// }, []);

// const toggleGymDay = (day) => {

// if (selectedGymDays.includes(day)) {

// setSelectedGymDays(selectedGymDays.filter(d => d !== day));

// } else if (selectedGymDays.length < maxGymDays) {

// setSelectedGymDays([...selectedGymDays, day]);

// }

// };

// const toggleCardioDay = (day) => {

// if (cardioPlan[day]) {

// const newPlan = { ...cardioPlan };
// delete newPlan[day];
// setCardioPlan(newPlan);

// } else {

// setCardioPlan({ ...cardioPlan, [day]: 0 });

// }

// };

// const updateCardioMinutes = (day, minutes) => {

// setCardioPlan({ ...cardioPlan, [day]: parseInt(minutes, 10) || 0 });

// };

// const totalCardioMinutes = Object.values(cardioPlan).reduce((a, b) => a + b, 0);

// const savePlan = async () => {

// try {

// const weeklyPlan = {};

// selectedGymDays.forEach(day => {
// weeklyPlan[day] = { type: 'Workout', cardio: 0 };
// });

// Object.entries(cardioPlan).forEach(([day, minutes]) => {
// weeklyPlan[day] = { type: 'Cardio', cardio: minutes };
// });

// await AsyncStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));

// const { data: { user } } = await supabase.auth.getUser();

// await supabase
// .from('userProfiles')
// .update({
// UserHasWeeklyPlanSetup: true,
// lastupdate_at: new Date().toISOString(),
// })
// .eq('id', user.id);

// navigation.reset({
// index: 0,
// routes: [{ name: 'Home' }],
// });

// } catch (err) {

// console.error(err.message);

// }

// };

// return (

// <View style={styles.container}>

// <StatusBar barStyle="light-content" />

// <LinearGradient
// colors={['#1e3a8a', '#0f766e', '#065f46']}
// style={styles.gradientBackground}
// >

// <KeyboardAvoidingView
// style={{ flex: 1 }}
// behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// >

// <ScrollView
// contentContainerStyle={styles.scrollContent}
// showsVerticalScrollIndicator={false}
// >

// <View style={styles.content}>

// {/* Progress */}

// <View style={styles.progressContainer}>

// <View style={styles.progressBar}>
// <View
// style={[
// styles.progressFill,
// { width: step === 0 ? '50%' : '100%' }
// ]}
// />
// </View>

// <Text style={styles.progressText}>
// Step {step + 1} of 2
// </Text>

// </View>

// {/* Card */}

// <LinearGradient
// colors={['#1E293B','#1E293B']}
// style={styles.cardOuter}
// >

// <LinearGradient
// colors={['#0F172A','#0F172A']}
// style={styles.cardInner}
// >

// <Text style={styles.question}>

// {step === 0
// ? `Choose ${maxGymDays} Gym Days`
// : `Cardio Plan (${cardioGoal} mins)`
// }

// </Text>

// {/* Gym Days */}

// {step === 0 && (

// <View style={styles.grid}>

// {daysOfWeek.map(day => (

// <TouchableOpacity
// key={day}
// style={[
// styles.dayCard,
// selectedGymDays.includes(day) && styles.selectedCard
// ]}
// onPress={() => toggleGymDay(day)}
// >

// <Text style={styles.dayText}>{day.slice(0,3)}</Text>

// </TouchableOpacity>

// ))}

// </View>

// )}

// {/* Cardio */}

// {step === 1 && (

// <>

// {daysOfWeek.map(day => (

// <View key={day} style={styles.cardioRow}>

// <TouchableOpacity
// style={[
// styles.dayCardSmall,
// cardioPlan[day] !== undefined && styles.selectedCard
// ]}
// onPress={() => toggleCardioDay(day)}
// >

// <Text style={styles.dayText}>{day.slice(0,3)}</Text>

// </TouchableOpacity>

// {cardioPlan[day] !== undefined && (

// <TextInput
// style={styles.minutesInput}
// keyboardType="numeric"
// value={String(cardioPlan[day])}
// onChangeText={(val)=>updateCardioMinutes(day,val)}
// />

// )}

// </View>

// ))}

// <Text style={styles.summary}>
// {totalCardioMinutes} / {cardioGoal} mins
// </Text>

// </>

// )}

// {/* Buttons */}

// <View style={styles.buttonContainer}>

// {step === 1 && (

// <TouchableOpacity
// style={styles.backButton}
// onPress={()=>setStep(0)}
// >

// <Ionicons name="arrow-back-outline" size={20} color="#fff" />
// <Text style={styles.backButtonText}>Back</Text>

// </TouchableOpacity>

// )}

// <TouchableOpacity
// style={styles.nextButton}
// onPress={() => step === 0 ? setStep(1) : savePlan()}
// disabled={step === 1 && totalCardioMinutes !== cardioGoal}
// >

// <LinearGradient
// colors={['#10b981','#059669']}
// style={styles.nextButtonGradient}
// >

// <Text style={styles.nextButtonText}>
// {step === 0 ? 'Next' : 'Save Plan'}
// </Text>

// <Ionicons name="arrow-forward-outline" size={20} color="#fff" />

// </LinearGradient>

// </TouchableOpacity>

// </View>

// </LinearGradient>
// </LinearGradient>

// </View>
// </ScrollView>
// </KeyboardAvoidingView>
// </LinearGradient>
// </View>

// );

// }

// const styles = StyleSheet.create({

// container:{ flex:1 },

// gradientBackground:{ flex:1 },

// scrollContent:{
// flexGrow:1,
// justifyContent:'center',
// paddingVertical:40,
// paddingHorizontal:20
// },

// content:{ flex:1, justifyContent:'center' },

// progressContainer:{ marginBottom:24 },

// progressBar:{
// height:6,
// backgroundColor:'rgba(255,255,255,0.2)',
// borderRadius:3,
// overflow:'hidden',
// marginBottom:8
// },

// progressFill:{
// height:'100%',
// backgroundColor:'#10b981'
// },

// progressText:{
// color:'rgba(255,255,255,0.9)',
// fontWeight:'600',
// textAlign:'center'
// },

// cardOuter:{
// borderRadius:24,
// padding:2
// },

// cardInner:{
// borderRadius:22,
// padding:28,
// backgroundColor:'#0F172A'
// },

// question:{
// fontSize:24,
// fontWeight:'bold',
// color:'#fff',
// textAlign:'center',
// marginBottom:20
// },

// grid:{
// flexDirection:'row',
// flexWrap:'wrap',
// justifyContent:'space-between'
// },

// dayCard:{
// width:'30%',
// aspectRatio:1,
// borderRadius:14,
// backgroundColor:'#1E293B',
// justifyContent:'center',
// alignItems:'center',
// marginBottom:12
// },

// dayCardSmall:{
// width:70,
// height:70,
// borderRadius:14,
// backgroundColor:'#1E293B',
// justifyContent:'center',
// alignItems:'center'
// },

// selectedCard:{
// backgroundColor:'#10b981'
// },

// dayText:{
// color:'#fff',
// fontWeight:'600'
// },

// cardioRow:{
// flexDirection:'row',
// alignItems:'center',
// justifyContent:'space-between',
// marginBottom:14
// },

// minutesInput:{
// backgroundColor:'#1C1F26',
// width:80,
// height:50,
// borderRadius:12,
// paddingHorizontal:12,
// color:'#fff',
// textAlign:'center'
// },

// summary:{
// marginTop:20,
// fontSize:16,
// fontWeight:'600',
// color:'#10b981',
// textAlign:'center'
// },

// buttonContainer:{
// flexDirection:'row',
// gap:12,
// marginTop:24
// },

// backButton:{
// flex:1,
// flexDirection:'row',
// alignItems:'center',
// justifyContent:'center',
// backgroundColor:'#374151',
// paddingVertical:16,
// borderRadius:12,
// gap:8
// },

// backButtonText:{
// color:'#fff',
// fontWeight:'600'
// },

// nextButton:{ flex:1 },

// nextButtonGradient:{
// flexDirection:'row',
// alignItems:'center',
// justifyContent:'center',
// paddingVertical:16,
// borderRadius:12,
// gap:8
// },

// nextButtonText:{
// color:'#fff',
// fontWeight:'bold'
// }

// });