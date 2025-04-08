import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import tw from "twrnc";

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { FIREBASE_AUTH } from "../../configs/fireBaseConfig"; 

const API_URL = "http://192.168.1.6:5000";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const firebaseUser = userCredential.user;
    
      await sendEmailVerification(firebaseUser);
    
      // ✅ Gọi API backend để lưu thông tin vào MongoDB
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }), // avatar nếu có
      });
    
      const data = await response.json();
    
      if (!response.ok) {
        console.log("❌ Lỗi từ backend:", data);
        Alert.alert("Lỗi server", data.error || "Không thể lưu user vào MongoDB");
        return;
      }
    
      Alert.alert("✅ Thành công", "Vui lòng kiểm tra email xác thực.");
      navigation.navigate("Login");
    
    } catch (error) {
      console.log("❌ Lỗi fetch Firebase hoặc backend:", error.message);
      Alert.alert("Lỗi", error.message);
    }
    
  };

  return (
    <ScrollView contentContainerStyle={tw`flex-1 bg-gradient-to-b from-blue-100 to-white`}>
      <View style={tw`flex-1 justify-center px-6 py-12`}>
        <View style={tw`bg-white p-6 rounded-2xl shadow-lg`}>
          <Text style={tw`text-3xl font-bold text-center text-blue-700 mb-6`}>
            Tạo tài khoản
          </Text>

          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-6`}
            placeholder="Xác nhận mật khẩu"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            style={tw`bg-blue-600 rounded-xl py-1`}
            labelStyle={tw`text-white text-lg`}
          >
            Đăng ký
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={tw`mt-4`}
          >
            <Text style={tw`text-center text-gray-500`}>
              Đã có tài khoản?{" "}
              <Text style={tw`text-blue-500 font-semibold`}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
