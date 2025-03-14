import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
// import { Button } from "react-native-paper";r


const LoginScreen = ({navigation}) => {
    const [secureText, setSecureText] = useState(true);

    return (
        <View style={{flex: 1, padding: 20, alignItems:'center'}}>
            <Text style={{
                fontSize: 50, 
                fontWeight: 'bold', 
                color: '#3B82F6',
                marginBottom: 48, 
                marginTop:200,
                marginBottom:50
            }}>Zalo</Text>

            <TouchableOpacity style={{width:'80%',marginBottom:70}}>
                <Text style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8,}}>
                    <TextInput
                        placeholder="Gmail"
                        style={{
                            flex: 1, fontSize: 16,color: '#333',
                        }}
                    />
                </Text>
                
                <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8,}}>
                    <TextInput
                        placeholder="Mật khẩu"
                        secureTextEntry={secureText}
                        style={{
                            flex: 1, fontSize: 16, color: '#333',
                        }}
                    />
                    <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                        <Text style={{fontSize: 16, color: '#3B82F6',fontWeight: 'bold', marginLeft: 10,}}>{secureText ? 'Hiện' : 'Ẩn'}</Text>
                    </TouchableOpacity>
                </View>
                
            </TouchableOpacity>
            

            {/* Btn_DN */}
            <TouchableOpacity style={{backgroundColor: '#3B82F6',paddingHorizontal: 24,paddingVertical: 12,borderRadius: 10,marginBottom: 16, width: '80%', alignItems: 'center',}}
                onPress={() => navigation.navigate('MessageScreen')}
            >
                <Text style={{color: '#fff',fontSize: 16,fontWeight: 'bold',}}>ĐĂNG NHẬP VỚI MẬT KHẨU</Text>
            </TouchableOpacity>
            
            {/* Quên mk */}
            <TouchableOpacity onPress={() => console.log('Quên mật khẩu?')}>
                <Text style={{color: '#3B82F6', fontSize: 16, fontWeight: '500',}}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <View style={{flexDirection: 'row',alignItems: 'center',marginTop:50}}>
                <Text style={{fontSize: 16, color: '#000',}}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={{fontSize: 16, color: '#3B82F6',fontWeight: 'bold',}}>Đăng Ký</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default LoginScreen;