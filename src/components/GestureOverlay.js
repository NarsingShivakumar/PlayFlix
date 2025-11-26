// src/components/GestureOverlay.js

/**
 * Gesture Overlay Component
 * Shows visual feedback for volume, brightness, and seek gestures
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const GestureOverlay = ({ type, value }) => {
  const renderContent = () => {
    switch (type) {
      case 'volume':
        return (
          <>
            <Ionicons name="volume-high" size={40} color="#FFFFFF" />
            <Text style={styles.valueText}>{value}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${value}%` }]} />
            </View>
          </>
        );

      case 'brightness':
        return (
          <>
            <Ionicons name="sunny" size={40} color="#FFFFFF" />
            <Text style={styles.valueText}>{value}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${value}%` }]} />
            </View>
          </>
        );

      case 'seek':
        return (
          <>
            <Ionicons
              name={value > 0 ? 'play-forward' : 'play-back'}
              size={40}
              color="#FFFFFF"
            />
            <Text style={styles.valueText}>
              {value > 0 ? '+' : ''}{Math.abs(value)}s
            </Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        {renderContent()}
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
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
  },
});

export default GestureOverlay;