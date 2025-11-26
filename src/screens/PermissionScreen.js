// src/screens/PermissionScreen.js

/**
 * Permission Screen
 * Shows when permissions are not granted
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import permissionService from '../services/permissionService';

const PermissionScreen = ({ onPermissionGranted }) => {
  const handleRequestPermission = async () => {
    const granted = await permissionService.requestStoragePermission();
    
    if (granted) {
      onPermissionGranted();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="folder-open-outline" size={100} color="#E50914" />
        
        <Text style={styles.title}>Storage Access Required</Text>
        
        <Text style={styles.description}>
          FlixStream needs permission to access your device storage to scan and play your videos.
        </Text>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.permissionText}>View your videos</Text>
          </View>
          
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.permissionText}>Play media files</Text>
          </View>
          
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.permissionText}>Create playlists</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Your privacy is important. We only access media files, not personal data.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#B3B3B3',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionList: {
    width: '100%',
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PermissionScreen;