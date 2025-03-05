import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation'; 
import NavigationBar from '../../components/MessageScreen/NavigationBar';
const PhoneBook = () => {
  const [activeTab, setActiveTab] = useState('Contacts');
  const handleTabPress = useTabNavigation(); 

  const contacts = [
    { id: '1', name: 'Friend 1', avatar: require('../../assets/tải xuống.png') },
    { id: '2', name: 'Friend 2', avatar: require('../../assets/tải xuống.png') },
    { id: '3', name: 'Friend 3', avatar: require('../../assets/tải xuống.png') },
    { id: '4', name: 'Friend 4', avatar: require('../../assets/tải xuống.png') },
  ];

  const renderItem = ({ item }) => (
    <View style={tw`flex-row items-center justify-between p-4 border-b`}>
      <View style={tw`flex-row items-center`}>
        <Image source={item.avatar} style={tw`w-12 h-12 rounded-full`} />
        <Text style={tw`ml-4 text-base`}>{item.name}</Text>
      </View>
      <View style={tw`flex-row`}>
        <TouchableOpacity style={tw`ml-4`}>
          <Text style={tw`text-blue-500`}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`ml-4`}>
          <Text style={tw`text-blue-500`}>📹</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`p-4 bg-blue-500`}>
        <Text style={tw`text-white text-lg font-bold`}>Danh Bạ</Text>
      </View>

      {/* Tab Menu */}
      <View style={tw`flex-row justify-around border-b`}>
        <TouchableOpacity onPress={() => setActiveTab('Contacts')}>
          <Text style={tw`p-4 ${activeTab === 'Contacts' ? 'border-b-2 border-blue-500' : ''}`}>Danh bạ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Requests')}>
          <Text style={tw`p-4 ${activeTab === 'Requests' ? 'border-b-2 border-blue-500' : ''}`}>Lời mời kết bạn</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Birthday')}>
          <Text style={tw`p-4 ${activeTab === 'Birthday' ? 'border-b-2 border-blue-500' : ''}`}>Sinh nhật</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={tw`flex-1`}
      />

      {/* Bottom Navigation Bar */}
      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default PhoneBook;
