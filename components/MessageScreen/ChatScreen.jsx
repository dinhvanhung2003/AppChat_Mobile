import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import axios from 'axios';
import tw from 'twrnc';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.6:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const ChatMessage = memo(({ item, isSender, onRecall, onDelete, onDownload }) => (
  <View style={tw`mb-2 px-2`}>
    <View style={tw`max-w-[75%] px-3 py-2 rounded-xl ${isSender ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'}`}>
      {item.isRecalled ? (
        <Text style={tw`italic text-gray-400`}>[Tin nhắn đã thu hồi]</Text>
      ) : item.type === 'image' && item.fileUrl ? (
        <Image source={{ uri: item.fileUrl }} style={tw`w-40 h-40 rounded`} />
      ) : item.type === 'file' && item.fileUrl ? (
        <TouchableOpacity onPress={() => onDownload(item.fileUrl, item.fileName)}>
          <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>📎 {item.fileName}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>{item.content}</Text>
      )}
    </View>
    {isSender && !item.isRecalled && (
      <View style={tw`flex-row self-end mt-1`}>
        <TouchableOpacity onPress={() => onRecall(item._id)}>
          <Text style={tw`text-xs text-blue-200 mr-2`}>Thu hồi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item._id)}>
          <Text style={tw`text-xs text-red-300`}>Xóa</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
));

const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const flatListRef = useRef();

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          const decoded = jwtDecode(storedToken);
          setCurrentUserId(decoded.id);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy token');
        }
      } catch (err) {
        console.error('❌ Lỗi lấy token:', err);
      }
    };
    loadToken();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/message`, {
        chatId,
        content: text,
        type: 'text',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      socket.emit('newMessage', newMsg);
      setText('');
    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const sendMessageWithFile = async (file) => {
    if (!file || !chatId || !token) return;

    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('file', {
      uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
    });

    const type = file.type.startsWith('image/') ? 'image' : 'file';
    formData.append('type', type);

    try {
      const res = await axios.post(`${API_URL}/api/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      socket.emit('newMessage', newMsg);
    } catch (err) {
      console.error('❌ Lỗi gửi file:', err);
      Alert.alert('Lỗi', 'Không thể gửi file');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const name = uri.split('/').pop();
      const ext = name.split('.').pop();
      const type = `image/${ext}`;
      const file = { uri, name, type };
      sendMessageWithFile(file);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      };
      sendMessageWithFile(file);
    }
  };

  const downloadFile = async (url, fileName = 'file.xyz') => {
    try {
      const localPath = FileSystem.documentDirectory + fileName;
      const downloadResumable = FileSystem.createDownloadResumable(url, localPath);
      const { uri } = await downloadResumable.downloadAsync();
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error('❌ Không thể mở file:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    socket.emit('joinChat', chatId);
    fetchMessages();
    socket.on('messageReceived', (message) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        return exists ? prev : [...prev, message];
      });
      scrollToBottom();
    });
    socket.on('messageRecalled', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? { ...msg, isRecalled: true } : msg))
      );
    });
    return () => {
      socket.off('messageReceived');
      socket.off('messageRecalled');
    };
  }, [token]);

  return (
    <KeyboardAvoidingView
      style={tw`flex-1 bg-white`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={tw`flex-row items-center justify-between px-4 py-3 bg-blue-500 mt-10`}>
        <Text style={tw`text-white text-lg font-bold`}>Zalo Chat</Text>
        <View style={tw`flex-row gap-4`}>
          <TouchableOpacity>
            <Ionicons name="call-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="video-call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `${item._id}_${index}`}
        renderItem={({ item }) => (
          <ChatMessage
            item={item}
            isSender={item.sender?._id === currentUserId}
            onRecall={() => {}}
            onDelete={() => {}}
            onDownload={downloadFile}
          />
        )}
        contentContainerStyle={tw`p-3 pb-24`}
        onContentSizeChange={scrollToBottom}
        initialNumToRender={10}
      />

      <View style={tw`absolute bottom-0 w-full flex-row items-center bg-white p-2 border-t border-gray-200`}>
        <TouchableOpacity onPress={pickImage} style={tw`mr-2`}>
          <Ionicons name="image-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickDocument} style={tw`mr-2`}>
          <Ionicons name="document-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn"
          style={tw`flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm`}
        />
        <TouchableOpacity onPress={sendMessage} style={tw`ml-2 bg-blue-500 px-4 py-2 rounded-full`}>
          <Text style={tw`text-white font-semibold`}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;