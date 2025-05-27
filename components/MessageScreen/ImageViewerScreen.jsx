import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const ImageViewerScreen = ({ route, navigation }) => {
  const { imageUrl } = route.params;

  return (
    <View style={tw`flex-1 bg-black justify-center items-center`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`absolute top-10 left-4 z-10`}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Image
        source={{ uri: imageUrl }}
        resizeMode="contain"
        style={tw`w-full h-full`}
      />
    </View>
  );
};

export default ImageViewerScreen;
