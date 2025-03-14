import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import NavigationBar from '../MessageScreen/NavigationBar';
import useTabNavigation from '../../hooks/useTabNavigation';
const messages = [
  { id: '1', name: 'Ngô Quốc Tuấn', message: 'Đợi tí', time: '1 phút', avatar: require('../../assets/Avatar/test.png') },
  { id: '2', name: 'Nguyễn Văn A', message: '[Cuộc gọi thoại đến]', time: '41 phút', avatar: require('../../assets/Avatar/test.png'), tag: 'Gia đình' },
  { id: '3', name: 'CNM_Nhom_2_ZaloChat', message: 'Trí Hiếu: [Link] https://github.com...', time: '1 giờ', avatar: require('../../assets/Avatar/test.png') },
  { id: '4', name: 'Media Box', message: 'Báo Mới: Giá vàng trong nước đạt...', time: '1 giờ', avatar: require('../../assets/Avatar/test.png'), hasNotification: true },
  { id: '5', name: 'NOW_LT_KTTKPM_T3_7...', message: 'Hôm nay là sinh nhật của...', time: '7 giờ', avatar: require('../../assets/Avatar/test.png') },
  { id: '6', name: 'Trần Văn A', message: '🥰 Gửi lời chào, bắt đầu trò chuyện...', time: '17 giờ', avatar: require('../../assets/Avatar/test.png'), hasNotification: true },
  { id: '7', name: 'Lê Văn B', message: 'Oke b', time: '18 giờ', avatar: require('../../assets/Avatar/test.png'), tag: 'Bạn bè' },
  { id: '8', name: 'Test', message: 'Bạn: [Hình ảnh]', time: 'Thứ 5', avatar: require('../../assets/Avatar/test.png'), tag: 'Gia đình' },
];

const MessageListScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Ưu tiên');
  const handleTabPress = useTabNavigation();

  const filteredMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={tw`flex-row items-center p-3 border-b border-gray-200`}>
      <Image source={item.avatar} style={tw`w-12 h-12 rounded-full`} />
      <View style={tw`ml-3 flex-1`}>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-base font-semibold`}>{item.name}</Text>
          <Text style={tw`text-xs text-gray-500`}>{item.time}</Text>
        </View>
        <Text style={tw`text-gray-600`} numberOfLines={1}>{item.message}</Text>
        {item.tag && <Text style={tw`text-xs bg-gray-200 px-2 py-1 rounded mt-1 w-16`}>{item.tag}</Text>}
      </View>
      {item.hasNotification && (
        <View style={tw`w-4 h-4 bg-red-500 rounded-full`} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white mt-10`}>
      {/* Thanh tìm kiếm */}
      <View style={tw`flex-row items-center p-3 bg-blue-500`}>
        <Ionicons name="search" size={20} color="white" style={tw`mr-2`} />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="white"
          style={tw`flex-1 bg-transparent text-white`}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={tw`mx-2`}>
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={tw`flex-row border-b`}>
        <TouchableOpacity
          onPress={() => setActiveTab('Ưu tiên')}
          style={tw`flex-1 p-3 items-center`}
        >
          <Text style={tw`${activeTab === 'Ưu tiên' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>Ưu tiên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Khác')}
          style={tw`flex-1 p-3 items-center`}
        >
          <Text style={tw`${activeTab === 'Khác' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>Khác</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={tw`flex-1`} // <-- Thêm dòng này để FlatList có thể cuộn
        contentContainerStyle={{ paddingBottom: 60 }} // Tránh bị che bởi NavigationBar
      />


      {/* Thanh điều hướng dưới */}
      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab="Messages" onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default MessageListScreen;
