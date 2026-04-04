import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getProfile } from '../lib/GetProfile';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import XPBar from '../components/XPBarLevel';
import TrackerBar from '../components/TrackerBar';
import TodayPlanCard from '../components/TodayPlanCard';
import Card from '../lib/assets/Card';
import Divider from '../components/Divider';
import AddMacrosModal from '../components/AddMacrosModal';
import AddTodayPlanModal from '../components/AddTodayPlanModal';


export default function Home() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);



    const [profile, setProfile] = useState(null);



  //Macros Goals  - Pulled from Database 
  const [caloriesGoal , SetCaloriesGoal]  = useState();
  const [proteinGoal , SetProteinGoal]  = useState();
  const [carbohydratesGoal , SetCarbohydratesGoal]  = useState();
  const [fatsGoal , SetFatsGoal]  = useState();


  // Total Consusumed amounts  - Manually enter or fitnesspal in future
  const [caloriesConsumed, SetCaloriesConsumed] = useState(0);
  const [proteinConsumed, SetProteinConsumed] = useState(0);
  const [carbohydratesConsumed, SetCarbohydratesConsumed] = useState(0);
  const [fatsConsumed, SetFatsConsumed] = useState(0);


  //Fitness Weekly Goals 
  const [cardioGoal , SetCardioGoal] = useState();
  const [stepsGoal , SetStepsGoal] = useState();
  const [workoutSessionsGoal , SetWorkoutSesssionsGoal] = useState();

  //Modal - AddMacros

  const [macrosModalVisible, setMacrosModalVisible] = useState(false);




 

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
    <View style={styles.container}>
    <StatusBar barStyle="light-content" /> 
    
    {/* Natural Gradient Background - Deep Blue/Teal */}
    <LinearGradient
      colors={['#1e3a8a', '#0f766e', '#065f46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >

        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header with Natural Icon */}
              <View style={styles.header}>
             
                    
              <Text style={styles.title}>Welcome to Fit-Bounty, {profile.first_name || 'Friend'}</Text> 
              <Text style={styles.subtitle}>Your fitness journey starts here</Text>
            
                <XPBar currentXP={350} levelXP={500} level={3} />


              </View>

              <TodayPlanCard profile={profile} />

{/* Macros Row 1  */}

    <View style={styles.cardContainer}>      
          <View style={styles.cardHeader}>
          <Text style={styles.actionText}> Nutrition Plan </Text>  
    </View>




<View style={styles.macrosContainer}>

  {/* Row 1 */}
  <View style={styles.row}>   

    {/* Card 1 */}
    <LinearGradient
      colors={['#1E293B', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCardOuter}
    >
      <LinearGradient
        colors={['#0F172A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCardInner}
      >
        <Text style={styles.cardTitle}>Calories</Text>
        <Text style={styles.cardValue}>
          {caloriesConsumed} / {caloriesGoal}
        </Text>
        <TrackerBar
          currentAmount={caloriesConsumed}
          totalAmount={caloriesGoal}
          size={40}         // smaller
          strokeWidth={4}   // thinner
        />
      </LinearGradient>
    </LinearGradient>

    {/* Card 2 */}
    <LinearGradient
      colors={['#1E293B', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCardOuter}
    >
      <LinearGradient
        colors={['#0F172A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCardInner}
      >
        <Text style={styles.cardTitle}>Protein</Text>
        <Text style={styles.cardValue}>
          {proteinConsumed} / {proteinGoal}
        </Text>
        <TrackerBar
          currentAmount={proteinConsumed}
          totalAmount={proteinGoal}
          size={40}
          strokeWidth={4}
        />
      </LinearGradient>
    </LinearGradient>

  </View>

  {/* Row 2 */}
  <View style={styles.row}>   

    {/* Card 3 */}
    <LinearGradient
      colors={['#1E293B', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCardOuter}
    >
      <LinearGradient
        colors={['#0F172A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCardInner}
      >
        <Text style={styles.cardTitle}>Carbs</Text>
        <Text style={styles.cardValue}>
          {carbohydratesConsumed} / {carbohydratesGoal}
        </Text>
        <TrackerBar
          currentAmount={carbohydratesConsumed}
          totalAmount={carbohydratesGoal}
          size={40}
          strokeWidth={4}
        />
      </LinearGradient> 
    </LinearGradient>

    {/* Card 4 */}
    <LinearGradient
      colors={['#1E293B', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientCardOuter}
    >
      <LinearGradient
        colors={['#0F172A', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCardInner}
      >
        <Text style={styles.cardTitle}>Fats</Text>
        <Text style={styles.cardValue}>
          {fatsConsumed} / {fatsGoal}
        </Text>
        <TrackerBar
          currentAmount={fatsConsumed}
          totalAmount={fatsGoal}
          size={40}
          strokeWidth={4}
        />
      </LinearGradient>
    </LinearGradient>

  </View>


  <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setMacrosModalVisible(true)}
        >
          <Ionicons name="add-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('UpdateMacrosPlan')}
        >
        <Ionicons name="options-outline"size={18} color="#fff" />
          <Text style={styles.actionText}>Update Macros Plan</Text>
        </TouchableOpacity>
      </View>

</View>


              </View>

 

    
</View>
              </ScrollView>

              </KeyboardAvoidingView>


              <AddMacrosModal
                visible={macrosModalVisible}

                caloriesConsumed={caloriesConsumed}
                proteinConsumed={proteinConsumed}
                carbohydratesConsumed={carbohydratesConsumed}
                fatsConsumed={fatsConsumed}
              
                setCaloriesConsumed={SetCaloriesConsumed}
                setProteinConsumed={SetProteinConsumed}
                setCarbohydratesConsumed={SetCarbohydratesConsumed}
                setFatsConsumed={SetFatsConsumed}
              
                onClose={() => setMacrosModalVisible(false)}
              />



           



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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  content: { flex: 1, backgroundColor: '#0000' },


  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  iconText: {
    fontSize: 45,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  cardOuter: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  cardInner: {
    borderRadius: 22,
    padding: 28,
    backgroundColor: '#0F172A',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#A0A3A8',
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: '#1C1F26',
    borderRadius: 14,
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
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  loginButtonWrapper: {
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#A0A3A8',
    fontSize: 14,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  socialButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '500',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },


    headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop:10
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerRight: {
    justifyContent: "center",
    alignItems: "flex-end",
  },

  macrosContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gradientCardOuter: {
    borderRadius: 12,
    padding: 2,
    flex: 1, // cards share space
    marginHorizontal: 4,
  },
  gradientCardInner: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 11,
    color: '#CBD5E1',
    marginBottom: 4,
  },

  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
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
    marginTop:10
  },

  cardHeader:
  {
    marginBottom:10
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


