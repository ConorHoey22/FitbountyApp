import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLayout from './components/AppLayout';
import { Ionicons } from '@expo/vector-icons';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import Home from './screens/Home';
import WorkoutsScreen from './screens/WorkoutsScreen';
import WorkoutModeScreen from './screens/WorkoutModeScreen';
import MyHealthScreen from './screens/MyHealthScreen';
import PlanYourWeekScreen from './screens/PlanYourWeekScreen';
import CreateMyPlan from './screens/CreateMyPlan'; 
import CreateUserPlan from './screens/CreateUserPlan';
import WeightTrackerScreen from './screens/WeightTrackerScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreateWorkoutScreen from './screens/CreateWorkoutScreen';
import PRScreen from './screens/PRScreen';
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

// Bottom tab icons (always filled)
const TAB_ICONS = {
  Home: 'home',
  MyHealth: 'heart',
  Rewards: 'gift',
  Workouts: 'fitness',
  PlanYourWeekScreen: 'calendar',
};

const TAB_ACTIVE = '#0A84FF';   // iOS system blue
const TAB_INACTIVE = '#8E8E93'; // iOS system grey

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
  // Which tab screen is showing — Workout Mode is a hidden tab, so the Workouts
  // icon is lit manually while it's open
  // (Screens are passed directly, not via withLayout(), so this state change
  // doesn't create new components and remount them.)
  const [focusedTab, setFocusedTab] = useState('Home');

  return (
    <Tab.Navigator
      screenListeners={({ route }) => ({
        focus: () => setFocusedTab(route.name),
      })}
      screenOptions={({ route }) => ({
        // Standard iOS tab bar (dark) — system blue active, system grey inactive
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] || 'ellipse'} size={size} color={color} />
        ),
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#2C2C2E' },

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
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="MyHealth" component={MyHealthScreen} options={{ headerShown: false , tabBarLabel: 'My Health' }} />
      <Tab.Screen name="Rewards" component={RewardSystemScreen} options={{ headerShown: false , tabBarLabel: 'Rewards'}} />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          headerShown: false,
          // Show Workouts as selected while Workout Mode is open. The tab bar takes
          // its tint colours from the focused screen (Workout Mode), so the icon
          // and label colour are set here per tab instead.
          ...(focusedTab === 'WorkoutModeScreen' && {
            tabBarIcon: ({ size }) => <Ionicons name={TAB_ICONS.Workouts} size={size} color={TAB_ACTIVE} />,
            tabBarLabelStyle: { color: TAB_ACTIVE },
          }),
        }}
      />
      <Tab.Screen name="PlanYourWeekScreen" component={PlanYourWeekScreen} options={{ headerShown: false , tabBarLabel: 'Planner'}} />

      <Tab.Screen name="UpdateMacrosPlan" component={UpdateMacrosPlan} options={{ headerShown: false ,tabBarButton: () => null }} />
      <Tab.Screen name="WorkoutModeScreen" component={WorkoutModeScreen} options={{ headerShown:false, tabBarButton: () => null }} />
      
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
      <Stack.Screen name="CreateWorkoutScreen" component={CreateWorkoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PRScreen" component={PRScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SettingsScreen" component={withLayout(SettingsScreen,'SettingsScreen')} options={{ headerShown: false }} />
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

  return (
    <SafeAreaProvider>

      <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Logo loading screen (no animation) while the session check runs */}
        {isCheckingSession ? (
          <LoadingScreen />
        ) : (
          <NavigationContainer theme={MyDarkTheme}>
            {hasSession ? <AppStack /> : <AuthStack />}
          </NavigationContainer>
        )}

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: '#0E1116',
  },
});
