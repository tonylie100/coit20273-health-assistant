import React, { useEffect, useMemo, useRef, useState } from 'react';
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
    "Hi! I'm your AI Health Assistant. I'm connected to your latest wellness context and can help you understand your activity, sleep, hydration, recovery and general wellbeing.",
  sender: 'bot',
  timestamp: new Date(),
};

const SUGGESTED_PROMPTS = [
  {
    icon: '❤️',
    title: 'Heart rate',
    text: 'What does my current heart rate tell me?',
  },
  {
    icon: '😴',
    title: 'Recovery',
    text: 'How is my recovery looking today?',
  },
  {
    icon: '💧',
    title: 'Hydration',
    text: 'How is my hydration today?',
  },
  {
    icon: '🧠',
    title: 'Stress',
    text: 'What can I do to manage my stress right now?',
  },
];

export default function ChatbotScreen() {
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
    useState<AIHealthContext>(() => createAIHealthContext());

  const [freshness, setFreshness] = useState(
    getHealthContextFreshness(),
  );

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const unsubscribe = subscribeToHealthState((state) => {
      setHealth({ ...state });
      setAIContext(createAIHealthContext(state));
      setFreshness(getHealthContextFreshness(state));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFreshness(getHealthContextFreshness(health));
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

  const liveStatus = health.deviceConnected;
  const isDemo = Boolean(health.isDemoDevice);

  const sendMessage = async (messageOverride?: string) => {
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
      /*
       * Always capture health state at the exact moment
       * the user asks the question.
       */
      const currentHealth = getHealthState();

      const contextualMessage = buildAIMessageContext(
        trimmedMessage,
        currentHealth,
      );

      const data = await sendChatbotMessage(
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
      console.log('Chatbot API error:', error);

      setLastFailedMessage(trimmedMessage);

      const fallbackMessage: Message = {
        id: `${Date.now()}-error`,
        text: generateFallback(
          trimmedMessage,
          health,
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
    const parts: string[] = [];

    if (current.heartRate !== null) {
      parts.push(
        `my current heart rate is ${current.heartRate} bpm`,
      );
    }

    if (current.steps > 0) {
      parts.push(
        `${current.steps.toLocaleString()} steps`,
      );
    }

    if (current.sleepHours !== null) {
      parts.push(
        `${current.sleepHours.toFixed(1)} hours of sleep`,
      );
    }

    if (current.waterIntake > 0) {
      parts.push(
        `${current.waterIntake.toFixed(1)} litres of water`,
      );
    }

    if (current.energyLevel !== null) {
      parts.push(
        `energy level ${current.energyLevel}/10`,
      );
    }

    if (current.stressLevel) {
      parts.push(
        `${current.stressLevel} stress`,
      );
    }

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
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedSmall,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>✦</Text>
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
                    ? 'Demo live health context'
                    : 'Live health context'
                  : 'Personal wellness support'}
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressedSmall,
            ]}
            onPress={clearChat}
            disabled={isTyping}
          >
            <Text style={styles.clearIcon}>↻</Text>
          </Pressable>
        </View>

        {/* CHAT */}

        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI CONTEXT */}

          <View style={styles.realtimeCard}>
            <View style={styles.realtimeHeader}>
              <View style={styles.realtimeTitleArea}>
                <View style={styles.realtimeIcon}>
                  <Text style={styles.realtimeIconText}>
                    ✦
                  </Text>
                </View>

                <View style={styles.realtimeTitleContent}>
                  <Text style={styles.realtimeTitle}>
                    AI live context
                  </Text>

                  <Text style={styles.realtimeSubtitle}>
                    {isDemo
                      ? `Simulated live data • ${freshness}`
                      : freshness}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.liveBadge,
                  !liveStatus &&
                    styles.liveBadgeOffline,
                ]}
              >
                <View
                  style={[
                    styles.liveBadgeDot,
                    !liveStatus &&
                      styles.liveBadgeDotOffline,
                  ]}
                />

                <Text
                  style={[
                    styles.liveBadgeText,
                    !liveStatus &&
                      styles.liveBadgeTextOffline,
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
              <View style={styles.liveMetrics}>
                <LiveMetric
                  icon="♥"
                  label="Heart"
                  value={
                    health.heartRate !== null
                      ? `${health.heartRate}`
                      : '--'
                  }
                  unit="bpm"
                  accent={colors.heart}
                />

                <LiveMetric
                  icon="⌁"
                  label="Steps"
                  value={
                    health.steps > 0
                      ? health.steps.toLocaleString()
                      : '--'
                  }
                  unit="today"
                  accent={colors.steps}
                />

                <LiveMetric
                  icon="◒"
                  label="Sleep"
                  value={
                    health.sleepHours !== null
                      ? health.sleepHours.toFixed(1)
                      : '--'
                  }
                  unit="hrs"
                  accent={colors.sleep}
                />

                <LiveMetric
                  icon="◆"
                  label="Water"
                  value={
                    health.waterIntake > 0
                      ? health.waterIntake.toFixed(1)
                      : '--'
                  }
                  unit="L"
                  accent={colors.water}
                />
              </View>
            ) : (
              <View style={styles.waitingState}>
                <Text style={styles.waitingIcon}>
                  ◌
                </Text>

                <View style={styles.waitingContent}>
                  <Text style={styles.waitingTitle}>
                    Waiting for health data
                  </Text>

                  <Text style={styles.waitingText}>
                    Start Live Health or add manual data
                    to give the AI more context.
                  </Text>
                </View>
              </View>
            )}

            {liveStatus ? (
              <View style={styles.deviceRow}>
                <View style={styles.devicePulse}>
                  <View style={styles.devicePulseInner} />
                </View>

                <View style={styles.deviceContent}>
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
                  ⓘ
                </Text>

                <Text style={styles.demoNoticeText}>
                  These live values are simulated demo
                  data for the prototype and are not
                  clinical measurements.
                </Text>
              </View>
            ) : null}
          </View>

          {/* ASK CURRENT HEALTH */}

          {hasContext ? (
            <Pressable
              style={({ pressed }) => [
                styles.askCurrentCard,
                pressed &&
                  styles.askCurrentCardPressed,
              ]}
              onPress={askAboutCurrentHealth}
              disabled={isTyping}
            >
              <View style={styles.askCurrentIcon}>
                <Text style={styles.askCurrentIconText}>
                  ✦
                </Text>
              </View>

              <View style={styles.askCurrentContent}>
                <Text style={styles.askCurrentTitle}>
                  Ask AI about my current health
                </Text>

                <Text style={styles.askCurrentSubtitle}>
                  Analyse the latest available readings
                  and give me a practical wellness summary.
                </Text>
              </View>

              <Text style={styles.askCurrentArrow}>
                →
              </Text>
            </Pressable>
          ) : null}

          {/* AI INSIGHT */}

          {aiContext.insights.length > 0 ? (
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.insightIcon}>
                  <Text style={styles.insightIconText}>
                    ✨
                  </Text>
                </View>

                <View style={styles.insightTitleArea}>
                  <Text style={styles.insightTitle}>
                    Live wellness insight
                  </Text>

                  <Text style={styles.insightSubtitle}>
                    Based on your latest health state
                  </Text>
                </View>
              </View>

              <Text style={styles.insightText}>
                {aiContext.insights[0]}
              </Text>
            </View>
          ) : null}

          {/* INTRO + QUICK PROMPTS */}

          {messages.length === 1 ? (
            <View style={styles.intro}>
              <Text style={styles.introEyebrow}>
                PERSONAL WELLNESS ASSISTANT
              </Text>

              <Text style={styles.introTitle}>
                What would you like to explore?
              </Text>

              <Text style={styles.introDescription}>
                Ask about your current health state and
                get guidance based on the latest
                information available in the app.
              </Text>

              <View style={styles.promptGrid}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Pressable
                    key={prompt.title}
                    style={({ pressed }) => [
                      styles.promptCard,
                      pressed &&
                        styles.promptCardPressed,
                    ]}
                    onPress={() =>
                      sendMessage(prompt.text)
                    }
                    disabled={isTyping}
                  >
                    <View style={styles.promptIcon}>
                      <Text style={styles.promptEmoji}>
                        {prompt.icon}
                      </Text>
                    </View>

                    <View style={styles.promptBottom}>
                      <Text style={styles.promptTitle}>
                        {prompt.title}
                      </Text>

                      <Text style={styles.promptArrow}>
                        →
                      </Text>
                    </View>
                  </Pressable>
                ))}
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
                      <Text style={styles.botLabel}>
                        AI HEALTH ASSISTANT
                      </Text>
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
                      {formatTime(item.timestamp)}
                    </Text>

                    {isError &&
                    lastFailedMessage ? (
                      <Pressable
                        style={styles.retryButton}
                        onPress={() =>
                          sendMessage(
                            lastFailedMessage,
                          )
                        }
                        disabled={isTyping}
                      >
                        <Text style={styles.retryButtonText}>
                          Try again
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {/* AI THINKING */}

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
                    <View style={styles.typingDot} />

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

                    <Text style={styles.typingLabel}>
                      Analysing live context
                    </Text>
                  </View>

                  <Text style={styles.typingText}>
                    Preparing a personalised response...
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* WELLNESS SNAPSHOT */}

          {hasContext ? (
            <View style={styles.snapshotCard}>
              <View style={styles.snapshotHeader}>
                <View>
                  <Text style={styles.snapshotEyebrow}>
                    CURRENT STATE
                  </Text>

                  <Text style={styles.snapshotTitle}>
                    Wellness snapshot
                  </Text>
                </View>

                {health.wellnessScore !== null ? (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreValue}>
                      {health.wellnessScore}
                    </Text>

                    <Text style={styles.scoreUnit}>
                      /100
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.snapshotGrid}>
                <SnapshotMetric
                  icon="❤️"
                  label="Heart rate"
                  value={
                    health.heartRate !== null
                      ? `${health.heartRate}`
                      : '--'
                  }
                  unit="bpm"
                />

                <SnapshotMetric
                  icon="👣"
                  label="Steps"
                  value={
                    health.steps > 0
                      ? health.steps.toLocaleString()
                      : '--'
                  }
                  unit="today"
                />

                <SnapshotMetric
                  icon="💧"
                  label="Hydration"
                  value={
                    health.waterIntake > 0
                      ? health.waterIntake.toFixed(1)
                      : '--'
                  }
                  unit="L"
                />

                <SnapshotMetric
                  icon="😴"
                  label="Sleep"
                  value={
                    health.sleepHours !== null
                      ? health.sleepHours.toFixed(1)
                      : '--'
                  }
                  unit="hrs"
                />
              </View>
            </View>
          ) : null}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* INPUT */}

        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={
                liveStatus
                  ? 'Ask about your live health...'
                  : 'Ask about your health...'
              }
              placeholderTextColor={
                colors.textSoft
              }
              multiline
              maxLength={500}
              editable={!isTyping}
              textAlignVertical="center"
              onSubmitEditing={() => {
                if (Platform.OS !== 'ios') {
                  sendMessage();
                }
              }}
            />

            <Pressable
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
            General wellness information only. AI
            guidance is not a diagnosis or emergency
            medical service.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ========================================================================== */
