import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Button } from "react-native-paper";

const API_URL = "http://192.168.1.6:5000";

const OtpVerificationScreen = ({ route, navigation }) => {
  const { signupData } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...signupData, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Lỗi", data.error || "Xác thực OTP thất bại.");
        return;
      }

      Alert.alert("✅ Thành công", "Đăng ký thành công, hãy đăng nhập.");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Lỗi kết nối", error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-white`}>
      <Text style={tw`text-2xl font-bold text-center mb-6`}>Xác thực OTP</Text>
      <TextInput
        placeholder="Nhập mã OTP"
        keyboardType="numeric"
        style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
        value={otp}
        onChangeText={setOtp}
      />
      <Button mode="contained" onPress={handleVerifyOtp} style={tw`bg-blue-600`}>
        Xác minh
      </Button>
    </View>
  );
};

export default OtpVerificationScreen;
