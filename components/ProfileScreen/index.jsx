import React, { useState } from 'react';
import { View, Text,TouchableOpacity ,Image,TextInput} from 'react-native';
import NavigationBar from '../../components/MessageScreen/NavigationBar';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation'; 

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const handleTabPress = useTabNavigation(); 

  return (
    <View style={tw`flex-1 bg-[#645C5CB2]`}>

      {/* Tìm kiếm */}
      <TouchableOpacity style={tw`bg-blue-500 h-15 px-5 flex-row`}>
        <Image source={require('../../assets/ProfileScreen/Icon/kinh.png')} style={tw`mt-6`}/>
        <TextInput
          placeholder="Tìm kiếm"
          placeholderTextColor="lightgray"
          style={tw`w-75 mt-3 ml-5 mr-3`}
        />
        <Image source={require('../../assets/ProfileScreen/Icon/caidat.png')} style={tw`mt-6`}/>
      </TouchableOpacity>

      {/* Cá nhân */}
      <TouchableOpacity style={tw` h-22 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Avt.png')} style={tw``}/>
        <TouchableOpacity style={tw`mt-6 w-73`}>
          <Text>Ngô Quốc Tuấn</Text>
          <Text style={tw`text-gray-500`}>Xem trang cá nhân</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/ProfileScreen/Icon/anh1.png')} style={tw`mt-8`}/>
      </TouchableOpacity>

      {/* zCould */}
      <TouchableOpacity style={tw` h-20 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>zCould</Text>
          <Text style={tw`text-gray-500`}>Không gian lưu trữ trên điện đám mấy</Text>
        </TouchableOpacity>
        <Text style={tw`mt-8`}></Text>
      </TouchableOpacity>

      {/* zStyle - Nổi bật trên Zalo */}
      <TouchableOpacity style={tw` h-20  px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>zStyle - Nổi bật trên Zalo</Text>
          <Text style={tw`text-gray-500`}>Hình nền và nhạc cho cuộc gọi Zalo</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Could của tôi */}
      <TouchableOpacity style={tw` h-20 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Clound.png')} style={tw`mt-8`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>Could của tôi</Text>
          <Text style={tw`text-gray-500`}>Lưu trữ tin nhắn quan trọng</Text>
        </TouchableOpacity>
        <Text style={tw`mt-8`}></Text>
      </TouchableOpacity>

      {/* Dữ liệu trên máy */}
      <TouchableOpacity style={tw` h-20 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/lock.png')} style={tw`mt-8`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-75`}>
          <Text>Dữ liệu trên máy</Text>
          <Text style={tw`text-gray-500`}>Quản lý dữ liệu Zalo của bạn</Text>
        </TouchableOpacity>
        <Text style={tw`mt-8`}></Text>
      </TouchableOpacity>

      {/* Ví QR */}
      <TouchableOpacity style={tw` h-20 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/Vi.png')} style={tw`mt-8`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text>Ví QR</Text>
          <Text style={tw`text-gray-500`}>Lưu trữ và xuất trình các mã QR quan trọng</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Tài khoản và bảo mật */}
      <TouchableOpacity style={tw` h-15 mt-2 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/anh2.png')} style={tw`mt-6`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text style={tw`text-[4]`}>Tài khoản và bảo mật</Text>
        </TouchableOpacity>
        <Text style={tw`mt-6`}></Text>
      </TouchableOpacity>

      {/* Quyền riệng tư */}
      <TouchableOpacity style={tw` h-15 px-5 flex-row bg-white`}>
        <Image source={require('../../assets/ProfileScreen/Icon/anh3.png')} style={tw`mt-6`}/>
        <TouchableOpacity style={tw`mt-5 mx-5 w-74`}>
          <Text style={tw`text-[4]`}>Quyền riệng tư</Text>
        </TouchableOpacity>
        <Text style={tw`mt-6`}></Text>
      </TouchableOpacity>

      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default ProfileScreen;

