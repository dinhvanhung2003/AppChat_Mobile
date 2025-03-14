import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={tw`p-4 bg-blue-500 flex-row items-center`}>
      <Ionicons name="search" size={20} color="white" style={tw`mr-2`} />
      <TextInput
        style={tw`flex-1 bg-white rounded-md p-2 text-black`}
        placeholder="Tìm kiếm"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={tw`ml-4`}>
        <Ionicons name="person-add-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
