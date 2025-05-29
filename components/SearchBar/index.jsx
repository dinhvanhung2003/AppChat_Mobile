import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-row items-center px-4 py-2 bg-white`}>
      <View style={tw`flex-row items-center flex-1 bg-gray-100 rounded-full px-3 py-2`}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={tw`ml-2 flex-1 text-sm`}
          placeholder="Tìm bạn bè, tin nhắn..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('SearchFriendScreen')}
        style={tw`ml-3`}
      >
        <Ionicons name="person-add-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
