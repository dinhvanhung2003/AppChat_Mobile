import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import tw from "twrnc";

import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
const API_URL = 'http://192.168.1.6:5000';
const SignupScreen = ({ navigation }) => {
  // khai bao state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  // xu ly dang ky
  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword || !gender || !dateOfBirth) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{8,}$/;
    const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u;
    const hasWhiteSpace = /\s/;
    const dateValid = !isNaN(Date.parse(dateOfBirth));

    if (!fullNameRegex.test(fullName)) {
      Alert.alert("Lỗi", "Họ và tên không được chứa ký tự đặc biệt hoặc số!");
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    if (hasWhiteSpace.test(email)) {
      Alert.alert("Lỗi", "Email không được chứa khoảng trắng!");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    if (hasWhiteSpace.test(password) || hasWhiteSpace.test(confirmPassword)) {
      Alert.alert("Lỗi", "Mật khẩu không được chứa khoảng trắng!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!dateValid) {
      Alert.alert("Lỗi", "Ngày sinh không hợp lệ! Định dạng: YYYY-MM-DD");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phoneNumber,
          gender,
          dateOfBirth: dateOfBirth.toISOString().split("T")[0],
          avatar: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Lỗi", data.error || "Đăng ký thất bại!");
        return;
      }

      // Chuyển sang màn hình OTP
      navigation.navigate("OtpVeficationScreen", {
        signupData: {
          fullName,
          email,
          password,
          phoneNumber,
          gender,
          dateOfBirth: dateOfBirth.toISOString().split("T")[0],
        },
      });
    } catch (error) {
      Alert.alert("Lỗi kết nối", error.message);
    }
  };


  // giao dien dang ky
  return (
    <ScrollView contentContainerStyle={tw`flex-1 bg-white`}>
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
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
            placeholder="Xác nhận mật khẩu"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TextInput
            style={tw`border border-gray-300 rounded-xl px-4 py-3 text-base mb-4`}
            placeholder="Số điện thoại (không bắt buộc)"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* Picker Giới tính */}
          <View style={tw`border border-gray-300 rounded-xl mb-4`}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={tw`px-2 py-2`}
            >
              <Picker.Item label="Nam" value="male" />
              <Picker.Item label="Nữ" value="female" />
            </Picker>
          </View>

          {/* Ngày sinh */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={tw`border border-gray-300 rounded-xl px-4 py-3 mb-4`}
          >
            <Text style={tw`text-base text-gray-600`}>
              {dateOfBirth.toISOString().split("T")[0]}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateOfBirth(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}

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
