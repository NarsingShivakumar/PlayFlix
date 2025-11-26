// src/services/permissionService.js

/**
 * Permission Service
 * Handles all app permissions with proper Android 13+ support
 */

import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

class PermissionService {
  /**
   * Check if storage permission is granted
   */
  async checkStoragePermission() {
    if (Platform.OS === 'ios') {
      return true; // iOS doesn't need explicit permission for app documents
    }

    const apiLevel = Platform.Version;
    console.log('Android API Level:', apiLevel);

    // Android 13+ (API 33+) - New permissions
    if (apiLevel >= 33) {
      try {
        const videoPermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
        const audioPermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);

        return (
          videoPermission === RESULTS.GRANTED &&
          audioPermission === RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Error checking Android 13+ permissions:', error);
        return false;
      }
    }

    // Android 12 and below
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted;
    } catch (error) {
      console.error('Error checking storage permission:', error);
      return false;
    }
  }

  /**
   * Request storage permission
   */
  async requestStoragePermission() {
    if (Platform.OS === 'ios') {
      return true;
    }

    const apiLevel = Platform.Version;

    // Android 13+ (API 33+)
    if (apiLevel >= 33) {
      try {
        const videoPermission = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
        const audioPermission = await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);

        if (
          videoPermission === RESULTS.GRANTED &&
          audioPermission === RESULTS.GRANTED
        ) {
          return true;
        }

        if (
          videoPermission === RESULTS.BLOCKED ||
          audioPermission === RESULTS.BLOCKED
        ) {
          this.showPermissionBlockedAlert();
          return false;
        }

        return false;
      } catch (error) {
        console.error('Error requesting Android 13+ permissions:', error);
        return false;
      }
    }

    // Android 12 and below
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'FlixStream needs access to your device storage to play videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        this.showPermissionBlockedAlert();
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      return false;
    }
  }

  /**
   * Show alert when permission is permanently blocked
   */
  showPermissionBlockedAlert() {
    Alert.alert(
      'Permission Required',
      'Storage access is required to view and play videos. Please enable it in app settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => openSettings(),
        },
      ]
    );
  }

  /**
   * Request all required permissions at startup
   */
  async requestAllPermissions() {
    const storageGranted = await this.requestStoragePermission();

    if (!storageGranted) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to use this app. The app may not function properly without it.',
        [
          {
            text: 'Exit',
            onPress: () => {
              // You could use BackHandler.exitApp() here
            },
          },
          {
            text: 'Retry',
            onPress: () => this.requestAllPermissions(),
          },
        ]
      );
      return false;
    }

    return true;
  }
}

export default new PermissionService();