import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
const API_URL = 'http://192.168.1.12:5000';

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };
      fetchUser();
    }, [])
  )
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin');
      return;
    }

    try {
      const tokenData = await AsyncStorage.getItem('user');
      const user = JSON.parse(tokenData);
      const token = user.token;

      const response = await fetch(`${API_URL}/users/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ Thành công', 'Mật khẩu đã được đổi');
        navigation.goBack();
      } else {
        Alert.alert('❌ Lỗi', data.error || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      Alert.alert('Lỗi kết nối', err.message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Đổi mật khẩu</Text>
      <TextInput
        placeholder="Mật khẩu cũ"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TouchableOpacity
        onPress={handleChangePassword}
        style={{ backgroundColor: '#3B82F6', padding: 12, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Cập nhật mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;
