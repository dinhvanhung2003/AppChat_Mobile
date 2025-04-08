import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NavigationBar from '../../components/MessageScreen/NavigationBar';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ route }) => {
  const [activeTab, setActiveTab] = useState('Account');
  const handleTabPress = useTabNavigation();
  const navigation = useNavigation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (route.params?.user) {
        setUser(route.params.user);
        await AsyncStorage.setItem("user", JSON.stringify(route.params.user));
      } else {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={tw`flex-1 bg-[#645C5CB2]`}>

      {/* Tìm kiếm */}
      <TouchableOpacity style={tw`bg-blue-500 h-15 px-5 flex-row`}>
        <Image source={require('../../assets/ProfileScreen/Icon/kinh.png')} style={tw`mt-6`} />
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="lightgray"
          style={tw`w-75 mt-3 ml-5 mr-3`}
        />
        <Image source={require('../../assets/ProfileScreen/Icon/caidat.png')} style={tw`mt-6`} />
      </TouchableOpacity>

      {/* Cá nhân */}
      <TouchableOpacity style={tw` h-22 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Avt.png')} style={tw``} />
        <TouchableOpacity style={tw`mt-6 w-73`}>
          <Text>{user ? user.fullName : 'Người dùng'}</Text>
          <Text style={tw`text-gray-500`}>Xem trang cá nhân</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/ProfileScreen/Icon/anh1.png')} style={tw`mt-8`} />
      </TouchableOpacity>

      {/* zCould */}
      <TouchableOpacity style={tw` h-20 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>zCould</Text>
          <Text style={tw`text-gray-500`}>Không gian lưu trữ trên điện đám mấy</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* zStyle */}
      <TouchableOpacity style={tw` h-20  px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>zStyle - Nổi bật trên Zalo</Text>
          <Text style={tw`text-gray-500`}>Hình nền và nhạc cho cuộc gọi Zalo</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Could của tôi */}
      <TouchableOpacity style={tw` h-20 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>Could của tôi</Text>
          <Text style={tw`text-gray-500`}>Lưu trữ tin nhắn quan trọng</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Dữ liệu trên máy */}
      <TouchableOpacity style={tw` h-20 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/lock.png')} style={tw`mt-8`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-75`}>
          <Text>Dữ liệu trên máy</Text>
          <Text style={tw`text-gray-500`}>Quản lý dữ liệu Zalo của bạn</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Ví QR */}
      <TouchableOpacity style={tw` h-20 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Vi.png')} style={tw`mt-8`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>Ví QR</Text>
          <Text style={tw`text-gray-500`}>Lưu trữ và xuất trình các mã QR quan trọng</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Tài khoản và bảo mật */}
      <TouchableOpacity style={tw` h-15 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/anh2.png')} style={tw`mt-6`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text style={tw`text-[4]`}>Tài khoản và bảo mật</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Quyền riêng tư */}
      <TouchableOpacity style={tw` h-15 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/anh3.png')} style={tw`mt-6`} />
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text style={tw`text-[4]`}>Quyền riêng tư</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Đăng xuất */}
      <TouchableOpacity
        style={tw` h-15 px-5 flex-row bg-white mt-2`}
        onPress={async () => {
          await AsyncStorage.removeItem("user");
          navigation.navigate('Login');
        }}>
        <Image source={require('../../assets/ProfileScreen/Icon/anh3.png')} style={tw`mt-6`} />
        <Text style={tw`text-[5] pt-5 ml-5`}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default ProfileScreen;
