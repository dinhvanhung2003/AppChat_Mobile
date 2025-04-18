import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';

const API_URL = 'http://192.168.1.12:5000';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return Alert.alert("Lỗi", "Vui lòng nhập đủ 2 mật khẩu");
    if (newPassword !== confirmPassword) return Alert.alert("Lỗi", "Mật khẩu không khớp");

    try {
      const res = await fetch(`${API_URL}/users/reset-password-forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const text = await res.text();
      console.log("🔁 Phản hồi:", text);

      try {
        const data = JSON.parse(text);
        if (res.ok) {
          Alert.alert("✅ Thành công", "Mật khẩu đã được đặt lại.");
          navigation.navigate('Login');
        } else {
          Alert.alert("❌ Lỗi", data.error || "Không thể đặt lại mật khẩu");
        }
      } catch (e) {
        Alert.alert("❌ JSON Parse Error", "Phản hồi không hợp lệ:\n" + text);
      }

    } catch (err) {
      Alert.alert("Lỗi kết nối", err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Đặt lại mật khẩu mới</Text>

      <TextInput
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <TextInput
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <TouchableOpacity onPress={handleResetPassword} style={{ backgroundColor: '#3B82F6', padding: 14, borderRadius: 10 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Đặt lại mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;
