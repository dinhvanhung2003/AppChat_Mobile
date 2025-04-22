import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import NavigationBar from '../MessageScreen/NavigationBar';
import useTabNavigation from '../../hooks/useTabNavigation';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const API_URL = 'http://192.168.1.5:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const MessageListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Ưu tiên');
  const [token, setToken] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');

  const navigation = useNavigation();
  const handleTabPress = useTabNavigation();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
        socket.emit('joinGlobalChatList', decoded.id);
      }
    };
    fetchToken();
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedChats = res.data.sort((a, b) => {
        const dateA = new Date(a.latestMessage?.createdAt || a.updatedAt);
        const dateB = new Date(b.latestMessage?.createdAt || b.updatedAt);
        return dateB - dateA;
      });
      setChats(sortedChats);
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách chat:', err);
    }
  }, [token]);

  // Gọi lại fetchChats mỗi khi màn hình MessageList được focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (token) fetchChats();
    });
    return unsubscribe;
  }, [navigation, token, fetchChats]);

  useEffect(() => {
    if (!token || !currentUserId) return;

    const handleMessage = (newMsg) => {
      const chatId = newMsg.chat?._id || newMsg.chatId;

      setChats((prevChats) => {
        const existingIndex = prevChats.findIndex((chat) => chat._id === chatId);

        const latestMessage = {
          content: newMsg.isRecalled ? '[Đã thu hồi]' : newMsg.content,
          createdAt: newMsg.createdAt,
          isRecalled: newMsg.isRecalled,
        };

        if (existingIndex !== -1) {
          const updatedChat = {
            ...prevChats[existingIndex],
            latestMessage,
          };

          const newList = [
            updatedChat,
            ...prevChats.slice(0, existingIndex),
            ...prevChats.slice(existingIndex + 1),
          ];

          return newList;
        } else {
          fetchChats();
          return prevChats;
        }
      });
    };

    socket.on('messageReceived', handleMessage);
    socket.on('newMessage', handleMessage);
    socket.on('messageEdited', handleMessage);
    socket.on('messageRecalled', handleMessage);

    return () => {
      socket.off('messageReceived', handleMessage);
      socket.off('newMessage', handleMessage);
      socket.off('messageEdited', handleMessage);
      socket.off('messageRecalled', handleMessage);
    };
  }, [token, currentUserId, fetchChats]);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/users?search=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data.users || res.data || []);
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng.');
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data._id) {
        await fetchChats();
        setSearchResults([]);
        navigation.navigate('ChatScreen', {
          chatId: res.data._id,
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo hoặc truy cập cuộc trò chuyện.');
      }
    } catch (error) {
      console.error('❌ Lỗi tạo cuộc trò chuyện:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể bắt đầu cuộc trò chuyện.');
    }
  };

  const renderItem = ({ item }) => {
    const isGroupChat = item.isGroupChat;
    const otherUser = item.users?.find((u) => u._id !== currentUserId);
    const displayName = isGroupChat ? item.chatName : otherUser?.fullName || 'Không rõ';
    const displayAvatar = isGroupChat
      ? 'https://cdn-icons-png.flaticon.com/512/74/74472.png' // icon nhóm
      : otherUser?.avatar || 'https://via.placeholder.com/150';
  
    return (
      <TouchableOpacity
        style={tw`flex-row items-center p-3 border-b border-gray-200`}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            chatId: item._id,
            partner: isGroupChat ? null : otherUser,
            chatName: isGroupChat ? item.chatName : null,
          })
        }
      >
        <Image
          source={{ uri: displayAvatar }}
          style={tw`w-12 h-12 rounded-full`}
        />
        <View style={tw`ml-3 flex-1`}>
          <View style={tw`flex-row justify-between`}>
            <Text style={tw`text-base font-semibold`}>
              {displayName}
            </Text>
            <Text style={tw`text-xs text-gray-500`}>
              {item.latestMessage?.createdAt?.substring(11, 16) || ''}
            </Text>
          </View>
          <Text style={tw`text-gray-600`} numberOfLines={1}>
            {item.latestMessage?.isRecalled
              ? '[Đã thu hồi]'
              : item.latestMessage?.content || '[Tệp đính kèm]'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={tw`flex-row items-center p-3 border-b border-gray-200`}
      onPress={() => handleSelectUser(item._id)}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
        style={tw`w-12 h-12 rounded-full`}
      />
      <View style={tw`ml-3 flex-1`}>
        <Text style={tw`text-base font-semibold`}>{item.fullName}</Text>
        <Text style={tw`text-gray-600`}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white mt-10`}>
      <View style={tw`flex-row items-center p-3 bg-blue-500`}>
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" style={tw`mr-2`} />
        </TouchableOpacity>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="white"
          style={tw`flex-1 bg-transparent text-white`}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={tw`mx-2`}>
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={tw`flex-row border-b`}>
        <TouchableOpacity
          onPress={() => setActiveTab('Ưu tiên')}
          style={tw`flex-1 p-3 items-center`}
        >
          <Text style={tw`${activeTab === 'Ưu tiên' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>
            Ưu tiên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Khác')}
          style={tw`flex-1 p-3 items-center`}
        >
          <Text style={tw`${activeTab === 'Khác' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>
            Khác
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults.length > 0 ? searchResults : chats}
        keyExtractor={(item, index) => `${item._id || item.id}_${index}`}
        renderItem={searchResults.length > 0 ? renderSearchItem : renderItem}
        style={tw`flex-1`}
        contentContainerStyle={{ paddingBottom: 60 }}
      />

      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab="Messages" onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default MessageListScreen;
