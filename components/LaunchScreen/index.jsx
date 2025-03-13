import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

export default function LaunchScreen({ navigation }) {
  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <Text style={tw`text-4xl font-bold text-blue-500 mb-12`}>Zalo</Text>

      {/* Nút Đăng nhập */}
      <TouchableOpacity 
        style={tw`bg-blue-500 px-6 py-3 rounded-lg mb-4 w-3/4`}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={tw`text-white text-center text-lg font-bold`}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Nút Tạo tài khoản mới */}
      <TouchableOpacity 
        style={tw`border border-blue-500 px-6 py-3 rounded-lg w-3/4`}
        onPress={() => navigation.navigate('NewScreen')}
      >
        <Text style={tw`text-blue-500 text-center text-lg font-bold`}>Tạo tài khoản mới</Text>
      </TouchableOpacity>
    </View>
  );
}
