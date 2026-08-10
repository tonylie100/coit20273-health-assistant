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

const getBotResponse = (userMessage: string): string => {
  const text = userMessage.toLowerCase();

  if (
    text.includes('stress') ||
    text.includes('stressed') ||
    text.includes('anxiety') ||
    text.includes('anxious')
  ) {
    return 'It sounds like you may be feeling stressed. Try taking a few slow breaths and taking a short break. If these feelings continue or become difficult to manage, consider speaking with a qualified health professional.';
  }

  if (
    text.includes('sleep') ||
    text.includes('tired') ||
    text.includes('insomnia')
  ) {
    return 'Good sleep is important for overall wellbeing. Try keeping a regular sleep schedule, reducing screen time before bed, and creating a comfortable sleep environment.';
  }

  if (
    text.includes('exercise') ||
    text.includes('workout') ||
    text.includes('fitness')
  ) {
    return 'Regular physical activity can support physical and mental wellbeing. Start with activities that are comfortable for you, such as walking, stretching, or other moderate exercise.';
  }

  if (
    text.includes('food') ||
    text.includes('diet') ||
    text.includes('eat') ||
    text.includes('nutrition')
  ) {
    return 'A balanced diet can support overall health. Aim for a variety of vegetables, fruits, whole grains, protein sources, and adequate water throughout the day.';
  }

  if (
    text.includes('sad') ||
    text.includes('depressed') ||
    text.includes('unhappy') ||
    text.includes('lonely')
  ) {
    return 'I am sorry that you are feeling this way. Talking to someone you trust and maintaining supportive routines can help. If you are experiencing persistent or severe emotional distress, consider contacting a qualified mental health professional.';
  }

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey')
  ) {
    return 'Hello! I am your AI Health Assistant. You can ask me about general wellness, sleep, exercise, nutrition, stress, or mental wellbeing.';
  }

  return 'Thanks for sharing. I can provide general health and wellness information about topics such as sleep, exercise, nutrition, stress, and mental wellbeing.';
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

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      sender: 'user',
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: getBotResponse(trimmedMessage),
        sender: 'bot',
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ]);

      setIsTyping(false);
    }, 700);
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
            <View style={[styles.messageBubble, styles.botBubble]}>
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