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
import { useNavigation } from '@react-navigation/native';
import { Video, Audio } from 'expo-av';
import {navigation} from '@react-navigation/native';
// import { mediaDevices, RTCPeerConnection, RTCView, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { Button } from 'react-native';
import { API_URL } from '../../configs/api';
const socket = io(API_URL, { transports: ['websocket'] });

const ChatMessage = memo(({ navigation,item, isSender, onRecall, onDelete, onEdit, onDownload, selectedMessageId, setSelectedMessageId, onForward }) => (




  <View style={tw`mb-2 px-2`}>
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => {
        setSelectedMessageId(selectedMessageId === item._id ? null : item._id);
      }}
    >
      <View style={tw`flex-row ${isSender ? 'justify-end' : 'justify-start'} items-end mb-2 px-2`}>
        {/* Avatar chỉ hiển thị với người nhận (không phải mình) */}
        {!isSender && item.sender?.avatar && (
          <Image source={item.sender.avatar} style={tw`w-8 h-8 rounded-full mr-2`} />

        )}

        {item.isRecalled ? (
          <Text style={tw`italic text-gray-400`}>[Tin nhắn đã thu hồi]</Text>
        ) : item.type === 'image' ? (
          <TouchableOpacity onPress={() => navigation.navigate('ImageViewer', { imageUrl: item.fileUrl })}>
            <Image source={{ uri: item.fileUrl }} style={tw`w-60 h-60 rounded-lg`} />
          </TouchableOpacity>
        ) : item.type === 'file' ? (
          // <TouchableOpacity onPress={() => downloadFile(item.fileUrl, item.fileName)}>
          //   <Text style={tw`text-blue-500 underline`}>{item.fileName}</Text>
          // </TouchableOpacity>
          <TouchableOpacity onPress={() => onDownload(item.fileUrl, item.fileName)}>
            <Text style={tw`text-blue-500 underline`}>{item.fileName}</Text>
          </TouchableOpacity>
        ) : item.type === 'video' ? (
          <Video
            source={{ uri: item.fileUrl }} // URL của video
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={false} // Không tự động phát khi mở
            useNativeControls={true} // Cho phép điều khiển video
            style={tw`w-60 h-60 rounded-lg`} // Bạn có thể điều chỉnh kích thước theo ý muốn
          />
        ) : item.type === 'audio' ? (
          <Audio
            source={{ uri: item.fileUrl }}
            shouldPlay={false}
            useNativeControls={true}
            style={{ width: 300, height: 50 }}
          />
        ) : (
          <Text style={tw`${isSender ? 'text-white' : 'text-black'}`}>
            {item.content} {item.isEdited && '(đã chỉnh sửa)'}
          </Text>
        )}
      </View>
    </TouchableOpacity>


    {!item.isRecalled && !item._id.startsWith('local-') && selectedMessageId === item._id && (
      <View style={tw`flex-row ${isSender ? 'self-end' : 'self-start'} mt-1`}>
        {isSender && (
          <>
            <TouchableOpacity onPress={() => onRecall(item._id)}>
              <Text style={tw`text-xs text-blue-200 mr-2`}>Thu hồi</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Text style={tw`text-xs text-yellow-200 mr-2`}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item._id)}>
              <Text style={tw`text-xs text-red-300 mr-2`}>Xóa</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => onForward(item)}>
              <Text style={tw`text-xs text-green-400`}>Chuyển tiếp</Text>
            </TouchableOpacity> */}
          </>
        )}

        {!isSender && (
          <TouchableOpacity onPress={() => onDelete(item._id)}><Text style={tw`text-xs text-red-500`}>Xóa khỏi tôi</Text></TouchableOpacity>

        )}
        <TouchableOpacity onPress={() => onForward(item)}>
          <Text style={tw`text-xs text-green-400`}>Chuyển tiếp</Text>
        </TouchableOpacity>
      </View>
    )}

  </View>
));

