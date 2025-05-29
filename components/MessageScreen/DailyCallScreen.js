import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

export default function DailyCallScreen({ route }) {
  const { url } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        originWhitelist={["*"]}
        allowsProtectedMedia
      />
    </View>
  );
}
