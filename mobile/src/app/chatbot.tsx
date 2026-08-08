import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function ChatbotScreen() {
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI Health Assistant. How can I help you today?",
      sender: 'bot',
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage('');

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for sharing. I can help you with general health information and guidance.',
        sender: 'bot',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          AI Health Assistant
        </Text>

        <Text style={styles.headerSubtitle}>
          Your personal health companion
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'user'
                ? styles.userBubble
                : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === 'user'
                  ? styles.userText
                  : styles.botText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your health question..."
          placeholderTextColor="#888"
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    padding: 20,
    paddingTop: 25,
    backgroundColor: '#2E7D6B',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#E8F5F1',
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D6B',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },

  botText: {
    color: '#222222',
  },

  userText: {
    color: '#FFFFFF',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: '#2E7D6B',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 22,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});