import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Alert, TextInput, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import tw from 'twrnc';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../configs/api';

const socket = io(API_URL, { transports: ['websocket'] });

const GroupDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params;

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [groupData, setGroupData] = useState(group);

  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setUserId(decoded.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    socket.emit('setup', userId);

    socket.on('group:updated', (updated) => {
      if (updated._id === group._id) {
        setGroupData(updated);
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

  const handleChangeGroupAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      const uri = image.uri;
      const filename = uri.split("/").pop();
      const ext = filename.split(".").pop();
      const mimeType = `image/${ext}`;

      const formData = new FormData();
      formData.append("chatId", groupData._id);
      formData.append("avatar", { uri, name: filename, type: mimeType });

      const response = await fetch(`${API_URL}/api/chat/group/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setGroupData(data);
        Alert.alert("✅ Thành công", "Ảnh nhóm đã được cập nhật!");
      } else {
        Alert.alert("❌ Lỗi", data.message || "Không thể cập nhật ảnh nhóm");
      }
    } catch (err) {
      Alert.alert("Lỗi mạng", err.message || "Không thể kết nối server");
    }
  };

  const handleRenameGroup = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/chat/rename`, {
        chatId: groupData._id,
        chatName: groupData.chatName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socket.emit('group:updated', res.data);
      Alert.alert('✅ Đã đổi tên nhóm');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi tên');
    }
  };

  const handleDisband = async () => {
    Alert.alert('Giải tán nhóm?', '', [
      { text: 'Huỷ' },
      {
        text: 'Giải tán',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/chat/dissGroup/${groupData._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            socket.emit('group:deleted', { chatId: groupData._id });
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể giải tán nhóm');
          }
        },
      },
    ]);
  };

  return (
    <View style={tw`flex-1 bg-gray-100 pt-10 px-4`}>
      <Text style={tw`text-xl font-bold mb-4`}>Chi tiết nhóm</Text>

      {groupData.groupAvatar ? (
        <Image source={{ uri: groupData.groupAvatar }} style={tw`w-24 h-24 rounded-full self-center mb-3`} />
      ) : (
        <View style={tw`w-24 h-24 rounded-full bg-gray-300 self-center mb-3`} />
      )}
      <TouchableOpacity onPress={handleChangeGroupAvatar}>
        <Text style={tw`text-blue-600 text-center mb-4`}>🖼️ Đổi ảnh nhóm</Text>
      </TouchableOpacity>

      <Text style={tw`font-semibold mb-1`}>Tên nhóm:</Text>
      <TextInput
        value={groupData.chatName}
        onChangeText={(text) => setGroupData(prev => ({ ...prev, chatName: text }))}
        style={tw`bg-white p-3 rounded border mb-2`}
      />
      
        <TouchableOpacity
          onPress={handleRenameGroup}
          style={tw`bg-blue-600 p-3 rounded mb-6`}
        >
          <Text style={tw`text-white text-center`}>💬 Đổi tên nhóm</Text>
        </TouchableOpacity>
     

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("GroupMemberScreen", {
            groupUsers: groupData.users,
            groupData,
            userId,
            token, // ✅ thêm token
          })}
      >
        <View style={tw`flex-row justify-between items-center bg-white p-4 rounded mb-4`}>
          <Text style={tw`font-semibold`}>👥 Xem thành viên</Text>
          <Text style={tw`text-blue-500`}>{groupData.users.length} người {'>'}</Text>
        </View>
      </TouchableOpacity>
      {groupData.users.some(user => user._id === userId) && (
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupAddMemberScreen", {
            groupData: groupData, // ✅ Truyền full object groupData
            currentMembers: groupData.users.map(u => u._id),
            token,
          })}
        >
          <View style={tw`flex-row justify-between items-center bg-white p-4 rounded mb-4`}>
            <Text style={tw`font-semibold`}>➕ Thêm thành viên</Text>
            <Text style={tw`text-blue-500`}>{'>'}</Text>
          </View>
        </TouchableOpacity>

      )}

      {isAdmin && (
        <TouchableOpacity
          onPress={handleDisband}
          style={tw`bg-red-600 p-3 rounded`}
        >
          <Text style={tw`text-white text-center`}>🗑️ Giải tán nhóm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GroupDetailScreen;