/* LIVE METRIC                                                                */
/* ========================================================================== */

function LiveMetric({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <View style={styles.liveMetric}>
      <View
        style={[
          styles.liveMetricIcon,
          {
            backgroundColor: `${accent}18`,
          },
        ]}
      >
        <Text
          style={[
            styles.liveMetricIconText,
            {
              color: accent,
            },
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text style={styles.liveMetricLabel}>
        {label}
      </Text>

      <View style={styles.liveMetricValueRow}>
        <Text style={styles.liveMetricValue}>
          {value}
        </Text>

        <Text style={styles.liveMetricUnit}>
          {unit}
        </Text>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* SNAPSHOT METRIC                                                            */
/* ========================================================================== */

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

/* ========================================================================== */
/* FALLBACK                                                                   */
/* ========================================================================== */

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
        }reading is ${health.heartRate} bpm. ` +
        'A single reading is only one part of your overall health picture. ' +
        'If you experience concerning symptoms such as chest pain, severe ' +
        'breathlessness or fainting, seek appropriate medical attention.'
      );
    }

    return (
      'I do not currently have a live heart-rate reading. ' +
      'Start Live Health to provide current monitoring data.'
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
        'Keeping a consistent sleep schedule and allowing enough recovery time ' +
        'can support general wellbeing.'
      );
    }

    return (
      'Sleep data is not available yet. Add your sleep information ' +
      'so the assistant can use it in your wellness context.'
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
        'Try to spread your fluid intake throughout the day.'
      );
    }

    return (
      'There is no hydration data available yet. Add your water intake ' +
      'to make the health context more useful.'
    );
  }

  if (
    lower.includes('step') ||
    lower.includes('walk') ||
    lower.includes('exercise')
  ) {
    return (
      `You have recorded ${health.steps.toLocaleString()} steps today. ` +
      'If you want to increase activity, a short comfortable walk can ' +
      'be a practical option.'
    );
  }

  return (
    'The AI service is temporarily unavailable. Your message was received, ' +
    'but I could not generate a live response. Please try again.'
  );
}

/* ========================================================================== */
/* TIME                                                                       */
/* ========================================================================== */

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

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

  pressedSmall: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 30,
    color: colors.textStrong,
    marginTop: -4,
  },

  aiAvatar: {
    width: 44,
    height: 44,
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
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearIcon: {
    fontSize: 23,
    color: colors.textMuted,
  },

  chat: {
    flex: 1,
    backgroundColor: colors.background,
  },

  chatContent: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.lg,
  },

  realtimeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },

  realtimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  realtimeTitleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  realtimeIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  realtimeIconText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '900',
  },

  realtimeTitleContent: {
    marginLeft: 10,
  },

  realtimeTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '900',
  },

  realtimeSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.successLight,
  },

  liveBadgeOffline: {
    backgroundColor: colors.surfaceMuted,
  },

  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.live,
    marginRight: 5,
  },

  liveBadgeDotOffline: {
    backgroundColor: colors.offline,
  },

  liveBadgeText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.success,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  liveBadgeTextOffline: {
    color: colors.textMuted,
  },

  liveMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  liveMetric: {
    width: '23.5%',
    alignItems: 'center',
  },

  liveMetricIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  liveMetricIconText: {
    fontSize: 15,
    fontWeight: '900',
  },

  liveMetricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
  },

  liveMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },

  liveMetricValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textStrong,
  },

  liveMetricUnit: {
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
  },

  waitingIcon: {
    fontSize: 27,
    color: colors.textSoft,
    marginRight: 10,
  },

  waitingContent: {
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

  devicePulse: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  devicePulseInner: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: colors.live,
  },

  deviceContent: {
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
    color: colors.primary,
    fontSize: 14,
    marginRight: 7,
  },

  demoNoticeText: {
    flex: 1,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 15,
  },

  askCurrentCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },

  askCurrentCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  askCurrentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  askCurrentIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  askCurrentContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  askCurrentTitle: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  askCurrentSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 16,
    marginTop: 3,
  },

  askCurrentArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  insightCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },

  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightIconText: {
    fontSize: 17,
  },

  insightTitleArea: {
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

  insightText: {
    ...typography.bodySmall,
    color: colors.textStrong,
    lineHeight: 20,
    marginTop: 11,
  },

  intro: {
    marginBottom: spacing.xl,
  },

  introEyebrow: {
    ...typography.overline,
    color: colors.primary,
    letterSpacing: 1.1,
  },

  introTitle: {
    ...typography.h1,
    color: colors.textStrong,
    marginTop: 3,
  },

  introDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 19,
    marginTop: 5,
  },

  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
    marginTop: 15,
  },

  promptCard: {
    width: '48.3%',
    minHeight: 98,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 12,
    ...shadows.card,
  },

  promptCardPressed: {
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

  promptEmoji: {
    fontSize: 17,
  },

  promptBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  promptTitle: {
    ...typography.bodySmall,
    color: colors.textStrong,
    fontWeight: '800',
  },

  promptArrow: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },

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
    width: 31,
    height: 31,
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

  botLabel: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 5,
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
    minWidth: 54,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 7,
  },

  scoreValue: {
    fontSize: 16,
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

  inputArea: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === 'ios' ? 9 : 8,
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