import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLayout from './components/AppLayout';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import Home from './screens/Home';
import WorkoutsScreen from './screens/WorkoutsScreen';
import WorkoutModeScreen from './screens/WorkoutModeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlanYourWeekScreen from './screens/PlanYourWeekScreen';
import CreateMyPlan from './screens/CreateMyPlan'; 
import CreateUserPlan from './screens/CreateUserPlan';
import WeightTrackerScreen from './screens/WeightTrackerScreen';
import SettingsScreen from './screens/SettingsScreen';
import RewardSystemScreen from './screens/RewardSystemScreen';



import { supabase } from './lib/supabase';
import UpdateMacrosPlan from './screens/UpdateMacrosPlan';


const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0E1116',
    card: '#121826',
    border: '#1F2937',
    text: '#FFFFFF',
    primary: '#4CAF50',
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function withLayout(Component, title) {
  return (props) => (
    // <AppLayout title={title}>
      <Component {...props} />
    /* </AppLayout> */
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Workouts') iconName = focused ? 'fitness' : 'fitness-outline';
          else if (route.name === 'Rewards') iconName = focused ? 'gift' : 'gift-outline';
          else if (route.name === 'ProfileScreen') iconName = focused ? 'person' : 'person-circle-outline';
          else if (route.name === 'PlanYourWeekScreen') iconName = focused ? 'calendar' : 'calendar-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#C6FF00', // lime green
        tabBarInactiveTintColor: '#ffffff',
        
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: '#1A1A1A',
          height: 75,          // increase height
          paddingBottom: 10,   // pushes content up
          paddingTop: 8,
        },
        
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginBottom: 4,     // moves text upward
        },
        
        headerStyle: {
          backgroundColor: '#000000',
        },
        
        headerTintColor: '#C6FF00',
        
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontSize: 20,
        },
      })}
    >
      <Tab.Screen name="Home" component={withLayout(Home, 'Home')} options={{ headerShown: false }} />
      <Tab.Screen name="ProfileScreen" component={withLayout(ProfileScreen, 'ProfileScreen')} options={{ headerShown: false , tabBarLabel: 'Profile' }} />
      <Tab.Screen name="Rewards" component={withLayout(RewardSystemScreen, 'Rewards')} options={{ headerShown: false , tabBarLabel: 'Rewards'}} />
      <Tab.Screen name="Workouts" component={withLayout(WorkoutsScreen, 'Workouts')} options={{ headerShown: false }} />
      <Tab.Screen name="PlanYourWeekScreen" component={withLayout(PlanYourWeekScreen, 'PlanYourWeekScreen')} options={{ headerShown: false , tabBarLabel: 'Planner'}} />

      <Tab.Screen name="UpdateMacrosPlan" component={withLayout(UpdateMacrosPlan, 'UpdateMacrosPlan')} options={{ headerShown: false ,tabBarButton: () => null }} />
      <Tab.Screen name="WorkoutModeScreen" component={withLayout(WorkoutModeScreen,'WorkoutModeScreen')} options={{ headerShown:false, tabBarButton: () => null }} />
      
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CreateUserPlan" component={withLayout(CreateUserPlan, 'CreateUserPlan')} options={{ title: 'Start your Journey' }} />
      <Stack.Screen name="CreateMyPlan" component={withLayout(CreateMyPlan,'CreateMyPlan') }options={{ headerShown: false }} />
      <Stack.Screen
          name="UpdateMacrosPlan"
          component={UpdateMacrosPlan}
          options={{ headerShown: false }} 
        />
      <Stack.Screen name="PlanYourWeekScreen" component={withLayout(PlanYourWeekScreen,'PlanYourWeekScreen')} options={{ title: 'Create a Plan' }} />
      <Stack.Screen name="WeightTrackerScreen" component={withLayout(WeightTrackerScreen,'WeightTrackerScreen')} options={{ title: 'Track your Weight' }} />

      <Stack.Screen name="RewardSystemScreen" component={withLayout(RewardSystemScreen,'RewardSystemScreen')} options={{ title: 'Your Reward System'}} />
      <Stack.Screen name="SettingsScreen" component={withLayout(SettingsScreen,'SettingsScreen')} options={{ title: 'Settings'}} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Initial session check
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(!!data?.session);
      setIsCheckingSession(false);
    };
    init();

    // Auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore SIGNED_UP events to prevent auto-navigation to Home
      if (_event === 'SIGNED_UP') return;
      setHasSession(!!session);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (isCheckingSession) return null;

  return (
    <SafeAreaProvider>

      <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <NavigationContainer theme={MyDarkTheme}>
          {hasSession ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
        
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: '#0E1116',
  },
});
