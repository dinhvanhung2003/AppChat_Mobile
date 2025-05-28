import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const API_URL = 'http://192.168.88.179:5000'; 

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendOtp = async () => {
    if (!email) return Alert.alert("Lỗi", "Vui lòng nhập email");
  
    try {
      const res = await fetch(`${API_URL}/users/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const text = await res.text(); 
      console.log("🔁 Response:", text);
  
      let data;
      try {
        data = JSON.parse(text); 
      } catch (e) {
        Alert.alert("❌ JSON Error", "Không thể phân tích phản hồi từ server:\n" + text);
        return;
      }
  
      if (res.ok) {
        Alert.alert("✅ Thành công", "Mã OTP đã được gửi đến email.");
        navigation.navigate('VerifyOtpScreen', { email });
      } else {
        Alert.alert("❌ Lỗi", data.error || "Không thể gửi OTP.");
      }
  
    } catch (err) {
      Alert.alert("Lỗi kết nối", err.message);
    }
  };
  

  return (
    <View style={{ padding: 20,marginTop:30 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Quên mật khẩu</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TouchableOpacity onPress={handleSendOtp} style={{ backgroundColor: '#3B82F6', padding: 14, borderRadius: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Gửi mã OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
