import React, { useState } from 'react';
import { View, Text } from 'react-native';
import NavigationBar from './NavigationBar';
import tw from 'twrnc';
import useTabNavigation from '../../hooks/useTabNavigation'; // Import custom hook

const MessageScreen = () => {
  const [activeTab, setActiveTab] = useState('Messages');
  const handleTabPress = useTabNavigation(); // Use the custom hook

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-xl`}>Welcome to the Message Screen!</Text>
      </View>
      <View style={tw`absolute bottom-0 w-full`}>
        <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </View>
  );
};

export default MessageScreen;
