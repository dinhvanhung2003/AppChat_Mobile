import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const NavigationBar = ({ activeTab, onTabPress }) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const handlePress = (tab) => {
    setSelectedTab(tab);
    onTabPress(tab);
  };

  return (
    <View style={tw`flex-row justify-around bg-white py-3 border-t border-gray-200`}>
      {/* Tin nhắn (Message Tab) */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handlePress('Messages')}>
        <Ionicons name="chatbubble-outline" size={24} color={selectedTab === 'Messages' ? '#00BFFF' : '#666'} />
        {selectedTab === 'Messages' && <Text style={tw`text-xs text-blue-500`}>Tin nhắn</Text>}
      </TouchableOpacity>

      {/* Danh bạ (Contacts Tab) */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handlePress('Contacts')}>
        <Ionicons name="person-outline" size={24} color={selectedTab === 'Contacts' ? '#00BFFF' : '#666'} />
        {selectedTab === 'Contacts' && <Text style={tw`text-xs text-blue-500`}>Danh bạ</Text>}
      </TouchableOpacity>

      {/* Tin tức (News Tab) */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handlePress('News')}>
        <Ionicons name="apps-outline" size={24} color={selectedTab === 'News' ? '#00BFFF' : '#666'} />
        {selectedTab === 'News' && <Text style={tw`text-xs text-blue-500`}>Tin tức</Text>}
      </TouchableOpacity>

      {/* Thông báo (Notification Tab) */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handlePress('Notifications')}>
        <Ionicons name="notifications-outline" size={24} color={selectedTab === 'Notifications' ? '#00BFFF' : '#666'} />
        {selectedTab === 'Notifications' && <Text style={tw`text-xs text-blue-500`}>Thông báo</Text>}
      </TouchableOpacity>

      {/* Tài khoản (Account Tab) */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handlePress('Account')}>
        <Ionicons name="person-outline" size={24} color={selectedTab === 'Account' ? '#00BFFF' : '#666'} />
        {selectedTab === 'Account' && <Text style={tw`text-xs text-blue-500`}>Tài khoản</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
