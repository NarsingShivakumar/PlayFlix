// src/store/slices/driveSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import googleDriveService from '../../services/googleDriveService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const signInToDrive = createAsyncThunk(
  'drive/signIn',
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = await googleDriveService.signIn();
      await AsyncStorage.setItem('drive_user', JSON.stringify(userInfo));
      return userInfo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOutFromDrive = createAsyncThunk(
  'drive/signOut',
  async () => {
    await googleDriveService.signOut();
    await AsyncStorage.removeItem('drive_user');
  }
);

export const loadDriveFolders = createAsyncThunk(
  'drive/loadFolders',
  async (_, { rejectWithValue }) => {
    try {
      const folders = await googleDriveService.getFolders();
      return folders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadDriveVideos = createAsyncThunk(
  'drive/loadVideos',
  async (folderId = 'root', { rejectWithValue }) => {
    try {
      const videos = await googleDriveService.getVideosInFolder(folderId);
      return videos;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreDriveSession = createAsyncThunk(
  'drive/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = await googleDriveService.getCurrentUser();
      if (userInfo) {
        return userInfo;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const driveSlice = createSlice({
  name: 'drive',
  initialState: {
    isAuthenticated: false,
    user: null,
    folders: [],
    videos: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInToDrive.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInToDrive.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(signInToDrive.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sign Out
      .addCase(signOutFromDrive.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.folders = [];
        state.videos = [];
      })
      // Load Folders
      .addCase(loadDriveFolders.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDriveFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload;
      })
      .addCase(loadDriveFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Videos
      .addCase(loadDriveVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDriveVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(loadDriveVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore Session
      .addCase(restoreDriveSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      });
  },
});

export const { clearError } = driveSlice.actions;
export default driveSlice.reducer;
