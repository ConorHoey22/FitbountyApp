import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import ProfileScreen from './screens/ProfileScreen';
import PlanYourWeekScreen from './screens/PlanYourWeekScreen';
import CreateMyPlan from './screens/CreateMyPlan'; 
import CreateUserPlan from './screens/CreateUserPlan';
import WeightTrackerScreen from './screens/WeightTrackerScreen';
import SettingsScreen from './screens/SettingsScreen';

import { supabase } from './lib/supabase';
import RewardSystemScreen from './screens/RewardSystemScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'ProfileScreen') {
            iconName = focused ? 'person' : 'person-circle-outline';
          } else if (route.name === 'PlanYourWeekScreen') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'SettingsScreen') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
    
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 70,             // controls total height
          paddingBottom: 6,       // small, keeps text/icons off the edge
          paddingTop: 6,          // keeps icons from being too high
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 10,        // pulls text slightly up
        },
        headerStyle: { backgroundColor: '#0B1220' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profile' ,headerShown: false }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="PlanYourWeekScreen" component={PlanYourWeekScreen} options={{ title: 'Your Plan' }} />
      <Tab.Screen name="SettingsScreen" component={SettingsScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}

// 👇 This stack wraps your tabs and adds extra routes
function AppStack() {
  return (
    <Stack.Navigator>
      {/* Tabs go first */}
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ headerShown: false }} // hide header for tabs
      />

      {/* Extra screens not in bottom tab */}
      <Stack.Screen
        name="CreateUserPlan"
        component={CreateUserPlan}
        options={{ title: 'Start your Journey' }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'FitBounty' }}
      />
       <Stack.Screen
        name="CreateMyPlan"
        component={CreateMyPlan}
        options={{ title: 'Create a Plan' }}
      />
        <Stack.Screen
        name="PlanYourWeekScreen"
        component={PlanYourWeekScreen}
        options={{ title: 'Create a Plan' }}
      />
       <Stack.Screen
        name="WeightTrackerScreen"
        component={WeightTrackerScreen}
        options={{ title: 'Track your Weight' }}
      />
       <Stack.Screen
        name="RewardSystemScreen"
        component={RewardSystemScreen}
        options={{ title: 'Your Reward System'}}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(!!data?.session);
      setIsCheckingSession(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (isCheckingSession) return null;

  return (
    <NavigationContainer>
      {hasSession ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}