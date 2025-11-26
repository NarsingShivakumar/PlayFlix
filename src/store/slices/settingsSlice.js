// src/store/slices/settingsSlice.js

import { createSlice } from '@reduxjs/toolkit';

/**
 * Settings Slice
 * User preferences and app settings
 */

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    // Theme
    theme: 'dark', // 'light' | 'dark'
    
    // Player preferences
    autoplay: true,
    continueWatching: true,
    defaultPlaybackRate: 1.0,
    defaultQuality: 'auto',
    
    // Gestures
    gesturesEnabled: true,
    swipeToSeek: true,
    doubleTapToSeek: true,
    seekInterval: 10, // seconds
    volumeGesture: true,
    brightnessGesture: true,
    
    // Subtitles
    subtitlesEnabled: true,
    subtitleSize: 16,
    subtitleColor: '#FFFFFF',
    subtitleBackgroundColor: 'rgba(0,0,0,0.7)',
    
    // Audio
    audioBoost: false,
    equalizer: {
      enabled: false,
      preset: 'Normal', // 'Normal', 'Bass', 'Treble', 'Classical', etc.
      bands: [0, 0, 0, 0, 0], // Frequency bands
    },
    
    // Background playback
    backgroundAudio: true,
    
    // Picture-in-Picture
    pipEnabled: true,
    pipOnMinimize: true,
    
    // Screen
    keepScreenOn: true,
    autoRotate: true,
    
    // Network
    wifiOnlyDownload: true,
    
    // Storage
    videosFolderPath: null,
    scanHiddenFolders: false,
  },
  reducers: {
    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    
    // Player settings
    setAutoplay: (state, action) => {
      state.autoplay = action.payload;
    },
    
    setContinueWatching: (state, action) => {
      state.continueWatching = action.payload;
    },
    
    setDefaultPlaybackRate: (state, action) => {
      state.defaultPlaybackRate = action.payload;
    },
    
    // Gestures
    setGesturesEnabled: (state, action) => {
      state.gesturesEnabled = action.payload;
    },
    
    setSeekInterval: (state, action) => {
      state.seekInterval = action.payload;
    },
    
    toggleSubtitles: (state) => {
      state.subtitlesEnabled = !state.subtitlesEnabled;
    },
    // Subtitles
    setSubtitleSettings: (state, action) => {
      state.subtitleSize = action.payload.size || state.subtitleSize;
      state.subtitleColor = action.payload.color || state.subtitleColor;
      state.subtitleBackgroundColor = action.payload.backgroundColor || state.subtitleBackgroundColor;
    },
    
    // Equalizer
    setEqualizer: (state, action) => {
      state.equalizer = { ...state.equalizer, ...action.payload };
    },
    
    // Background audio
    setBackgroundAudio: (state, action) => {
      state.backgroundAudio = action.payload;
    },

    setAudioBoost: (state, action) => {
      state.audioBoost = action.payload;
    },
        
    // PiP
    setPipEnabled: (state, action) => {
      state.pipEnabled = action.payload;
    },
    setPipOnMinimize: (state, action) => {
      state.pipOnMinimize = action.payload;
    },
    
    // Screen settings
    setKeepScreenOn: (state, action) => {
      state.keepScreenOn = action.payload;
    },
    
    setAutoRotate: (state, action) => {
      state.autoRotate = action.payload;
    },
    
    // Storage
    setScanHiddenFolders: (state, action) => {
      state.scanHiddenFolders = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setAutoplay,
  setContinueWatching,
  setDefaultPlaybackRate,
  setGesturesEnabled,
  setSeekInterval,
  setSubtitleSettings,
  toggleSubtitles,
  setEqualizer,
  setBackgroundAudio,
  setAudioBoost,
  setPipEnabled,
  setPipOnMinimize,
  setKeepScreenOn,
  setAutoRotate,
  setScanHiddenFolders,
} = settingsSlice.actions;

export default settingsSlice.reducer;