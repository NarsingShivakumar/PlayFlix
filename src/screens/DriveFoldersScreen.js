// src/screens/DriveFoldersScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { signInToDrive, loadDriveFolders } from '../store/slices/driveSlice';

const DriveFoldersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, folders, loading, user } = useSelector((state) => state.drive);
  const isDark = useSelector((state) => state.settings.theme) === 'dark';
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFolders();
    }
  }, [isAuthenticated]);

  const loadFolders = async () => {
    try {
      await dispatch(loadDriveFolders()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load folders. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFolders();
    setRefreshing(false);
  };

  const handleSignIn = async () => {
    try {
      await dispatch(signInToDrive()).unwrap();
    } catch (error) {
      Alert.alert(
        'Sign In Failed',
        error.message || 'Failed to sign in. Please try again.'
      );
    }
  };

  const handleFolderPress = (folder) => {
    navigation.navigate('DriveVideos', {
      folderId: folder.id,
      folderName: folder.name,
    });
  };

  const renderFolder = ({ item }) => (
    <TouchableOpacity
      style={[styles.folderCard, isDark && styles.folderCardDark]}
      onPress={() => handleFolderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.folderIcon}>
        <Ionicons name="folder" size={40} color="#E50914" />
      </View>
      
      <View style={styles.folderInfo}>
        <Text style={[styles.folderName, isDark && styles.textDark]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.folderDate, isDark && styles.textSecondaryDark]}>
          Modified: {new Date(item.modifiedTime).toLocaleDateString()}
        </Text>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={24} 
        color={isDark ? '#B3B3B3' : '#666666'} 
      />
    </TouchableOpacity>
  );

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Google Drive</Text>
          
          <View style={styles.placeholder} />
        </View>

        {/* Sign In Prompt */}
        <View style={styles.centerContent}>
          <Ionicons name="cloud-offline-outline" size={80} color="#E50914" />
          <Text style={[styles.promptTitle, isDark && styles.textDark]}>
            Connect to Google Drive
          </Text>
          <Text style={[styles.promptSubtitle, isDark && styles.textSecondaryDark]}>
            Sign in to access your videos from Google Drive
          </Text>
          
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                <Text style={styles.signInButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Authenticated view
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()}
          style={styles.menuButton}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Drive Folders</Text>
        
        <TouchableOpacity 
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      {user && (
        <View style={[styles.userBanner, isDark && styles.userBannerDark]}>
          <Ionicons name="person-circle" size={32} color="#E50914" />
          <Text style={[styles.userEmail, isDark && styles.textDark]}>
            {user.data?.user.email}
          </Text>
        </View>
      )}

      {/* Folders List */}
      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            Loading folders...
          </Text>
        </View>
      ) : folders.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="folder-open-outline" size={80} color="#666666" />
          <Text style={[styles.emptyText, isDark && styles.textDark]}>
            No folders found
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
            Create folders in Google Drive to organize your videos
          </Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={renderFolder}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E50914"
              colors={['#E50914']}
            />
          }
        />
      )}
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  headerDark: {
    backgroundColor: '#1F1F1F',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  userBannerDark: {
    backgroundColor: '#1F1F1F',
    borderBottomColor: '#2D2D2D',
  },
  userEmail: {
    fontSize: 14,
    color: '#000000',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 24,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 32,
    gap: 12,
    minWidth: 200,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderCardDark: {
    backgroundColor: '#1F1F1F',
  },
  folderIcon: {
    marginRight: 16,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  folderDate: {
    fontSize: 12,
    color: '#666666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#B3B3B3',
  },
});

export default DriveFoldersScreen;
