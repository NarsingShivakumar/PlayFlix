// src/screens/DriveVideosScreen.js

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    Alert,
    Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { loadDriveVideos } from '../store/slices/driveSlice';
import { setCurrentVideo } from '../store/slices/playerSlice';
import googleDriveService from '../services/googleDriveService';
import { formatFileSize, formatDuration } from '../utils/formatters';

const DriveVideosScreen = ({ navigation, route }) => {
    const { folderId, folderName } = route.params || {};
    const dispatch = useDispatch();
    const { videos, loading } = useSelector((state) => state.drive);
    const isDark = useSelector((state) => state.settings.theme) === 'dark';

    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        loadVideos();
    }, [folderId]);

    const loadVideos = async () => {
        try {
            await dispatch(loadDriveVideos(folderId || 'root')).unwrap();
        } catch (error) {
            Alert.alert('Error', 'Failed to load videos. Please try again.');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadVideos();
        setRefreshing(false);
    };

    //   const handleVideoPress = async (video) => {
    //     try {
    //       // Get stream URL
    //       const streamUrl = googleDriveService.getVideoStreamUrl(video.id);

    //       // Set current video in Redux
    //       dispatch(setCurrentVideo({
    //         id: video.id,
    //         name: video.name,
    //         path: streamUrl,
    //         size: video.size,
    //         duration: video.videoMediaMetadata?.durationMillis / 1000 || 0,
    //         source: 'drive',
    //       }));

    //       // Navigate to player
    //       navigation.navigate('VideoPlayer', {
    //         video: {
    //           id: video.id,
    //           name: video.name,
    //           path: streamUrl,
    //           size: video.size,
    //           duration: video.videoMediaMetadata?.durationMillis / 1000 || 0,
    //         },
    //         source: 'drive',
    //       });
    //     } catch (error) {
    //       Alert.alert('Error', 'Failed to play video. Please try again.');
    //     }
    //   };

    // const handleVideoPress = (video) => {
    //     console.log('▶️ Playing Drive video:', video.name);
    //     console.log('🆔 Video ID:', video.id);

    //     // Navigate to WebView player
    //     navigation.navigate('DriveVideoPlayer', {
    //         video: video,
    //     });
    // };

    // Alternative: Show option to download or open in browser

    const handleVideoPress = (video) => {
        // Alert.alert(
        //     'Play Video',
        //     'How would you like to play this video?',
        //     [
        //         {
        //             text: 'Stream (WebView)',
        //             onPress: () => {
        //                 navigation.navigate('DriveVideoPlayer', { video });
        //             },
        //         },
        //         {
        //             text: 'Open in Browser',
        //             onPress: async () => {
        //                 const fileId = video.id;
        //                 const url = `https://drive.google.com/file/d/${fileId}/view`;
        //                 Linking.openURL(url);
        //             },
        //         },
        //         { text: 'Cancel', style: 'cancel' },
        //     ]
        // );
        const fileId = video.id;
        const url = `https://drive.google.com/file/d/${fileId}/view`;
        Linking.openURL(url);
    };

    const renderVideoList = ({ item }) => (
        <TouchableOpacity
            style={[styles.videoCard, isDark && styles.videoCardDark]}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.7}
        >
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
                {item.thumbnailLink ? (
                    <Image
                        source={{ uri: item.thumbnailLink }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.thumbnailPlaceholder, isDark && styles.thumbnailPlaceholderDark]}>
                        <Ionicons name="play-circle" size={40} color="#E50914" />
                    </View>
                )}

                {item.videoMediaMetadata?.durationMillis && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                            {formatDuration(item.videoMediaMetadata.durationMillis / 1000)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.videoInfo}>
                <Text style={[styles.videoName, isDark && styles.textDark]} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.videoMeta}>
                    <Text style={[styles.videoSize, isDark && styles.textSecondaryDark]}>
                        {formatFileSize(item.size)}
                    </Text>
                    {item.videoMediaMetadata?.width && (
                        <Text style={[styles.videoResolution, isDark && styles.textSecondaryDark]}>
                            • {item.videoMediaMetadata.width}x{item.videoMediaMetadata.height}
                        </Text>
                    )}
                </View>
            </View>

            <Ionicons
                name="play-circle"
                size={32}
                color="#E50914"
            />
        </TouchableOpacity>
    );

    const renderVideoGrid = ({ item }) => (
        <TouchableOpacity
            style={[styles.gridItem, isDark && styles.gridItemDark]}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.7}
        >
            {item.thumbnailLink ? (
                <Image
                    source={{ uri: item.thumbnailLink }}
                    style={styles.gridThumbnail}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.gridThumbnail, styles.gridPlaceholder, isDark && styles.gridPlaceholderDark]}>
                    <Ionicons name="play-circle" size={50} color="#E50914" />
                </View>
            )}

            {item.videoMediaMetadata?.durationMillis && (
                <View style={styles.gridDurationBadge}>
                    <Text style={styles.durationText}>
                        {formatDuration(item.videoMediaMetadata.durationMillis / 1000)}
                    </Text>
                </View>
            )}

            <Text style={[styles.gridVideoName, isDark && styles.textDark]} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {folderName || 'Drive Videos'}
                </Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        style={styles.viewModeButton}
                    >
                        <Ionicons
                            name={viewMode === 'list' ? 'grid' : 'list'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Videos List/Grid */}
            {loading && !refreshing ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#E50914" />
                    <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
                        Loading videos...
                    </Text>
                </View>
            ) : videos.length === 0 ? (
                <View style={styles.centerContent}>
                    <Ionicons name="film-outline" size={80} color="#666666" />
                    <Text style={[styles.emptyText, isDark && styles.textDark]}>
                        No videos found
                    </Text>
                    <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
                        Upload videos to this folder in Google Drive
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={viewMode === 'list' ? renderVideoList : renderVideoGrid}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={viewMode} // Force re-render when switching modes
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#E50914"
                            colors={['#E50914']}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    containerDark: {
        backgroundColor: '#141414',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E50914',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 48,
    },
    headerDark: {
        backgroundColor: '#1F1F1F',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginLeft: 16,
    },
    backButton: {
        padding: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    viewModeButton: {
        padding: 8,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666666',
        marginTop: 8,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    videoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    videoCardDark: {
        backgroundColor: '#1F1F1F',
    },
    thumbnailContainer: {
        position: 'relative',
        marginRight: 12,
    },
    thumbnail: {
        width: 120,
        height: 80,
        borderRadius: 8,
    },
    thumbnailPlaceholder: {
        width: 120,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailPlaceholderDark: {
        backgroundColor: '#2D2D2D',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    videoInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    videoName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    videoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoSize: {
        fontSize: 12,
        color: '#666666',
    },
    videoResolution: {
        fontSize: 12,
        color: '#666666',
    },
    gridItem: {
        flex: 1,
        margin: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gridItemDark: {
        backgroundColor: '#1F1F1F',
    },
    gridThumbnail: {
        width: '100%',
        height: 120,
    },
    gridPlaceholder: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridPlaceholderDark: {
        backgroundColor: '#2D2D2D',
    },
    gridDurationBadge: {
        position: 'absolute',
        top: 90,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    gridVideoName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        padding: 8,
    },
    textDark: {
        color: '#FFFFFF',
    },
    textSecondaryDark: {
        color: '#B3B3B3',
    },
});

export default DriveVideosScreen;
