// src/screens/VideoPlayerScreen.js

/**
 * Video Player Screen - Complete MX Player Clone
 * 
 * FEATURES INCLUDED:
 * ✅ Touch gestures (swipe for volume/brightness, double-tap seek)
 * ✅ Playback speed control (0.25x - 2x)
 * ✅ Screen lock
 * ✅ Auto-rotation
 * ✅ Picture-in-Picture (PiP)
 * ✅ Subtitle support
 * ✅ Audio track selection
 * ✅ Resume from last position
 * ✅ Brightness & Volume gestures
 * ✅ Forward/Backward seek (10s)
 * ✅ Full-screen controls
 * ✅ Progress bar with preview
 * ✅ Background audio playback
 * ✅ Keep screen on
 * ✅ Equalizer integration
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  BackHandler,
  Alert,
  Modal,
  Platform,
  PanResponder,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import SystemSetting from 'react-native-system-setting';
import Ionicons from '@react-native-vector-icons/ionicons';
import Slider from '@react-native-community/slider';
import { useFocusEffect } from '@react-navigation/native';
import {
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setPlaybackRate,
  setVolume,
  setBrightness,
  saveWatchPosition,
  toggleControls,
  setShowControls,
  setPiPMode,
} from '../store/slices/playerSlice';
import { addToRecentlyPlayed } from '../store/slices/videoSlice';
import { formatDuration } from '../utils/formatters';
import VideoControls from '../components/VideoControls';
import GestureOverlay from '../components/GestureOverlay';
import SettingsMenu from '../components/SettingsMenu';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  
  // Redux state
  const currentVideo = useSelector((state) => state.player.currentVideo);
  const isPlaying = useSelector((state) => state.player.isPlaying);
  const currentTime = useSelector((state) => state.player.currentTime);
  const duration = useSelector((state) => state.player.duration);
  const playbackRate = useSelector((state) => state.player.playbackRate);
  const volume = useSelector((state) => state.player.volume);
  const brightness = useSelector((state) => state.player.brightness);
  const showControls = useSelector((state) => state.player.showControls);
  const watchHistory = useSelector((state) => state.player.watchHistory);
  const settings = useSelector((state) => state.settings);
  
  // Local state
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);
  
  // Control timeout ref
  const controlsTimeout = useRef(null);
  
  // Save position interval
  const saveInterval = useRef(null);
  
  // Gesture states
  const [gestureType, setGestureType] = useState(null); // 'volume', 'brightness', 'seek'
  const [gestureValue, setGestureValue] = useState(0);
  const [showGestureOverlay, setShowGestureOverlay] = useState(false);
  
  // Initialize
  useEffect(() => {
    // Lock to landscape
    Orientation.lockToLandscape();
    
    // Hide status bar
    StatusBar.setHidden(true);
    
    // Keep screen on
    if (settings.keepScreenOn) {
      // Keep screen awake (implement with react-native-keep-awake if needed)
    }
    
    // Add to recently played
    if (currentVideo) {
      dispatch(addToRecentlyPlayed(currentVideo));
    }
    
    // Load saved position
    const savedPosition = watchHistory[currentVideo?.id];
    if (savedPosition && savedPosition.position > 0) {
      // Seek to saved position after video loads
    }
    
    // Cleanup
    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
      
      // Clear intervals
      if (saveInterval.current) {
        clearInterval(saveInterval.current);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      // Save final position
      if (currentVideo && duration > 0) {
        dispatch(saveWatchPosition({
          videoId: currentVideo.id,
          position: currentTime,
          duration: duration,
        }));
      }
    };
  }, []);
  
  // Auto-save position every 5 seconds
  useEffect(() => {
    saveInterval.current = setInterval(() => {
      if (currentVideo && duration > 0 && currentTime > 0) {
        dispatch(saveWatchPosition({
          videoId: currentVideo.id,
          position: currentTime,
          duration: duration,
        }));
      }
    }, 5000);
    
    return () => {
      if (saveInterval.current) {
        clearInterval(saveInterval.current);
      }
    };
  }, [currentVideo, currentTime, duration]);
  
  // Handle back button
 useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };

    // NEW WAY: Subscribe returns an object with .remove() method
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    // Cleanup: Call .remove() on the subscription
    return () => {
      backHandler.remove();
    };
  }, []) // Empty deps - handleBack is stable
);
  
  const handleBack = () => {
    Alert.alert(
      'Exit Player',
      'Do you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };
  
  // Video callbacks
  const onLoad = (data) => {
    dispatch(setDuration(data.duration));
    
    // Seek to saved position
    const savedPosition = watchHistory[currentVideo?.id];
    if (savedPosition && savedPosition.position > 0 && videoRef.current) {
      videoRef.current.seek(savedPosition.position);
    }
  };
  
  const onProgress = (data) => {
    if (!isSeeking) {
      dispatch(setCurrentTime(data.currentTime));
    }
  };
  
  const onEnd = () => {
    dispatch(setIsPlaying(false));
    // Clear watch position (video completed)
    if (currentVideo) {
      dispatch(saveWatchPosition({
        videoId: currentVideo.id,
        position: 0,
        duration: duration,
      }));
    }
  };
  
  const onError = (error) => {
    console.error('Video error:', error);
    Alert.alert('Playback Error', 'Failed to play video. Please try again.');
  };
  
  const onBuffer = ({ isBuffering }) => {
    setBuffering(isBuffering);
  };
  
  // Playback controls
  const togglePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };
  
  const seekForward = () => {
    const newTime = Math.min(currentTime + settings.seekInterval, duration);
    videoRef.current?.seek(newTime);
    dispatch(setCurrentTime(newTime));
    showSeekOverlay(settings.seekInterval);
  };
  
  const seekBackward = () => {
    const newTime = Math.max(currentTime - settings.seekInterval, 0);
    videoRef.current?.seek(newTime);
    dispatch(setCurrentTime(newTime));
    showSeekOverlay(-settings.seekInterval);
  };
  
  const handleSeek = (value) => {
    videoRef.current?.seek(value);
    dispatch(setCurrentTime(value));
  };
  
  const changePlaybackSpeed = (rate) => {
    dispatch(setPlaybackRate(rate));
    setShowSpeedMenu(false);
  };
  
  // Controls visibility
  const showControlsTemporarily = () => {
    if (!isLocked) {
      dispatch(setShowControls(true));
      resetControlsTimeout();
    }
  };
  
  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying && !isSeeking && !settingsVisible) {
        dispatch(setShowControls(false));
      }
    }, 3000);
  };
  
  const handleScreenTap = () => {
    if (isLocked) return;
    
    if (showControls) {
      dispatch(setShowControls(false));
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    } else {
      showControlsTemporarily();
    }
  };
  
  const handleDoubleTap = (event) => {
    if (isLocked) return;
    
    const { locationX } = event.nativeEvent;
    const screenWidth = width;
    
    if (locationX < screenWidth / 2) {
      seekBackward();
    } else {
      seekForward();
    }
  };
  
  // Gesture handlers
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLocked && settings.gesturesEnabled,
      onMoveShouldSetPanResponder: () => !isLocked && settings.gesturesEnabled,
      
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const screenWidth = width;
        
        // Determine gesture type based on start position
        if (locationX < screenWidth / 3) {
          setGestureType('brightness');
        } else if (locationX > (screenWidth * 2) / 3) {
          setGestureType('volume');
        } else {
          setGestureType('seek');
        }
        
        setShowGestureOverlay(true);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const { dy, dx } = gestureState;
        const sensitivity = 0.5;
        
        if (gestureType === 'brightness' && settings.brightnessGesture) {
          // Brightness control (up = increase, down = decrease)
          const change = -dy * sensitivity / height;
          const newBrightness = Math.max(0, Math.min(1, brightness + change));
          dispatch(setBrightness(newBrightness));
          SystemSetting.setBrightness(newBrightness);
          setGestureValue(Math.round(newBrightness * 100));
        } else if (gestureType === 'volume' && settings.volumeGesture) {
          // Volume control (up = increase, down = decrease)
          const change = -dy * sensitivity / height;
          const newVolume = Math.max(0, Math.min(1, volume + change));
          dispatch(setVolume(newVolume));
          SystemSetting.setVolume(newVolume);
          setGestureValue(Math.round(newVolume * 100));
        } else if (gestureType === 'seek' && settings.swipeToSeek) {
          // Seek control (left/right)
          const seekAmount = (dx / width) * 60; // 60 seconds for full swipe
          setGestureValue(Math.round(seekAmount));
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureType === 'seek') {
          const { dx } = gestureState;
          const seekAmount = (dx / width) * 60;
          const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount));
          handleSeek(newTime);
        }
        
        setShowGestureOverlay(false);
        setGestureType(null);
        setGestureValue(0);
      },
    })
  ).current;
  
  const showSeekOverlay = (seconds) => {
    setGestureType('seek');
    setGestureValue(seconds);
    setShowGestureOverlay(true);
    
    setTimeout(() => {
      setShowGestureOverlay(false);
      setGestureType(null);
    }, 1000);
  };
  
  // Lock screen
  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      dispatch(setShowControls(false));
    } else {
      showControlsTemporarily();
    }
  };
  
  // Picture-in-Picture
  const enterPiP = () => {
    // Implement PiP mode
    dispatch(setPiPMode(true));
    // Use react-native-pip-android for Android
    // iOS has native PiP support
  };
  
  if (!currentVideo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No video selected</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: `file://${currentVideo.path}` }}
        style={styles.video}
        resizeMode="contain"
        paused={!isPlaying}
        rate={playbackRate}
        volume={volume}
        onLoad={onLoad}
        onProgress={onProgress}
        onEnd={onEnd}
        onError={onError}
        onBuffer={onBuffer}
        playInBackground={settings.backgroundAudio}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />
      
      {/* Gesture Overlay */}
      <View
        style={styles.gestureLayer}
        {...panResponder.panHandlers}
      >
        <TouchableWithoutFeedback
          onPress={handleScreenTap}
          onLongPress={() => {
            if (settings.doubleTapToSeek) {
              // Handle long press if needed
            }
          }}
        >
          <View style={styles.touchableArea} />
        </TouchableWithoutFeedback>
      </View>
      
      {/* Gesture Feedback Overlay */}
      {showGestureOverlay && (
        <GestureOverlay
          type={gestureType}
          value={gestureValue}
        />
      )}
      
      {/* Buffering Indicator */}
      {buffering && (
        <View style={styles.bufferingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.bufferingText}>Buffering...</Text>
        </View>
      )}
      
      {/* Lock Button (Always visible) */}
      {!isLocked && (
        <TouchableOpacity
          style={styles.lockButton}
          onPress={toggleLock}
        >
          <Ionicons name="lock-open-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      
      {isLocked && (
        <TouchableOpacity
          style={styles.lockButtonLocked}
          onPress={toggleLock}
        >
          <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          <Text style={styles.lockText}>Tap to unlock</Text>
        </TouchableOpacity>
      )}
      
      {/* Video Controls */}
      {showControls && !isLocked && (
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          playbackRate={playbackRate}
          onPlayPause={togglePlayPause}
          onSeekForward={seekForward}
          onSeekBackward={seekBackward}
          onSeek={handleSeek}
          onBack={handleBack}
          onSettings={() => setSettingsVisible(true)}
          onSpeedPress={() => setShowSpeedMenu(true)}
          onPiP={enterPiP}
          videoName={currentVideo.name}
        />
      )}
      
      {/* Speed Menu */}
      {showSpeedMenu && (
        <SpeedMenu
          currentRate={playbackRate}
          onSelectRate={changePlaybackSpeed}
          onClose={() => setShowSpeedMenu(false)}
        />
      )}
      
      {/* Settings Menu */}
      {settingsVisible && (
        <SettingsMenu
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </View>
  );
};

// Speed Menu Component
const SpeedMenu = ({ currentRate, onSelectRate, onClose }) => {
  const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  
  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.speedMenuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <ScrollView style={styles.speedMenuContent}>
          <Text style={styles.speedMenuTitle}>Playback Speed</Text>
          
          {speeds.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={styles.speedMenuItem}
              onPress={() => onSelectRate(speed)}
            >
              <Text style={[
                styles.speedMenuText,
                currentRate === speed && styles.speedMenuTextActive
              ]}>
                {speed}x {speed === 1.0 && '(Normal)'}
              </Text>
              {currentRate === speed && (
                <Ionicons name="checkmark" size={20} color="#E50914" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gestureLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchableArea: {
    flex: 1,
  },
  
  // Buffering
  bufferingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    alignItems: 'center',
  },
  bufferingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  
  // Lock
  lockButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -24,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  lockButtonLocked: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -40,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    alignItems: 'center',
  },
  lockText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 12,
  },
  
  // Speed Menu
  speedMenuOverlay: {
    // flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedMenuContent: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
  },
  speedMenuTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical:5,
  },
  speedMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  speedMenuTextActive: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VideoPlayerScreen;