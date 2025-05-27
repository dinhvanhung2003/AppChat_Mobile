import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../configs/fireBaseConfig'; // đường dẫn đúng file config

const API_URL = 'http://192.168.88.179:5000';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Lỗi", "Vui lòng nhập đủ 2 mật khẩu");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Lỗi", "Mật khẩu không khớp");
    }

    try {
      // 1. Gửi yêu cầu đổi mật khẩu về backend MongoDB
      const res = await fetch(`${API_URL}/users/reset-password-forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        return Alert.alert("Lỗi", data.error || "Không thể đặt lại mật khẩu");
      }

      // 2. Cập nhật mật khẩu trong Firebase
      const auth = FIREBASE_AUTH;

      // Firebase yêu cầu login để thay đổi password
      const credential = await signInWithEmailAndPassword(auth, email, otp); // dùng OTP như mật khẩu tạm
      await updatePassword(credential.user, newPassword);

      Alert.alert("✅ Thành công", "Mật khẩu đã được đặt lại!");
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể cập nhật mật khẩu Firebase");
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

      <TouchableOpacity
        onPress={handleResetPassword}
        style={{ backgroundColor: '#3B82F6', padding: 14, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Đặt lại mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;
