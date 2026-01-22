import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppLayout from './components/AppLayout';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import WorkoutModeScreen from './screens/WorkoutModeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlanYourWeekScreen from './screens/PlanYourWeekScreen';
import CreateMyPlan from './screens/CreateMyPlan'; 
import CreateUserPlan from './screens/CreateUserPlan';
import WeightTrackerScreen from './screens/WeightTrackerScreen';
import SettingsScreen from './screens/SettingsScreen';
import RewardSystemScreen from './screens/RewardSystemScreen';
import AddMacros from './screens/AddMacros';


import { supabase } from './lib/supabase';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function withLayout(Component, title) {
  return (props) => (
    <AppLayout title={title}>
      <Component {...props} />
    </AppLayout>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
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
          else if (route.name === 'ProfileScreen') iconName = focused ? 'person' : 'person-circle-outline';
          else if (route.name === 'PlanYourWeekScreen') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'SettingsScreen') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 70,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 10,
        },
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', color:'#000' },
      })}
    >
      <Tab.Screen name="Home" component={withLayout(HomeScreen, 'Home')} options={{ headerShown: false }} />
      <Tab.Screen name="ProfileScreen" component={withLayout(ProfileScreen, 'ProfileScreen')} options={{ headerShown: false }} />
      <Tab.Screen name="Workouts" component={withLayout(WorkoutsScreen, 'Workouts')} options={{ headerShown: false }} />
      <Tab.Screen name="PlanYourWeekScreen" component={withLayout(PlanYourWeekScreen, 'PlanYourWeekScreen')} options={{ headerShown: false }} />
      <Tab.Screen name="SettingsScreen" component={withLayout(SettingsScreen, 'SettingsScreen')} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CreateUserPlan" component={withLayout(CreateUserPlan, 'CreateUserPlan')} options={{ title: 'Start your Journey' }} />
      <Stack.Screen name="CreateMyPlan" component={withLayout(CreateMyPlan,'CreateMyPlan')} options={{ title: 'Create a Plan' }} />
      <Stack.Screen name="AddMacros" component={withLayout(AddMacros,'AddMacros')} options={{ title: 'Add Macros' }} />
      <Stack.Screen name="PlanYourWeekScreen" component={withLayout(PlanYourWeekScreen,'PlanYourWeekScreen')} options={{ title: 'Create a Plan' }} />
      <Stack.Screen name="WeightTrackerScreen" component={withLayout(WeightTrackerScreen,'WeightTrackerScreen')} options={{ title: 'Track your Weight' }} />
      <Stack.Screen name="WorkoutModeScreen" component={withLayout(WorkoutModeScreen,'WorkoutModeScreen')} options={{ title: 'Workout' }} />
      <Stack.Screen name="RewardSystemScreen" component={withLayout(RewardSystemScreen,'RewardSystemScreen')} options={{ title: 'Your Reward System'}} />
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
      <StatusBar barStyle="light-content" backgroundColor="#0E1116" />
      <NavigationContainer>
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
