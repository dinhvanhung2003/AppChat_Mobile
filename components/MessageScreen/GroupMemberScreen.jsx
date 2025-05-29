import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert
} from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '../../configs/api';
import { io } from 'socket.io-client';

const socket = io(API_URL, { transports: ['websocket'] });

const GroupMemberScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupUsers, groupData, userId, token } = route.params;

  const [members, setMembers] = useState(groupUsers);
  const [adminId, setAdminId] = useState(groupData.groupAdmin?._id);

  const isAdmin = adminId === userId;

  useEffect(() => {
    socket.emit('setup', userId);

    socket.on('group:removed', (chatId) => {
      if (chatId === groupData._id) {
        Alert.alert('Bạn đã bị xoá khỏi nhóm');
        navigation.goBack();
      }
    });

    socket.on('admin:transferred', ({ chatId, newAdminId }) => {
      if (chatId === groupData._id) {
        setAdminId(newAdminId); // ✅ Cập nhật UI mới
        if (newAdminId === userId) {
          Alert.alert('🎉 Bạn đã trở thành trưởng nhóm!');
        }
      }
    });

    socket.on('group:updated', (updatedGroup) => {
      if (updatedGroup._id === groupData._id) {
        setMembers(updatedGroup.users); // ✅ cập nhật danh sách mới
      }
    });

    return () => {
      socket.off('group:removed');
      socket.off('admin:transferred');
      socket.off('group:updated');
    };
  }, [groupData._id, userId]);

  const handleKick = async (memberId) => {
    Alert.alert('Xoá thành viên?', '', [
      { text: 'Huỷ' },
      {
        text: 'Xoá',
        onPress: async () => {
          try {
            const res = await axios.put(`${API_URL}/api/chat/groupremove`, {
              chatId: groupData._id,
              userId: memberId
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            socket.emit('group:updated', res.data);
            socket.emit('group:removed', memberId);
            Alert.alert('✅ Đã xoá thành viên');
          } catch (err) {
            Alert.alert('❌ Lỗi khi xoá');
          }
        }
      }
    ]);
  };

  const handleTransfer = async (memberId) => {
    Alert.alert('Chuyển quyền trưởng nhóm?', '', [
      { text: 'Huỷ' },
      {
        text: 'Chuyển',
        onPress: async () => {
          try {
            await axios.put(`${API_URL}/api/chat/transferAdmin/${groupData._id}`, {
              newAdminId: memberId
            }, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            socket.emit('admin:transferred', {
              chatId: groupData._id,
              newAdminId: memberId
            });

            setAdminId(memberId); // ✅ cập nhật ngay lập tức UI
            Alert.alert('✅ Đã chuyển quyền');
          } catch (err) {
            Alert.alert('❌ Lỗi khi chuyển quyền');
          }
        }
      }
    ]);
  };

  return (
    <View style={tw`flex-1 bg-white pt-10 px-4`}>
      <Text style={tw`text-xl font-bold mb-4`}>👥 Thành viên nhóm</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={tw`flex-row justify-between items-center bg-gray-100 px-4 py-3 mb-2 rounded`}>
            <Text>
              {item.fullName}
              {item._id === adminId && ' (Admin)'}
            </Text>
            {isAdmin && item._id !== userId && (
              <View style={tw`flex-row space-x-3`}>
                <TouchableOpacity onPress={() => handleTransfer(item._id)}>
                  <Text style={tw`text-blue-600`}>Chuyển quyền</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleKick(item._id)}>
                  <Text style={tw`text-red-500`}>Kick</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-500 mt-4`}>Không có thành viên nào</Text>
        }
      />
    </View>
  );
};

export default GroupMemberScreen;
