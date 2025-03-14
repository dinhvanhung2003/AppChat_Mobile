import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation';

const NavigationBar = ({ activeTab }) => {
  const handleTabPress = useTabNavigation();

  return (
    <View style={tw`flex-row justify-around bg-white py-3 border-t border-gray-200`}>
      {/* Tin nhắn */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handleTabPress('Messages')}>
        <Ionicons
          name={activeTab === 'Messages' ? 'chatbubble' : 'chatbubble-outline'}
          size={24}
          color={activeTab === 'Messages' ? '#007AFF' : '#666'}
        />
        {activeTab === 'Messages' && <Text style={tw`text-xs text-blue-500 font-semibold`}>Tin nhắn</Text>}
      </TouchableOpacity>

      {/* Danh bạ */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handleTabPress('Contacts')}>
        <View style={tw`items-center`}>
          <Ionicons
            name={activeTab === 'Contacts' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'Contacts' ? '#007AFF' : '#666'}
          />
          {activeTab === 'Contacts' && <Text style={tw`text-xs text-blue-500 font-semibold`}>Danh bạ</Text>}
        </View>
      </TouchableOpacity>

      {/* Tin tức */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handleTabPress('News')}>
        <Ionicons
          name={activeTab === 'News' ? 'grid' : 'grid-outline'}
          size={24}
          color={activeTab === 'News' ? '#007AFF' : '#666'}
        />
        {activeTab === 'News' && <Text style={tw`text-xs text-blue-500 font-semibold`}>Tin tức</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={tw`items-center relative`} onPress={() => handleTabPress('Notifications')}>
        <View style={tw`items-center`}>
          <Ionicons
            name={activeTab === 'Notifications' ? 'time' : 'time-outline'}
            size={24}
            color={activeTab === 'Notifications' ? '#007AFF' : '#666'}
          />
          {/* Hiển thị chữ "Lịch sử" khi active */}
          {activeTab === 'Notifications' && <Text style={tw`text-xs text-blue-500 font-semibold mt-1`}>Lịch sử</Text>}
        </View>

        {/* Badge thông báo đỏ "N" chỉ hiển thị khi không active */}
        {activeTab !== 'Notifications' && (
          <View style={tw`absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center`}>
            <Text style={tw`text-xs text-white font-bold`}>N</Text>
          </View>
        )}
      </TouchableOpacity>


      {/* Cá nhân */}
      <TouchableOpacity style={tw`items-center`} onPress={() => handleTabPress('Account')}>
        <Ionicons
          name={activeTab === 'Account' ? 'person' : 'person-outline'}
          size={24}
          color={activeTab === 'Account' ? '#007AFF' : '#666'}
        />
        {activeTab === 'Account' && <Text style={tw`text-xs text-blue-500 font-semibold`}>Cá nhân</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
