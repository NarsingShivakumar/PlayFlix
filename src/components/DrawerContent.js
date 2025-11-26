// src/components/DrawerContent.js - COMPLETE FIX

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { signInToDrive, signOutFromDrive } from '../store/slices/driveSlice';

const DrawerContent = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.drive);
  const isDark = useSelector((state) => state.settings.theme) === 'dark';

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInToDrive()).unwrap();
      Alert.alert('Success', 'Signed in successfully!');
      navigation.closeDrawer();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await dispatch(signOutFromDrive()).unwrap();
              Alert.alert('Success', 'Signed out successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  // BULLETPROOF user data extraction
  const getUserData = () => {
    if (!user) return { photo: null, name: 'User', email: '' };
    
    // Handle different possible structures
    const userData = user.data?.user || user.user || user;
    
    return {
      photo: userData?.photo || null,
      name: userData?.name || 'User',
      email: userData?.email || '',
    };
  };

  const { photo, name, email } = getUserData();

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Ionicons name="videocam" size={40} color="#FFFFFF" />
        <Text style={styles.appName}>PlayFlix</Text>
      </View>

      {/* Google Drive Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textSecondaryDark]}>
          GOOGLE DRIVE
        </Text>

        {isAuthenticated ? (
          <View style={styles.userSection}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
            )}
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isDark && styles.textDark]}>
                {name}
              </Text>
              {email ? (
                <Text style={[styles.userEmail, isDark && styles.textSecondaryDark]}>
                  {email}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleGoogleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color="#E50914" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleGoogleSignIn}
          >
            <Ionicons name="logo-google" size={24} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Menu */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textSecondaryDark]}>
          NAVIGATION
        </Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('HomeTabs', { screen: 'LocalTab' });
            navigation.closeDrawer();
          }}
        >
          <Ionicons
            name="folder-outline"
            size={24}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.menuText, isDark && styles.textDark]}>
            Local Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate('HomeTabs', { screen: 'DriveTab' });
            navigation.closeDrawer();
          }}
        >
          <Ionicons
            name="cloud-outline"
            size={24}
            color={isDark ? '#FFFFFF' : '#000000'}
          />
          <Text style={[styles.menuText, isDark && styles.textDark]}>
            Google Drive
          </Text>
          {isAuthenticated && (
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.appVersion, isDark && styles.textSecondaryDark]}>
          PlayFlix v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#141414',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#E50914',
    alignItems: 'center',
  },
  headerDark: {
    backgroundColor: '#1F1F1F',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  userEmail: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  signOutButton: {
    padding: 8,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  connectedBadge: {
    marginLeft: 'auto',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  appVersion: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#B3B3B3',
  },
});

export default DrawerContent;
