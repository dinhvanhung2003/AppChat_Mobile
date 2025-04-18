import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator,
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

const API_URL = 'http://192.168.1.12:5000';
const socket = io(API_URL, { transports: ['websocket'] });

const ChatMessage = memo(({ item, isSender, onRecall, onDelete, onEdit, onDownload }) => (
  <View style={tw`mb-2 px-2`}>
    <View style={tw`max-w-[75%] px-3 py-2 rounded-xl ${isSender ? 'bg-blue-500 self-end' : 'bg-gray-200 self-start'}`}>
      {item.isRecalled ? (
        <Text style={tw`italic text-gray-400`}>[Tin nhắn đã thu hồi]</Text>
      ) : item.type === 'image' ? (
        <Image source={{ uri: item.fileUrl }} style={tw`w-40 h-40 rounded`} />
      ) : item.type === 'file' ? (
        <TouchableOpacity onPress={() => onDownload(item.fileUrl, item.fileName)}>
          <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>📎 {item.fileName}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>{item.content} {item.isEdited && '(đã chỉnh sửa)'}</Text>
      )}
    </View>
    {isSender && !item.isRecalled && !item._id.startsWith('local-') && (
      <View style={tw`flex-row self-end mt-1`}>
        <TouchableOpacity onPress={() => onRecall(item._id)}>
          <Text style={tw`text-xs text-blue-200 mr-2`}>Thu hồi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Text style={tw`text-xs text-yellow-200 mr-2`}>Sửa</Text>
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true });

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
      } else Alert.alert('Lỗi', 'Không tìm thấy token');
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (token) {
      socket.emit('joinChat', chatId);
      fetchMessages();
    }
  }, [token]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
      setTimeout(() => { scrollToBottom(); setLoading(false); }, 300);
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.chat?._id !== chatId) return;
    
      // Xoá bản local nếu có
      setMessages((prev) => {
        const filtered = prev.filter(m =>
          !(m._id.startsWith('local-') && m.type === msg.type && m.content === msg.content)
        );
        return [...filtered, msg];
      });
      scrollToBottom();
    };

    socket.on('messageReceived', handleMessage);
    socket.on('messageRecalled', (msg) => setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, isRecalled: true } : m)));
    socket.on('messageEdited', (msg) => setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, content: msg.content, isEdited: true } : m)));

    return () => {
      socket.off('messageReceived', handleMessage);
      socket.off('messageRecalled');
      socket.off('messageEdited');
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
  
    const localId = `local-${Date.now()}`;
    const tempMessage = {
      _id: localId,
      sender: { _id: currentUserId },
      chat: { _id: chatId },
      createdAt: new Date().toISOString(),
      type: 'text',
      content: text,
      isRecalled: false,
      isEdited: false,
    };
  
    // Hiển thị ngay
    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();
    setText('');
  
    try {
      await axios.post(`${API_URL}/api/message`, {
        chatId,
        content: text,
        type: 'text',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Tin nhắn thật sẽ đến qua socket, tin tạm sẽ bị lọc
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };
  

  const sendMessageWithFile = async (file) => {
    const formData = new FormData();
    const type = file.type.startsWith('image/') ? 'image' : 'file';

    const temp = {
      _id: `local-${Date.now()}`,
      sender: { _id: currentUserId },
      chat: { _id: chatId },
      createdAt: new Date().toISOString(),
      type,
      fileUrl: file.uri,
      fileName: file.name,
      content: '',
      isRecalled: false,
      isEdited: false,
    };

    setMessages((prev) => [...prev, temp]);
    scrollToBottom();

    formData.append('chatId', chatId);
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    });
    formData.append('type', type);

    try {
      await axios.post(`${API_URL}/api/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi file');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop();
      const ext = name.split('.').pop();
      sendMessageWithFile({ uri: asset.uri, name, type: `image/${ext}` });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      sendMessageWithFile({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
    }
  };

  const recallMessage = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/recall/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      Alert.alert('Lỗi', 'Không thể thu hồi tin nhắn');
    }
  };

  const deleteMessageForMe = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/delete-for-me/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa tin nhắn');
    }
  };

  const downloadFile = async (url, fileName = 'file.xyz') => {
    try {
      const localPath = FileSystem.documentDirectory + fileName;
      const downloadResumable = FileSystem.createDownloadResumable(url, localPath);
      const { uri } = await downloadResumable.downloadAsync();
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error('Lỗi mở file:', err);
    }
  };

  return (
    <KeyboardAvoidingView style={tw`flex-1 bg-white`} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <View style={tw`flex-row items-center justify-between px-4 py-3 bg-blue-500 mt-10`}>
        <Text style={tw`text-white text-lg font-bold`}>Zalo Chat</Text>
        <View style={tw`flex-row gap-4`}>
          <TouchableOpacity><Ionicons name="call-outline" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity><MaterialIcons name="video-call" size={24} color="white" /></TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}><ActivityIndicator size="large" color="blue" /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `${item._id}_${index}`}
          renderItem={({ item }) => (
            <ChatMessage
              item={item}
              isSender={item.sender?._id === currentUserId}
              onRecall={recallMessage}
              onDelete={deleteMessageForMe}
              onEdit={(msg) => {
                setEditingMessageId(msg._id);
                setText(msg.content);
              }}
              onDownload={downloadFile}
            />
          )}
          contentContainerStyle={tw`p-3 pb-24`}
        />
      )}
      <View style={tw`absolute bottom-0 w-full flex-row items-center bg-white p-2 border-t border-gray-200`}>
        <TouchableOpacity onPress={pickImage} style={tw`mr-2`}><Ionicons name="image-outline" size={24} color="gray" /></TouchableOpacity>
        <TouchableOpacity onPress={pickDocument} style={tw`mr-2`}><Ionicons name="document-outline" size={24} color="gray" /></TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={editingMessageId ? 'Chỉnh sửa tin nhắn...' : 'Nhập tin nhắn'}
          style={tw`flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm`}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={tw`ml-2 ${editingMessageId ? 'bg-yellow-500' : 'bg-blue-500'} px-4 py-2 rounded-full`}
        >
          <Text style={tw`text-white font-semibold`}>
            {editingMessageId ? 'Lưu chỉnh sửa' : 'Gửi'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
