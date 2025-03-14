import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import useTabNavigation from '../../hooks/useTabNavigation';
import NavigationBar from '../../components/MessageScreen/NavigationBar';
import SearchBar from '../SearchBar/index';
const PhoneBook = () => {
  const [activeTab, setActiveTab] = useState('Friends');
  // const handleTabPress = useTabNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách liên hệ có nhóm chữ cái
  const contacts = [
    { id: '1', name: 'Test 1', avatar: require('../../assets/Avatar/test.png'), group: 'A' },
    { id: '2', name: 'Test 2', avatar: require('../../assets/Avatar/test.png'), group: 'B' },
    { id: '3', name: 'Test 3', avatar: require('../../assets/Avatar/test.png'), group: 'B' },
    { id: '4', name: 'Test 4', avatar: require('../../assets/Avatar/test.png'), group: 'B' },
    { id: '5', name: 'Test 5', avatar: require('../../assets/Avatar/test.png'), group: 'D' },
    { id: '6', name: 'Test 5', avatar: require('../../assets/Avatar/test.png'), group: 'D' },
    { id: '7', name: 'Test 5', avatar: require('../../assets/Avatar/test.png'), group: 'D' },
    { id: '8', name: 'Test 5', avatar: require('../../assets/Avatar/test.png'), group: 'D' },
  ];

  // Lọc danh bạ theo tìm kiếm
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tạo nhóm theo chữ cái đầu tiên
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const firstLetter = contact.group;
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  // Render danh bạ có phân nhóm chữ cái
  const renderItem = ({ item }) => (
    <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-300`}>
      <View style={tw`flex-row items-center`}>
        <Image source={item.avatar} style={tw`w-12 h-12 rounded-full`} />
        <Text style={tw`ml-4 text-base font-semibold`}>{item.name}</Text>
      </View>
      <View style={tw`flex-row`}>
        <TouchableOpacity style={tw`ml-4`}>
          <Ionicons name="call" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={tw`ml-4`}>
          <Ionicons name="videocam" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-white mt-10`}>
      {/* Header tìm kiếm */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Tab Menu */}
      <View style={tw`flex-row justify-around border-b`}>
        <TouchableOpacity onPress={() => setActiveTab('Friends')}>
          <Text style={tw`p-4 ${activeTab === 'Friends' ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-600'}`}>Bạn bè</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Groups')}>
          <Text style={tw`p-4 ${activeTab === 'Groups' ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-600'}`}>Nhóm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('OA')}>
          <Text style={tw`p-4 ${activeTab === 'OA' ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : 'text-gray-600'}`}>OA</Text>
        </TouchableOpacity>
      </View>

      {/* Danh bạ máy & lời mời kết bạn */}
      <View style={tw`p-4 border-b`}>
        <TouchableOpacity style={tw`flex-row items-center mb-2`}>
          <Ionicons name="person-add-outline" size={24} color="#007AFF" />
          <Text style={tw`ml-4 text-lg`}>Lời mời kết bạn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`flex-row items-center`}>
          <Ionicons name="book-outline" size={24} color="#007AFF" />
          <Text style={tw`ml-4 text-lg`}>Danh bạ máy</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách bạn bè */}
      <FlatList
        data={Object.keys(groupedContacts)}
        keyExtractor={(letter) => letter}
        renderItem={({ item: letter }) => (
          <View>
            <Text style={tw`bg-gray-200 p-2 text-gray-600 font-bold`}>{letter}</Text>
            <FlatList
              data={groupedContacts[letter]}
              renderItem={renderItem}
              keyExtractor={(contact) => contact.id}
            />
          </View>
        )}
      />

      {/* Bottom Navigation Bar */}
      <View style={tw`absolute bottom-0 w-full`}>
      <NavigationBar activeTab="Contacts" />
      </View>
    </View>
  );
};

export default PhoneBook;
