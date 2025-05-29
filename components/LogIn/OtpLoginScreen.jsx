import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
import { API_URL } from '../../configs/api'; 


const OtpLoginScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.user?.token) {
        await AsyncStorage.setItem("token", data.user.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        navigation.navigate("MessageScreen");
      } else {
        Alert.alert("Lỗi", data.error || "Xác minh OTP thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-white`}>
      <Text style={tw`text-2xl font-bold text-center mb-6`}>Xác minh OTP</Text>
      <TextInput
        placeholder="Nhập mã OTP"
        keyboardType="numeric"
        style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
        value={otp}
        onChangeText={setOtp}
      />
      <TouchableOpacity
        style={tw`bg-blue-600 p-4 rounded-xl`}
        onPress={handleVerifyOtp}
      >
        <Text style={tw`text-white text-center font-bold`}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpLoginScreen;
