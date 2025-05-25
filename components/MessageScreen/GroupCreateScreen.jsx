import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import tw from 'twrnc';

const API_URL = 'http://172.20.10.5:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const GroupCreateScreen = () => {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setUserId(decoded.id);
        socket.emit('setup', decoded.id);

        const res = await axios.get(`${API_URL}/users/listFriends`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (Array.isArray(res.data)) setFriends(res.data);
      }
    };
    fetchData();
  }, []);

  const toggleSelect = (friendId) => {
    setSelected((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (selected.length < 2 || !groupName.trim()) {
      Alert.alert('Lỗi', 'Cần ít nhất 2 thành viên và tên nhóm');
      return;
    }
  
    try {
      const res = await axios.post(
        `${API_URL}/api/chat/group`,
        {
          users: JSON.stringify(selected),
          name: groupName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const groupChat = res.data;
  
      // ✅ Sau khi tạo nhóm thì gửi tin nhắn thông báo vào nhóm
      const systemMessage = {
        chatId: groupChat._id,
        content: 'Bạn đã được thêm vào nhóm',
        type: 'text',
      };
  
      const messageRes = await axios.post(`${API_URL}/api/message`, systemMessage, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // ✅ Emit socket tạo nhóm + tin nhắn hệ thống
      socket.emit('group:new', groupChat);
      socket.emit('newMessage', messageRes.data);
  
      Alert.alert('Thành công', 'Tạo nhóm và gửi thông báo thành công!');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Lỗi tạo nhóm:', err?.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tạo nhóm.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSelect(item._id)}
      style={tw`flex-row justify-between items-center p-3 border-b bg-white`}
    >
      <Text>{item.fullName}</Text>
      <Text>{selected.includes(item._id) ? '✅' : ''}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 pt-10 bg-gray-100`}>
      <Text style={tw`text-xl font-bold text-center mb-4`}>Tạo nhóm mới</Text>

      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        placeholder="Nhập tên nhóm..."
        style={tw`bg-white mx-4 p-3 rounded mb-4 border`}
      />

      <Text style={tw`mx-4 mb-2 font-semibold`}>Chọn bạn bè:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={tw`text-center mt-4 text-gray-500`}>
            Không có bạn bè nào
          </Text>
        }
      />

      <TouchableOpacity
        onPress={handleCreateGroup}
        style={tw`bg-blue-600 m-4 p-3 rounded`}
      >
        <Text style={tw`text-white text-center font-semibold`}>
          ✅ Tạo nhóm
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroupCreateScreen;
