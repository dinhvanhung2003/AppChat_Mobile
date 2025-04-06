import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Lưu user
import tw from 'twrnc';

const ProfileScreen = ({ route, navigation }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            // Kiểm tra xem có user được truyền từ Login không
            if (route.params?.user) {
                setUser(route.params.user);
                await AsyncStorage.setItem("user", JSON.stringify(route.params.user));
            } else {
                // Nếu không có user từ Login, lấy từ AsyncStorage
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        };

        fetchUser();
    }, []);

    return (
        <View style={tw`flex-1 bg-[#645C5CB2]`}>
            {/* Thông tin người dùng */}
            <TouchableOpacity style={tw`h-22 flex-row bg-white`}>
                <Image source={require('../../assets/ProfileScreen/Icon/Avt.png')} style={tw``}/>
                <TouchableOpacity style={tw`mt-6 w-73`}>
                    <Text>{user ? user.fullName : "Người dùng"}</Text>
                    <Text style={tw`text-gray-500`}>Xem trang cá nhân</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Đăng xuất */}
            <TouchableOpacity 
                style={tw`h-15 px-5 flex-row bg-white mt-2`} 
                onPress={async () => {
                    await AsyncStorage.removeItem("user"); // Xóa dữ liệu user
                    navigation.navigate('LoginScreen'); // Quay lại màn hình Login
                }}>
                <Image source={require('../../assets/ProfileScreen/Icon/anh3.png')} style={tw`mt-6`}/>
                <Text style={tw`text-[5] pt-5 ml-5`}>Đăng xuất</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileScreen;
