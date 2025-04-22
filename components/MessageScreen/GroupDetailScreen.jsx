import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import tw from 'twrnc';

const API_URL = 'http://192.168.1.6:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const GroupDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params;

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [groupData, setGroupData] = useState(group);
  const [groupUsers, setGroupUsers] = useState(group.users);
  const [newName, setNewName] = useState(group.chatName);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setUserId(decoded.id);

        const res = await axios.get(`${API_URL}/users/listFriends`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setFriends(res.data);
      }
    };
    init();
  }, []);

  useEffect(() => {
    socket.emit('setup', userId);

    socket.on('group:updated', (updated) => {
      if (updated._id === group._id) {
        setGroupData(updated);
        setGroupUsers(updated.users);
      }
    });

    socket.on('admin:transferred', ({ chatId, newAdminId }) => {
      if (chatId === group._id) {
        setGroupData((prev) => ({
          ...prev,
          groupAdmin: { _id: newAdminId },
        }));
      }
    });

    socket.on('group:deleted', ({ chatId }) => {
      if (chatId === group._id) {
        Alert.alert('Nhóm đã bị giải tán');
        navigation.goBack();
      }
    });

    socket.on('group:removed', (chatId) => {
      if (chatId === group._id) {
        Alert.alert('Bạn đã bị xoá khỏi nhóm');
        navigation.goBack();
      }
    });

    return () => {
      socket.off('group:updated');
      socket.off('admin:transferred');
      socket.off('group:deleted');
      socket.off('group:removed');
    };
  }, [group._id, userId]);

  const isAdmin = groupData.groupAdmin?._id === userId;

  const handleRenameGroup = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/api/chat/rename`,
        {
          chatId: groupData._id,
          chatName: newName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('group:updated', res.data);
      Alert.alert('✅ Đã đổi tên nhóm');
    } catch (err) {
      console.error('Lỗi đổi tên:', err);
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) return;

    try {
      const res = await axios.put(
        `${API_URL}/api/chat/groupadd`,
        {
          chatId: groupData._id,
          userId: selectedFriends,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('group:updated', res.data);
      setSelectedFriends([]);
    } catch (err) {
      console.error('Lỗi thêm thành viên:', err);
    }
  };

  const handleKick = async (id) => {
    if (!isAdmin) return;
    Alert.alert('Xoá thành viên?', '', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        onPress: async () => {
          try {
            const res = await axios.put(
              `${API_URL}/api/chat/groupremove`,
              {
                chatId: groupData._id,
                userId: id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            socket.emit('group:updated', res.data);
          } catch (err) {
            console.error('Lỗi kick:', err);
          }
        },
      },
    ]);
  };

  const handleTransferAdmin = async (newAdminId) => {
    try {
      await axios.put(
        `${API_URL}/api/chat/transferAdmin/${groupData._id}`,
        { newAdminId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('admin:transferred', {
        chatId: groupData._id,
        newAdminId,
      });
    } catch (err) {
      console.error('Lỗi chuyển quyền:', err);
    }
  };

  const handleDisband = async () => {
    Alert.alert('Giải tán nhóm?', '', [
      { text: 'Huỷ' },
      {
        text: 'Giải tán',
        onPress: async () => {
          try {
            await axios.delete(
              `${API_URL}/api/chat/dissGroup/${groupData._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            socket.emit('group:deleted', { chatId: groupData._id });
          } catch (err) {
            console.error('Lỗi giải tán nhóm:', err);
          }
        },
      },
    ]);
  };

  return (
    <View style={tw`flex-1 bg-gray-100 pt-10 px-4`}>
      <Text style={tw`text-xl font-bold mb-4`}>Chi tiết nhóm</Text>

      <TextInput
        value={newName}
        onChangeText={setNewName}
        style={tw`bg-white p-3 mb-2 rounded border`}
      />
      {isAdmin && (
        <TouchableOpacity
          onPress={handleRenameGroup}
          style={tw`bg-blue-600 mb-4 p-3 rounded`}
        >
          <Text style={tw`text-white text-center`}>Đổi tên nhóm</Text>
        </TouchableOpacity>
      )}

      <Text style={tw`font-semibold mb-2`}>Thành viên:</Text>
      <FlatList
        data={groupUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={tw`flex-row justify-between items-center border-b py-2`}
          >
            <Text>
              {item.fullName}
              {item._id === groupData.groupAdmin?._id && ' (Admin)'}
            </Text>
            {isAdmin && item._id !== userId && (
              <View style={tw`flex-row space-x-3`}>
                <TouchableOpacity onPress={() => handleTransferAdmin(item._id)}>
                  <Text style={tw`text-blue-500`}>Chuyển quyền</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleKick(item._id)}>
                  <Text style={tw`text-red-500`}>Kick</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {isAdmin && (
        <>
          <Text style={tw`font-semibold mt-6 mb-2`}>Thêm thành viên:</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedFriends((prev) =>
                    prev.includes(item._id)
                      ? prev.filter((id) => id !== item._id)
                      : [...prev, item._id]
                  );
                }}
                style={tw`flex-row justify-between items-center p-2 bg-white border-b`}
              >
                <Text>{item.fullName}</Text>
                {selectedFriends.includes(item._id) && <Text>✅</Text>}
              </TouchableOpacity>
            )}
            style={tw`max-h-52`}
          />

          <TouchableOpacity
            onPress={handleAddMembers}
            style={tw`bg-green-600 mt-3 p-3 rounded`}
          >
            <Text style={tw`text-white text-center`}>➕ Thêm thành viên</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDisband}
            style={tw`bg-red-600 mt-4 p-3 rounded`}
          >
            <Text style={tw`text-white text-center`}>🗑️ Giải tán nhóm</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default GroupDetailScreen;
