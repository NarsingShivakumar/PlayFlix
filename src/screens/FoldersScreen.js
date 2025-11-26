// src/screens/FoldersScreen.js

/**
 * Folders Screen
 * Shows all folders containing videos with options to sort and filter
 * Features:
 * - Scan device for videos
 * - Group by folders
 * - Sort options
 * - Grid/List view toggle
 */

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
  Modal,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';
import { scanVideos } from '../store/slices/videoSlice';
import { setViewMode } from '../store/slices/folderSlice';
import { formatFileSize } from '../utils/formatters';

const { width } = Dimensions.get('window');

const FoldersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { allVideos, loading } = useSelector((state) => state.videos);
  const { viewMode } = useSelector((state) => state.folders);
  const theme = useSelector((state) => state.settings.theme);
  const isDark = theme === 'dark';
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'count', 'size'
  
  // Group videos by folder
  const [folders, setFolders] = useState([]);
  
  useEffect(() => {
    // Initial scan
    handleScan();
  }, []);
  
  useEffect(() => {
    // Group videos by folder whenever allVideos changes
    groupVideosByFolder();
  }, [allVideos, sortBy]);
  
  const handleScan = async () => {
    try {
      await dispatch(scanVideos()).unwrap();
    } catch (error) {
      Alert.alert('Error', error);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await handleScan();
    setRefreshing(false);
  };
  
  const groupVideosByFolder = () => {
    const folderMap = {};
    
    allVideos.forEach((video) => {
      const folderPath = video.folder;
      const folderName = folderPath.split('/').pop() || 'Unknown';
      
      if (!folderMap[folderPath]) {
        folderMap[folderPath] = {
          path: folderPath,
          name: folderName,
          videos: [],
          totalSize: 0,
          thumbnail: null,
        };
      }
      
      folderMap[folderPath].videos.push(video);
      folderMap[folderPath].totalSize += video.size;
      
      // Use first video as thumbnail
      if (!folderMap[folderPath].thumbnail) {
        folderMap[folderPath].thumbnail = video.path;
      }
    });
    
    let foldersArray = Object.values(folderMap);
    
    // Sort folders
    foldersArray = foldersArray.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'count':
          return b.videos.length - a.videos.length;
        case 'size':
          return b.totalSize - a.totalSize;
        default:
          return 0;
      }
    });
    
    setFolders(foldersArray);
  };
  
  const handleFolderPress = (folder) => {
    navigation.navigate('LocalVideos', { folder });
  };
  
  const renderFolderGrid = ({ item }) => (
    <TouchableOpacity
      style={[styles.folderCardGrid, isDark && styles.folderCardGridDark]}
      onPress={() => handleFolderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {item.thumbnail ? (
          <Image
            source={{ uri: `file://${item.thumbnail}` }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnailPlaceholder, isDark && styles.thumbnailPlaceholderDark]}>
            <Ionicons name="folder" size={50} color={isDark ? '#666' : '#ccc'} />
          </View>
        )}
        <View style={styles.videoCountBadge}>
          <Text style={styles.videoCountText}>{item.videos.length} videos</Text>
        </View>
      </View>
      
      <View style={styles.folderInfo}>
        <Text style={[styles.folderName, isDark && styles.textDark]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.folderSize, isDark && styles.textSecondaryDark]}>
          {formatFileSize(item.totalSize)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderFolderList = ({ item }) => (
    <TouchableOpacity
      style={[styles.folderCardList, isDark && styles.folderCardListDark]}
      onPress={() => handleFolderPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listThumbnail}>
        {item.thumbnail ? (
          <Image
            source={{ uri: `file://${item.thumbnail}` }}
            style={styles.listThumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.listThumbnailPlaceholder, isDark && styles.thumbnailPlaceholderDark]}>
            <Ionicons name="folder" size={30} color={isDark ? '#666' : '#ccc'} />
          </View>
        )}
      </View>
      
      <View style={styles.listInfo}>
        <Text style={[styles.folderName, isDark && styles.textDark]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.listSubtext, isDark && styles.textSecondaryDark]}>
          {item.videos.length} videos • {formatFileSize(item.totalSize)}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={24} color={isDark ? '#666' : '#ccc'} />
    </TouchableOpacity>
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
          <Text style={[styles.modalTitle, isDark && styles.textDark]}>Sort By</Text>
          
          {['name', 'count', 'size'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.modalOption}
              onPress={() => {
                setSortBy(option);
                setSortModalVisible(false);
              }}
            >
              <Text style={[styles.modalOptionText, isDark && styles.textDark]}>
                {option === 'name' && 'Name'}
                {option === 'count' && 'Video Count'}
                {option === 'size' && 'Size'}
              </Text>
              {sortBy === option && (
                <Ionicons name="checkmark" size={24} color="#E50914" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  if (loading && folders.length === 0) {
    return (
      <View style={[styles.container, styles.centered, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={[styles.loadingText, isDark && styles.textDark]}>
          Scanning for videos...
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>Local Folders</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Ionicons name="funnel-outline" size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => dispatch(setViewMode(viewMode === 'grid' ? 'list' : 'grid'))}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={24}
              color={isDark ? '#FFF' : '#000'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleScan}
          >
            <Ionicons name="refresh-outline" size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Folders List */}
      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color={isDark ? '#666' : '#ccc'} />
          <Text style={[styles.emptyText, isDark && styles.textDark]}>
            No videos found
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.textSecondaryDark]}>
            Pull to scan for videos
          </Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          renderItem={viewMode === 'grid' ? renderFolderGrid : renderFolderList}
          keyExtractor={(item) => item.path}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when switching modes
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E50914"
              colors={['#E50914']}
            />
          }
        />
      )}
      
      {/* Sort Modal */}
      <SortModal />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  
  // List
  listContent: {
    padding: 12,
  },
  
  // Grid View
  folderCardGrid: {
    flex: 1,
    margin: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  folderCardGridDark: {
    backgroundColor: '#1F1F1F',
  },
  thumbnailContainer: {
    width: '100%',
    height: (width / 2) - 24,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderDark: {
    backgroundColor: '#2D2D2D',
  },
  videoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  folderInfo: {
    padding: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  folderSize: {
    fontSize: 12,
    color: '#666666',
  },
  
  // List View
  folderCardList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
    elevation: 1,
  },
  folderCardListDark: {
    backgroundColor: '#1F1F1F',
  },
  listThumbnail: {
    width: 80,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  listThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  
  // Text
  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#B3B3B3',
  },
  
  // Loading
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  
  // Modal
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
});

export default FoldersScreen;
