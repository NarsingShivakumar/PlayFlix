// src/components/SettingsMenu.js - LAYOUT FIXED VERSION

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// import Ionicons from 'react-native-vector-icons/ionicons';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  setAutoplay,
  setGesturesEnabled,
  setBackgroundAudio,
  toggleSubtitles,
  setEqualizer,
  setKeepScreenOn,
  setAudioBoost,
  setPipEnabled,
  setPipOnMinimize,
  setAutoRotate,
} from '../store/slices/settingsSlice';

const SettingsMenu = ({ onClose }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: 'settings-outline' },
    { id: 'subtitles', label: 'Subtitles', icon: 'text-outline' },
    { id: 'audio', label: 'Audio', icon: 'musical-notes-outline' },
    { id: 'advanced', label: 'Advanced', icon: 'options-outline' },
  ];

  const SettingItem = ({ label, value, onValueChange, type }) => {
    return (
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{label}</Text>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#E50914' }}
            thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
          />
        ) : (
          <Text style={styles.settingValue}>{value}</Text>
        )}
      </View>
    );
  };

  const renderGeneralSettings = () => (
    <View style={styles.settingsContent}>
      <SettingItem
        label="Autoplay Next"
        value={settings.autoplay}
        onValueChange={(value) => dispatch(setAutoplay(value))}
        type="switch"
      />

      <SettingItem
        label="Gestures Enabled"
        value={settings.gesturesEnabled}
        onValueChange={(value) => dispatch(setGesturesEnabled(value))}
        type="switch"
      />

      <SettingItem
        label="Background Audio"
        value={settings.backgroundAudio}
        onValueChange={(value) => dispatch(setBackgroundAudio(value))}
        type="switch"
      />

      <SettingItem
        label="Keep Screen On"
        value={settings.keepScreenOn}
        onValueChange={(value) => dispatch(setKeepScreenOn(value))}
        type="switch"
      />

      <SettingItem
        label="Seek Interval"
        value={`${settings.seekInterval}s`}
        type="info"
      />
    </View>
  );

  const renderSubtitleSettings = () => (
    <View style={styles.settingsContent}>
      <SettingItem
        label="Enable Subtitles"
        value={settings.subtitlesEnabled}
        onValueChange={() => dispatch(toggleSubtitles())}
        type="switch"
      />

      <SettingItem
        label="Subtitle Size"
        value={`${settings.subtitleSize}px`}
        type="info"
      />

      <Text style={styles.sectionTitle}>Subtitle Preview</Text>
      <View style={styles.subtitlePreview}>
        <Text
          style={[
            styles.subtitleText,
            {
              fontSize: settings.subtitleSize,
              color: settings.subtitleColor,
              backgroundColor: settings.subtitleBackgroundColor,
            },
          ]}
        >
          Sample Subtitle Text
        </Text>
      </View>
    </View>
  );

  const renderAudioSettings = () => {
    const equalizerPresets = ['Normal', 'Bass', 'Treble', 'Classical', 'Rock', 'Pop'];

    return (
      <View style={styles.settingsContent}>
        <SettingItem
          label="Audio Boost"
          value={settings.audioBoost}
          onValueChange={(value) => dispatch(setAudioBoost(value))}
          type="switch"
        />

        <Text style={styles.sectionTitle}>Equalizer</Text>
        <SettingItem
          label="Equalizer Enabled"
          value={settings.equalizer.enabled}
          onValueChange={(value) =>
            dispatch(setEqualizer({ enabled: value }))
          }
          type="switch"
        />

        {settings.equalizer.enabled && (
          <View style={styles.equalizerPresets}>
            {equalizerPresets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  settings.equalizer.preset === preset && styles.presetButtonActive,
                ]}
                onPress={() => dispatch(setEqualizer({ preset }))}
              >
                <Text
                  style={[
                    styles.presetText,
                    settings.equalizer.preset === preset && styles.presetTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAdvancedSettings = () => (
    <View style={styles.settingsContent}>
      <SettingItem
        label="Picture-in-Picture"
        value={settings.pipEnabled}
        onValueChange={(value) => dispatch(setPipEnabled(value))}
        type="switch"
      />

      <SettingItem
        label="PiP on Minimize"
        value={settings.pipOnMinimize}
        onValueChange={(value) => dispatch(setPipOnMinimize(value))}
        type="switch"
      />

      <SettingItem
        label="Auto Rotate"
        value={settings.autoRotate}
        onValueChange={(value) => dispatch(setAutoRotate(value))}
        type="switch"
      />

      <Text style={styles.sectionTitle}>Gestures</Text>
      <SettingItem
        label="Swipe to Seek"
        value={settings.swipeToSeek ? 'Enabled' : 'Disabled'}
        type="info"
      />
      <SettingItem
        label="Double Tap to Seek"
        value={settings.doubleTapToSeek ? 'Enabled' : 'Disabled'}
        type="info"
      />
      <SettingItem
        label="Volume Gesture"
        value={settings.volumeGesture ? 'Enabled' : 'Disabled'}
        type="info"
      />
      <SettingItem
        label="Brightness Gesture"
        value={settings.brightnessGesture ? 'Enabled' : 'Disabled'}
        type="info"
      />
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'subtitles':
        return renderSubtitleSettings();
      case 'audio':
        return renderAudioSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Player Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? '#E50914' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content - FIXED SCROLLVIEW */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#1F1F1F',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    borderRadius: 20,

    height: '80%', // CHANGED FROM maxHeight to height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8, // Added padding bottom
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2D2D2D',
  },
  tabActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  tabTextActive: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1, // IMPORTANT: Takes remaining space
  },
  scrollContent: {
    flexGrow: 1, // ADDED: Ensures content can scroll
  },
  settingsContent: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitlePreview: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 8,
    marginTop: 12,
  },
  subtitleText: {
    padding: 8,
    borderRadius: 4,
  },
  equalizerPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2D2D2D',
  },
  presetButtonActive: {
    backgroundColor: '#E50914',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  presetTextActive: {
    fontWeight: 'bold',
  },
});

export default SettingsMenu;