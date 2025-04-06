import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import tw from "twrnc";

const API_URL = "http://192.168.1.6:5000"; 

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Đăng ký thành công!", "Vui lòng đăng nhập.");
        navigation.navigate("SignIn"); // Chuyển sang màn hình đăng nhập
      } else {
        Alert.alert("Lỗi", data.error || "Đăng ký thất bại!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <View style={tw`flex-1 p-6 justify-center bg-white`}>
      <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>Đăng ký</Text>

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-4 text-lg`}
        placeholder="Nhập họ và tên"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-4 text-lg mt-3`}
        placeholder="Nhập email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={tw`border border-gray-300 rounded-lg p-4 text-lg mt-3`}
        placeholder="Nhập mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button mode="contained" onPress={handleSignup} style={tw`mt-5 bg-blue-500`}>
        Đăng ký
      </Button>
    </View>
  );
};

export default SignupScreen;
