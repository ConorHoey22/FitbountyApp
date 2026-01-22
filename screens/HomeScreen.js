import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar ,ActivityIndicator, Image } from 'react-native';
import XPBar from '../components/XPBarLevel';
import { Ionicons } from '@expo/vector-icons';
import TrackerBar from '../components/TrackerBar';
import TodayPlanCard from '../components/TodayPlanCard';
import Card from '../lib/assets/Card';

import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import Divider from '../components/Divider';

const testUser = {
  nutrition: 2000,
  calories:2000,
  protein:130,
  carbs:100,
  fats:10
}


// 🎨 Dark Mode FitBounty Theme
// Background (main dark): #0E1116
// Card / Section background: #1C1F26
// Primary text (white): #FFFFFF
// Secondary text (gray): #A0A3A8
// XP / Progress orange: #FF8A00
// Protein yellow: #FFD43B
// Carbs green: #3DDC97
// Fats blue: #3B82F6
// Accent button orange: #FF8A00
// Accent button blue: #2563EB



export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);


  //Macros Goals 
  const [caloriesGoal , SetCaloriesGoal]  = useState();
  const [proteinGoal , SetProteinGoal]  = useState();
  const [carbohydratesGoal , SetCarbohydratesGoal]  = useState();
  const [fatsGoal , SetFatsGoal]  = useState();


  //Fitness Weekly Goals 
  const [cardioGoal , SetCardioGoal] = useState();
  const [stepsGoal , SetStepsGoal] = useState();
  const [workoutSessionsGoal , SetWorkoutSesssionsGoal] = useState();

  const navigation = useNavigation();


    // This data needs pulled from DB

    const caloriesCurrentAmount = 1000
    const proteinCurrentAmount =  10
    const carbsCurrentAmount =  75
    const fatsCurrentAmount =  5


    //This should be manually entered but not hooked up 
    const cardioWeeklyProgress = 100
    const workoutWeeklyProgress =  1
    const stepsWeeklyProgress =  75








  const images = [
    require('../lib/assets/maleRunning.png')
  ];

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


      // No profile row found — first login
      if (!profileData) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CreateUserPlan' }],
        });
        return;
      }

      // Profile DB Trigger check 
      if (!profileData.UserHasEnteredTheirProfileDataTrigger) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CreateUserPlan' }],
        });
        return;
      }

      // Weekly Plan DB Trigger check 
      if (!profileData.UserHasWeeklyPlanSetup) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PlanYourWeekScreen' }],
        });
        return;
      }


      // If User has Profiledata & Weekly plan setup but not Macros  
      if(profileData.UserHasEnteredTheirProfileDataTrigger && profileData.UserHasEnteredTheirProfileDataTrigger && !profileData.UserHasMacros)
      {
          console.log("User does not have macros");
          navigation.reset({
            index: 0,
            routes: [{ name: 'AddMacros' }],
          });
          return;

      }

      //Get Profile
      setProfile(profileData);
      
      //Macros
      SetCaloriesGoal(profileData.calories);
      SetProteinGoal(profileData.protein);
      SetCarbohydratesGoal(profileData.carbohydrates);
      SetFatsGoal(profileData.fats);

      //Fitness Goals
      SetCardioGoal(profileData.cardioGoal);
      SetStepsGoal(profileData.stepGoal);
      SetWorkoutSesssionsGoal(profileData.workoutSessionsGoal);

    } catch (err) {
      console.error('Home Screen load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  
    load();
  }, []);

  const checkWeeklySetupTrigger = async () => {
    try {
      const profileData = await getProfile();
      if (!profileData.UserHasWeeklyPlanSetup) {
        navigation.reset({ index: 0, routes: [{ name: 'PlanYourWeekScreen' }] });
        return;
      }
      console.log('Weekly Plan already set:', profileData);
    } catch (err) {
      console.error('Weekly setup check error:', err.message);
    }
  };


  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>No profile found</Text>
      </View>
    );
  }

  return (
      <View style={{ flex: 1,  padding:20 }}>
      {/* <StatusBar barStyle="light-content" backgroundColor={theme.bg} /> */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

      {images.map((img, idx) => (
          <Image key={idx} source={img} style={styles.image} resizeMode="contain" />
        ))}
        {/* Card 1  */}
        <Card>
  
        <Text style={styles.title}>Welcome to FitBounty, {profile.first_name || 'Friend'}</Text>
        <Text style={styles.subtitle}>Your fitness journey starts here</Text>
    

        <XPBar currentXP={350} levelXP={500} level={3} />
         
        </Card>


        <View style={styles.headerRow}>
 
  
          <View style={styles.headerLeft}>      
            <Text style={styles.title}>Plan For Today </Text>  
          </View>

          {/* RIGHT COLUMN */}
              <View style={styles.headerRight}>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: "#4C8DFF",
                            backgroundColor: "rgba(76,141,255,0.08)",
                          }}
                          onPress={() => navigation.navigate("AddMacros")}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="options-outline" size={16} color="#4C8DFF" />
                          <Text style={styles.updateButtonText}>Update Plan</Text>
                        </TouchableOpacity>
                      </View>        

        </View>
    
      
      
          <TodayPlanCard profile={profile} />
      
          <View style={styles.headerRow}>

            {/* LEFT COLUMN */}
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Macros</Text>
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#4C8DFF",
                  backgroundColor: "rgba(76,141,255,0.08)",
                }}
                onPress={() => navigation.navigate("AddMacros")}
                activeOpacity={0.7}
              >
                <Ionicons name="options-outline" size={16} color="#4C8DFF" />
                <Text style={styles.updateButtonText}>Update Macros</Text>
              </TouchableOpacity>
            </View>
          </View>

    

       {/* Macros Row 1  */}
       <View style={styles.macrosContainer}>

          <View style={styles.row}>   

              <LinearGradient
                  colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCardOuter}
                >

                  <LinearGradient
                    colors={['#0F172A', '#0F172A']} // accent gradient ring
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardInner}
                  >
  
                      <Text style={styles.cardTitle}>Calories</Text>
                      <Text style={styles.cardValue}>
                        {caloriesCurrentAmount} / {caloriesGoal}
                      </Text>


                      <View style ={{ padding: 5 }}>
                        <TrackerBar
                      
                          currentAmount={caloriesCurrentAmount}
                          totalAmount={caloriesGoal}
                        />
                      </View>
              


                  </LinearGradient>
                </LinearGradient>

              {/* Card 2 */}
              <LinearGradient
                  colors={['#1E293B', '#1E293B']}  // base dark gradient for the card
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCardOuter}
                >

                  <LinearGradient
                    colors={['#0F172A', '#0F172A']} // accent gradient ring
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardInner}
                  >
         
                      <Text style={styles.cardTitle}>Protein</Text>
                      <Text style={styles.cardValue}>
                        {proteinCurrentAmount} / {proteinGoal}
                      </Text>

                      <View style ={{ padding: 5 }}>
                      <TrackerBar
                     
                        currentAmount={proteinCurrentAmount}
                        totalAmount={proteinGoal}
                      />
                      </View>

                  </LinearGradient>
                </LinearGradient>



                
           </View>
   

   {/* Row 2 */}
           <View style={styles.row}>   
           <LinearGradient
                  colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCardOuter}
                >

                  <LinearGradient
                    colors={['#0F172A', '#0F172A']} // accent gradient ring
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardInner}
                  >
   
                      <Text style={styles.cardTitle}>Carbs</Text>
                      <Text style={styles.cardValue}>
                        {carbsCurrentAmount} / {carbohydratesGoal}
                      </Text>

                      <View style ={{ padding: 5 }}>
                      <TrackerBar
                  
                        currentAmount={carbsCurrentAmount}
                        totalAmount={carbohydratesGoal}
                      />
                      </View>
              


                  </LinearGradient> 
                </LinearGradient>
                
                 {/* Card 2 */}
              <LinearGradient
                  colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCardOuter}
                >

                  <LinearGradient
                    colors={['#0F172A', '#0F172A']} // accent gradient ring
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardInner}
                  >
                  
                      <Text style={styles.cardTitle}>Fats</Text>
                      <Text style={styles.cardValue}>
                        {fatsCurrentAmount} / {fatsGoal}
                      </Text>

                      <View style ={{ padding: 5 }}>
                      <TrackerBar
             
                        currentAmount={fatsCurrentAmount}
                        totalAmount={fatsGoal}
                      />
                      </View>
              


                  </LinearGradient>
                </LinearGradient>

            </View>

          </View>

   



          <View style={styles.headerRow}>

              {/* LEFT COLUMN */}
              <View style={styles.headerLeft}>
                <Text style={styles.title}>Weekly Goals</Text> 
              </View>
                 {/* RIGHT COLUMN */}
                 <View style={styles.headerRight}>
                 <TouchableOpacity
                  style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#4C8DFF",
                  backgroundColor: "rgba(76,141,255,0.08)",
                }}
                onPress={() => navigation.navigate("AddMacros")}
                activeOpacity={0.7}
              >
                <Ionicons name="options-outline" size={16} color="#4C8DFF" />
                <Text style={styles.updateButtonText}>Update Goals</Text>
              </TouchableOpacity>
            </View>
         
          </View>
       
        <View style={styles.macrosContainer}>
        <View style={styles.row}>   
      
                  <LinearGradient
                    colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardOuter}
                  >

                        <LinearGradient
                          colors={['#0F172A', '#0F172A']} // accent gradient ring
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientCardInner}
                        >
                        <Ionicons name="bicycle-outline" size={28} color="#fff" />
                          <Text style={styles.cardTitle}>Cardio</Text>

                          {/* DB data here needed */}
                     
                          <Text style={styles.cardValue}>{cardioWeeklyProgress} <Text style={styles.cardValue}> / {cardioGoal}</Text></Text>

                          <View style ={{ padding: 5 }}>

                            <TrackerBar
                 
                              currentAmount={cardioWeeklyProgress}
                              totalAmount={cardioGoal}
                            />

                          </View>


                        </LinearGradient>

                  </LinearGradient>


                  <LinearGradient
                    colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardOuter}
                  >

                        <LinearGradient
                          colors={['#0F172A', '#0F172A']}  // accent gradient ring
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientCardInner}
                        >
                          <Ionicons name="gift-outline" size={28} color="#fff" />
                            <Text style={styles.cardTitle}>Weekly Rewards</Text>
                            <Text style={styles.cardValue}>{workoutWeeklyProgress} <Text style={styles.cardValue}> / {workoutSessionsGoal}</Text></Text>



                          <View style ={{ padding: 5 }}>

                            <TrackerBar              
                           
                            currentAmount={workoutWeeklyProgress} totalAmount={workoutSessionsGoal} />

                          </View>
                    
                        </LinearGradient>
                        
                        </LinearGradient> 

                  </View>


                  <View style={styles.row}>   

                    <LinearGradient
                      colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientCardOuter}
                    >

                          <LinearGradient
                            colors={['#0F172A', '#0F172A']} // accent gradient ring
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientCardInner}
                          >
                          <Ionicons name="footsteps-outline" size={28} color="#fff" />
                            <Text style={styles.cardTitle}>Steps</Text>
                           
                            <Text style={styles.cardValue}>{stepsWeeklyProgress} <Text style={styles.cardValue}> / {stepsGoal}</Text></Text>
                      

                            <View style ={{ padding: 5 }}>

                              <TrackerBar         
                            
                                currentAmount={stepsWeeklyProgress} totalAmount={stepsGoal}
                              />

                            </View>

                            </LinearGradient> 

                    </LinearGradient> 


                  <LinearGradient
                    colors={['#1E293B', '#1E293B']} // base dark gradient for the card
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCardOuter}
                  >

                        <LinearGradient
                          colors={['#0F172A', '#0F172A']} // accent gradient ring
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientCardInner}
                        >
                          <Ionicons name="barbell-outline" size={28} color="#fff" />
                            <Text style={styles.cardTitle}>Workouts</Text>
                            <Text style={styles.cardValue}>{workoutWeeklyProgress} <Text style={styles.cardValue}> / {workoutSessionsGoal}</Text></Text>


                        <View style ={{ padding: 5 }}>
                          <TrackerBar      
                         
                              currentAmount={workoutWeeklyProgress} totalAmount={workoutSessionsGoal} />

                        </View>
                        
                        </LinearGradient>
                        
                        </LinearGradient> 
                
                  </View>

         

                  </View>


        {/* Quick Actions */}
  


        <View>
          {/* Update button */}
           <TouchableOpacity
            style={[styles.button, styles.updateButton]}
            onPress={() => navigation.navigate('PlanYourWeekScreen')}
          >
            <Ionicons name="gift-outline" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}> Reward System</Text>
          </TouchableOpacity>
        </View> 

        <View>
          
           <TouchableOpacity 
              style={[styles.button, styles.updateButton]}
              onPress={() => navigation.navigate('WeightTrackerScreen')}>

             <Ionicons name="bar-chart-outline" size={22} color= "#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}> View Progress</Text>
          </TouchableOpacity> 
         </View>



         {/* </View>  */}

      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1116',
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop:10
  },
  
  headerLeft: {
    flex: 1,              // 👈 takes remaining space
  },
  
  headerRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4C8DFF",
  },
  
  updateButtonText: {
    color: "#4C8DFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  
  
  
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  
  rowCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // optional, RN 0.71+
  },

  rowCardNoBackground: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  

  // Titles
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'transparent',
    opacity: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  rowCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSide: {
    flexDirection: 'column',
  },

  subtitle: {
    fontSize: 16,
    color: '#A0A3A8',
    fontWeight: '500',
    marginTop: 2,
  },
  primaryTextColor: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'transparent',
    opacity: 1,
  },
  secondaryTextColor: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    marginTop: 4,
  },

  blackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 18,
  },

  // Image
  image: {
    width: '100%',
    height: 120,
    marginBottom: -10,
  },

  // Cards
  statCardCompact: {
    flex: 1,
    backgroundColor: '#1C1F26',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: 'transparent', // no glow
  },
  WeeklyFitnessCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },

  // Labels and text
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginVertical: 6,
  },
  boldBlackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#A0A3A8',
    marginBottom: 10,
  },

  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },

  trackerWrap: {
    marginTop: 6,
  },

  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 6,
  },
  updateButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 6,
  },

  // Loading center
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E1116',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  macrosContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#0B1120', // deep dark blue/black
    borderRadius: 16,
    flex: 1,
  },
  
  gradientCardOuter: {
    width: '48%', // two per row
    borderRadius: 16,
    padding: 2,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  
  gradientCardInner: {
    borderRadius: 14,
    paddingVertical: 10, // smaller height
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#1C1F26',
    minHeight: 110, // adjust height of each card
  },
  
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  
  cardValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 4,
  },
});
