import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../../configs/fireBaseConfig"; 

const API_URL = "http://192.168.1.6:5000";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return;
    }

    try {
      // Đăng nhập bằng Firebase
      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Reload để chắc chắn trạng thái xác thực mới nhất
      await user.reload();

      if (!user.emailVerified) {
        Alert.alert("Lỗi", "Email chưa được xác thực. Vui lòng kiểm tra email của bạn.");
        return;
      }

      // Gọi API backend nếu bạn cần xác thực thêm (tùy chọn)
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // hoặc JWT token nếu backend yêu cầu
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data));
        navigation.navigate("ProfileScreen", { user: data });
      } else {
        Alert.alert("Lỗi", data.error || "Đăng nhập thất bại từ server!");
      }

    } catch (error) {
      Alert.alert("Lỗi đăng nhập", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
      <Text style={{
        fontSize: 50,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 48,
        marginTop: 200,
        marginBottom: 50
      }}>Zalo</Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ width: '80%', fontSize: 16, borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8 }}
      />

      {/* Mật khẩu */}
      <View style={{ width: '80%', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8 }}>
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
          style={{ flex: 1, fontSize: 16, color: '#333' }}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text style={{ fontSize: 16, color: '#3B82F6', fontWeight: 'bold', marginLeft: 10 }}>
            {secureText ? 'Hiện' : 'Ẩn'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nút đăng nhập */}
      <TouchableOpacity
        style={{ backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginBottom: 16, width: '80%', alignItems: 'center' }}
        onPress={handleLogin}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>ĐĂNG NHẬP VỚI MẬT KHẨU</Text>
      </TouchableOpacity>

      {/* Quên mật khẩu */}
      <TouchableOpacity onPress={() => console.log('Quên mật khẩu?')}>
        <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '500' }}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Đăng ký */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 50 }}>
        <Text style={{ fontSize: 16, color: '#000' }}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{ fontSize: 16, color: '#3B82F6', fontWeight: 'bold' }}>Đăng Ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
