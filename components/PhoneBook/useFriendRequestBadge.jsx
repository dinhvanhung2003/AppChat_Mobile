import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_URL } from '../../configs/api';
const socket = io(API_URL, { transports: ['websocket'] });

const useFriendRequestBadge = () => {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      socket.emit('setup', userId);

      // Gọi API lấy số lời mời
      const res = await axios.get(`${API_URL}/api/friendRequests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBadgeCount(res.data.length || 0);
    };

    init();
  }, []);

  useEffect(() => {
    socket.on('friendRequestReceived', ({ sender }) => {
      setBadgeCount((prev) => prev + 1);
    });

    socket.on('friendRequestAccepted', () => {
      setBadgeCount((prev) => Math.max(0, prev - 1));
    });

    socket.on('friendRequestCancelled', ({ senderId }) => {
      setBadgeCount((prev) => Math.max(0, prev - 1));
    });

    return () => {
      socket.off('friendRequestReceived');
      socket.off('friendRequestAccepted');
      socket.off('friendRequestCancelled');
    };
  }, []);

  return badgeCount;
};

export default useFriendRequestBadge;
