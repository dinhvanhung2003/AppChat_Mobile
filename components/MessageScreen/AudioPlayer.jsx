import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Slider from '@react-native-community/slider';

const AudioPlayer = ({ uri, isSender }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
    setSound(sound);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setDuration(status.durationMillis);
        setPosition(status.positionMillis);
        setIsPlaying(status.isPlaying);
      }
    });
  };

  const togglePlay = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={tw`bg-${isSender ? 'blue-500' : 'gray-200'} p-2 rounded-lg`}>
      <TouchableOpacity onPress={togglePlay} style={tw`mb-2`}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={isSender ? 'white' : 'black'} />
      </TouchableOpacity>
      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={async (value) => {
          if (sound) {
            await sound.setPositionAsync(value);
          }
        }}
        minimumTrackTintColor={isSender ? 'white' : 'black'}
        style={{ width: 200, height: 40 }}
      />
      <Text style={tw`text-xs ${isSender ? 'text-white' : 'text-black'}`}>
        {formatTime(position)} / {formatTime(duration)}
      </Text>
    </View>
  );
};

export default AudioPlayer;
