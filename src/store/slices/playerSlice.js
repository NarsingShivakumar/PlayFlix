// src/store/slices/playerSlice.js

import { createSlice } from '@reduxjs/toolkit';

/**
 * Player Slice
 * Manages video player state: playback, controls, position
 */

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    currentVideo: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
    brightness: 0.5,
    
    // Continue watching (resume positions)
    watchHistory: {}, // { videoId: { position, duration, timestamp } }
    
    // Player UI state
    showControls: true,
    isFullscreen: false,
    isPiPMode: false,
    
    // Subtitles
    subtitlesEnabled: false,
    currentSubtitle: null,
    
    // Audio tracks
    audioTracks: [],
    currentAudioTrack: 0,
  },
  reducers: {
    // Set current video
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload;
      
      // Load saved position if exists
      const savedPosition = state.watchHistory[action.payload.id];
      if (savedPosition) {
        state.currentTime = savedPosition.position;
      } else {
        state.currentTime = 0;
      }
    },
    
    // Playback controls
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    
    // Speed control
    setPlaybackRate: (state, action) => {
      state.playbackRate = action.payload;
    },
    
    // Volume control
    setVolume: (state, action) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    
    // Brightness control
    setBrightness: (state, action) => {
      state.brightness = Math.max(0, Math.min(1, action.payload));
    },
    
    // UI controls
    toggleControls: (state) => {
      state.showControls = !state.showControls;
    },
    
    setShowControls: (state, action) => {
      state.showControls = action.payload;
    },
    
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    
    setPiPMode: (state, action) => {
      state.isPiPMode = action.payload;
    },
    
    // Watch history (continue watching)
    saveWatchPosition: (state, action) => {
      const { videoId, position, duration } = action.payload;
      state.watchHistory[videoId] = {
        position,
        duration,
        timestamp: Date.now(),
        percentage: (position / duration) * 100,
      };
    },
    
    clearWatchPosition: (state, action) => {
      delete state.watchHistory[action.payload];
    },
    
    // Subtitles
    toggleSubtitles: (state) => {
      state.subtitlesEnabled = !state.subtitlesEnabled;
    },
    
    setCurrentSubtitle: (state, action) => {
      state.currentSubtitle = action.payload;
    },
    
    // Audio tracks
    setAudioTracks: (state, action) => {
      state.audioTracks = action.payload;
    },
    
    setCurrentAudioTrack: (state, action) => {
      state.currentAudioTrack = action.payload;
    },
    
    // Reset player
    resetPlayer: (state) => {
      state.currentVideo = null;
      state.isPlaying = false;
      state.currentTime = 0;
      state.duration = 0;
      state.showControls = true;
      state.isFullscreen = false;
    },
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setPlaybackRate,
  setVolume,
  setBrightness,
  toggleControls,
  setShowControls,
  toggleFullscreen,
  setPiPMode,
  saveWatchPosition,
  clearWatchPosition,
  toggleSubtitles,
  setCurrentSubtitle,
  setAudioTracks,
  setCurrentAudioTrack,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;

// Selectors
export const selectCurrentVideo = (state) => state.player.currentVideo;
export const selectIsPlaying = (state) => state.player.isPlaying;
export const selectPlaybackRate = (state) => state.player.playbackRate;
export const selectVolume = (state) => state.player.volume;
export const selectBrightness = (state) => state.player.brightness;
export const selectWatchHistory = (state) => state.player.watchHistory;