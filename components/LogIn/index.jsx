import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "twrnc";
const API_URL = 'http://192.168.1.6:5000';
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token và user riêng biệt
        if (response.ok && data.user?.token) {
          await AsyncStorage.setItem("token", data.user.token);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
          navigation.navigate("MessageScreen");
        } else {
          Alert.alert("Lỗi", "Đăng nhập thất bại hoặc không nhận được token.");
        }



        // Điều hướng không cần truyền token nữa
        navigation.navigate("MessageScreen");
      } else {
        Alert.alert("Lỗi", data.error || "Đăng nhập thất bại!");
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", error.message);
    }
  };


  return (
    <View style={tw`flex-1 bg-white justify-center items-center px-6`}>
      <Text style={tw`text-blue-600 text-5xl font-bold mb-12`}>ChatAlo</Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={tw`w-full border-b border-gray-300 text-base pt-4 pb-2 mb-6`}
        placeholderTextColor="#999"
      />


      {/* Mật khẩu */}
      <View style={tw`w-full flex-row items-center border-b border-gray-300 pt-4 pb-2 mb-6`}>
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          style={tw`flex-1 text-base`}
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text style={tw`text-blue-600 font-bold ml-3`}>
            {secureText ? "Hiện" : "Ẩn"}
          </Text>
        </TouchableOpacity>
      </View>



      {/* Nút đăng nhập */}
      <TouchableOpacity
        style={tw`bg-blue-600 w-full py-3 rounded-xl mb-4`}
        onPress={handleLogin}
      >
        <Text style={tw`text-white text-center text-base font-semibold`}>
          ĐĂNG NHẬP VỚI MẬT KHẨU
        </Text>
      </TouchableOpacity>

      {/* Quên mật khẩu */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={tw`text-blue-600 font-medium mb-8`}>
          Quên mật khẩu?
        </Text>
      </TouchableOpacity>

      {/* Đăng ký */}
      <View style={tw`flex-row items-center`}>
        <Text style={tw`text-base`}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={tw`text-blue-600 font-semibold ml-2`}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
