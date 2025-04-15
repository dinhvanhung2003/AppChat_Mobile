import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationBar from '../../components/MessageScreen/NavigationBar';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ route }) => {
  const [activeTab, setActiveTab] = useState('Account');
  const handleTabPress = useTabNavigation();
  const navigation = useNavigation();

  const [user, setUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };
      fetchUser();
    }, [])
  );

  const MenuItem = ({ icon, text, onPress }) => (
    <TouchableOpacity
      style={tw`flex-row items-center px-5 py-4 bg-white border-b border-gray-200 `}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={24} color="#3B82F6" />
      <Text style={tw`ml-4 text-base`}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-100 mt-10`}>
      {/* Header tìm kiếm */}
      <View style={tw`flex-row items-center bg-blue-500 px-4 py-3`}>
        <MaterialIcons name="search" size={24} color="white" />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="white"
          style={tw`flex-1 text-white ml-4`}
        />
        <MaterialIcons name="settings" size={24} color="white" />
      </View>

      {/* Thông tin người dùng */}
      <View style={tw`flex-row items-center bg-white px-5 py-4 border-b border-gray-200`}>
        <Image
          source={{
            uri:
              user?.avatar ||
              'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
          }}
          style={tw`w-14 h-14 rounded-full border border-gray-300`}
        />
        <View style={tw`ml-4`}>
          <Text style={tw`text-lg font-semibold`}>
            {user?.fullName || 'Người dùng'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { user })}>
            <Text style={tw`text-gray-500`}>Xem trang cá nhân</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách chức năng */}
      <MenuItem icon="cloud" text="Cloud của tôi" />
      <MenuItem icon="folder" text="Dữ liệu trên máy" />
      <MenuItem icon="qr-code" text="Ví QR" />
      <MenuItem
        icon="security"
        text="Đổi mật khẩu"
        onPress={() => navigation.navigate('ChangePass')}
      />
      <MenuItem icon="lock" text="Quyền riêng tư" />

      {/* Đăng xuất */}
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem('user');
          navigation.navigate('Login');
        }}
        style={tw`flex-row items-center px-5 py-4 bg-white mt-4`}
      >
        <MaterialIcons name="logout" size={24} color="#DC2626" />
        <Text style={tw`ml-4 text-red-600 font-semibold`}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Navigation Bar */}
      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default ProfileScreen;
