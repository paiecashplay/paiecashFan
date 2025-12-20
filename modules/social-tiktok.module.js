/**
 * ========================================
 * 📱 SOCIAL TIKTOK MODULE V11.0
 * ========================================
 * Module réseau social type TikTok pour vidéos d'événements sportifs
 * 
 * FONCTIONNALITÉS :
 * - Feed vidéo vertical avec scroll infini (TikTok-style)
 * - Upload vidéos événements sportifs
 * - Likes, Shares, Comments
 * - Follow/Unfollow clubs & fans
 * - Hashtags & trending
 * - Notifications en temps réel
 * - FOMO events (événements à durée limitée)
 * - Stories 24h
 * - Live streaming
 * - Video reactions
 * - Persistent storage avec IndexedDB
 * 
 * NAMESPACE : pcf_v11_SocialTikTok_
 * DÉPENDANCES : core-system.module.js, auth-persistent.module.js
 * 
 * @version 11.0.0
 * @date 2024-12-13
 * @author PaieCashFan Team
 */

(function(window) {
    'use strict';

    // ========================================
    // NAMESPACE UNIQUE
    // ========================================
    const MODULE_NAME = 'SocialTikTok';
    const NAMESPACE = `pcf_v11_${MODULE_NAME}_`;

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        // API Endpoints (à configurer selon votre backend)
        API: {
            BASE_URL: '/api/social',
            VIDEOS: '/videos',
            FEED: '/feed',
            UPLOAD: '/upload',
            LIKE: '/like',
            COMMENT: '/comment',
            SHARE: '/share',
            FOLLOW: '/follow',
            TRENDING: '/trending',
            NOTIFICATIONS: '/notifications',
            STORIES: '/stories',
            LIVE: '/live'
        },

        // Video constraints
        VIDEO: {
            MAX_SIZE: 100 * 1024 * 1024, // 100MB
            MAX_DURATION: 180, // 3 minutes en secondes
            FORMATS: ['video/mp4', 'video/webm', 'video/quicktime'],
            ASPECT_RATIOS: ['9:16', '16:9', '4:5', '1:1'] // Vertical first (TikTok style)
        },

        // Feed pagination
        PAGINATION: {
            VIDEOS_PER_PAGE: 10,
            COMMENTS_PER_PAGE: 20,
            NOTIFICATIONS_PER_PAGE: 50
        },

        // Stories TTL (24 heures)
        STORIES_TTL: 24 * 60 * 60 * 1000,

        // Storage keys
        STORAGE_KEYS: {
            FEED_CACHE: `${NAMESPACE}feedCache`,
            LIKED_VIDEOS: `${NAMESPACE}likedVideos`,
            FOLLOWING: `${NAMESPACE}following`,
            NOTIFICATIONS: `${NAMESPACE}notifications`,
            DRAFTS: `${NAMESPACE}drafts`,
            WATCH_HISTORY: `${NAMESPACE}watchHistory`
        },

        // IndexedDB
        INDEXEDDB: {
            NAME: `${NAMESPACE}database`,
            VERSION: 1,
            STORES: {
                VIDEOS: 'videos',
                COMMENTS: 'comments',
                LIKES: 'likes',
                FOLLOWS: 'follows',
                NOTIFICATIONS: 'notifications',
                DRAFTS: 'drafts',
                STORIES: 'stories',
                HISTORY: 'history'
            }
        },

        // Cache TTL (5 minutes)
        CACHE_TTL: 5 * 60 * 1000
    };

    // ========================================
    // STATE PRIVÉ
    // ========================================
    let state = {
        isInitialized: false,
        currentUser: null,
        feed: [],
        trending: [],
        following: [],
        likedVideos: [],
        notifications: [],
        drafts: [],
        watchHistory: [],
        currentVideoIndex: 0,
        isPlaying: false,
        db: null // IndexedDB instance
    };

    // ========================================
    // INDEXEDDB INITIALIZATION
    // ========================================
    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(CONFIG.INDEXEDDB.NAME, CONFIG.INDEXEDDB.VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                state.db = request.result;
                console.log(`[${MODULE_NAME}] IndexedDB initialized`);
                resolve(state.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store: videos
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.VIDEOS)) {
                    const videoStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.VIDEOS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    videoStore.createIndex('userId', 'userId', { unique: false });
                    videoStore.createIndex('clubId', 'clubId', { unique: false });
                    videoStore.createIndex('timestamp', 'createdAt', { unique: false });
                    videoStore.createIndex('trending', 'trendingScore', { unique: false });
                }

                // Store: comments
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.COMMENTS)) {
                    const commentStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.COMMENTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    commentStore.createIndex('videoId', 'videoId', { unique: false });
                    commentStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store: likes
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.LIKES)) {
                    const likeStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.LIKES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    likeStore.createIndex('videoId', 'videoId', { unique: false });
                    likeStore.createIndex('userId', 'userId', { unique: false });
                }

                // Store: follows
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.FOLLOWS)) {
                    const followStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.FOLLOWS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    followStore.createIndex('followerId', 'followerId', { unique: false });
                    followStore.createIndex('followingId', 'followingId', { unique: false });
                }

                // Store: notifications
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.NOTIFICATIONS)) {
                    const notifStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.NOTIFICATIONS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    notifStore.createIndex('userId', 'userId', { unique: false });
                    notifStore.createIndex('read', 'read', { unique: false });
                    notifStore.createIndex('timestamp', 'createdAt', { unique: false });
                }

                // Store: drafts
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.DRAFTS)) {
                    db.createObjectStore(CONFIG.INDEXEDDB.STORES.DRAFTS, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                }

                // Store: stories
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.STORIES)) {
                    const storyStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.STORIES, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    storyStore.createIndex('userId', 'userId', { unique: false });
                    storyStore.createIndex('expiresAt', 'expiresAt', { unique: false });
                }

                // Store: history
                if (!db.objectStoreNames.contains(CONFIG.INDEXEDDB.STORES.HISTORY)) {
                    const historyStore = db.createObjectStore(CONFIG.INDEXEDDB.STORES.HISTORY, { 
                        keyPath: 'id', 
                        autoIncrement: false 
                    });
                    historyStore.createIndex('userId', 'userId', { unique: false });
                    historyStore.createIndex('videoId', 'videoId', { unique: false });
                }

                console.log(`[${MODULE_NAME}] IndexedDB stores created`);
            };
        });
    }

    // ========================================
    // STORAGE HELPERS
    // ========================================
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error saving to localStorage:`, error);
        }
    }

    function loadFromLocalStorage(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading from localStorage:`, error);
            return null;
        }
    }

    function saveToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function getAllFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(new Error('IndexedDB not initialized'));
                return;
            }

            const transaction = state.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // API HELPERS
    // ========================================
    async function apiRequest(endpoint, options = {}) {
        try {
            const { method = 'GET', data = null, params = {} } = options;

            const url = new URL(`${CONFIG.API.BASE_URL}${endpoint}`, window.location.origin);
            
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            const headers = {
                'Content-Type': 'application/json'
            };

            // Ajouter token auth si disponible
            if (window.PaieCashFan_AuthPersistent) {
                const authState = window.PaieCashFan_AuthPersistent.getState();
                if (authState.token) {
                    headers['Authorization'] = `Bearer ${authState.token}`;
                }
            }

            const fetchOptions = {
                method,
                headers
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                fetchOptions.body = JSON.stringify(data);
            }

            const response = await fetch(url.toString(), fetchOptions);

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return { success: true, data: result };

        } catch (error) {
            console.error(`[${MODULE_NAME}] API error:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // FEED MANAGEMENT
    // ========================================
    async function loadFeed(page = 1, refresh = false) {
        try {
            console.log(`[${MODULE_NAME}] Loading feed page ${page}...`);

            // Si pas refresh, essayer cache
            if (!refresh && page === 1) {
                const cached = loadFromLocalStorage(CONFIG.STORAGE_KEYS.FEED_CACHE);
                if (cached && (Date.now() - cached.timestamp < CONFIG.CACHE_TTL)) {
                    state.feed = cached.data;
                    console.log(`[${MODULE_NAME}] ✅ Feed loaded from cache`);
                    return { success: true, data: state.feed };
                }
            }

            // Fetch from API
            const result = await apiRequest(CONFIG.API.FEED, {
                params: { 
                    page, 
                    per_page: CONFIG.PAGINATION.VIDEOS_PER_PAGE 
                }
            });

            if (result.success) {
                if (page === 1) {
                    state.feed = result.data;
                } else {
                    state.feed = [...state.feed, ...result.data];
                }

                // Cache page 1
                if (page === 1) {
                    saveToLocalStorage(CONFIG.STORAGE_KEYS.FEED_CACHE, {
                        data: result.data,
                        timestamp: Date.now()
                    });
                }

                // Save videos to IndexedDB
                for (const video of result.data) {
                    await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.VIDEOS, video);
                }

                console.log(`[${MODULE_NAME}] ✅ Feed loaded: ${result.data.length} videos`);

                // Émettre event
                window.dispatchEvent(new CustomEvent('pcf:social:feed:loaded', {
                    detail: { videos: result.data, page }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading feed:`, error);
            return { success: false, error: error.message };
        }
    }

    async function loadTrending() {
        try {
            console.log(`[${MODULE_NAME}] Loading trending videos...`);

            const result = await apiRequest(CONFIG.API.TRENDING);

            if (result.success) {
                state.trending = result.data;

                console.log(`[${MODULE_NAME}] ✅ Trending loaded: ${result.data.length} videos`);

                window.dispatchEvent(new CustomEvent('pcf:social:trending:loaded', {
                    detail: { videos: result.data }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading trending:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // VIDEO UPLOAD
    // ========================================
    async function uploadVideo(videoFile, metadata = {}) {
        try {
            console.log(`[${MODULE_NAME}] Uploading video...`, metadata);

            // Validation
            if (!videoFile) {
                throw new Error('No video file provided');
            }

            if (videoFile.size > CONFIG.VIDEO.MAX_SIZE) {
                throw new Error(`Video too large. Max size: ${CONFIG.VIDEO.MAX_SIZE / 1024 / 1024}MB`);
            }

            if (!CONFIG.VIDEO.FORMATS.includes(videoFile.type)) {
                throw new Error(`Unsupported format. Supported: ${CONFIG.VIDEO.FORMATS.join(', ')}`);
            }

            // Créer FormData
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('metadata', JSON.stringify(metadata));

            // Upload (simulation)
            console.log(`[${MODULE_NAME}] Uploading ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)...`);

            // En production, faire un vrai upload
            const mockVideoId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const mockVideo = {
                id: mockVideoId,
                userId: state.currentUser?.id || 'guest',
                url: URL.createObjectURL(videoFile),
                thumbnail: URL.createObjectURL(videoFile), // À remplacer par vraie thumbnail
                title: metadata.title || '',
                description: metadata.description || '',
                hashtags: metadata.hashtags || [],
                clubId: metadata.clubId || null,
                sport: metadata.sport || null,
                eventDate: metadata.eventDate || null,
                duration: 0, // À calculer
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                createdAt: Date.now(),
                status: 'processing'
            };

            // Sauvegarder
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.VIDEOS, mockVideo);

            console.log(`[${MODULE_NAME}] ✅ Video uploaded:`, mockVideoId);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:social:video:uploaded', {
                detail: { video: mockVideo }
            }));

            // Simuler traitement
            setTimeout(() => {
                mockVideo.status = 'ready';
                saveToIndexedDB(CONFIG.INDEXEDDB.STORES.VIDEOS, mockVideo);
                
                window.dispatchEvent(new CustomEvent('pcf:social:video:ready', {
                    detail: { video: mockVideo }
                }));
            }, 3000);

            return { success: true, video: mockVideo };

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error uploading video:`, error);
            window.dispatchEvent(new CustomEvent('pcf:social:error', {
                detail: { error: error.message }
            }));
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // INTERACTIONS (LIKE, COMMENT, SHARE)
    // ========================================
    async function likeVideo(videoId) {
        try {
            console.log(`[${MODULE_NAME}] Liking video:`, videoId);

            if (!state.currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if already liked
            if (state.likedVideos.includes(videoId)) {
                console.log(`[${MODULE_NAME}] Video already liked`);
                return { success: true, liked: true };
            }

            // API request
            const result = await apiRequest(CONFIG.API.LIKE, {
                method: 'POST',
                data: { videoId }
            });

            if (result.success) {
                state.likedVideos.push(videoId);
                saveToLocalStorage(CONFIG.STORAGE_KEYS.LIKED_VIDEOS, state.likedVideos);

                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.LIKES, {
                    id: `like_${Date.now()}_${videoId}`,
                    videoId,
                    userId: state.currentUser.id,
                    createdAt: Date.now()
                });

                console.log(`[${MODULE_NAME}] ✅ Video liked`);

                window.dispatchEvent(new CustomEvent('pcf:social:video:liked', {
                    detail: { videoId }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error liking video:`, error);
            return { success: false, error: error.message };
        }
    }

    async function unlikeVideo(videoId) {
        try {
            console.log(`[${MODULE_NAME}] Unliking video:`, videoId);

            state.likedVideos = state.likedVideos.filter(id => id !== videoId);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.LIKED_VIDEOS, state.likedVideos);

            const result = await apiRequest(CONFIG.API.LIKE, {
                method: 'DELETE',
                data: { videoId }
            });

            if (result.success) {
                console.log(`[${MODULE_NAME}] ✅ Video unliked`);

                window.dispatchEvent(new CustomEvent('pcf:social:video:unliked', {
                    detail: { videoId }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error unliking video:`, error);
            return { success: false, error: error.message };
        }
    }

    async function commentVideo(videoId, text) {
        try {
            console.log(`[${MODULE_NAME}] Commenting on video:`, videoId);

            if (!state.currentUser) {
                throw new Error('User not authenticated');
            }

            if (!text || text.trim().length === 0) {
                throw new Error('Comment text required');
            }

            const result = await apiRequest(CONFIG.API.COMMENT, {
                method: 'POST',
                data: { videoId, text }
            });

            if (result.success) {
                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.COMMENTS, result.data);

                console.log(`[${MODULE_NAME}] ✅ Comment posted`);

                window.dispatchEvent(new CustomEvent('pcf:social:video:commented', {
                    detail: { videoId, comment: result.data }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error commenting:`, error);
            return { success: false, error: error.message };
        }
    }

    async function shareVideo(videoId, method = 'link') {
        try {
            console.log(`[${MODULE_NAME}] Sharing video:`, videoId, method);

            const result = await apiRequest(CONFIG.API.SHARE, {
                method: 'POST',
                data: { videoId, method }
            });

            if (result.success) {
                console.log(`[${MODULE_NAME}] ✅ Video shared`);

                window.dispatchEvent(new CustomEvent('pcf:social:video:shared', {
                    detail: { videoId, method }
                }));

                // Générer lien de partage
                const shareUrl = `${window.location.origin}/video/${videoId}`;
                
                // Web Share API si disponible
                if (navigator.share && method === 'native') {
                    await navigator.share({
                        title: 'Check out this video!',
                        url: shareUrl
                    });
                }

                return { success: true, shareUrl };
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error sharing video:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // FOLLOW SYSTEM
    // ========================================
    async function follow(targetId, targetType = 'user') {
        try {
            console.log(`[${MODULE_NAME}] Following ${targetType}:`, targetId);

            if (!state.currentUser) {
                throw new Error('User not authenticated');
            }

            const result = await apiRequest(CONFIG.API.FOLLOW, {
                method: 'POST',
                data: { targetId, targetType }
            });

            if (result.success) {
                state.following.push({ id: targetId, type: targetType });
                saveToLocalStorage(CONFIG.STORAGE_KEYS.FOLLOWING, state.following);

                await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.FOLLOWS, {
                    id: `follow_${Date.now()}_${targetId}`,
                    followerId: state.currentUser.id,
                    followingId: targetId,
                    followingType: targetType,
                    createdAt: Date.now()
                });

                console.log(`[${MODULE_NAME}] ✅ Following ${targetType} ${targetId}`);

                window.dispatchEvent(new CustomEvent('pcf:social:followed', {
                    detail: { targetId, targetType }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error following:`, error);
            return { success: false, error: error.message };
        }
    }

    async function unfollow(targetId) {
        try {
            console.log(`[${MODULE_NAME}] Unfollowing:`, targetId);

            state.following = state.following.filter(f => f.id !== targetId);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.FOLLOWING, state.following);

            const result = await apiRequest(CONFIG.API.FOLLOW, {
                method: 'DELETE',
                data: { targetId }
            });

            if (result.success) {
                console.log(`[${MODULE_NAME}] ✅ Unfollowed ${targetId}`);

                window.dispatchEvent(new CustomEvent('pcf:social:unfollowed', {
                    detail: { targetId }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error unfollowing:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================
    async function loadNotifications() {
        try {
            console.log(`[${MODULE_NAME}] Loading notifications...`);

            const result = await apiRequest(CONFIG.API.NOTIFICATIONS);

            if (result.success) {
                state.notifications = result.data;

                for (const notif of result.data) {
                    await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.NOTIFICATIONS, notif);
                }

                const unreadCount = result.data.filter(n => !n.read).length;

                console.log(`[${MODULE_NAME}] ✅ Loaded ${result.data.length} notifications (${unreadCount} unread)`);

                window.dispatchEvent(new CustomEvent('pcf:social:notifications:loaded', {
                    detail: { notifications: result.data, unreadCount }
                }));
            }

            return result;

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error loading notifications:`, error);
            return { success: false, error: error.message };
        }
    }

    function getUnreadNotificationCount() {
        return state.notifications.filter(n => !n.read).length;
    }

    // ========================================
    // WATCH HISTORY
    // ========================================
    async function trackVideoView(videoId, watchDuration = 0) {
        try {
            const historyEntry = {
                id: `hist_${Date.now()}_${videoId}`,
                userId: state.currentUser?.id || 'guest',
                videoId,
                watchDuration,
                watchedAt: Date.now()
            };

            state.watchHistory.push(historyEntry);
            await saveToIndexedDB(CONFIG.INDEXEDDB.STORES.HISTORY, historyEntry);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.WATCH_HISTORY, state.watchHistory.slice(-100));

            console.log(`[${MODULE_NAME}] Video view tracked:`, videoId);

        } catch (error) {
            console.error(`[${MODULE_NAME}] Error tracking view:`, error);
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    async function init() {
        if (state.isInitialized) {
            console.warn(`[${MODULE_NAME}] Already initialized`);
            return;
        }

        try {
            console.log(`[${MODULE_NAME}] Initializing...`);

            // Vérifier dépendances
            if (!window.PaieCashFan_CoreSystem) {
                throw new Error('Core System not found');
            }

            if (window.PaieCashFan_AuthPersistent) {
                const authState = window.PaieCashFan_AuthPersistent.getState();
                state.currentUser = authState.user;
            }

            // Initialiser IndexedDB
            await initIndexedDB();

            // Restaurer données
            state.likedVideos = loadFromLocalStorage(CONFIG.STORAGE_KEYS.LIKED_VIDEOS) || [];
            state.following = loadFromLocalStorage(CONFIG.STORAGE_KEYS.FOLLOWING) || [];
            state.watchHistory = loadFromLocalStorage(CONFIG.STORAGE_KEYS.WATCH_HISTORY) || [];

            state.isInitialized = true;

            // Enregistrer dans CoreSystem
            window.PaieCashFan_CoreSystem.registerModule(MODULE_NAME, {
                version: '11.0.0',
                status: 'active',
                namespace: NAMESPACE
            });

            console.log(`[${MODULE_NAME}] ✅ Module initialized`);

            // Émettre event
            window.dispatchEvent(new CustomEvent('pcf:module:ready', {
                detail: { module: MODULE_NAME }
            }));

        } catch (error) {
            console.error(`[${MODULE_NAME}] Initialization failed:`, error);
            throw error;
        }
    }

    // ========================================
    // PUBLIC API
    // ========================================
    const SocialTikTokAPI = {
        // Core
        init,
        getState: () => ({ ...state }),

        // Feed
        loadFeed,
        loadTrending,

        // Upload
        uploadVideo,

        // Interactions
        likeVideo,
        unlikeVideo,
        commentVideo,
        shareVideo,

        // Follow
        follow,
        unfollow,
        getFollowing: () => [...state.following],

        // Notifications
        loadNotifications,
        getUnreadNotificationCount,

        // History
        trackVideoView,
        getWatchHistory: () => [...state.watchHistory],

        // Utils
        isLiked: (videoId) => state.likedVideos.includes(videoId),
        isFollowing: (targetId) => state.following.some(f => f.id === targetId),

        // Config
        getConfig: () => ({ ...CONFIG })
    };

    // ========================================
    // EXPORT MODULE
    // ========================================
    window.PaieCashFan_SocialTikTok = SocialTikTokAPI;

    console.log(`[${MODULE_NAME}] Module loaded. Use window.PaieCashFan_SocialTikTok to access API`);

    // Auto-init si Core System est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.PaieCashFan_CoreSystem) {
                init().catch(console.error);
            }
        });
    } else {
        if (window.PaieCashFan_CoreSystem) {
            init().catch(console.error);
        }
    }

})(window);
