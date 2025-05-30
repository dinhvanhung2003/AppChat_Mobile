import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Alert, Image
} from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { API_URL } from '../../configs/api';

const socket = io(API_URL, { transports: ['websocket'] });

const SearchFriendScreen = () => {
  const [token, setToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tempSentIds, setTempSentIds] = useState([]);

  // ✅ Init
  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          console.warn('⚠️ Token không tồn tại trong AsyncStorage');
          return;
        }
        const decoded = jwtDecode(storedToken);
        setToken(storedToken);
        setCurrentUserId(decoded.id);

        socket.emit('setup', decoded.id);
        await fetchFriends(storedToken);
        await fetchSentRequests(storedToken);
        await fetchReceivedRequests(storedToken);
      } catch (error) {
        console.error('❌ Lỗi init:', error.message);
      }
    };

    init();
  }, []);

  // 🧠 Socket
  useEffect(() => {
    if (!currentUserId) return;

    socket.on('friendRequestAccepted', ({ sender }) => {
      fetchFriends(token);
      fetchSentRequests(token);
      Alert.alert("🎉", `${sender.fullName} đã chấp nhận lời mời`);
    });

    socket.on('friendRequestRejected', ({ senderId, receiverId }) => {
      if (senderId === currentUserId) {
        setSentRequests(prev => prev.filter(u => u._id !== receiverId));
        setTempSentIds(prev => prev.filter(id => id !== receiverId));
        Alert.alert("❌", "Lời mời đã bị từ chối");
      }
    });

    socket.on('friendRequestReceived', ({ sender }) => {
      if (sender._id !== currentUserId) {
        setReceivedRequests(prev => prev.some(u => u._id === sender._id) ? prev : [...prev, sender]);
      }
    });

    socket.on('friendRequestSent', ({ receiverId }) => {
      setTempSentIds(prev => prev.filter(id => id !== receiverId));
      fetchSentRequests(token);
    });

    socket.on('friendRequestCancelled', ({ senderId }) => {
      setReceivedRequests(prev => prev.filter(u => u._id !== senderId));
    });

    socket.on('youRemovedFriend', ({ friendId }) => {
      setContacts(prev => prev.filter(u => u._id !== friendId));
    });

    socket.on('youWereRemoved', ({ userId }) => {
      setContacts(prev => prev.filter(u => u._id !== userId));
    });

    return () => {
      socket.off('friendRequestAccepted');
      socket.off('friendRequestRejected');
      socket.off('friendRequestReceived');
      socket.off('friendRequestSent');
      socket.off('friendRequestCancelled');
      socket.off('youRemovedFriend');
      socket.off('youWereRemoved');
    };
  }, [token, currentUserId]);

  // ✅ API Calls
  const fetchFriends = async (tk) => {
    if (!tk) return;
    try {
      const res = await axios.get(`${API_URL}/users/listFriends`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      setContacts(res.data || []);
    } catch (err) {
      console.error('❌ Lỗi fetchFriends:', err.message);
    }
  };

  const fetchSentRequests = async (tk) => {
    if (!tk) {
      console.warn('⚠️ Token không tồn tại');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/friendRequests/sent`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      const valid = res.data
        .filter(r => r.receiver && typeof r.receiver === 'object')
        .map(r => r.receiver);
      setSentRequests(valid);
    } catch (err) {
      console.error("❌ Lỗi fetchSentRequests:", err.message);
    }
  };

  const fetchReceivedRequests = async (tk) => {
    if (!tk) return;
    try {
      const res = await axios.get(`${API_URL}/api/friendRequests/pending`, {
        headers: { Authorization: `Bearer ${tk}` }
      });
      setReceivedRequests(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi fetchReceivedRequests:", err.message);
    }
  };

  const handleSearch = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi handleSearch:", err.message);
    }
  };

  // ✅ Actions
  const sendFriendRequest = (receiverId) => {
    if (receiverId === currentUserId) return;
    setTempSentIds(prev => [...prev, receiverId]);
    socket.emit('sendFriendRequest', { senderId: currentUserId, receiverId });
    Alert.alert('✅', 'Đã gửi lời mời');
  };

  const cancelSentRequest = (receiverId) => {
    socket.emit('cancelFriendRequest', { senderId: currentUserId, receiverId });
    setSentRequests(prev => prev.filter(u => u._id !== receiverId));
    setTempSentIds(prev => prev.filter(id => id !== receiverId));
  };

  const acceptFriendRequest = async (senderId) => {
    if (!token) return;
    try {
      await axios.post(`${API_URL}/api/friendRequests/acceptFriend`, {
        senderId,
        receiverId: currentUserId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      socket.emit("acceptFriendRequest", { senderId, receiverId: currentUserId });
      fetchFriends(token);
      fetchReceivedRequests(token);
    } catch (err) {
      Alert.alert("❌", "Không thể chấp nhận");
    }
  };

  const rejectFriendRequest = (senderId) => {
    socket.emit("rejectFriendRequest", { senderId, receiverId: currentUserId });
    setReceivedRequests(prev => prev.filter(u => u._id !== senderId));
  };

  const isFriend = (userId) =>
    Array.isArray(contacts) && contacts.some((u) => u._id === userId);

  const renderUserItem = (item, actions) => (
    <View style={tw`flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white`}>
      <View style={tw`flex-row items-center`}>
        <Image
          source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }}
          style={tw`w-10 h-10 rounded-full mr-3`}
        />
        <Text style={tw`text-base font-medium text-gray-800`}>
          {item.fullName || item.email}
        </Text>
      </View>
      {actions}
    </View>
  );

  // ✅ UI
  return (
    <View style={tw`flex-1 bg-white pt-10`}>
      {/* Tabs */}
      <View style={tw`flex-row justify-around border-b border-gray-300 bg-gray-100`}>
        {[
  { key: 'search', label: 'Tìm kiếm' },
  { key: 'sent', label: 'Đã gửi' },
  { key: 'received', label: 'Lời mời tới' },
].map(tab => (
  <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={tw`flex-1 relative`}>
    <Text style={tw`text-center p-3 ${activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-600'}`}>
      {tab.label}
    </Text>

    {tab.key === 'received' && receivedRequests.length > 0 && (
      <View style={tw`absolute top-1 right-4 bg-red-500 rounded-full w-5 h-5 items-center justify-center`}>
        <Text style={tw`text-white text-xs font-bold`}>{receivedRequests.length}</Text>
      </View>
    )}
  </TouchableOpacity>
))}
      </View>

      {/* Tìm kiếm */}
      {activeTab === 'search' && (
        <View style={tw`p-4`}>
          <View style={tw`flex-row border border-gray-300 p-2 rounded items-center mb-4`}>
            <Ionicons name="search-outline" size={20} color="#333" />
            <TextInput
              style={tw`ml-2 flex-1 text-gray-800`}
              placeholder="Tìm người dùng..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) =>
              renderUserItem(item,
                isFriend(item._id) ? (
                  <Text style={tw`text-gray-400`}>Bạn bè</Text>
                ) : sentRequests.some((u) => u._id === item._id) || tempSentIds.includes(item._id) ? (
                  <Text style={tw`text-gray-400`}>Đã gửi</Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => sendFriendRequest(item._id)}
                    style={tw`bg-blue-500 px-4 py-1.5 rounded-full`}
                  >
                    <Text style={tw`text-white text-sm font-semibold`}>Kết bạn</Text>
                  </TouchableOpacity>
                )
              )}
          />
        </View>
      )}

      {/* Đã gửi */}
      {activeTab === 'sent' && (
        <FlatList
          data={sentRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={tw`p-4`}
          renderItem={({ item }) =>
            renderUserItem(item, (
              <TouchableOpacity
                onPress={() => cancelSentRequest(item._id)}
                style={tw`bg-red-500 px-4 py-1.5 rounded-full`}
              >
                <Text style={tw`text-white text-sm font-semibold`}>Huỷ</Text>
              </TouchableOpacity>
            ))
          }
        />
      )}

      {/* Lời mời tới */}
      {activeTab === 'received' && (
        <FlatList
          data={receivedRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={tw`p-4 items-center`}
          renderItem={({ item }) =>
            renderUserItem(item, (
              <View style={tw`flex-row items-center justify-center `}>
                <TouchableOpacity
                  onPress={() => acceptFriendRequest(item._id)}
                  style={tw`bg-blue-500 px-4 py-1.5 rounded-full mr-2`}
                >
                  <Text style={tw`text-white text-sx font-semibold`}>Chấp nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => rejectFriendRequest(item._id)}
                  style={tw`bg-gray-500 px-4 py-1.5 rounded-full`}
                >
                  <Text style={tw`text-white text-sm font-semibold`}>Từ chối</Text>
                </TouchableOpacity>
              </View>
            ))
          }
        />
      )}
    </View>
  );
};

export default SearchFriendScreen;
