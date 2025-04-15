import React, { useState, useEffect } from 'react';
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

const API_URL = 'http://192.168.1.33:5000';

const MessageListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Ưu tiên');
  const [token, setToken] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);

  const navigation = useNavigation();
  const handleTabPress = useTabNavigation();

  useEffect(() => {
    const fetchTokenAndChats = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          const res = await axios.get(`${API_URL}/api/chat`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setChats(res.data);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy token');
        }
      } catch (err) {
        console.error('❌ Lỗi lấy danh sách chat:', err);
      }
    };

    fetchTokenAndChats();
  }, []);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/users?search=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data.users || []);
    } catch (error) {
      console.error('❌ Lỗi tìm kiếm:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng.');
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigation.navigate('ChatScreen', {
        chatId: res.data._id,
      });
    } catch (error) {
      console.error('❌ Lỗi tạo cuộc trò chuyện:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu cuộc trò chuyện.');
    }
  };

  const renderItem = ({ item }) => {
    const otherUser = item.users?.find((u) => !u.email?.includes('@admin')); // Hoặc lọc theo điều kiện khác nếu cần
    return (
      <TouchableOpacity
        style={tw`flex-row items-center p-3 border-b border-gray-200`}
        onPress={() => navigation.navigate('ChatScreen', { chatId: item._id })}
      >
        <Image
          source={{ uri: otherUser?.avatar || 'https://via.placeholder.com/150' }}
          style={tw`w-12 h-12 rounded-full`}
        />
        <View style={tw`ml-3 flex-1`}>
          <View style={tw`flex-row justify-between`}>
            <Text style={tw`text-base font-semibold`}>
              {otherUser?.fullName || 'Không rõ'}
            </Text>
            <Text style={tw`text-xs text-gray-500`}>
              {item.latestMessage?.createdAt?.substring(11, 16) || ''}
            </Text>
          </View>
          <Text style={tw`text-gray-600`} numberOfLines={1}>
            {item.latestMessage?.content || '[Tệp đính kèm]'}
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
      {/* Thanh tìm kiếm */}
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

      {/* Tabs */}
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

      {/* Danh sách đoạn chat hoặc kết quả tìm kiếm */}
      <FlatList
        data={searchResults.length > 0 ? searchResults : chats}
        keyExtractor={(item) => item._id || item.id}
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
