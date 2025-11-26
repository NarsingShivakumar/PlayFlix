// src/screens/VideosScreen.js

/**
 * Videos Screen
 * Shows all videos in selected folder with advanced features
 * Features:
 * - Grid/List view
 * - Sort by name, date, size, duration
 * - Search videos
 * - Continue watching
 * - Favorites
 * - Video preview on long press
 */

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    Modal,
    Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { formatDuration, formatFileSize, truncateText } from '../utils/formatters';
import { toggleFavorite } from '../store/slices/videoSlice';
import { setCurrentVideo } from '../store/slices/playerSlice';

const { width } = Dimensions.get('window');

const VideosScreen = ({ route, navigation }) => {
    const { folder } = route.params;
    const dispatch = useDispatch();

    // Redux state
    const { favorites } = useSelector((state) => state.videos);
    const { watchHistory } = useSelector((state) => state.player);
    const theme = useSelector((state) => state.settings.theme);
    const viewMode = useSelector((state) => state.folders.viewMode);
    const isDark = theme === 'dark';

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, date, size, duration
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);

    // Filter and sort videos
    const filteredVideos = useMemo(() => {
        let videos = folder.videos.filter((video) =>
            video.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort
        videos = videos.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'duration':
                    comparison = (a.duration || 0) - (b.duration || 0);
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return videos;
    }, [folder.videos, searchQuery, sortBy, sortOrder]);

    const handlePlayVideo = (video) => {
        dispatch(setCurrentVideo(video));
        navigation.navigate('VideoPlayer');
    };

    const handleToggleFavorite = (video) => {
        dispatch(toggleFavorite(video.id));
    };

    const isFavorite = (videoId) => {
        return favorites.some((v) => v.id === videoId);
    };

    const getProgress = (videoId) => {
        const history = watchHistory[videoId];
        return history ? history.percentage : 0;
    };

    const renderVideoGrid = ({ item }) => {
        const progress = getProgress(item.id);
        const favorite = isFavorite(item.id);

        return (
            <TouchableOpacity
                style={[styles.videoCardGrid, isDark && styles.videoCardGridDark]}
                onPress={() => handlePlayVideo(item)}
                onLongPress={() => {
                    setSelectedVideo(item);
                    setPreviewModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={{ uri: `file://${item.path}` }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />

                    {/* Progress bar */}
                    {progress > 0 && progress < 95 && (
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                    )}

                    {/* Duration badge */}
                    {item.duration > 0 && (
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>
                                {formatDuration(item.duration)}
                            </Text>
                        </View>
                    )}

                    {/* Play icon overlay */}
                    <View style={styles.playOverlay}>
                        <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.9)" />
                    </View>
                </View>

                <View style={styles.videoInfo}>
                    <Text style={[styles.videoName, isDark && styles.textDark]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={[styles.videoSize, isDark && styles.textSecondaryDark]}>
                        {formatFileSize(item.size)}
                    </Text>
                </View>

                {/* Favorite icon */}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(item)}
                >
                    <Ionicons
                        name={favorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={favorite ? '#E50914' : (isDark ? '#666' : '#999')}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderVideoList = ({ item }) => {
        const progress = getProgress(item.id);
        const favorite = isFavorite(item.id);

        return (
            <TouchableOpacity
                style={[styles.videoCardList, isDark && styles.videoCardListDark]}
                onPress={() => handlePlayVideo(item)}
                onLongPress={() => {
                    setSelectedVideo(item);
                    setPreviewModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.listThumbnail}>
                    <Image
                        source={{ uri: `file://${item.path}` }}
                        style={styles.listThumbnailImage}
                        resizeMode="cover"
                    />

                    {progress > 0 && progress < 95 && (
                        <View style={styles.progressBarList}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                    )}

                    <View style={styles.playIconList}>
                        <Ionicons name="play-circle" size={30} color="rgba(255,255,255,0.9)" />
                    </View>
                </View>

                <View style={styles.listInfo}>
                    <Text style={[styles.videoName, isDark && styles.textDark]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.listMetadata}>
                        {item.duration > 0 && (
                            <Text style={[styles.metadataText, isDark && styles.textSecondaryDark]}>
                                {formatDuration(item.duration)}
                            </Text>
                        )}
                        <Text style={[styles.metadataText, isDark && styles.textSecondaryDark]}>
                            {formatFileSize(item.size)}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.favoriteButtonList}
                    onPress={() => handleToggleFavorite(item)}
                >
                    <Ionicons
                        name={favorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={favorite ? '#E50914' : (isDark ? '#666' : '#999')}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const PreviewModal = () => (
        <Modal
            visible={previewModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewModalVisible(false)}
        >
            <TouchableOpacity
                style={styles.previewOverlay}
                activeOpacity={1}
                onPress={() => setPreviewModalVisible(false)}
            >
                <View style={[styles.previewContent, isDark && styles.previewContentDark]}>
                    {selectedVideo && (
                        <>
                            <Image
                                source={{ uri: `file://${selectedVideo.path}` }}
                                style={styles.previewImage}
                                resizeMode="cover"
                            />

                            <View style={styles.previewInfo}>
                                <Text style={[styles.previewTitle, isDark && styles.textDark]}>
                                    {selectedVideo.name}
                                </Text>

                                <View style={styles.previewMetadata}>
                                    {selectedVideo.duration > 0 && (
                                        <Text style={[styles.previewMeta, isDark && styles.textSecondaryDark]}>
                                            {formatDuration(selectedVideo.duration)}
                                        </Text>
                                    )}
                                    <Text style={[styles.previewMeta, isDark && styles.textSecondaryDark]}>
                                        {formatFileSize(selectedVideo.size)}
                                    </Text>
                                    <Text style={[styles.previewMeta, isDark && styles.textSecondaryDark]}>
                                        {selectedVideo.extension.toUpperCase()}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => {
                                        setPreviewModalVisible(false);
                                        handlePlayVideo(selectedVideo);
                                    }}
                                >
                                    <Ionicons name="play" size={20} color="#FFF" />
                                    <Text style={styles.playButtonText}>Play Video</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const SortModal = () => (
        <Modal
            visible={sortModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSortModalVisible(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setSortModalVisible(false)}
            >
                <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                    <Text style={[styles.modalTitle, isDark && styles.textDark]}>Sort Videos</Text>

                    {['name', 'date', 'size', 'duration'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.modalOption}
                            onPress={() => {
                                if (sortBy === option) {
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                } else {
                                    setSortBy(option);
                                    setSortOrder('asc');
                                }
                                setSortModalVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionText, isDark && styles.textDark]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                            {sortBy === option && (
                                <Ionicons
                                    name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                                    size={20}
                                    color="#E50914"
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            {/* Header */}
            <View style={[styles.header, isDark && styles.headerDark]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, isDark && styles.textDark]} numberOfLines={1}>
                    {folder.name}
                </Text>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setSortModalVisible(true)}
                >
                    <Ionicons name="funnel-outline" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
                <Ionicons name="search" size={20} color={isDark ? '#666' : '#999'} />
                <TextInput
                    style={[styles.searchInput, isDark && styles.searchInputDark]}
                    placeholder="Search videos..."
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={isDark ? '#666' : '#999'} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Videos List */}
            {filteredVideos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="videocam-outline" size={80} color={isDark ? '#666' : '#ccc'} />
                    <Text style={[styles.emptyText, isDark && styles.textDark]}>
                        {searchQuery ? 'No videos found' : 'This folder is empty'}
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={[styles.videoCount, isDark && styles.textSecondaryDark]}>
                        {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                    </Text>

                    <FlatList
                        data={filteredVideos}
                        renderItem={viewMode === 'grid' ? renderVideoGrid : renderVideoList}
                        keyExtractor={(item) => item.id}
                        numColumns={viewMode === 'grid' ? 2 : 1}
                        key={viewMode}
                        contentContainerStyle={styles.listContent}
                    />
                </>
            )}

            {/* Modals */}
            <SortModal />
            <PreviewModal />
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerDark: {
        backgroundColor: '#1F1F1F',
        borderBottomColor: '#2D2D2D',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerButton: {
        padding: 4,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        margin: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    searchContainerDark: {
        backgroundColor: '#1F1F1F',
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#000000',
    },
    searchInputDark: {
        color: '#FFFFFF',
    },

    // Video count
    videoCount: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        fontSize: 14,
        color: '#666666',
    },

    // List
    listContent: {
        padding: 6,
    },

    // Grid View
    videoCardGrid: {
        flex: 1,
        margin: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    videoCardGridDark: {
        backgroundColor: '#1F1F1F',
    },
    thumbnailContainer: {
        width: '100%',
        height: (width / 2) * 1.2,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -25,
        marginTop: -25,
    },
    progressBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#E50914',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    videoInfo: {
        padding: 8,
    },
    videoName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    videoSize: {
        fontSize: 11,
        color: '#666666',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6,
        borderRadius: 20,
    },

    // List View
    videoCardList: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 8,
        marginVertical: 4,
        marginHorizontal: 12,
        borderRadius: 12,
        elevation: 1,
    },
    videoCardListDark: {
        backgroundColor: '#1F1F1F',
    },
    listThumbnail: {
        width: 120,
        height: 90,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        position: 'relative',
    },
    listThumbnailImage: {
        width: '100%',
        height: '100%',
    },
    playIconList: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15,
        marginTop: -15,
    },
    progressBarList: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    listInfo: {
        flex: 1,
    },
    listMetadata: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    metadataText: {
        fontSize: 12,
        color: '#666666',
    },
    favoriteButtonList: {
        padding: 8,
    },

    // Text
    textDark: {
        color: '#FFFFFF',
    },
    textSecondaryDark: {
        color: '#B3B3B3',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginTop: 16,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
    },
    modalContentDark: {
        backgroundColor: '#1F1F1F',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#000000',
    },

    // Preview Modal
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContent: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
    },
    previewContentDark: {
        backgroundColor: '#1F1F1F',
    },
    previewImage: {
        width: '100%',
        height: 200,
    },
    previewInfo: {
        padding: 16,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
    },
    previewMetadata: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    previewMeta: {
        fontSize: 12,
        color: '#666666',
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E50914',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    playButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default VideosScreen;
