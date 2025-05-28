import React from 'react';
import { View, Image, Text } from 'react-native';
import tw from 'twrnc';

const GroupAvatar = ({ users = [], size = 48 }) => {
  const maxVisible = 3;
  const visibleUsers = users.slice(0, maxVisible);
  const extraCount = users.length - maxVisible;

  const avatarSize = size * 0.5;

  const placeholder = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  return (
    <View style={{ width: size, height: size + 8 }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {visibleUsers.slice(0, 2).map((u, idx) => (
          <Image
            key={u._id || idx}
            source={{ uri: u.avatar || placeholder }}
            style={[
              tw`border border-white`,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                marginRight: idx === 0 ? 4 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom row */}
      <View style={{ flexDirection: 'row', marginTop: 2, justifyContent: 'center' }}>
        {users.length > 2 && (
          <>
            <Image
              source={{ uri: placeholder }}
              style={[
                tw`border border-white`,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  marginRight: 4,
                  opacity: 0.5,
                },
              ]}
            />
            <View
              style={[
                tw`bg-gray-300 items-center justify-center border border-white`,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            >
              <Text style={tw`text-xs font-semibold text-gray-800`}>+{extraCount}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default GroupAvatar;

