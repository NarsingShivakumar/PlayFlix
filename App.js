// App.js - UPDATED WITH PERMISSION HANDLING

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, LogBox, ActivityIndicator, View } from 'react-native';
import { store, persistor } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import PermissionScreen from './src/screens/PermissionScreen';
import permissionService from './src/services/permissionService';

// Ignore specific warnings
LogBox.ignoreLogs(['new NativeEventEmitter']);

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check if permissions are already granted
      const hasPermission = await permissionService.checkStoragePermission();
      
      if (hasPermission) {
        setPermissionsGranted(true);
      } else {
        // Request permissions on first launch
        const granted = await permissionService.requestStoragePermission();
        setPermissionsGranted(granted);
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setPermissionsGranted(false);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const handlePermissionGranted = () => {
    setPermissionsGranted(true);
  };

  // Loading state while checking permissions
  if (checkingPermissions) {
    return (
      <View style={{ flex: 1, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  // Show permission screen if not granted
  if (!permissionsGranted) {
    return <PermissionScreen onPermissionGranted={handlePermissionGranted} />;
  }

  // Main app with permissions granted
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#000000"
            translucent
          />
          <RootNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
