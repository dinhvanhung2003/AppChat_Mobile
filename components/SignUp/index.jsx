import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import { Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";




import tw from "twrnc";

const SignupScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // Quản lý bước đăng ký
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Kiểm tra email hợp lệ
  const handleNext = () => {
    if (!email.includes("@")) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ!");
      return;
    }
    setStep(2); // Chuyển sang nhập OTP
  };

  // Kiểm tra OTP hợp lệ
  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert("Lỗi", "Mã OTP phải có 6 chữ số!");
      return;
    }
    setStep(3); // Chuyển sang nhập tên
  };

  // Kiểm tra tên hợp lệ
  const handleNextName = () => {
    if (name.length < 2) {
      Alert.alert("Lỗi", "Tên phải có ít nhất 2 ký tự!");
      return;
    }
    setStep(4); // Chuyển sang chọn ngày sinh
  };

  // Xác nhận ngày sinh
  const handleNextDob = () => {
    setStep(5); // Chuyển sang chọn giới tính
  };

  // Xác nhận giới tính
  const handleNextGender = () => {
    if (!gender) {
      Alert.alert("Lỗi", "Vui lòng chọn giới tính!");
      return;
    }
    setStep(6); // Hoàn tất đăng ký
  };

  // Hoàn tất đăng ký
  const handleComplete = () => {
    Alert.alert("Chúc mừng!", "Bạn đã đăng ký thành công!");
    navigation.navigate("HomeScreen"); // Chuyển sang màn hình chính
  };

  return (
    <View style={tw`flex-1 p-6 justify-center bg-white`}>
      {/* Bước 1: Nhập Email */}
      {step === 1 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Nhập email của bạn
          </Text>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-4 text-lg`}
            placeholder="Nhập địa chỉ email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Button mode="contained" onPress={handleNext} style={tw`mt-5 bg-blue-500`}>
            Tiếp tục
          </Button>
        </>
      )}

      {/* Bước 2: Nhập OTP */}
      {step === 2 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Nhập mã xác thực
          </Text>
          <Text style={tw`text-center text-gray-600`}>Nhập mã OTP đã gửi đến {email}</Text>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-4 text-lg text-center mt-5`}
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <Button mode="contained" onPress={handleVerifyOTP} style={tw`mt-5 bg-blue-500`}>
            Xác nhận
          </Button>
        </>
      )}

      {/* Bước 3: Nhập Tên */}
      {step === 3 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Nhập tên Zalo
          </Text>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-4 text-lg`}
            placeholder="Nhập tên của bạn"
            value={name}
            onChangeText={setName}
          />
          <Button mode="contained" onPress={handleNextName} style={tw`mt-5 bg-blue-500`}>
            Tiếp tục
          </Button>
        </>
      )}

      {/* Bước 4: Chọn Ngày Sinh */}
      {step === 4 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Thêm thông tin cá nhân
          </Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`border p-4 rounded-lg text-lg`}>
            <Text>{dob.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dob}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}

          <Button mode="contained" onPress={handleNextDob} style={tw`mt-5 bg-blue-500`}>
            Chọn
          </Button>
        </>
      )}

      {/* Bước 5: Chọn Giới Tính */}
      {step === 5 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Thêm thông tin cá nhân
          </Text>
          <TouchableOpacity onPress={() => setShowGenderModal(true)} style={tw`border p-4 rounded-lg text-lg`}>
            <Text>{gender || "Chọn giới tính"}</Text>
          </TouchableOpacity>

          {/* Modal chọn giới tính */}
          <Modal visible={showGenderModal} transparent>
            <View style={tw`flex-1 justify-center bg-black bg-opacity-30`}>
              <View style={tw`bg-white p-5 rounded-lg mx-6`}>
                <TouchableOpacity onPress={() => { setGender("Nam"); setShowGenderModal(false); }}>
                  <Text style={tw`text-lg p-3`}>Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setGender("Nữ"); setShowGenderModal(false); }}>
                  <Text style={tw`text-lg p-3`}>Nữ</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setGender("Không chia sẻ"); setShowGenderModal(false); }}>
                  <Text style={tw`text-lg p-3`}>Không chia sẻ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Button mode="contained" onPress={handleNextGender} style={tw`mt-5 bg-blue-500`}>
            Tiếp tục
          </Button>
        </>
      )}

      {/* Bước 6: Hoàn tất */}
      {step === 6 && (
        <>
          <Text style={tw`text-2xl font-bold text-center text-gray-800 mb-4`}>
            Thông tin cá nhân
          </Text>
          <Button mode="contained" onPress={handleComplete} style={tw`mt-5 bg-blue-500`}>
            Hoàn tất
          </Button>
        </>
      )}
    </View>
  );
};

export default SignupScreen;
