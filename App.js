import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LaunchScreen from './components/LaunchScreen/index';
import MessageScreen from './components/MessageScreen/MassageScreen';
import PhoneBook from './components/PhoneBook/index';
import NewScreen from './components/NewScreen/index';
import ProfileScreen from './components/ProfileScreen/index';
import ExploreScreen from './components/ExploreScreen/index';
import Login from './components/LogIn/index';
import ForgotPassword from './components/LogIn/ForgotPassword';
import SignUp from './components/SignUp/index';
import VerifyOtpScreen from './components/LogIn/VerifyOTP';
import ResetPasswordScreen from './components/LogIn/ResetPasswordScreen';
import ChangePass from './components/ProfileScreen/ChangePassword';
import EditProfile from './components/ProfileScreen/EditProfile';
import ChatSceen from './components/MessageScreen/ChatScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LaunchScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LaunchScreen" component={LaunchScreen} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="ChangePass" component={ChangePass} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChatScreen" component={ChatSceen} />
        <Stack.Screen name="PhoneBook" component={PhoneBook} />
        <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
        <Stack.Screen name="NewScreen" component={NewScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

