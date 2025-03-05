import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";

const SignupScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");

  const handleNext = () => {
    navigation.navigate("OtpScreen", { phone });
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Nhập số điện thoại
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 10,
          marginTop: 20,
        }}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button
        mode="contained"
        onPress={handleNext}
        style={{ marginTop: 20 }}
      >
        Tiếp tục
      </Button>
    </View>
  );
};

export default SignupScreen;
