// src/components/VideoControls.js

/**
 * Video Controls Component
 * Complete playback controls UI with progress bar, buttons, and info
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Slider from '@react-native-community/slider';
import { formatDuration } from '../utils/formatters';

const { width } = Dimensions.get('window');

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  onSeek,
  onBack,
  onSettings,
  onSpeedPress,
  onPiP,
  videoName,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(currentTime);

  const handleSlidingStart = () => {
    setIsSeeking(true);
    setSeekPosition(currentTime);
  };

  const handleSlidingComplete = (value) => {
    setIsSeeking(false);
    onSeek(value);
  };

  const handleValueChange = (value) => {
    setSeekPosition(value);
  };

  const displayTime = isSeeking ? seekPosition : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.topButton}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.videoTitle} numberOfLines={1}>
          {videoName}
        </Text>

        <View style={styles.topRightButtons}>
          <TouchableOpacity onPress={onPiP} style={styles.topButton}>
            <Ionicons name="contract-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSettings} style={styles.topButton}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Controls */}
      <View style={styles.centerControls}>
        {/* Seek Backward */}
        <TouchableOpacity onPress={onSeekBackward} style={styles.seekButton}>
          <Ionicons name="play-back" size={40} color="#FFFFFF" />
          <Text style={styles.seekText}>10s</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={50}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Seek Forward */}
        <TouchableOpacity onPress={onSeekForward} style={styles.seekButton}>
          <Ionicons name="play-forward" size={40} color="#FFFFFF" />
          <Text style={styles.seekText}>10s</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatDuration(displayTime)}</Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={displayTime}
              onValueChange={handleValueChange}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="#E50914"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#E50914"
            />

            {/* Progress percentage */}
            <View style={styles.progressOverlay}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <Text style={styles.timeText}>{formatDuration(duration)}</Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Playback Speed */}
          <TouchableOpacity onPress={onSpeedPress} style={styles.bottomButton}>
            <Text style={styles.speedText}>{playbackRate}x</Text>
          </TouchableOpacity>

          {/* Subtitle Toggle */}
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="text-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Audio Track */}
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="musical-notes-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* More Options */}
          <TouchableOpacity style={styles.bottomButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  topButton: {
    padding: 8,
  },
  videoTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  // Center Controls
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  seekButton: {
    alignItems: 'center',
    padding: 12,
  },
  seekText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 50,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 45,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    pointerEvents: 'none',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 2,
  },

  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default VideoControls;