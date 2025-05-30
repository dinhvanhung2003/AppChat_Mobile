import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import tw from "twrnc";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import { API_URL } from '../../configs/api';

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [gender, setGender] = useState(user.gender || "male");
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || "");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const loggedInUser = JSON.parse(userData);
      const token = loggedInUser?.token;

      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("gender", gender);
      formData.append("dateOfBirth", new Date(dateOfBirth).toISOString());

      // Thêm ảnh nếu là URI từ máy
      if (avatar && avatar.startsWith("file")) {
        const filename = avatar.split("/").pop();
        const ext = filename.split(".").pop();
        const mimeType = `image/${ext}`;

        formData.append("avatar", {
          uri: avatar,
          name: filename,
          type: mimeType,
        });
      }

      const response = await fetch(`${API_URL}/users/updateprofile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify({ ...loggedInUser, ...data }));
        Alert.alert("✅ Cập nhật thành công");
        navigation.goBack();
      } else {
        Alert.alert("❌ Lỗi", data.error || "Không thể cập nhật");
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
      <TextInput
        style={tw`border p-3 mb-4 rounded-xl`}
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Picker
        selectedValue={gender}
        onValueChange={(val) => setGender(val)}
        style={tw`border p-3 mb-4 rounded-xl`}
      >
        <Picker.Item label="Nam" value="male" />
        <Picker.Item label="Nữ" value="female" />
      </Picker>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`border p-3 mb-4 rounded-xl`}>
        <Text>{new Date(dateOfBirth).toISOString().split("T")[0]}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(dateOfBirth)}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setDateOfBirth(date.toISOString());
          }}
        />
      )}

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
