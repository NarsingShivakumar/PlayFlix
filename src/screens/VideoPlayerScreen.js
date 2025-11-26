// src/screens/VideoPlayerScreen.js - FIXED PANRESPONDER

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Text,
  BackHandler,
  Alert,
  Modal,
  PanResponder,
  ActivityIndicator,
  ScrollView,
  AppState,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import SystemSetting from 'react-native-system-setting';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setPlaybackRate,
  setVolume,
  setBrightness,
  saveWatchPosition,
  setShowControls,
} from '../store/slices/playerSlice';
import { addToRecentlyPlayed } from '../store/slices/videoSlice';
import { formatDuration } from '../utils/formatters';
import VideoControls from '../components/VideoControls';
import GestureOverlay from '../components/GestureOverlay';
import SettingsMenu from '../components/SettingsMenu';
import PipHandler, { usePipModeListener } from 'react-native-pip-android';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const appState = useRef(AppState.currentState);

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

  const inPipMode = usePipModeListener();

  const [isLocked, setIsLocked] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);

  const controlsTimeout = useRef(null);
  const saveInterval = useRef(null);

  const [gestureType, setGestureType] = useState(null);
  const [gestureValue, setGestureValue] = useState(0);
  const [showGestureOverlay, setShowGestureOverlay] = useState(false);

  // Refs to avoid stale closure inside PanResponder
  const gestureTypeRef = useRef(null);
  const isGesturingRef = useRef(false);

  const brightnessRef = useRef(brightness);
  const volumeRef = useRef(volume);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);


  // ✅ Track if gesture is in progress
  const [isGesturing, setIsGesturing] = useState(false);

  useEffect(() => {
    brightnessRef.current = brightness;
  }, [brightness]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);


  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    dispatch(setShowControls(true));

    if (currentVideo) {
      dispatch(addToRecentlyPlayed(currentVideo));
    }

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);

      if (saveInterval.current) clearInterval(saveInterval.current);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);

      if (currentVideo && duration > 0) {
        dispatch(saveWatchPosition({
          videoId: currentVideo.id,
          position: currentTime,
          duration: duration,
        }));
      }
    };
  }, []);
  useEffect(() => {
    // Sync initial brightness with system/app brightness
    SystemSetting.getBrightness().then((val) => {
      brightnessRef.current = val;
      dispatch(setBrightness(val));
    }).catch((e) => {
      console.warn('Failed to get brightness', e);
    });
  }, []);

  useEffect(() => {
  if (Platform.OS !== 'android') return;

  const subscription = AppState.addEventListener('change', (nextState) => {
    const prevState = appState.current;
    appState.current = nextState;

    // We care when the app is leaving foreground for background
    if (
      prevState === 'active' &&
      (nextState === 'background' || nextState === 'inactive') &&
      currentVideo &&
      isPlaying &&
      !inPipMode
    ) {
      // Try to enter PiP mode
      try {
        // Width/height are hints, not strict; you can tweak
        PipHandler.enterPipMode(300, 214);
      } catch (e) {
        console.warn('Failed to enter PiP mode', e);
      }
    }
  });

  return () => {
    subscription.remove();
  };
}, [currentVideo, isPlaying, inPipMode]);


  useEffect(() => {
    saveInterval.current = setInterval(() => {
      if (currentVideo && duration > 0 && currentTime > 0) {
        dispatch(saveWatchPosition({
          videoId: currentVideo.id,
          position: currentTime,
          duration: duration,
        }));
      }
    }, 500);

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [currentVideo, currentTime, duration]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleBack = () => {
    Alert.alert(
      'Exit Player',
      'Do you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() },
      ]
    );
  };

  const onLoad = (data) => {
    dispatch(setDuration(data.duration));
    dispatch(setIsPlaying(true));

    const savedPosition = watchHistory[currentVideo?.id];
    if (savedPosition && savedPosition.position > 0 && videoRef.current) {
      videoRef.current.seek(savedPosition.position);
    }

    resetControlsTimeout();
  };

  const onProgress = (data) => {
    if (!isSeeking) {
      dispatch(setCurrentTime(data.currentTime));
    }
  };

  const onEnd = () => {
    dispatch(setIsPlaying(false));
    dispatch(setShowControls(true));

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

  const togglePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const seekForward = () => {
    const seekInterval = settings?.seekInterval || 10;
    const newTime = Math.min(currentTime + seekInterval, duration);
    videoRef.current?.seek(newTime);
    dispatch(setCurrentTime(newTime));
    showSeekOverlay(seekInterval);
  };

  const seekBackward = () => {
    const seekInterval = settings?.seekInterval || 10;
    const newTime = Math.max(currentTime - seekInterval, 0);
    videoRef.current?.seek(newTime);
    dispatch(setCurrentTime(newTime));
    showSeekOverlay(-seekInterval);
  };

  const handleSeek = (value) => {
    videoRef.current?.seek(value);
    dispatch(setCurrentTime(value));
  };

  const changePlaybackSpeed = (rate) => {
    dispatch(setPlaybackRate(rate));
    setShowSpeedMenu(false);
  };

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
      if (!isLocked && !isSeeking && !settingsVisible && !showSpeedMenu) {
        dispatch(setShowControls(false));
      }
    }, 1500);
  };

  // ✅ FIXED: PanResponder that handles both gestures and taps
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLocked,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if moved more than 10px
        return (
          !isLocked &&
          (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10)
        );
      },

      onPanResponderGrant: () => {
        // Reset per-gesture refs + UI state
        isGesturingRef.current = false;
        gestureTypeRef.current = null;

        setIsGesturing(false);
        setGestureType(null);
        setShowGestureOverlay(false);
      },

      onPanResponderMove: (evt, gestureState) => {
        if (isLocked) return;

        const { dx, dy } = gestureState;

        // If moved enough, it's a gesture (not a tap)
        if (!isGesturingRef.current &&
          (Math.abs(dx) > 10 || Math.abs(dy) > 10)
        ) {
          isGesturingRef.current = true;
          setIsGesturing(true);
          setShowGestureOverlay(true);

        }

        if (!isGesturingRef.current) {
          return;
        }

        // Determine gesture type on first significant move
        if (!gestureTypeRef.current) {
          const { locationX } = evt.nativeEvent;
          const screenWidth = width;

          if (Math.abs(dy) > Math.abs(dx)) {
            // Vertical gestures: brightness (left) / volume (right)
            if (locationX < screenWidth / 2) {
              gestureTypeRef.current = 'brightness';
            } else {
              gestureTypeRef.current = 'volume';
            }
          } else {
            // Horizontal gestures: seek
            gestureTypeRef.current = 'seek';
          }

          setGestureType(gestureTypeRef.current);
          setShowGestureOverlay(true);
        }

        const type = gestureTypeRef.current;
        const sensitivity = 0.5;

        if (type === 'brightness' && settings?.brightnessGesture !== false) {
          const change = (-dy * sensitivity) / height;
          const base = brightnessRef.current;
          let newBrightness = base + change;

          newBrightness = Math.max(0, Math.min(1, newBrightness));

          dispatch(setBrightness(newBrightness));
          SystemSetting.setAppBrightness(newBrightness);

          setGestureValue(Math.round(newBrightness * 100));
        } else if (type === 'volume' && settings?.volumeGesture !== false) {
          const change = (-dy * sensitivity) / height;
          const base = volumeRef.current;
          let newVolume = base + change;

          newVolume = Math.max(0, Math.min(1, newVolume));

          dispatch(setVolume(newVolume));
          SystemSetting.setVolume(newVolume);

          setGestureValue(Math.round(newVolume * 100));
        } else if (type === 'seek' && settings?.swipeToSeek !== false) {
          // Show how many seconds we’ll seek, apply on release
          const seekAmount = (dx / width) * 60; // +/- 60s max
          setGestureValue(Math.round(seekAmount));
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        const type = gestureTypeRef.current;

        if (isGesturingRef.current && type === 'seek' && settings?.swipeToSeek !== false) {
          const { dx } = gestureState;
          const seekAmount = (dx / width) * 60;
          const baseTime = currentTimeRef.current;
          const totalDuration = durationRef.current || 0;

          const newTime = Math.max(
            0,
            Math.min(totalDuration, baseTime + seekAmount)
          );

          handleSeek(newTime);
        }

        // If it was just a tap (no gesture), toggle controls
        if (!isGesturingRef.current) {
          handleScreenTap();
        }

        // Reset gesture state
        isGesturingRef.current = false;
        gestureTypeRef.current = null;

        setShowGestureOverlay(false);
        setGestureType(null);
        setGestureValue(0);
        setIsGesturing(false);
      },

      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        // Same reset as release
        isGesturingRef.current = false;
        gestureTypeRef.current = null;

        setShowGestureOverlay(false);
        setGestureType(null);
        setGestureValue(0);
        setIsGesturing(false);
      },
    })
  ).current;

  const handleScreenTap = () => {
    if (isLocked) return;

    dispatch(setShowControls(true));
    resetControlsTimeout();
  };

  const showSeekOverlay = (seconds) => {
    setGestureType('seek');
    setGestureValue(seconds);
    setShowGestureOverlay(true);

    setTimeout(() => {
      setShowGestureOverlay(false);
      setGestureType(null);
    }, 1000);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      dispatch(setShowControls(false));
    } else {
      showControlsTemporarily();
    }
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
        playInBackground={settings?.backgroundAudio || false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />

      {/* ✅ FIXED: Gesture Layer WITHOUT TouchableWithoutFeedback */}
      <View style={styles.gestureLayer} {...panResponder.panHandlers} />

      {/* Gesture Feedback Overlay */}
      {!inPipMode && showGestureOverlay && (
        <GestureOverlay type={gestureType} value={gestureValue} />
      )}

      {/* Buffering Indicator */}
      {buffering && (
        <View style={styles.bufferingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.bufferingText}>Buffering...</Text>
        </View>
      )}

      {/* Lock Button */}
      {showControls && !isLocked && (
        <TouchableOpacity style={styles.lockButton} onPress={toggleLock}>
          <Ionicons name="lock-open-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {isLocked && (
        <TouchableOpacity style={styles.lockButtonLocked} onPress={toggleLock}>
          <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          <Text style={styles.lockText}>Tap to unlock</Text>
        </TouchableOpacity>
      )}

      {/* Video Controls */}
      {!inPipMode && showControls && !isLocked && (
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
          onSettings={() => {
            setSettingsVisible(true);
            if (controlsTimeout.current) {
              clearTimeout(controlsTimeout.current);
            }
          }}
          onSpeedPress={() => {
            setShowSpeedMenu(true);
            if (controlsTimeout.current) {
              clearTimeout(controlsTimeout.current);
            }
          }}
          videoName={currentVideo.name}
        />
      )}

      {/* Speed Menu */}
      {showSpeedMenu && (
        <SpeedMenu
          currentRate={playbackRate}
          onSelectRate={changePlaybackSpeed}
          onClose={() => {
            setShowSpeedMenu(false);
            resetControlsTimeout();
          }}
        />
      )}

      {/* Settings Menu */}
      {settingsVisible && (
        <SettingsMenu
          onClose={() => {
            setSettingsVisible(false);
            resetControlsTimeout();
          }}
        />
      )}
    </View>
  );
};

// Speed Menu Component
const SpeedMenu = ({ currentRate, onSelectRate, onClose }) => {
  const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.speedMenuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.speedMenuContent}>
          <Text style={styles.speedMenuTitle}>Playback Speed</Text>

          <ScrollView>
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
        </View>
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
  speedMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedMenuContent: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    maxHeight: 400,
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
    paddingVertical: 12,
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