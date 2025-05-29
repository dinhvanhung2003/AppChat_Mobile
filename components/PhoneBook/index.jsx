import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import NavigationBar from '../../components/MessageScreen/NavigationBar';
import SearchBar from '../SearchBar';
import { Swipeable } from 'react-native-gesture-handler';
import { API_URL } from '../../configs/api';

const socket = io(API_URL, { transports: ['websocket'] });

const PhoneBook = () => {
  const [activeTab, setActiveTab] = useState('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [token, setToken] = useState('');
  const navigation = useNavigation();
const initiateVideoCall = async (friendId, navigation) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userJson = await AsyncStorage.getItem('user');
    const user = JSON.parse(userJson);

    const res = await axios.post(
      `${API_URL}/api/daily/create-room`,
      {
        conversationId: friendId,
        fromUser: {
          _id: user._id,
          fullName: user.fullName,
        },
        toUserId: friendId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const url = `${res.data.url}?userName=${encodeURIComponent(user.fullName)}`;
    navigation.navigate('DailyCallScreen', { url });
  } catch (err) {
    console.error('Gọi thất bại:', err);
    Alert.alert('Không thể gọi video');
  }
};

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
        socket.emit('setup', decoded.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (token) {
      fetchFriends(token);
      fetchPendingRequests();
    }
  }, [token]);

  const fetchFriends = async (tk) => {
    try {
      const res = await axios.get(`${API_URL}/users/listFriends`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setContacts([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/friendRequests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequests(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch pending:", err);
    }
  };

  const acceptFriendRequest = async (senderId) => {
  try {
    await axios.post(`${API_URL}/api/friendRequests/acceptFriend`, {
      senderId,
      receiverId: currentUserId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFriendRequests((prev) => prev.filter((u) => u._id !== senderId));
    // Không cần gọi fetchFriends ở đây, sẽ được gọi trong socket.on
  } catch (err) {
    console.error('❌ Lỗi khi chấp nhận:', err);
  }
};


  const handleRemoveFriend = async (friendId, fullName) => {
    Alert.alert(
      'Xoá bạn bè',
      `Xác nhận xoá ${fullName}?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          onPress: async () => {
            try {
              await axios.put(`${API_URL}/users/removeFriend`, { friendId }, {
                headers: { Authorization: `Bearer ${token}` },
              });
              socket.emit("removeFriend", {
                userId: currentUserId,
                friendId
              });
              fetchFriends(token);
            } catch {
              Alert.alert('Lỗi', 'Không thể xoá bạn');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // SOCKET EVENTS
  useEffect(() => {
    if (!currentUserId || !token) return;

    socket.on("youRemovedFriend", ({ friendId }) => {
      setContacts((prev) => prev.filter(c => c._id !== friendId));
    });

    socket.on("youWereRemoved", ({ userId }) => {
      setContacts((prev) => prev.filter(c => c._id !== userId));
    });

    socket.on("friendRequestAccepted", ({ sender, receiver }) => {
  console.log("📥 Socket event: friendRequestAccepted", { sender, receiver });

  if (currentUserId === sender._id || currentUserId === receiver._id) {
    fetchFriends(token);
  }
});


    return () => {
      socket.off("youRemovedFriend");
      socket.off("youWereRemoved");
      socket.off("friendRequestAccepted");
    };
  }, [currentUserId, token]);

  const filteredContacts = contacts.filter((c) =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const letter = contact.fullName?.[0]?.toUpperCase() || '#';
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(contact);
    return acc;
  }, {});

  const handleChatWithFriend = async (friendId) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { userId: friendId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chat = res.data;
      if (chat._id) {
        const partner = chat.users.find((u) => u._id !== currentUserId);
        navigation.navigate('ChatScreen', { chatId: chat._id, partner });
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở trò chuyện');
    }
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          onPress={() => handleRemoveFriend(item._id, item.fullName)}
          style={tw`bg-red-500 justify-center items-center w-20`}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={tw`text-white text-xs`}>Xoá</Text>
        </TouchableOpacity>
      )}
    >
     <TouchableOpacity
  onPress={() => handleChatWithFriend(item._id)}
  style={tw`flex-row items-center justify-between p-4 border-b border-gray-300 bg-white`}
>
  <View style={tw`flex-row items-center`}>
    <Image
      source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }}
      style={tw`w-12 h-12 rounded-full`}
    />
    <Text style={tw`ml-4 text-base font-semibold`}>{item.fullName}</Text>
  </View>

  <TouchableOpacity
    onPress={() => initiateVideoCall(item._id, navigation)}
    style={tw`ml-4`}
  >
    <Ionicons name="videocam-outline" size={24} color="#007AFF" />
  </TouchableOpacity>
</TouchableOpacity>

    </Swipeable>
  );

  return (
    <View style={tw`flex-1 bg-white pt-10`}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <View style={tw`flex-row justify-around border-b`}>
        {['Friends', 'Groups', 'OA'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'Groups') navigation.navigate('GroupListScreen');
            }}
            style={tw`flex-1`}
          >
            <Text style={tw`text-center p-4 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-600'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={Object.keys(groupedContacts)}
        keyExtractor={(letter) => `section_${letter}`}
        renderItem={({ item: letter }) => (
          <View>
            <Text style={tw`bg-gray-200 p-2 text-gray-600 font-bold`}>{letter}</Text>
            <FlatList
              data={groupedContacts[letter]}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
            />
          </View>
        )}
      />

      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab="Contacts" />
      </View>
    </View>
  );
};

export default PhoneBook;
