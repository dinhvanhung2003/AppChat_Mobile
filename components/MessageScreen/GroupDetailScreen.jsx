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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';
<<<<<<< HEAD
import { API_URL } from '../../configs/api'; 
=======
const API_URL = 'http://192.168.88.179:5000';
>>>>>>> 83bf22c4cfc7096e2f1a1e512f950e445468115c
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
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/users?search=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // lọc bỏ người đã trong nhóm
      const available = (Array.isArray(res.data) ? res.data : res.data.users || []).filter(
        (u) => !groupUsers.some((member) => member._id === u._id)
      );

      setSearchResults(available);
    } catch (err) {
      console.error('❌ Lỗi tìm kiếm:', err.response?.data || err.message);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng.');
    }
  };
  // sua anh 
const handleChangeGroupAvatar = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ dùng lại MediaTypeOptions.Images
  allowsEditing: true,
  quality: 1,
});


    if (result.canceled) return;

    const image = result.assets[0];
    const uri = image.uri;

    if (!uri.startsWith("file://")) {
      Alert.alert("❌ Lỗi ảnh", "Chỉ hỗ trợ ảnh từ thiết bị");
      return;
    }

    const filename = uri.split("/").pop();
    const ext = filename.split(".").pop();
    const mimeType = `image/${ext}`;

    const formData = new FormData();
    formData.append("chatId", groupData._id);
    formData.append("avatar", {
      uri,
      name: filename,
      type: mimeType,
    });

    const token = await AsyncStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/chat/group/avatar`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // "Content-Type": "multipart/form-data", // ✅ Giống update user
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setGroupData(data);
      Alert.alert("✅ Thành công", "Ảnh nhóm đã được cập nhật!");
    } else {
      console.error("❌ Upload thất bại:", data);
      Alert.alert("❌ Lỗi", data.message || "Không thể cập nhật ảnh nhóm");
    }
  } catch (err) {
    console.error("❌ Lỗi upload ảnh:", err);
    Alert.alert("Lỗi mạng", err.message || "Không thể kết nối server");
  }
};















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
    if (!searchText.trim()) {
      setSearchResults([]);
    }
  }, [searchText]);

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
      Alert.alert('✅ Thành công', 'Đã thêm thành viên vào nhóm!');

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
  const filteredSearchResults = Array.isArray(searchResults)
    ? searchResults.filter(
      (u) =>
        !selectedFriends.includes(u._id) &&
        !groupUsers.some((g) => g._id === u._id)
    )
    : [];

  const availableFriends = Array.isArray(friends)
    ? friends.filter(
      (f) =>
        !groupUsers.some((g) => g._id === f._id) &&
        !selectedFriends.includes(f._id)
    )
    : [];
  useEffect(() => {
    if (selectedFriends.length > 0) {
      setSearchResults([]); // dọn kết quả cũ
      setSearchText('');
    }
  }, [selectedFriends]);

  const mergedUsers = [
    ...(Array.isArray(searchResults) ? searchResults : []),
    ...(Array.isArray(friends) ? friends : []),
  ];
  return (
    <View style={tw`flex-1 bg-gray-100 pt-10 px-4`}>
      <Text style={tw`text-xl font-bold mb-4`}>Chi tiết nhóm</Text>
      {groupData.groupAvatar ? (
  <Image
    source={{ uri: groupData.groupAvatar }}
    style={tw`w-24 h-24 rounded-full self-center mb-3`}
  />
) : (
  <View style={tw`w-24 h-24 rounded-full bg-gray-300 self-center mb-3`} />
)}

<TouchableOpacity onPress={handleChangeGroupAvatar} style={tw`mb-4`}>
  <Text style={tw`text-blue-600 text-center`}>🖼️ Đổi ảnh nhóm</Text>
</TouchableOpacity>


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

          <View style={tw`flex-row items-center bg-white px-3 py-2 rounded border mb-3`}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              placeholder="Tìm người dùng để thêm"
              style={tw`flex-1 text-black`}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Text style={tw`text-blue-600 font-semibold ml-2`}>Tìm</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredSearchResults.length > 0 ? filteredSearchResults : availableFriends}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedFriends((prev) => [...prev, item._id]);
                }}
                style={tw`flex-row items-center justify-between p-3 bg-white border-b`}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-10 h-10 rounded-full bg-gray-300 mr-3`} />
                  <Text>{item.fullName}</Text>
                </View>
                <Text style={tw`text-green-600 text-lg`}>➕</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={tw`text-center text-gray-500 mt-2`}>
                {searchText.trim()
                  ? 'Không tìm thấy người dùng phù hợp.'
                  : 'Không còn bạn bè nào để thêm.'}
              </Text>
            )}
            style={tw`max-h-60 rounded overflow-hidden`}
            contentContainerStyle={tw`border rounded`}
            showsVerticalScrollIndicator={false}
          />

          {selectedFriends.map((id) => {
            const user = mergedUsers.find((u) => u._id === id);
            if (!user) return null;

            return (
              <View
                key={user._id}
                style={tw`flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2`}
              >
                <Text style={tw`text-sm text-blue-800 mr-1`}>{user.fullName}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedFriends((prev) => prev.filter((uid) => uid !== user._id))
                  }
                >
                  <Text style={tw`text-blue-600 text-xs`}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}



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
