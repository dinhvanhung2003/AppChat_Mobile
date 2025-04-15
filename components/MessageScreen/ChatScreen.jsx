import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Alert,
  KeyboardAvoidingView, Platform, Image,
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

const ChatMessage = memo(({ item, isSender, onRecall, onDelete, onEdit, onDownload }) => (
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
        <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>
          {item.content} {item.isEdited && '(đã chỉnh sửa)'}
        </Text>
      )}
    </View>

    {isSender && !item.isRecalled && (
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
  const flatListRef = useRef();

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy token');
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

    // Nếu đang chỉnh sửa
    if (editingMessageId) {
      try {
        const res = await axios.put(`${API_URL}/api/message/edit/${editingMessageId}`, {
          content: text,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const updated = res.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === editingMessageId ? { ...m, content: updated.content, isEdited: true } : m
          )
        );
        socket.emit('messageEdited', updated);
        setEditingMessageId(null);
        setText('');
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể chỉnh sửa');
      }
      return;
    }

    // Gửi tin nhắn mới
    try {
      const res = await axios.post(`${API_URL}/api/message`, {
        chatId, content: text, type: 'text',
      }, { headers: { Authorization: `Bearer ${token}` } });
      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);
      socket.emit('newMessage', newMsg);
      setText('');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const sendMessageWithFile = async (file) => {
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
      sendMessageWithFile({ uri, name, type });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      sendMessageWithFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });
    }
  };

  const recallMessage = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/recall/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, isRecalled: true } : msg))
      );
      socket.emit('messageRecalled', { _id: id });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thu hồi tin nhắn');
    }
  };

  const deleteMessageForMe = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/delete-for-me/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
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
      console.error('❌ Không thể mở file:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    socket.emit('joinChat', chatId);
    fetchMessages();

    socket.on('messageReceived', (msg) => {
      setMessages((prev) => prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]);
      scrollToBottom();
    });

    socket.on('messageRecalled', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? { ...msg, isRecalled: true } : msg))
      );
    });

    socket.on('messageEdited', (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMsg._id ? { ...msg, content: updatedMsg.content, isEdited: true } : msg
        )
      );
    });

    return () => {
      socket.off('messageReceived');
      socket.off('messageRecalled');
      socket.off('messageEdited');
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
