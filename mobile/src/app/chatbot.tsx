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

import { getClaudeResponse } from '../services/claudeService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotScreen() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI Health Assistant. How can I help you today?",
      sender: 'bot',
    },
  ]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'user',
    };

    const previousConversation: ClaudeMessage[] = messages
      .filter((item) => item.id !== '1')
      .map((item) => ({
        role: item.sender === 'user' ? 'user' : 'assistant',
        content: item.text,
      }));

    const conversationForClaude: ClaudeMessage[] = [
      ...previousConversation,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ];

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage('');
    setIsTyping(true);

    try {
      const apiKey =
        process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error('Claude API key is not configured.');
      }

      const response = await getClaudeResponse(
        conversationForClaude,
        apiKey
      );

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: response,
        sender: 'bot',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ]);
    } catch (error) {
      console.log('Claude API error:', error);

      const fallbackMessage: Message = {
        id: `${Date.now()}-error`,
        text:
          'The AI service is currently unavailable. Your message was received, but a live Claude response could not be generated. Please try again later.',
        sender: 'bot',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        fallbackMessage,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
  <View style={styles.headerTopRow}>
    <View>
      <Text style={styles.headerTitle}>
        AI Health Assistant
      </Text>

      <Text style={styles.headerSubtitle}>
        Your personal health companion
      </Text>
    </View>

    <TouchableOpacity
      style={styles.clearButton}
      onPress={() => {
        setMessages([
          {
            id: '1',
            text: "Hi! I'm your AI Health Assistant. How can I help you today?",
              sender: 'bot',
              },
            ]);
            setMessage('');
          }}
          disabled={isTyping}
          >
            <Text style={styles.clearButtonText}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
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
        ListFooterComponent={
          isTyping ? (
            <View
              style={[
                styles.messageBubble,
                styles.botBubble,
              ]}
            >
              <Text style={styles.typingText}>
                AI Health Assistant is typing...
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          General wellness information only. This assistant does not
          provide medical diagnosis or emergency care.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your health question..."
          placeholderTextColor="#888888"
          multiline
          maxLength={500}
          editable={!isTyping}
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            isTyping && styles.disabledSendButton,
          ]}
          onPress={sendMessage}
          disabled={isTyping}
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
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 18,
    backgroundColor: '#2E7D6B',
  },
  headerTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

clearButton: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 16,
  backgroundColor: '#FFFFFF',
},

clearButtonText: {
  color: '#2E7D6B',
  fontSize: 13,
  fontWeight: '600',
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
    paddingBottom: 12,
    flexGrow: 1,
  },

  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D6B',
    borderBottomRightRadius: 5,
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

  typingText: {
    fontSize: 14,
    color: '#777777',
    fontStyle: 'italic',
  },

  disclaimer: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#EEF4F2',
  },

  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#666666',
    textAlign: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
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
    color: '#222222',
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: '#2E7D6B',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 22,
  },

  disabledSendButton: {
    opacity: 0.5,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});