const ChatScreen = ({ route }) => {
  const { chatId, partner, chatName, isGroup = false, group = null } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const flatListRef = useRef();
  const navigation = useNavigation();
  const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true });
  const [groupData, setGroupData] = useState(group);
  const [contacts, setContacts] = useState([]);
  // 👇 Gọi khi muốn mở modal chọn người để chuyển tiếp
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);

  // Mở modal từ menu chuyển tiếp
  const handleForward = async (message) => {
    setMessageToForward(message);
    setShowForwardModal(true);

    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      await fetchContacts(); // 👈 chỉ fetch sau khi có token
    }
  };
  //  chuyển tiếp nhóm 
  const fetchContactsAndGroups = async () => {
    try {
      const [friendsRes, groupsRes] = await Promise.all([
        axios.get(`${API_URL}/users/listFriends`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/chat/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const formattedFriends = (friendsRes.data || []).map(u => ({
        ...u,
        isGroup: false,
      }));

      const formattedGroups = (groupsRes.data || []).map(g => ({
        _id: g._id,
        fullName: g.chatName,
        avatar: 'https://icon-library.com/images/group-icon/group-icon-0.jpg', // fallback
        isGroup: true,
      }));

      setContacts([...formattedFriends, ...formattedGroups]);
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách bạn và nhóm:', err.message);
    }
  };


  const fetchContacts = async () => {
  try {
    const [friendsRes, chatsRes] = await Promise.all([
      axios.get(`${API_URL}/users/listFriends`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const friends = (friendsRes.data || []).map(friend => ({
      ...friend,
      isGroup: false,
    }));

    const groups = (chatsRes.data || [])
      .filter(chat => chat.isGroupChat)
      .map(group => ({
        _id: group._id,
        fullName: group.chatName,
        avatar: group.groupAvatar || 'https://icon-library.com/images/group-icon/group-icon-0.jpg',
        isGroup: true,
      }));

    setContacts([...friends, ...groups]);
  } catch (err) {
    console.error('❌ Lỗi khi lấy bạn + nhóm:', err.message);
  }
};


  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  const forwardToFriend = async (target) => {
    try {
      let chatIdToUse = target._id;

      // Nếu là bạn, tạo chat cá nhân
      if (!target.isGroup) {
        const resChat = await axios.post(`${API_URL}/api/chat`, {
          userId: target._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        chatIdToUse = resChat.data._id;
      }

      // Gửi tin nhắn đến chatId (nhóm hoặc bạn)
      const res = await axios.post(`${API_URL}/api/message/forward`, {
        messageId: messageToForward._id,
        toChatId: chatIdToUse,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit('messageReceived', res.data.data);
      Alert.alert("✅", "Chuyển tiếp thành công");
    } catch (err) {
      console.error("❌ Chuyển tiếp lỗi:", err.message);
      Alert.alert("❌", "Chuyển tiếp thất bại");
    } finally {
      setShowForwardModal(false);
    }
  };





  //goi thoại và video call
  const [incomingCall, setIncomingCall] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const { callerId, calleeId, isCaller } = route.params;
  const isCurrentUserCaller = currentUserId === callerId;

  const declineCall = () => {
    socket.emit('end-call', { to: incomingCall.from });
    setIncomingCall(null);
  };

  const handleCallPress = () => {
    navigation.replace('ChatScreen', {
      ...route.params,
      callerId: currentUserId,
      calleeId: partner?._id,
      isCaller: true,
    });
  };




  const pc = useRef(null);
  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  const acceptCall = async () => {
    const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
    setLocalStream(stream);

    const peer = new RTCPeerConnection(configuration);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    pc.current = peer;

    peer.ontrack = (event) => {
      const [remote] = event.streams;
      setRemoteStream(remote);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    await pc.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    socket.emit('make-answer', { answer, to: incomingCall.from });

    setIncomingCall(null);
  };
  useEffect(() => {
    const setup = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;
      const decoded = jwtDecode(storedToken);
      setCurrentUserId(decoded.id);
      socket.emit('setup', decoded.id);
    };
    setup();
  }, []);

  useEffect(() => {
    const initCall = async () => {
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      const peer = new RTCPeerConnection(configuration);
      stream.getTracks().forEach(track => peer.addTrack(track, stream));
      pc.current = peer;

      peer.ontrack = (event) => {
        const [remote] = event.streams;
        setRemoteStream(remote);
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { to: calleeId, candidate: event.candidate });
        }
      };

      if (isCaller && currentUserId === callerId) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('call-user', { offer, to: calleeId, from: callerId });
      }
    };

    if (callerId && calleeId) initCall();
    socket.on('call-user', ({ offer, from }) => {
      setIncomingCall({ offer, from });
    });

    socket.on('call-made', async ({ offer, from }) => {
      if (!pc.current) return;
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit('make-answer', { answer, to: from });
    });



    socket.on('answer-made', async ({ answer }) => {
      if (pc.current) await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      if (candidate && pc.current) {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('call-ended', () => {
      endCall();
    });

    return () => {
      if (pc.current) pc.current.close();
      socket.off('call-made');
      socket.off('answer-made');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [callerId, calleeId, isCaller, currentUserId]);

  const endCall = () => {
    socket.emit('end-call', { to: calleeId });
    if (pc.current) pc.current.close();
    localStream?.getTracks().forEach((track) => track.stop()); // 👈 thêm dòng này
    setLocalStream(null);
    setRemoteStream(null);
    navigation.goBack();
  };



  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setCurrentUserId(decoded.id);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (token && chatId) {
      console.log('✅ Joined chatId:', chatId); // Thêm dòng này
      socket.emit('joinChat', chatId);
      fetchMessages();
    }
  }, [token, chatId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      console.log('📩 Fetching messages for chatId:', chatId);
      const res = await axios.get(`${API_URL}/api/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📥 Messages fetched:', res.data); // 👈 kiểm tra có dữ liệu không
      setMessages(res.data);
      setTimeout(() => {
        scrollToBottom();
        setLoading(false);
      }, 300);
    } catch (err) {
      console.error('❌ Lỗi tải tin nhắn:', err.response?.data || err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (route.params?.group && isGroup) {
      setGroupData(route.params.group); // ✅ đúng state đang dùng
    }
  }, [route.params?.group]);

  useEffect(() => {
    const handleGroupUpdate = (updatedGroup) => {
      if (updatedGroup._id === chatId && isGroup) {
        setGroupData(updatedGroup); // ✅ cập nhật local
        navigation.setParams({
          group: updatedGroup,
          chatName: updatedGroup.chatName,
        });
      }
    };

    socket.on('group:updated', handleGroupUpdate);
    return () => {
      socket.off('group:updated', handleGroupUpdate);
    };
  }, [chatId, isGroup]);
  useEffect(() => {
    const handleAdminTransferred = ({ chatId, newAdminId }) => {
      if (chatId === groupData?._id) {
        setGroupData(prev => ({
          ...prev,
          groupAdmin: { _id: newAdminId },
        }));
      }
    };

    const handleRemoved = (removedChatId) => {
      if (removedChatId === groupData?._id) {
        Alert.alert('Bạn đã bị xoá khỏi nhóm');
        navigation.goBack();
      }
    };

    socket.on('admin:transferred', handleAdminTransferred);
    socket.on('group:removed', handleRemoved);

    return () => {
      socket.off('admin:transferred', handleAdminTransferred);
      socket.off('group:removed', handleRemoved);
    };
  }, [groupData?._id]);

  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('messages', JSON.stringify(messages)); // Lưu messages vào AsyncStorage
      } catch (err) {
        console.error('Không thể lưu tin nhắn:', err);
      }
    };

    saveMessages(); // Mỗi khi messages thay đổi, lưu lại vào AsyncStorage
  }, [messages]); // Theo dõi sự thay đổi của messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('messages');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages)); // Tải lại messages từ AsyncStorage
        } else {
          fetchMessages(); // Nếu không có, gọi API để lấy lại tin nhắn
        }
      } catch (err) {
        console.error('Không thể tải tin nhắn:', err);
        fetchMessages(); // Nếu gặp lỗi, tải lại tin nhắn từ server
      }
    };

    loadMessages(); // Gọi khi component mount lần đầu
  }, []); // Chạy khi component mount lần đầu

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.chat?._id !== chatId) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev.filter((m) => !m._id.startsWith('local-')), msg];
      });
      scrollToBottom();
    };

    const handleEdit = (msg) => {
      setMessages((prev) =>
        prev.map((m) => m._id === msg._id ? { ...m, content: msg.content, isEdited: true } : m)
      );
    };

    const handleRecall = (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, isRecalled: true } : m))
      );
    };

    socket.on('newMessage', handleMessage);
    socket.on('messageReceived', handleMessage);
    socket.on('messageEdited', handleEdit);
    socket.on('messageRecalled', handleRecall);

    return () => {
      socket.off('newMessage', handleMessage);
      socket.off('messageReceived', handleMessage);
      socket.off('messageEdited', handleEdit);
      socket.off('messageRecalled', handleRecall);
    };
  }, [chatId]);
  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!text.trim()) return;

    if (editingMessageId) {
      try {
        const res = await axios.put(`${API_URL}/api/message/edit/${editingMessageId}`, {
          content: text,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        socket.emit('messageEdited', res.data);
        setMessages((prev) =>
          prev.map((m) => m._id === res.data._id ? { ...m, content: res.data.content, isEdited: true } : m)
        );
        setEditingMessageId(null);
        setText('');
      } catch {
        Alert.alert('Lỗi', 'Không thể chỉnh sửa tin nhắn');
      }
      return;
    }

    const savedText = text;
    setText('');

    try {
      const res = await axios.post(`${API_URL}/api/message`, {
        chatId,
        content: savedText,
        type: 'text',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit('newMessage', res.data);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };
  // Tải xuống file và chia sẻ
  // const downloadFile = async (url, fileName = 'file.xyz') => {
  //   try {
  //     if (!url) {
  //       Alert.alert("Lỗi", "Không tìm thấy đường dẫn file.");
  //       return;
  //     }

  //     const localPath = FileSystem.documentDirectory + fileName;
  //     const downloadResumable = FileSystem.createDownloadResumable(url, localPath);
  //     const { uri } = await downloadResumable.downloadAsync();

  //     const canShare = await Sharing.isAvailableAsync();
  //     if (canShare) {
  //       await Sharing.shareAsync(uri);
  //     } else {
  //       await WebBrowser.openBrowserAsync(uri); // Fallback nếu không chia sẻ được
  //     }
  //   } catch (err) {
  //     console.error('❌ Lỗi khi mở file:', err);
  //     Alert.alert('Lỗi', 'Không thể mở file. Hãy kiểm tra định dạng hoặc thử lại sau.');
  //   }
  // };
  // const downloadFile = async (url, fileName) => {
  //   try {
  //     if (!url) {
  //       Alert.alert("Lỗi", "Không tìm thấy đường dẫn file.");
  //       return;
  //     }

  //     const finalName = fileName || url.split("/").pop() || `file-${Date.now()}`;
  //     const localUri = FileSystem.documentDirectory + finalName;

  //     console.log("📥 Đang tải file:", finalName);

  //     const downloadResumable = FileSystem.createDownloadResumable(url, localUri);
  //     const { uri } = await downloadResumable.downloadAsync();

  //     console.log("📂 File đã lưu:", uri);

  //     const canShare = await Sharing.isAvailableAsync();
  //     if (canShare) {
  //       await Sharing.shareAsync(uri);
  //     } else {
  //       Alert.alert("Thiết bị không hỗ trợ mở file này");
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi mở file:", err.message);
  //     Alert.alert("Lỗi", "Không thể mở file.");
  //   }
  // };
  const downloadFile = async (url, fileName) => {
  try {
    if (!url) {
      Alert.alert("Lỗi", "Không tìm thấy đường dẫn file.");
      return;
    }

    // ✅ Nếu không có tên file, fallback thành file từ URL
    const finalName = fileName || url.split("/").pop() || `file-${Date.now()}`;

    const localPath = FileSystem.documentDirectory + finalName;

    const downloadResumable = FileSystem.createDownloadResumable(url, localPath);
    const { uri } = await downloadResumable.downloadAsync();

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Thiết bị không hỗ trợ mở file này');
    }
  } catch (err) {
    console.error('❌ Lỗi khi mở file:', err);
    Alert.alert('Lỗi', 'Không thể mở file. Hãy kiểm tra định dạng hoặc thử lại sau.');
  }
};

  
  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, // Chất lượng ảnh
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const imageUri = asset.uri; // Đường dẫn của ảnh đã chọn
      const name = imageUri.split('/').pop(); // Lấy tên ảnh
      const ext = name.split('.').pop(); // Lấy phần mở rộng (đuôi ảnh)

      // Gọi sendMessageWithFile để gửi ảnh
      sendMessageWithFile({ uri: imageUri, name, type: `image/${ext}` });
    } else {
      Alert.alert('Lỗi', 'Không có ảnh nào được chọn');
    }
  };
  // Chọn tài liệu (PDF, DOCX, v.v.)
  // const pickDocument = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({});
  //   if (!result.canceled && result.assets?.length > 0) {
  //     const asset = result.assets[0];
  //     sendMessageWithFile({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
  //   }
  // };
  // // Chọn tệp âm thanh (MP3 hoặc các định dạng khác)
  // const pickAudioFile = async () => {
  //   const result = await DocumentPicker.getDocumentAsync({
  //     type: 'audio/*', // Chỉ cho phép chọn tệp âm thanh
  //   });

  //   if (result.type === 'success') {
  //     const file = result.files[0];

  //     // Kiểm tra nếu tệp là MP3 hoặc các định dạng âm thanh khác
  //     if (file.mimeType && file.mimeType.startsWith('audio/')) {
  //       setSelectedFile(file); // Lưu tệp âm thanh vào state
  //     } else {
  //       Alert.alert('Lỗi', 'Chỉ có thể tải lên tệp âm thanh (MP3)');
  //     }
  //   } else {
  //     Alert.alert('Lỗi', 'Không có tệp nào được chọn');
  //   }
  // };
  const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: "*/*", // Cho phép tất cả định dạng
  });

  if (!result.canceled && result.assets?.length > 0) {
    const asset = result.assets[0];

    sendMessageWithFile({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
};

  // Gửi tin nhắn với file (ảnh, tài liệu, video, âm thanh)
  const sendMessageWithFile = async (file) => {
    const type = file.type.startsWith('image/') ? 'image' : 'file';
    console.log("📤 file upload:", file);
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

    const formData = new FormData();

    formData.append('chatId', chatId);
    formData.append('type', type);
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    });

    // ✅ Sau khi append xong mới log
    for (let [key, value] of formData.entries()) {
      console.log("🧾 FormData:", key, value);
    }

    try {
      const res = await axios.post(`${API_URL}/api/message`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      socket.emit('newMessage', res.data);
    } catch (err) {
      console.error("Gửi file lỗi:", err.message);
      Alert.alert('Lỗi', 'Không thể gửi file');
    }
  };



  // Thu hồi tin nhắn
  const recallMessage = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/recall/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessages((prev) =>
        prev.map((m) => m._id === id ? { ...m, isRecalled: true } : m)
      );
      socket.emit('messageRecalled', { _id: id });
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


  // delete của người gửi 
  const deleteMessageForReceiver = async (id) => {
    try {
      await axios.put(`${API_URL}/api/message/delete-for-receiver/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("❌ Lỗi xóa phía người nhận:", err.response?.data || err.message);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa tin nhắn khỏi phía bạn');
    }
  };



  return (
    <KeyboardAvoidingView style={tw`flex-1 bg-white`} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}>
      <View style={tw`flex-row items-center justify-between px-4 py-3 bg-blue-500 mt-10`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-white text-lg font-bold mr-3`}>
            {isGroup ? route.params.chatName : (partner?.fullName || 'Đang trò chuyện')}
          </Text>

          {!isGroup && partner && (
            <TouchableOpacity
              onPress={handleCallPress}
              style={tw`ml-2`}
            >
              <Ionicons name="call" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {groupData?.users?.some(u => u._id === currentUserId) && (
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupDetailScreen', { group: groupData })}
          >
            <Text style={tw`text-white underline text-sm`}>
              {groupData?.groupAdmin?._id === currentUserId ? 'Quản lý nhóm' : 'Xem thành viên'}
            </Text>
          </TouchableOpacity>
        )}
        {incomingCall && (
          <View style={tw`absolute top-20 left-0 right-0 p-4 bg-white shadow-md z-50`}>
            <Text style={tw`text-lg font-bold text-center`}>📞 Cuộc gọi đến</Text>
            <Text style={tw`text-center`}>Từ: {incomingCall.from}</Text>
            <View style={tw`flex-row justify-around mt-4`}>
              <Button title="Chấp nhận" onPress={acceptCall} />
              <Button title="Từ chối" onPress={declineCall} color="red" />
            </View>
          </View>
        )}

        {/* <View style={styles.container}>
          {localStream && (
            <RTCView streamURL={localStream.toURL()} style={styles.local} />
          )}
          {remoteStream && (
            <RTCView streamURL={remoteStream.toURL()} style={styles.remote} />
          )}
          <Button title="Kết thúc cuộc gọi" onPress={endCall} color="red" />
        </View> */}
      </View>
      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="blue" />
        </View>
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
              onDelete={(id) => {
                if (item.sender?._id === currentUserId) {
                  deleteMessageForMe(id);
                } else {
                  deleteMessageForReceiver(id);
                }
              }}
              onEdit={(msg) => {
                setEditingMessageId(msg._id);
                setText(msg.content);
              }}
              selectedMessageId={selectedMessageId}
              setSelectedMessageId={setSelectedMessageId}
              navigation={navigation}
              onDownload={downloadFile}
              
            />
          )}
          contentContainerStyle={tw`p-3 pb-24`}
          onContentSizeChange={() => scrollToBottom()}
        />
      )}
      {showForwardModal && (
        <View style={tw`absolute top-0 bottom-0 left-0 right-0 bg-black/50 justify-center items-center z-50`}>
          <View style={tw`bg-white p-4 rounded w-80 max-h-[60%]`}>
            <Text style={tw`text-lg font-bold mb-2`}>Chuyển tiếp tới:</Text>

            <FlatList
              data={contacts}
              keyExtractor={(item) => item._id}
              style={tw`max-h-80`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => forwardToFriend(item)} style={tw`p-2 border-b`}>
                  <View style={tw`flex-row items-center`}>
                    <Image source={{ uri: item.avatar }} style={tw`w-8 h-8 rounded-full mr-2`} />
                    <View style={tw`flex-row flex-wrap items-center`}>
                      <Text>{item.fullName}</Text>
                      {item.isGroup && (
                        <Text style={tw`text-xs text-gray-400 ml-1`}>(Nhóm)</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-400 mt-2`}>Không có bạn bè hoặc nhóm</Text>
              }
            />

            <TouchableOpacity onPress={() => setShowForwardModal(false)} style={tw`mt-4`}>
              <Text style={tw`text-blue-500 text-center`}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={tw`flex-row items-center bg-white p-2 border-t border-gray-200`}>
        <TouchableOpacity onPress={pickImage} style={tw`mr-2`}><Ionicons name="image-outline" size={24} color="gray" /></TouchableOpacity>
        <TouchableOpacity onPress={pickDocument} style={tw`mr-2`}><Ionicons name="document-outline" size={24} color="gray" /></TouchableOpacity>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={editingMessageId ? 'Chỉnh sửa tin nhắn...' : 'Nhập tin nhắn'}
          style={tw`flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm`}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={tw`ml-2 ${editingMessageId ? 'bg-yellow-500' : 'bg-blue-500'} px-4 py-2 rounded-full`}
        >
          <Text style={tw`text-white font-semibold`}>
            {editingMessageId ? 'Lưu' : 'Gửi'}
          </Text>
        </TouchableOpacity>


      </View>
    </KeyboardAvoidingView>
  );
};
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: 'black',
//   },
//   local: {
//     width: 120,
//     height: 160,
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 2,
//   },
//   remote: {
//     width: '100%',
//     height: '60%',
//   },
// });
export default ChatScreen;
