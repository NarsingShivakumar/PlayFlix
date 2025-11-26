// src/navigation/RootNavigator.js

import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
// Screens
import FoldersScreen from '../screens/FoldersScreen';
import VideosScreen from '../screens/VideosScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import DriveFoldersScreen from '../screens/DriveFoldersScreen';
import DriveVideosScreen from '../screens/DriveVideosScreen';
import DriveVideoPlayerScreen from '../screens/DriveVideoPlayerScreen';

// Components
import DrawerContent from '../components/DrawerContent';

// Redux
import { restoreDriveSession } from '../store/slices/driveSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Local Videos Stack Navigator
const LocalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="LocalFolders"
        component={FoldersScreen}
        options={{ title: 'Local Videos' }}
      />
      <Stack.Screen
        name="LocalVideos"
        component={VideosScreen}
        options={{ title: 'Videos' }}
      />
    </Stack.Navigator>
  );
};

// Drive Videos Stack Navigator
const DriveStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="DriveFolders"
        component={DriveFoldersScreen}
        options={{ title: 'Drive Videos' }}
      />
      <Stack.Screen
        name="DriveVideos"
        component={DriveVideosScreen}
        options={{ title: 'Drive Videos' }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator
const TabNavigator = () => {
  const isDark = useSelector((state) => state.settings.theme) === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'LocalTab') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'DriveTab') {
            iconName = focused ? 'cloud' : 'cloud-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: isDark ? '#B3B3B3' : '#666666',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
          borderTopColor: isDark ? '#2D2D2D' : '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="LocalTab"
        component={LocalStack}
        options={{
          title: 'Local',
          tabBarLabel: 'Local Videos',
        }}
      />
      <Tab.Screen
        name="DriveTab"
        component={DriveStack}
        options={{
          title: 'Drive',
          tabBarLabel: 'Google Drive',
        }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator (wraps the tabs)
const DrawerNavigator = () => {
  const isDark = useSelector((state) => state.settings.theme) === 'dark';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: isDark ? '#141414' : '#FFFFFF',
          width: 280,
        },
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{ title: 'Home' }}
      />
    </Drawer.Navigator>
  );
};

// Root Navigator (includes video player as modal)
const RootNavigator = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const isDark = theme === 'dark';
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#E50914',
      background: isDark ? '#141414' : '#FFFFFF',
      card: isDark ? '#1F1F1F' : '#F5F5F5',
      text: isDark ? '#FFFFFF' : '#000000',
      border: isDark ? '#2D2D2D' : '#E0E0E0',
      notification: '#E50914',
    },
  };

  // Restore Google Drive session on app start
  useEffect(() => {
    dispatch(restoreDriveSession());
  }, [dispatch]);

  return (
    <SafeAreaView style={{flex:1 }} >
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Main App with Drawer and Tabs */}
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
        />

        {/* Video Player (Full Screen Modal) */}
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            animation: 'fade',
            presentation: 'fullScreenModal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="DriveVideoPlayer"
          component={DriveVideoPlayerScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  );
};

export default RootNavigator;
