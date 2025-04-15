import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import NavigationBar from '../MessageScreen/NavigationBar';
import useTabNavigation from '../../hooks/useTabNavigation';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const MessageListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Ưu tiên');
  const [token, setToken] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [messages, setMessages] = useState([]); // default to empty array

  const navigation = useNavigation();
  const handleTabPress = useTabNavigation();

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy token");
        }
      } catch (err) {
        console.error("❌ Lỗi lấy token:", err);
      }
    };
    getToken();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://192.168.1.12:5000/users?search=${searchText}`, {
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
      const res = await axios.post('http://192.168.1.12:5000/api/chat', { userId }, {
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

  const filteredMessages = Array.isArray(messages)
    ? messages.filter((msg) =>
        msg.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={tw`flex-row items-center p-3 border-b border-gray-200`}
      onPress={() => handleSelectUser(item._id)}
    >
      <Image source={{ uri: item.avatar || 'https://via.placeholder.com/150' }} style={tw`w-12 h-12 rounded-full`} />
      <View style={tw`ml-3 flex-1`}>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-base font-semibold`}>{item.name}</Text>
          <Text style={tw`text-xs text-gray-500`}>{item.time || ''}</Text>
        </View>
        <Text style={tw`text-gray-600`} numberOfLines={1}>
          {item.message || 'Gửi lời chào, bắt đầu trò chuyện...'}
        </Text>
        {item.tag && (
          <Text style={tw`text-xs bg-gray-200 px-2 py-1 rounded mt-1 w-16`}>
            {item.tag}
          </Text>
        )}
      </View>
      {item.hasNotification && (
        <View style={tw`w-4 h-4 bg-red-500 rounded-full`} />
      )}
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
          <Text
            style={tw`${activeTab === 'Ưu tiên' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}
          >
            Ưu tiên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Khác')}
          style={tw`flex-1 p-3 items-center`}
        >
          <Text
            style={tw`${activeTab === 'Khác' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}
          >
            Khác
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults.length > 0 ? searchResults : filteredMessages}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderItem}
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