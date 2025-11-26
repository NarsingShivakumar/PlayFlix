// src/store/slices/videoSlice.js - COMPLETE FIXED VERSION

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

// Async thunk to scan device for videos
export const scanVideos = createAsyncThunk(
  'videos/scanVideos',
  async (_, { rejectWithValue }) => {
    try {
      // Import permission service
      const permissionService = require('../../services/permissionService').default;
      
      // Check permission first
      const hasPermission = await permissionService.checkStoragePermission();
      
      if (!hasPermission) {
        // Request permission
        const granted = await permissionService.requestStoragePermission();
        
        if (!granted) {
          return rejectWithValue('Storage permission denied. Please grant permission in settings.');
        }
      }

      const videos = [];
      
      // Directories to scan (Android)
      const directories = [
        RNFS.ExternalStorageDirectoryPath + '/Movies',
        RNFS.ExternalStorageDirectoryPath + '/Download',
        RNFS.ExternalStorageDirectoryPath + '/DCIM',
        RNFS.DownloadDirectoryPath,
        RNFS.ExternalStorageDirectoryPath + '/Videos',
      ];

      // Recursive function to scan directories
      const scanDirectory = async (path) => {
        try {
          const exists = await RNFS.exists(path);
          if (!exists) {
            console.log('Directory does not exist:', path);
            return;
          }

          const items = await RNFS.readDir(path);
          
          for (const item of items) {
            // Skip hidden files/folders
            // if (item.name.startsWith('.')) continue;

            if (item.isDirectory()) {
              await scanDirectory(item.path);
            } else if (item.isFile()) {
              // Check if file is video (by extension)
              const ext = item.name.split('.').pop().toLowerCase();
              const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', '3gp', 'webm', 'm4v', 'mpeg', 'mpg'];
              
              if (videoExts.includes(ext)) {
                const stats = await RNFS.stat(item.path);
                
                videos.push({
                  id: `${item.path}-${Date.now()}-${Math.random()}`,
                  name: item.name,
                  path: item.path,
                  size: stats.size,
                  duration: 0, // Will be set during playback
                  thumbnail: null,
                  // FIX: Convert Date to timestamp
                  dateAdded: new Date(stats.mtime).getTime(), // â† THIS IS THE FIX
                  folder: path,
                  extension: ext,
                });
              }
            }
          }
        } catch (error) {
          console.log('Error scanning directory:', path, error.message);
        }
      };

      // Scan all directories
      for (const dir of directories) {
        await scanDirectory(dir);
      }

      console.log(`Found ${videos.length} videos`);
      return videos;

    } catch (error) {
      console.error('Scan error:', error);
      return rejectWithValue(error.message || 'Failed to scan videos');
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState: {
    allVideos: [],
    filteredVideos: [],
    recentlyPlayed: [],
    favorites: [],
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    loading: false,
    error: null,
    lastScanned: null,
  },
  reducers: {
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.filteredVideos = sortVideos(state.allVideos, action.payload, state.sortOrder);
    },
    
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
      state.filteredVideos = sortVideos(state.allVideos, state.sortBy, action.payload);
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredVideos = state.allVideos.filter((video) =>
        video.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    
    addToRecentlyPlayed: (state, action) => {
      const video = action.payload;
      state.recentlyPlayed = [
        { ...video, lastPlayed: Date.now() },
        ...state.recentlyPlayed.filter((v) => v.id !== video.id),
      ].slice(0, 20);
    },
    
    toggleFavorite: (state, action) => {
      const videoId = action.payload;
      const isFavorite = state.favorites.some((v) => v.id === videoId);
      
      if (isFavorite) {
        state.favorites = state.favorites.filter((v) => v.id !== videoId);
      } else {
        const video = state.allVideos.find((v) => v.id === videoId);
        if (video) {
          state.favorites.push(video);
        }
      }
    },
    
    updateVideoDuration: (state, action) => {
      const { id, duration } = action.payload;
      const video = state.allVideos.find((v) => v.id === id);
      if (video) {
        video.duration = duration;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.allVideos = action.payload;
        state.filteredVideos = sortVideos(action.payload, state.sortBy, state.sortOrder);
        state.lastScanned = Date.now();
      })
      .addCase(scanVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to sort videos
const sortVideos = (videos, sortBy, sortOrder) => {
  const sorted = [...videos].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        // Compare timestamps (already numbers)
        comparison = a.dateAdded - b.dateAdded;
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

export const {
  setSortBy,
  setSortOrder,
  setSearchQuery,
  addToRecentlyPlayed,
  toggleFavorite,
  updateVideoDuration,
} = videoSlice.actions;

export default videoSlice.reducer;

export const selectAllVideos = (state) => state.videos.allVideos;
export const selectFilteredVideos = (state) => state.videos.filteredVideos;
export const selectRecentlyPlayed = (state) => state.videos.recentlyPlayed;
export const selectFavorites = (state) => state.videos.favorites;
export const selectLoading = (state) => state.videos.loading;