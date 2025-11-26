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
    autoplay: false,
    gesturesEnabled: true,
    backgroundAudio: true,
    keepScreenOn: true,
    seekInterval: 10, // seconds
    
    // Subtitles
    subtitlesEnabled: false,
    subtitleSize: 16,
    subtitleColor: '#FFFFFF',
    subtitleBackground: 'rgba(0,0,0,0.7)',
    
    // Audio
    audioBoost: false,
    equalizer: {
      enabled: false,
      preset: 'Normal', // 'Normal', 'Bass', 'Treble', 'Classical', 'Rock', 'Pop'
    },
    
    // Advanced
    pipEnabled: false,
    pipOnMinimize: false,
    autoRotate: true,
    
    // Gestures
    doubleTapToSeek: true,
    volumeGesture: true,
    brightnessGesture: true,
    swipeToSeek: true,
  },
  
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // General Settings
    setAutoplay: (state, action) => {
      state.autoplay = action.payload;
    },
    
    setGesturesEnabled: (state, action) => {
      state.gesturesEnabled = action.payload;
    },
    
    setBackgroundAudio: (state, action) => {
      state.backgroundAudio = action.payload;
    },
    
    setKeepScreenOn: (state, action) => {
      state.keepScreenOn = action.payload;
    },
    
    setSeekInterval: (state, action) => {
      state.seekInterval = action.payload;
    },
    
    // Subtitles
    toggleSubtitles: (state) => {
      state.subtitlesEnabled = !state.subtitlesEnabled;
    },
    
    setSubtitlesEnabled: (state, action) => {
      state.subtitlesEnabled = action.payload;
    },
    
    setSubtitleSize: (state, action) => {
      state.subtitleSize = action.payload;
    },
    
    setSubtitleColor: (state, action) => {
      state.subtitleColor = action.payload;
    },
    
    setSubtitleBackground: (state, action) => {
      state.subtitleBackground = action.payload;
    },
    
    // Audio
    setAudioBoost: (state, action) => {
      state.audioBoost = action.payload;
    },
    
    setEqualizer: (state, action) => {
      state.equalizer = { ...state.equalizer, ...action.payload };
    },
    
    // Advanced
    setPipEnabled: (state, action) => {
      state.pipEnabled = action.payload;
    },
    
    setPipOnMinimize: (state, action) => {
      state.pipOnMinimize = action.payload;
    },
    
    setAutoRotate: (state, action) => {
      state.autoRotate = action.payload;
    },
    
    // Gestures
    setDoubleTapToSeek: (state, action) => {
      state.doubleTapToSeek = action.payload;
    },
    
    setVolumeGesture: (state, action) => {
      state.volumeGesture = action.payload;
    },
    
    setBrightnessGesture: (state, action) => {
      state.brightnessGesture = action.payload;
    },
    
    setSwipeToSeek: (state, action) => {
      state.swipeToSeek = action.payload;
    },
    
    // Reset all settings
    resetSettings: (state) => {
      return settingsSlice.getInitialState();
    },
  },
});

export const {
  setTheme,
  setAutoplay,
  setGesturesEnabled,
  setBackgroundAudio,
  setKeepScreenOn,
  setSeekInterval,
  toggleSubtitles,
  setSubtitlesEnabled,
  setSubtitleSize,
  setSubtitleColor,
  setSubtitleBackground,
  setAudioBoost,
  setEqualizer,
  setPipEnabled,
  setPipOnMinimize,
  setAutoRotate,
  setDoubleTapToSeek,
  setVolumeGesture,
  setBrightnessGesture,
  setSwipeToSeek,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

// Selectors
export const selectTheme = (state) => state.settings.theme;
export const selectAutoplay = (state) => state.settings.autoplay;
export const selectGesturesEnabled = (state) => state.settings.gesturesEnabled;
export const selectSubtitlesEnabled = (state) => state.settings.subtitlesEnabled;
export const selectEqualizer = (state) => state.settings.equalizer;
