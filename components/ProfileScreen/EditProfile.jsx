import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import tw from "twrnc";
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = "http://192.168.1.9:5000";

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };
;
  


  const handleUpdate = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = JSON.parse(userData);
      const token = user?.token;
  
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }
  
      const response = await fetch(`${API_URL}/users/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ fullName, email, avatar }),
      });
  
      const text = await response.text();
  
      try {
        const data = JSON.parse(text);
        if (response.ok) {
          await AsyncStorage.setItem("user", JSON.stringify({ ...user, ...data }));
  
          Alert.alert("✅ Cập nhật thành công");
          navigation.goBack();
        } else {
          Alert.alert("❌ Lỗi", data.error || "Không thể cập nhật");
        }
      } catch (e) {
        Alert.alert("Lỗi", "Phản hồi không hợp lệ từ server:\n" + text);
      }
    } catch (err) {
      Alert.alert("Lỗi kết nối", err.message);
    }
  };
  

  

  return (
    <View style={tw`flex-1 p-6 bg-white`}>
      <Text style={tw`text-2xl font-bold text-center mb-6`}>Chỉnh sửa thông tin</Text>

      <TouchableOpacity onPress={pickImage} style={tw`items-center mb-6`}>
        <Image
          source={{ uri: avatar }}
          style={tw`w-28 h-28 rounded-full border-2 border-blue-500`}
        />
        <Text style={tw`text-blue-500 mt-2`}>Thay ảnh đại diện</Text>
      </TouchableOpacity>

      <TextInput
        style={tw`border p-3 mb-4 rounded-xl`}
        placeholder="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={tw`border p-3 mb-4 rounded-xl`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={tw`bg-blue-600 p-4 rounded-xl`}
        onPress={handleUpdate}
      >
        <Text style={tw`text-white text-center font-bold`}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileScreen;
