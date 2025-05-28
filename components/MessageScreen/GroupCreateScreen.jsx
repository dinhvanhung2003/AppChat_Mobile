import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import tw from 'twrnc';

<<<<<<< HEAD
import { API_URL } from '../../configs/api'; 
=======
const API_URL = 'http://192.168.88.179:5000';
>>>>>>> 83bf22c4cfc7096e2f1a1e512f950e445468115c
const socket = io(API_URL, { transports: ['websocket'] });

const GroupCreateScreen = () => {
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigation = useNavigation();
  const [selectedUsers, setSelectedUsers] = useState([]); // chứa user object
  const [isCreating, setIsCreating] = useState(false);


  // them khi chua la ban be 
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  // xu ly tim kiem 
  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/users?search=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(Array.isArray(res.data) ? res.data : res.data.users || []);

    } catch (error) {
      console.error('❌ Lỗi tìm kiếm:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tìm kiếm người dùng.');
    }
  };

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

  const toggleSelect = (uid, userObj) => {
    if (uid === userId) return;

    setSelected((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );

    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === uid);
      if (exists) {
        return prev.filter((u) => u._id !== uid);
      } else {
        return [...prev, userObj];
      }
    });

    setSearchResults([]);
    setSearchText('');
  };



  const creatingLock = useRef(false);


  const handleCreateGroup = async () => {
    if (creatingLock.current || isCreating) return;
    creatingLock.current = true;
    setIsCreating(true);


    // Kiểm tra điều kiện
    if (selected.length < 2 || !groupName.trim()) {
      Alert.alert('Lỗi', 'Cần ít nhất 2 thành viên và tên nhóm');
      return;
    }
    if (!groupName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên nhóm.');
      creatingLock.current = false;
      setIsCreating(false);
      return;
    }

    if (selected.length < 2) {
      Alert.alert('Không đủ thành viên', 'Cần chọn ít nhất 2 người để tạo nhóm.');
      creatingLock.current = false;
      setIsCreating(false);
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
    } finally {
      setIsCreating(false); // 👈 luôn reset
    }
  };

  // renderItem
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSelect(item._id, item)}
      style={tw`flex-row items-center p-3 border-b bg-white`}
    >
      <View style={tw`w-10 h-10 rounded-full bg-gray-300 mr-3`} />
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-semibold`}>{item.fullName}</Text>
        <Text style={tw`text-sm text-gray-500`}>{item.email}</Text>
      </View>
      <Text style={tw`text-xl`}>
        {selected.includes(item._id) ? '✅' : ''}
      </Text>
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
      {!groupName.trim() && (
        <Text style={tw`text-red-500 text-xs ml-4 -mt-3 mb-2`}>
          Tên nhóm không được để trống
        </Text>
      )}

      <Text style={tw`mx-4 mb-2 font-semibold`}>Chọn bạn bè:</Text>
      <View style={tw`flex-row items-center bg-white mx-4 px-3 py-2 rounded mb-2 border`}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          placeholder="Tìm người dùng (không cần là bạn bè)"
          style={tw`flex-1 text-black`}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={tw`text-blue-500 font-semibold ml-2`}>Tìm</Text>
        </TouchableOpacity>
      </View>

     <FlatList
  data={searchResults.length > 0 ? searchResults : friends}
  keyExtractor={(item) => item._id}
  renderItem={renderItem}
  ListEmptyComponent={() => (
    <Text style={tw`text-center mt-4 text-gray-500`}>
      {searchText.trim()
        ? (searchResults.length === 0 ? 'Không tìm thấy người dùng nào phù hợp.' : '')
        : (friends.length === 0 ? 'Bạn chưa có bạn bè nào.' : '')}
    </Text>
  )}
/>

      {selectedUsers.length > 0 && (
        <View style={tw`bg-white mx-4 my-3 p-3 rounded-xl border`}>
          <Text style={tw`font-semibold mb-2`}>Thành viên đã chọn:</Text>
          <View style={tw`flex-row flex-wrap`}>
            {selectedUsers.map((user) => (
              <View
                key={user._id}
                style={tw`flex-row items-center bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2`}
              >
                <Text style={tw`text-sm text-blue-800 mr-1`}>{user.fullName}</Text>
                <TouchableOpacity onPress={() => toggleSelect(user._id, user)}>
                  <Text style={tw`text-blue-600 text-xs`}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}





      <TouchableOpacity
        onPress={handleCreateGroup}
        disabled={isCreating}
        style={tw`m-4 p-3 rounded ${isCreating ? 'bg-blue-300' : 'bg-blue-600'}`}
      >
        <Text style={tw`text-white text-center font-semibold`}>
          {isCreating ? 'Đang tạo nhóm...' : '✅ Tạo nhóm'}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default GroupCreateScreen;
