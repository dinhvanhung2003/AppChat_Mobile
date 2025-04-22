import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';
import { io } from 'socket.io-client';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

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
    navigation.navigate('ChatScreen', {
      chatId: group._id,
      chatName: group.chatName,
      isGroup: true,
      group,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectGroup(item)}
      style={tw`flex-row items-center p-4 bg-white border-b border-gray-200`}
    >
      <View style={tw`w-12 h-12 bg-blue-200 rounded-full items-center justify-center`}>
        <Ionicons name="people" size={24} color="#2563EB" />
      </View>
      <View style={tw`ml-4 flex-1`}>
        <Text style={tw`text-base font-semibold text-black`}>{item.chatName}</Text>
        <Text style={tw`text-sm text-gray-500`}>{item.users.length} thành viên</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-100 pt-10`}>
      <View style={tw`flex-row justify-between items-center px-4 py-3 bg-white shadow-sm`}>
        <Text style={tw`text-xl font-bold text-blue-600`}>Danh sách nhóm</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('GroupCreateScreen')}
          style={tw`bg-blue-500 px-4 py-2 rounded`}
        >
          <Text style={tw`text-white font-semibold`}>➕ Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item, index) => `${item._id}_${index}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={tw`text-center mt-10 text-gray-500`}>Chưa có nhóm nào</Text>
        }
        contentContainerStyle={tw`pb-24`}
      />
    </View>
  );
};

export default GroupListScreen;
