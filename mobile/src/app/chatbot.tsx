import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

import { sendChatbotMessage } from '../services/apiService';

import {
  getHealthState,
  subscribeToHealthState,
  type HealthState,
} from '../services/healthState';

import {
  buildAIMessageContext,
  createAIHealthContext,
  getHealthContextFreshness,
  hasAIHealthContext,
  type AIHealthContext,
} from '../services/aiHealthContext';

import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from '../theme';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
  id: 'initial-message',
  text:
    "Hi! I'm your AI Health Assistant. I can use the wellness information currently available in the app to help you understand your activity, sleep, hydration, recovery and general wellbeing.",
  sender: 'bot',
  timestamp: new Date(),
};

const SUGGESTED_PROMPTS = [
  {
    icon: '♥',
    title: 'Heart rate',
    text: 'What does my current heart rate tell me?',
  },
  {
    icon: '☾',
    title: 'Recovery',
    text: 'How is my recovery looking today?',
  },
  {
    icon: '◊',
    title: 'Hydration',
    text: 'How is my hydration today?',
  },
  {
    icon: '✦',
    title: 'Next step',
    text: 'Based on my current health, what should I focus on next?',
  },
];

function formatTime(value: Date | string | null) {
  if (!value) {
    return 'Waiting for data';
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Waiting for data';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateFallback(
  question: string,
  health: HealthState,
): string {
  const lower = question.toLowerCase();

  if (
    lower.includes('heart') ||
    lower.includes('pulse') ||
    lower.includes('bpm')
  ) {
    if (health.heartRate !== null) {
      return (
        `Your latest ${
          health.isDemoDevice
            ? 'simulated '
            : ''
        }heart-rate reading is ${health.heartRate} bpm. ` +
        'A single reading is only one part of your overall health picture. ' +
        'If you have concerning symptoms such as chest pain, severe breathlessness ' +
        'or fainting, seek appropriate medical attention.'
      );
    }

    return (
      'I do not currently have a heart-rate reading. ' +
      'Start Live Health or add health information so I can use it in the conversation.'
    );
  }

  if (
    lower.includes('sleep') ||
    lower.includes('recovery') ||
    lower.includes('tired')
  ) {
    if (health.sleepHours !== null) {
      return (
        `You currently have ${health.sleepHours.toFixed(
          1,
        )} hours of recorded sleep. ` +
        'A consistent sleep routine and enough recovery time can support general wellbeing.'
      );
    }

    return (
      'Sleep information is not available yet. ' +
      'Add your sleep data so I can include it in your wellness context.'
    );
  }

  if (
    lower.includes('water') ||
    lower.includes('hydration')
  ) {
    if (health.waterIntake > 0) {
      return (
        `You have recorded ${health.waterIntake.toFixed(
          1,
        )} litres of water so far. ` +
        'Spreading fluid intake throughout the day can be a practical hydration habit.'
      );
    }

    return (
      'I do not have hydration information yet. ' +
      'Add your water intake so I can make the conversation more relevant.'
    );
  }

  if (
    lower.includes('step') ||
    lower.includes('walk') ||
    lower.includes('exercise') ||
    lower.includes('activity')
  ) {
    return (
      `You have recorded ${health.steps.toLocaleString()} steps today. ` +
      'If you want to increase activity, a short comfortable walk can be a practical option.'
    );
  }

  return (
    'I could not reach the AI service just now, so I could not generate a personalised response. ' +
    'Your latest wellness values remain available in the app. Please check your connection and try again.'
  );
}

function getHealthSummary(
  health: HealthState,
) {
  const parts: string[] = [];

  if (health.heartRate !== null) {
    parts.push(
      `${health.heartRate} bpm heart rate`,
    );
  }

  if (health.steps > 0) {
    parts.push(
      `${health.steps.toLocaleString()} steps`,
    );
  }

  if (health.sleepHours !== null) {
    parts.push(
      `${health.sleepHours.toFixed(1)} hours sleep`,
    );
  }

  if (health.waterIntake > 0) {
    parts.push(
      `${health.waterIntake.toFixed(1)} L hydration`,
    );
  }

  if (health.energyLevel !== null) {
    parts.push(
      `energy ${health.energyLevel}/10`,
    );
  }

  if (health.stressLevel) {
    parts.push(
      `${health.stressLevel} stress`,
    );
  }

  return parts;
}

export default function ChatbotScreen() {
  const { width } = useWindowDimensions();

  const isWide = width >= 900;

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    INITIAL_MESSAGE,
  ]);

  const [health, setHealth] = useState<HealthState>(
    getHealthState(),
  );

  const [aiContext, setAIContext] =
    useState<AIHealthContext>(() =>
      createAIHealthContext(),
    );

  const [freshness, setFreshness] = useState(
    getHealthContextFreshness(),
  );

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = subscribeToHealthState(
      (state) => {
        setHealth({ ...state });
        setAIContext(
          createAIHealthContext(state),
        );
        setFreshness(
          getHealthContextFreshness(state),
        );
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFreshness(
        getHealthContextFreshness(health),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [health]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const hasContext = useMemo(
    () => hasAIHealthContext(health),
    [health],
  );

  const liveStatus =
    health.deviceConnected;

  const isDemo =
    Boolean(health.isDemoDevice);

  const healthSummary = useMemo(
    () => getHealthSummary(health),
    [health],
  );

  const sendMessage = async (
    messageOverride?: string,
  ) => {
    const trimmedMessage = (
      messageOverride ?? message
    ).trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage('');
    setIsTyping(true);
    setLastFailedMessage(null);

    try {
      const currentHealth = getHealthState();

      const contextualMessage =
        buildAIMessageContext(
          trimmedMessage,
          currentHealth,
        );

      const data =
        await sendChatbotMessage(
          contextualMessage,
        );

      const response =
        typeof data?.reply === 'string'
          ? data.reply
          : 'I received your message, but I could not generate a response right now. Please try again.';

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((previous) => [
        ...previous,
        botMessage,
      ]);
    } catch (error) {
      console.log(
        'Chatbot API error:',
        error,
      );

      setLastFailedMessage(
        trimmedMessage,
      );

      const fallbackHealth = getHealthState();

      const fallbackMessage: Message = {
        id: `${Date.now()}-error`,
        text: generateFallback(
          trimmedMessage,
          fallbackHealth,
        ),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((previous) => [
        ...previous,
        fallbackMessage,
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const askAboutCurrentHealth = () => {
    if (isTyping) {
      return;
    }

    const current = getHealthState();

    const parts = getHealthSummary(
      current,
    );

    const context =
      parts.length > 0
        ? parts.join(', ')
        : 'the health data currently available';

    sendMessage(
      `Based on my current health data (${context}), how am I doing right now and what should I focus on next?`,
    );
  };

  const clearChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: `initial-${Date.now()}`,
        timestamp: new Date(),
      },
    ]);

    setMessage('');
    setLastFailedMessage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.pressedSmall,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </Pressable>

          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>
              ✦
            </Text>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              AI Health Assistant
            </Text>

            <View style={styles.headerStatus}>
              <View
                style={[
                  styles.headerStatusDot,
                  liveStatus &&
                    styles.headerStatusDotLive,
                ]}
              />

              <Text style={styles.headerStatusText}>
                {liveStatus
                  ? isDemo
                    ? 'Simulated health context active'
                    : 'Live health context active'
                  : 'Personal wellness support'}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start a new conversation"
            accessibilityHint="Clears the current conversation"
            style={({ pressed }) => [
              styles.clearButton,
              pressed &&
                styles.pressedSmall,
            ]}
            onPress={clearChat}
            disabled={isTyping}
          >
            <Text style={styles.clearIcon}>
              ↻
            </Text>
          </Pressable>
        </View>

        {/* CHAT */}

        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={[
            styles.chatContent,
            isWide &&
              styles.chatContentWide,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.contentColumn,
              isWide &&
                styles.contentColumnWide,
            ]}
          >
            {/* CONTEXT CARD */}

            <View style={styles.contextCard}>
              <View style={styles.contextTop}>
                <View style={styles.contextIdentity}>
                  <View style={styles.contextIcon}>
                    <Text style={styles.contextIconText}>
                      ✦
                    </Text>
                  </View>

                  <View style={styles.contextCopy}>
                    <Text style={styles.contextTitle}>
                      Your wellness context
                    </Text>

                    <Text style={styles.contextSubtitle}>
                      {isDemo
                        ? `Simulated live data • ${freshness}`
                        : freshness}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.contextBadge,
                    liveStatus
                      ? styles.contextBadgeLive
                      : styles.contextBadgeReady,
                  ]}
                >
                  {liveStatus ? (
                    <View style={styles.contextBadgeDot} />
                  ) : null}

                  <Text
                    style={[
                      styles.contextBadgeText,
                      liveStatus
                        ? styles.contextBadgeTextLive
                        : styles.contextBadgeTextReady,
                    ]}
                  >
                    {liveStatus
                      ? isDemo
                        ? 'DEMO'
                        : 'LIVE'
                      : hasContext
                        ? 'READY'
                        : 'WAITING'}
                  </Text>
                </View>
              </View>

              {hasContext ? (
                <View style={styles.contextMetrics}>
                  <ContextMetric
                    icon="♥"
                    label="Heart"
                    value={
                      health.heartRate !== null
                        ? String(
                            health.heartRate,
                          )
                        : '--'
                    }
                    unit="bpm"
                  />

                  <ContextMetric
                    icon="⌁"
                    label="Steps"
                    value={
                      health.steps > 0
                        ? health.steps.toLocaleString()
                        : '--'
                    }
                    unit="today"
                  />

                  <ContextMetric
                    icon="☾"
                    label="Sleep"
                    value={
                      health.sleepHours !== null
                        ? health.sleepHours.toFixed(
                            1,
                          )
                        : '--'
                    }
                    unit="hrs"
                  />

                  <ContextMetric
                    icon="◊"
                    label="Water"
                    value={
                      health.waterIntake > 0
                        ? health.waterIntake.toFixed(
                            1,
                          )
                        : '--'
                    }
                    unit="L"
                  />
                </View>
              ) : (
                <View style={styles.waitingState}>
                  <View style={styles.waitingIcon}>
                    <Text style={styles.waitingIconText}>
                      +
                    </Text>
                  </View>

                  <View style={styles.waitingCopy}>
                    <Text style={styles.waitingTitle}>
                      Your health context is waiting
                    </Text>

                    <Text style={styles.waitingText}>
                      Add health information or start
                      the demo monitor to give the AI
                      more useful context.
                    </Text>
                  </View>
                </View>
              )}

              {liveStatus ? (
                <View style={styles.deviceRow}>
                  <View style={styles.deviceIndicator}>
                    <View
                      style={
                        styles.deviceIndicatorInner
                      }
                    />
                  </View>

                  <View style={styles.deviceCopy}>
                    <Text style={styles.deviceName}>
                      {health.deviceName ??
                        'Health device'}
                    </Text>

                    <Text style={styles.deviceDescription}>
                      {isDemo
                        ? 'Simulated wearable • updating automatically'
                        : 'Connected wearable • updating automatically'}
                    </Text>
                  </View>
                </View>
              ) : null}

              {isDemo ? (
                <View style={styles.demoNotice}>
                  <Text style={styles.demoNoticeIcon}>
                    i
                  </Text>

                  <Text style={styles.demoNoticeText}>
                    Demo values are simulated for this
                    prototype and are not clinical
                    measurements.
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ASK AI */}

            {hasContext ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ask AI about my current health"
                style={({ pressed }) => [
                  styles.askCard,
                  pressed &&
                    styles.askCardPressed,
                ]}
                onPress={askAboutCurrentHealth}
                disabled={isTyping}
              >
                <View style={styles.askIcon}>
                  <Text style={styles.askIconText}>
                    ✦
                  </Text>
                </View>

                <View style={styles.askCopy}>
                  <Text style={styles.askTitle}>
                    Ask AI about my health
                  </Text>

                  <Text style={styles.askSubtitle}>
                    Get a practical summary of your
                    latest available wellness context.
                  </Text>
                </View>

                <View style={styles.askArrowCircle}>
                  <Text style={styles.askArrow}>
                    →
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* LIVE INSIGHT */}

            {aiContext.insights.length > 0 ? (
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightIcon}>
                    <Text style={styles.insightIconText}>
                      ✨
                    </Text>
                  </View>

                  <View style={styles.insightCopy}>
                    <Text style={styles.insightTitle}>
                      Live wellness insight
                    </Text>

                    <Text style={styles.insightSubtitle}>
                      Based on your latest health state
                    </Text>
                  </View>

                  <View style={styles.aiPill}>
                    <Text style={styles.aiPillText}>
                      AI
                    </Text>
                  </View>
                </View>

                <Text style={styles.insightText}>
                  {aiContext.insights[0]}
                </Text>
              </View>
            ) : null}

            {/* EMPTY CHAT */}

            {messages.length === 1 ? (
              <View style={styles.intro}>
                <View style={styles.introBadge}>
                  <Text style={styles.introBadgeText}>
                    PERSONAL WELLNESS ASSISTANT
                  </Text>
                </View>

                <Text style={styles.introTitle}>
                  What would you like to understand?
                </Text>

                <Text style={styles.introDescription}>
                  Ask a question about your current
                  wellness data, daily habits or how
                  you are feeling.
                </Text>

                <View style={styles.promptGrid}>
                  {SUGGESTED_PROMPTS.map(
                    (prompt) => (
                      <Pressable
                        key={prompt.title}
                        accessibilityRole="button"
                        accessibilityLabel={
                          prompt.text
                        }
                        style={({ pressed }) => [
                          styles.promptCard,
                          pressed &&
                            styles.promptPressed,
                        ]}
                        onPress={() =>
                          sendMessage(
                            prompt.text,
                          )
                        }
                        disabled={isTyping}
                      >
                        <View style={styles.promptIcon}>
                          <Text style={styles.promptIconText}>
                            {prompt.icon}
                          </Text>
                        </View>

                        <View style={styles.promptContent}>
                          <Text style={styles.promptTitle}>
                            {prompt.title}
                          </Text>

                          <Text
                            style={styles.promptQuestion}
                            numberOfLines={2}
                          >
                            {prompt.text}
                          </Text>
                        </View>

                        <Text style={styles.promptArrow}>
                          →
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              </View>
            ) : null}

            {/* MESSAGES */}

            <View style={styles.messagesList}>
              {messages.map((item) => {
                const isUser =
                  item.sender === 'user';

                const isError =
                  item.id.endsWith('-error');

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.messageRow,
                      isUser &&
                        styles.userMessageRow,
                    ]}
                  >
                    {!isUser ? (
                      <View style={styles.botAvatar}>
                        <Text style={styles.botAvatarText}>
                          ✦
                        </Text>
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.messageBubble,
                        isUser
                          ? styles.userBubble
                          : styles.botBubble,
                      ]}
                    >
                      {!isUser ? (
                        <View
                          style={
                            styles.botMessageHeader
                          }
                        >
                          <Text style={styles.botLabel}>
                            AI HEALTH ASSISTANT
                          </Text>

                          <View
                            style={
                              styles.botStatusDot
                            }
                          />
                        </View>
                      ) : null}

                      <Text
                        style={[
                          styles.messageText,
                          isUser
                            ? styles.userText
                            : styles.botText,
                        ]}
                      >
                        {item.text}
                      </Text>

                      <Text
                        style={[
                          styles.messageTime,
                          isUser
                            ? styles.userTime
                            : styles.botTime,
                        ]}
                      >
                        {formatTime(
                          item.timestamp,
                        )}
                      </Text>

                      {isError &&
                      lastFailedMessage ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Try sending the message again"
                          style={
                            styles.retryButton
                          }
                          onPress={() =>
                            sendMessage(
                              lastFailedMessage,
                            )
                          }
                          disabled={isTyping}
                        >
                          <Text
                            style={
                              styles.retryButtonText
                            }
                          >
                            Try again →
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                );
              })}

              {isTyping ? (
                <View style={styles.messageRow}>
                  <View style={styles.botAvatar}>
                    <Text style={styles.botAvatarText}>
                      ✦
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.messageBubble,
                      styles.botBubble,
                      styles.typingBubble,
                    ]}
                  >
                    <View style={styles.typingHeader}>
                      <View
                        style={styles.typingDot}
                      />

                      <View
                        style={[
                          styles.typingDot,
                          styles.typingDotTwo,
                        ]}
                      />

                      <View
                        style={[
                          styles.typingDot,
                          styles.typingDotThree,
                        ]}
                      />

                      <Text
                        style={styles.typingLabel}
                      >
                        AI is thinking
                      </Text>
                    </View>

                    <Text style={styles.typingText}>
                      Reviewing your available wellness
                      context...
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* SNAPSHOT */}

            {hasContext ? (
              <View style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <View>
                    <Text style={styles.snapshotEyebrow}>
                      CURRENT CONTEXT
                    </Text>

                    <Text style={styles.snapshotTitle}>
                      Wellness snapshot
                    </Text>
                  </View>

                  {health.wellnessScore !== null ? (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreValue}>
                        {Math.round(
                          health.wellnessScore,
                        )}
                      </Text>

                      <Text style={styles.scoreUnit}>
                        /100
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.snapshotGrid}>
                  <SnapshotMetric
                    icon="♥"
                    label="Heart rate"
                    value={
                      health.heartRate !== null
                        ? String(
                            health.heartRate,
                          )
                        : '--'
                    }
                    unit="bpm"
                  />

                  <SnapshotMetric
                    icon="⌁"
                    label="Steps"
                    value={
                      health.steps > 0
                        ? health.steps.toLocaleString()
                        : '--'
                    }
                    unit="today"
                  />

                  <SnapshotMetric
                    icon="◊"
                    label="Hydration"
                    value={
                      health.waterIntake > 0
                        ? health.waterIntake.toFixed(
                            1,
                          )
                        : '--'
                    }
                    unit="L"
                  />

                  <SnapshotMetric
                    icon="☾"
                    label="Sleep"
                    value={
                      health.sleepHours !== null
                        ? health.sleepHours.toFixed(
                            1,
                          )
                        : '--'
                    }
                    unit="hrs"
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.bottomSpace} />
          </View>
        </ScrollView>

        {/* COMPOSER */}

        <View style={styles.inputArea}>
          <View style={styles.inputHint}>
            <View style={styles.inputHintDot} />

            <Text style={styles.inputHintText}>
              {isDemo
                ? 'AI is using simulated wellness context'
                : hasContext
                  ? 'AI is using your available wellness context'
                  : 'Add health data for more personalised answers'}
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel="Message the AI Health Assistant"
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={
                liveStatus
                  ? 'Ask about your current health...'
                  : 'Ask your health assistant...'
              }
              placeholderTextColor={
                colors.textSoft
              }
              multiline
              maxLength={500}
              editable={!isTyping}
              textAlignVertical="center"
              returnKeyType="send"
              onSubmitEditing={() => {
                if (
                  Platform.OS !== 'ios'
                ) {
                  sendMessage();
                }
              }}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[
                styles.sendButton,
                (!message.trim() ||
                  isTyping) &&
                  styles.disabledSendButton,
              ]}
              onPress={() => sendMessage()}
              disabled={
                !message.trim() ||
                isTyping
              }
            >
              {isTyping ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.sendIcon}>
                  ↑
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.disclaimer}>
            General wellness information only. AI guidance
            is not a diagnosis or emergency medical service.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* CONTEXT METRIC                                                             */
/* -------------------------------------------------------------------------- */

function ContextMetric({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.contextMetric}>
      <View style={styles.contextMetricIcon}>
        <Text style={styles.contextMetricIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.contextMetricLabel}>
        {label}
      </Text>

      <View style={styles.contextMetricValueRow}>
        <Text style={styles.contextMetricValue}>
          {value}
        </Text>

        <Text style={styles.contextMetricUnit}>
          {unit}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* SNAPSHOT METRIC                                                            */
/* -------------------------------------------------------------------------- */

function SnapshotMetric({
  icon,
  label,
  value,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.snapshotMetric}>
      <View style={styles.snapshotIcon}>
        <Text style={styles.snapshotIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.snapshotContent}>
        <Text style={styles.snapshotLabel}>
          {label}
        </Text>

        <View style={styles.snapshotValueRow}>
          <Text style={styles.snapshotValue}>
            {value}
          </Text>

          <Text style={styles.snapshotUnit}>
            {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* HEADER */

  header: {
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: colors.textStrong,
    marginTop: -4,
  },

  aiAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  aiAvatarText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.textStrong,
  },

  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  headerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.offline,
    marginRight: 5,
  },

  headerStatusDotLive: {
    backgroundColor: colors.live,
  },

  headerStatusText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  clearButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearIcon: {
    fontSize: 23,
    color: colors.textMuted,
  },

  pressedSmall: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  /* CHAT */

  chat: {
    flex: 1,
    backgroundColor: colors.background,
  },

  chatContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
  },

  chatContentWide: {
    paddingBottom: spacing.xl,
  },

  contentColumn: {
    width: '100%',
  },

  contentColumnWide: {
    maxWidth: 920,
    alignSelf: 'center',
  },

  /* CONTEXT */

  contextCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },

  contextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  contextIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  contextIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contextIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },

  contextCopy: {
    flex: 1,
    marginLeft: 10,
  },

  contextTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  contextSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  contextBadge: {
    minHeight: 26,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  contextBadgeLive: {
    backgroundColor: colors.successLight,
  },

  contextBadgeReady: {
    backgroundColor: colors.surfaceMuted,
  },

  contextBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.live,
    marginRight: 5,
  },

  contextBadgeText: {
    ...typography.caption,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  contextBadgeTextLive: {
    color: colors.success,
  },

  contextBadgeTextReady: {
    color: colors.textMuted,
  },

  contextMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  contextMetric: {
    width: '23.5%',
    alignItems: 'center',
  },

  contextMetricIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contextMetricIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },

  contextMetricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 5,
  },

  contextMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },

  contextMetricValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textStrong,
  },

  contextMetricUnit: {
    fontSize: 8,
    color: colors.textSoft,
    marginLeft: 2,
  },

  waitingState: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 11,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  waitingIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  waitingIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },

  waitingCopy: {
    flex: 1,
  },

  waitingTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.textStrong,
  },

  waitingText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },

  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  deviceIndicator: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceIndicatorInner: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.live,
  },

  deviceCopy: {
    flex: 1,
    marginLeft: 9,
  },

  deviceName: {
    ...typography.caption,
    fontWeight: '900',
    color: colors.textStrong,
  },

  deviceDescription: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  demoNoticeIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.primaryLight,
    textAlign: 'center',
    lineHeight: 17,
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    marginRight: 7,
  },

  demoNoticeText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 15,
  },

  /* ASK */

  askCard: {
    minHeight: 74,
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },

  askCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  askIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  askIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  askCopy: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  askTitle: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  askSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 16,
    marginTop: 3,
  },

  askArrowCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  askArrow: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  /* INSIGHT */

  insightCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightIconText: {
    fontSize: 17,
  },

  insightCopy: {
    flex: 1,
    marginLeft: 9,
  },

  insightTitle: {
    ...typography.bodySmall,
    fontWeight: '900',
    color: colors.textStrong,
  },

  insightSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },

  aiPill: {
    minWidth: 31,
    height: 27,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },

  insightText: {
    ...typography.bodySmall,
    color: colors.textStrong,
    lineHeight: 20,
    marginTop: 11,
  },

  /* INTRO */

  intro: {
    marginBottom: spacing.xl,
  },

  introBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  introBadgeText: {
    ...typography.overline,
    fontSize: 7,
    color: colors.primaryDark,
    letterSpacing: 1,
  },

  introTitle: {
    ...typography.h1,
    color: colors.textStrong,
    marginTop: 9,
  },

  introDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 620,
  },

  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 15,
  },

  promptCard: {
    width: '48.3%',
    minHeight: 112,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    ...shadows.card,
  },

  promptPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.primaryLight,
  },

  promptIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  promptIconText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '900',
  },

  promptContent: {
    flex: 1,
    marginTop: 9,
  },

  promptTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  promptQuestion: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 14,
    marginTop: 3,
  },

  promptArrow: {
    alignSelf: 'flex-end',
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },

  /* MESSAGES */

  messagesList: {
    gap: 12,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '94%',
  },

  userMessageRow: {
    alignSelf: 'flex-end',
  },

  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  botAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  messageBubble: {
    maxWidth: '88%',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 9,
    borderRadius: 18,
  },

  botBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 5,
    ...shadows.card,
  },

  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 5,
  },

  botMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  botLabel: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 8,
    letterSpacing: 0.8,
  },

  botStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.live,
    marginLeft: 5,
  },

  messageText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },

  botText: {
    color: colors.textStrong,
  },

  userText: {
    color: '#FFFFFF',
  },

  messageTime: {
    ...typography.caption,
    fontSize: 9,
    marginTop: 5,
    textAlign: 'right',
  },

  botTime: {
    color: colors.textSoft,
  },

  userTime: {
    color: 'rgba(255,255,255,0.65)',
  },

  retryButton: {
    marginTop: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },

  retryButtonText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },

  typingBubble: {
    paddingVertical: 11,
  },

  typingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.primary,
    marginRight: 4,
  },

  typingDotTwo: {
    opacity: 0.55,
  },

  typingDotThree: {
    opacity: 0.3,
  },

  typingLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: 4,
  },

  typingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 5,
  },

  /* SNAPSHOT */

  snapshotCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    ...shadows.card,
  },

  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  snapshotEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1,
  },

  snapshotTitle: {
    ...typography.h3,
    color: colors.textStrong,
    marginTop: 2,
  },

  scoreBadge: {
    minWidth: 58,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 7,
  },

  scoreValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primaryDark,
  },

  scoreUnit: {
    fontSize: 9,
    color: colors.primary,
    marginLeft: 1,
  },

  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },

  snapshotMetric: {
    width: '48.5%',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  snapshotIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  snapshotIconText: {
    fontSize: 14,
    color: colors.primary,
  },

  snapshotContent: {
    flex: 1,
    marginLeft: 8,
  },

  snapshotLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  snapshotValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },

  snapshotValue: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  snapshotUnit: {
    ...typography.caption,
    color: colors.textSoft,
    marginLeft: 3,
  },

  bottomSpace: {
    height: 20,
  },

  /* INPUT */

  inputArea: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom:
      Platform.OS === 'ios' ? 9 : 8,
  },

  inputHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  inputHintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 5,
  },

  inputHintText: {
    ...typography.caption,
    fontSize: 8,
    color: colors.textSoft,
  },

  inputRow: {
    minHeight: 54,
    maxHeight: 115,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    paddingLeft: 13,
    paddingRight: 6,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 95,
    color: colors.textStrong,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 9,
    paddingBottom: 8,
    paddingRight: 8,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledSendButton: {
    backgroundColor: colors.borderStrong,
  },

  sendIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 25,
    fontWeight: '800',
    marginTop: -3,
  },

  disclaimer: {
    ...typography.caption,
    fontSize: 8.5,
    color: colors.textSoft,
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 5,
  },
});