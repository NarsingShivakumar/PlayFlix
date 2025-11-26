// src/screens/DriveVideoPlayerScreen.js - FIXED WITH AUTHENTICATION

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation-locker';
import googleDriveService from '../services/googleDriveService';
import Ionicons from '@react-native-vector-icons/ionicons';

const DriveVideoPlayerScreen = ({ route, navigation }) => {
  const { video } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webViewUrl, setWebViewUrl] = useState(null);

  useEffect(() => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    
    prepareVideo();
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    
    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
      backHandler.remove();
    };
  }, []);

  const prepareVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fileId = video.id;
      console.log('🎬 Preparing Drive video for WebView');
      console.log('📄 File:', video.name);
      console.log('🆔 ID:', fileId);
      
      // Refresh token
      await googleDriveService.refreshTokenIfNeeded();
      const accessToken = googleDriveService.accessToken;
      
      console.log('🔑 Has token:', !!accessToken);
      
      // Use direct media link with token (works better than preview)
      const streamUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
      
      console.log('🌐 Stream URL ready');
      
      setWebViewUrl(streamUrl);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Failed to prepare video:', err);
      setError(err.message || 'Failed to load video');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
    return true;
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    
    Alert.alert(
      'Playback Error',
      'Cannot play this video. It might be:\n\n• Too large for streaming\n• Requires download first\n• Unsupported format',
      [
        { text: 'Go Back', onPress: () => navigation.goBack() },
        { text: 'Retry', onPress: () => prepareVideo() },
      ]
    );
  };

  const handleWebViewLoad = () => {
    console.log('✅ WebView loaded');
    setLoading(false);
  };

  const handleWebViewLoadStart = () => {
    console.log('🔄 WebView loading...');
    setLoading(true);
  };

  if (!video || !video.id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={80} color="#E50914" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>No video selected</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={80} color="#E50914" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!webViewUrl) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Preparing video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* WebView with Video */}
      <WebView
        source={{ 
          uri: webViewUrl,
        }}
        style={styles.webview}
        onLoadStart={handleWebViewLoadStart}
        onLoadEnd={handleWebViewLoad}
        onError={handleWebViewError}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        // Inject HTML to play video
        injectedJavaScript={`
          const style = document.createElement('style');
          style.innerHTML = \`
            body {
              margin: 0;
              padding: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            video {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
            }
          \`;
          document.head.appendChild(style);
          
          const video = document.createElement('video');
          video.src = '${webViewUrl}';
          video.controls = true;
          video.autoplay = true;
          video.style.width = '100%';
          video.style.height = '100%';
          
          document.body.innerHTML = '';
          document.body.appendChild(video);
          
          video.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
          });
          
          video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            document.body.innerHTML = '<div style="color:white;text-align:center;padding:20px;">Failed to load video</div>';
          });
          
          true;
        `}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading video...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    padding: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#B3B3B3',
    marginTop: 8,
    fontSize: 14,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#E50914',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DriveVideoPlayerScreen;
