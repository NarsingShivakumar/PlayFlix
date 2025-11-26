// src/navigation/MainTabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSelector } from 'react-redux';

// Screens
import FoldersScreen from '../screens/FoldersScreen';
import DriveFoldersScreen from '../screens/DriveFoldersScreen';
import DrawerContent from '../components/DrawerContent';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Tab Navigator
const TabNavigator = () => {
  const isDark = useSelector((state) => state.settings.theme) === 'dark';
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'LocalVideos') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'DriveVideos') {
            iconName = focused ? 'cloud' : 'cloud-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: isDark ? '#B3B3B3' : '#666666',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D2D' : '#E0E0E0',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="LocalVideos" 
        component={FoldersScreen}
        options={{ title: 'Local' }}
      />
      <Tab.Screen 
        name="DriveVideos" 
        component={DriveFoldersScreen}
        options={{ title: 'Drive' }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator with Drawer
const MainNavigator = () => {
  const isDark = useSelector((state) => state.settings.theme) === 'dark';
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: isDark ? '#141414' : '#FFFFFF',
        },
      }}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

export default MainNavigator;
