import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const API_URL = 'http://192.168.1.12:5000'; 

const VerifyOtpScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otpCode, setOtpCode] = useState('');

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }), 
      });

      const text = await res.text();
      console.log("📩 Server response:", text);

      try {
        const data = JSON.parse(text);
        if (res.ok) {
          Alert.alert("✅ Thành công", "OTP hợp lệ. Tiếp tục đặt lại mật khẩu.");
          navigation.navigate('ResetPasswordScreen', { email, otp: otpCode });
        } else {
          Alert.alert("❌ Lỗi", data.error || "Mã OTP không đúng hoặc đã hết hạn.");
        }
      } catch (e) {
        Alert.alert("❌ JSON Parse Error", "Phản hồi không phải JSON:\n" + text);
      }

    } catch (err) {
      Alert.alert("Lỗi kết nối", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24,marginTop:30 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Xác thực mã OTP
      </Text>

      <Text style={{ fontSize: 16, color: '#555', marginBottom: 8 }}>
        Mã OTP đã gửi đến email: {email}
      </Text>

      <TextInput
        placeholder="Nhập mã OTP"
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="numeric"
        maxLength={6}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
          fontSize: 18,
        }}
      />

      <TouchableOpacity
        onPress={handleVerifyOtp}
        style={{
          backgroundColor: '#3B82F6',
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
          Xác nhận OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOtpScreen;
