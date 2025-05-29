import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Alert, Image, ScrollView,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { API_URL } from '../../configs/api';
import { Ionicons } from '@expo/vector-icons';

const GroupAddMemberScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupData = {}, token = '', currentMembers = [] } = route.params || {};

  const [friends, setFriends] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Bảo vệ truy cập groupData
  const groupId = groupData?._id;

  const isAlreadyInGroup = (user) => {
    if (!user || !user._id) return true;
    return Array.isArray(currentMembers) && currentMembers.some((m) =>
      typeof m === 'string'
        ? m === user._id
        : m && m._id === user._id
    );
  };

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/users/listFriends`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter(
          (u) => u && u._id && !isAlreadyInGroup(u)
        );
        setFriends(filtered);
      })
      .catch(() => Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè.'));
  }, [token]);

  useEffect(() => {
    if (selectedUsers.length > 0) {
      setSearchResults([]);
      setSearchText('');
    }
  }, [selectedUsers]);

  const handleSearch = () => {
    if (!searchText.trim()) return;

    axios
      .get(`${API_URL}/users?search=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter(
          (u) =>
            u &&
            u._id &&
            !isAlreadyInGroup(u) &&
            !selectedUsers.some((s) => s && s._id === u._id)
        );
        setSearchResults(filtered);
      })
      .catch(() => Alert.alert('Lỗi', 'Không thể tìm kiếm.'));
  };

  const toggleSelect = (user) => {
    if (!user || !user._id) return;
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u && u._id === user._id);
      return exists
        ? prev.filter((u) => u && u._id !== user._id)
        : [...prev, user];
    });
  };

  const handleAddMembers = () => {
    if (!groupId) {
      Alert.alert('❌ Lỗi', 'Không tìm thấy nhóm!');
      return;
    }

    const userIds = selectedUsers
      .filter((u) => u && u._id)
      .map((u) => u._id);

    if (userIds.length === 0) {
      Alert.alert('⚠️ Vui lòng chọn thành viên');
      return;
    }

    axios
      .put(
        `${API_URL}/api/chat/groupadd`,
        { chatId: groupId, userId: userIds },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        Alert.alert('✅ Thành công', 'Đã thêm thành viên vào nhóm!');
        navigation.goBack();
      })
      .catch((err) => {
        console.error('❌ Lỗi thêm thành viên:', err.response?.data || err.message);
        Alert.alert('❌ Lỗi', err.response?.data?.message || 'Không thể thêm thành viên.');
      });
  };

  const dataToShow = (searchResults.length > 0 ? searchResults : friends)
    .filter((u) => u && u._id);

  const renderUser = ({ item }) => {
    if (!item || !item._id) return null;
    const isSel = selectedUsers.some((u) => u && u._id === item._id);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={tw`flex-row items-center justify-between px-4 py-3 bg-white mb-1 rounded-xl shadow-sm`}
      >
        <View style={tw`flex-row items-center`}>
          <Image
            source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }}
            style={tw`w-10 h-10 rounded-full mr-3`}
          />
          <Text style={tw`text-base font-medium`}>
            {item.fullName || item.email}
          </Text>
        </View>
        <Ionicons
          name={isSel ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSel ? '#3b82f6' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-100 pt-10`}>
  <Text style={tw`text-xl font-bold text-center mb-4`}>➕ Thêm thành viên</Text>

  {/* Search Bar */}
  <View style={tw`mx-4 mt-1 mb-3 px-4 py-2 bg-white rounded-full flex-row items-center border`}>
    <Ionicons name="search" size={18} color="#888" style={tw`mr-2`} />
    <TextInput
      value={searchText}
      onChangeText={setSearchText}
      onSubmitEditing={handleSearch}
      placeholder="Tìm theo tên, email..."
      placeholderTextColor="#999"
      style={tw`flex-1 text-base text-gray-900`}
    />
  </View>

  {/* Danh sách gợi ý thêm */}
  <FlatList
    data={dataToShow}
    keyExtractor={(item, index) => (item && item._id ? item._id : `item-${index}`)}
    renderItem={renderUser}
    contentContainerStyle={tw`px-4 pb-4`}
    ListEmptyComponent={() => (
      <Text style={tw`text-center text-gray-500 mt-10`}>
        Không có người nào để thêm.
      </Text>
    )}
  />

  {/* Danh sách đã chọn – nằm dưới danh sách gợi ý */}
  {selectedUsers.length > 0 && (
    <ScrollView
      horizontal
      style={tw`px-4 py-2 border-t border-gray-300 bg-gray-100`}
      showsHorizontalScrollIndicator={false}
    >
      {selectedUsers.map((u) =>
        u && u._id ? (
          <View key={u._id} style={tw`items-center mr-4`}>
            <TouchableOpacity onPress={() => toggleSelect(u)}>
              <Image
                source={{ uri: u.avatar || 'https://i.pravatar.cc/100' }}
                style={tw`w-12 h-12 rounded-full`}
              />
              <View style={tw`absolute top-0 right-0 bg-white rounded-full`}>
                <Ionicons name="close-circle" size={18} color="red" />
              </View>
            </TouchableOpacity>
            <Text style={tw`text-xs mt-1 text-center`} numberOfLines={1}>
              {u.fullName?.split(' ')[0]}
            </Text>
          </View>
        ) : null
      )}
    </ScrollView>
  )}

  {/* Nút thêm thành viên */}
  {selectedUsers.length > 0 && (
    <View style={tw`absolute bottom-6 left-6 right-6`}>
      <TouchableOpacity
        onPress={handleAddMembers}
        style={tw`bg-blue-600 py-4 rounded-full shadow-md`}
      >
        <Text style={tw`text-white text-center text-base font-bold`}>
          ➕ Thêm {selectedUsers.length} người
        </Text>
      </TouchableOpacity>
    </View>
  )}
</View>

  );
};

export default GroupAddMemberScreen;
