import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';
import { io } from 'socket.io-client';
import tw from 'twrnc';

const API_URL = 'http://192.168.1.5:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const GroupListScreen = () => {
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setUserId(decoded.id);
        socket.emit('setup', decoded.id);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupChats = res.data.filter((chat) => chat.isGroupChat);
        setGroups(groupChats);
      } catch (err) {
        console.error('❌ Lỗi lấy nhóm:', err);
      }
    };

    if (token) fetchGroups();
  }, [token]);

  useEffect(() => {
    socket.on('group:new', (newGroup) => {
      setGroups((prev) => {
        if (prev.find((g) => g._id === newGroup._id)) return prev;
        return [newGroup, ...prev];
      });
    });

    socket.on('group:deleted', ({ chatId }) => {
      setGroups((prev) => prev.filter((g) => g._id !== chatId));
    });

    socket.on('group:updated', (updatedGroup) => {
      setGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
    });

    return () => {
      socket.off('group:new');
      socket.off('group:deleted');
      socket.off('group:updated');
    };
  }, []);

  const handleSelectGroup = (group) => {
    navigation.navigate('GroupDetailScreen', { group });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectGroup(item)}
      style={tw`p-4 border-b border-gray-300 bg-white`}
    >
      <Text style={tw`text-lg font-semibold`}>{item.chatName}</Text>
      <Text style={tw`text-gray-500 text-sm`}>
        {item.users.length} thành viên
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-100 pt-10`}>
      <View style={tw`px-4 py-2`}>
        <TouchableOpacity
          onPress={() => navigation.navigate('GroupCreateScreen')}
          style={tw`bg-blue-500 px-4 py-2 rounded`}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            ➕ Tạo nhóm mới
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item, index) => `${item._id}_${index}`} // ✅ key luôn duy nhất
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={tw`text-center mt-10 text-gray-500`}>
            Chưa có nhóm nào
          </Text>
        }
      />
    </View>
  );
};

export default GroupListScreen;
