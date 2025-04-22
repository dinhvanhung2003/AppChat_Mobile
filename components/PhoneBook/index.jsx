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
import SearchBar from '../SearchBar/index';

const API_URL = 'http://192.168.1.6:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const PhoneBook = () => {
  const [activeTab, setActiveTab] = useState('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        const userId = decoded.id;
        setCurrentUserId(userId);

        socket.emit('setup', userId);

        socket.on('friendRequestReceived', (data) => {
          if (!data?.sender?._id) return;
          setFriendRequests((prev) => {
            const exists = prev.some((u) => u._id === data.sender._id);
            return exists ? prev : [...prev, data.sender];
          });
        });

        socket.on('friendRequestAccepted', ({ sender }) => {
          setContacts((prev) => [...prev, sender]);
          Alert.alert('🤝', `Bạn vừa kết bạn với ${sender.fullName}`);
        });
      }
    };

    init();

    return () => {
      socket.off('friendRequestReceived');
      socket.off('friendRequestAccepted');
    };
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!token) return;
        const res = await axios.get(`${API_URL}/users/listFriends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Lỗi lấy danh sách bạn bè:', err);
        setContacts([]);
      }
    };
    fetchFriends();
  }, [token]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/users?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
    }
  };

  const sendFriendRequest = (receiverId) => {
    socket.emit('sendFriendRequest', {
      senderId: currentUserId,
      receiverId,
    });
    setSentRequests((prev) => [...prev, receiverId]);
    Alert.alert('✅', 'Đã gửi lời mời kết bạn');
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
    } catch (err) {
      console.error('❌ Lỗi khi chấp nhận:', err);
    }
  };

  const handleChatWithFriend = async (friendId) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { userId: friendId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data._id) {
        navigation.navigate('ChatScreen', {
          chatId: res.data._id,
          partner: res.data.users.find((u) => u._id !== currentUserId),
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo hoặc truy cập cuộc trò chuyện.');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể bắt đầu cuộc trò chuyện.');
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const firstLetter = contact.fullName?.[0]?.toUpperCase() || '#';
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleChatWithFriend(item._id)}
      style={tw`flex-row items-center justify-between p-4 border-b border-gray-300`}
    >
      <View style={tw`flex-row items-center`}>
        <Image
          source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }}
          style={tw`w-12 h-12 rounded-full`}
        />
        <Text style={tw`ml-4 text-base font-semibold`}>{item.fullName}</Text>
      </View>
      <View style={tw`flex-row`}>
        <TouchableOpacity style={tw`ml-4`}>
          <Ionicons name="call" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={tw`ml-4`}>
          <Ionicons name="videocam" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white mt-10`}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <TouchableOpacity
        style={tw`bg-blue-500 mx-4 my-2 rounded p-2`}
        onPress={handleSearch}
      >
        <Text style={tw`text-white text-center font-semibold`}>Tìm bạn</Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <>
          <Text style={tw`text-lg font-semibold mx-4 mb-2`}>Kết quả:</Text>
          {results.map((item) => {
            const alreadySent = sentRequests.includes(item._id);
            return (
              <View key={item._id} style={tw`mx-4 mb-2 p-2 border rounded flex-row justify-between items-center`}>
                <Text>{item.fullName || item.email}</Text>
                <TouchableOpacity
                  disabled={alreadySent}
                  style={tw`px-3 py-1 rounded ${alreadySent ? 'bg-gray-400' : 'bg-green-500'}`}
                  onPress={() => sendFriendRequest(item._id)}
                >
                  <Text style={tw`text-white`}>
                    {alreadySent ? 'Đã gửi' : 'Kết bạn'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}

      {/* Tabs */}
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
            <Text
              style={tw`text-center p-4 ${activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-500 font-bold'
                  : 'text-gray-600'
                }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lời mời kết bạn */}
      {friendRequests.length > 0 && (
        <View style={tw`mb-4`}>
          <TouchableOpacity style={tw`flex-row items-center mb-2 ml-4`}>
            <Ionicons name="person-add-outline" size={24} color="#007AFF" />
            <Text style={tw`ml-4 text-lg font-semibold`}>
              Lời mời kết bạn
              <Text style={tw`text-red-500`}> ({friendRequests.length})</Text>
            </Text>
          </TouchableOpacity>

          {friendRequests.map((sender) => (
            <View key={sender._id} style={tw`flex-row justify-between items-center mx-4 mt-2 bg-gray-100 p-2 rounded`}>
              <Text>{sender.fullName || sender.email}</Text>
              <TouchableOpacity
                onPress={() => acceptFriendRequest(sender._id)}
                style={tw`bg-blue-500 px-3 py-1 rounded`}
              >
                <Text style={tw`text-white`}>Chấp nhận</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Danh bạ */}
     <FlatList
  data={Object.keys(groupedContacts)}
  keyExtractor={(letter) => `section_${letter}`}
  renderItem={({ item: letter }) => (
    <View key={`section_${letter}`}>
      <Text style={tw`bg-gray-200 p-2 text-gray-600 font-bold`}>{letter}</Text>
      <FlatList
        data={groupedContacts[letter]}
        renderItem={renderItem}
        keyExtractor={(contact, index) => `${contact._id}_${index}`} // 👈 đảm bảo key duy nhất
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
