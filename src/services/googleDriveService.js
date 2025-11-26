// src/services/googleDriveService.js

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

// ⚠️ REPLACE WITH YOUR WEB CLIENT ID (NOT the installed app ID)
GoogleSignin.configure({
  webClientId: '192888782552-ihkea499vecif135ofbpfpij9a9i0fas.apps.googleusercontent.com', // ← UPDATE THIS
  // webClientId: '192888782552-v6scvm1op85a0qts05nm1qv1o1gjjlf3.apps.googleusercontent.com',
  scopes: SCOPES,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

class GoogleDriveService {
  constructor() {
    this.accessToken = null;
    this.userInfo = null;
  }

  /**
   * Sign in to Google Drive
   */
  async signIn() {
    try {
      console.log('🔍 Checking Play Services...');
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      console.log('🔐 Starting sign-in...');
      const userInfo = await GoogleSignin.signIn();

      console.log('🎫 Getting tokens...');
      const tokens = await GoogleSignin.getTokens();

      this.accessToken = tokens.accessToken;
      this.userInfo = userInfo;

      console.log('✅ Google Drive Sign-In Success!');
      // console.log('👤 User:', userInfo.user.email);
      // console.log('🔑 Token:', this.accessToken ? 'Available' : 'Missing');
        console.log('👤 User:', userInfo?.user?.email || userInfo?.email || 'Signed in');


      return userInfo;
    } catch (error) {
      console.error('❌ Google Drive Sign-In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Provide helpful error messages
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === '12501') {
        throw new Error('Sign-in failed. Please check your Google Cloud Console configuration.');
      } else if (error.code === '10') {
        throw new Error('Developer error. SHA-1 fingerprint may be missing.');
      } else if (error.message?.includes('activity is null')) {
        throw new Error('Google Sign-In initialization failed. Please restart the app.');
      }

      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
      this.accessToken = null;
      this.userInfo = null;
      console.log('✅ Google Drive Sign-Out Success');
    } catch (error) {
      console.error('❌ Google Drive Sign-Out Error:', error);
      throw error;
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn() {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user info (silent sign-in)
   */
  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      this.userInfo = userInfo;
      console.log('✅ Silent sign-in successful');
      return userInfo;
    } catch (error) {
      console.log('ℹ️ No saved session');
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshTokenIfNeeded() {
    try {
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      return this.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API request with retry
   */
  async makeAuthRequest(url, params = {}) {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      // If 401, try refreshing token
      if (error.response?.status === 401) {
        console.log('🔄 Token expired, refreshing...');
        await this.refreshTokenIfNeeded();

        // Retry request
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params,
        });
        return response.data;
      }
      throw error;
    }
  }

  /**
   * Get folders from Google Drive
   */
  async getFolders() {
    try {
      const data = await this.makeAuthRequest(
        'https://www.googleapis.com/drive/v3/files',
        {
          q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: 'files(id, name, modifiedTime, iconLink)',
          orderBy: 'name',
          pageSize: 100,
        }
      );

      console.log(`📁 Found ${data.files?.length || 0} folders`);
      return data.files || [];
    } catch (error) {
      console.error('❌ Error fetching folders:', error.message);
      throw error;
    }
  }

  /**
   * Get video files from a folder
   */
  async getVideosInFolder(folderId = 'root') {
    try {
      const videoMimeTypes = [
        'video/mp4',
        'video/x-msvideo',
        'video/quicktime',
        'video/x-matroska',
        'video/webm',
        'video/mpeg',
      ];

      const mimeTypeQuery = videoMimeTypes
        .map((type) => `mimeType='${type}'`)
        .join(' or ');

      const data = await this.makeAuthRequest(
        'https://www.googleapis.com/drive/v3/files',
        {
          q: `(${mimeTypeQuery}) and '${folderId}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, size, videoMediaMetadata, thumbnailLink, modifiedTime)',
          orderBy: 'name',
          pageSize: 100,
        }
      );

      console.log(`🎬 Found ${data.files?.length || 0} videos`);
      return data.files || [];
    } catch (error) {
      console.error('❌ Error fetching videos:', error.message);
      throw error;
    }
  }

  /**
   * Get all videos (from root)
   */
  async getAllVideos() {
    return await this.getVideosInFolder('root');
  }

  /**
   * Get video stream URL
   */
  getVideoStreamUrl(fileId) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${this.accessToken}`;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId) {
    try {
      const data = await this.makeAuthRequest(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          fields: 'id, name, mimeType, size, videoMediaMetadata, thumbnailLink, webContentLink',
        }
      );
      return data;
    } catch (error) {
      console.error('❌ Error fetching metadata:', error.message);
      throw error;
    }
  }
}

export default new GoogleDriveService();
