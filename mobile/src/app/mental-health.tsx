import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const questions = [
  {
    question: 'How are you feeling today?',
    options: ['Very good', 'Good', 'Okay', 'Not good', 'Very bad'],
  },
  {
    question: 'How would you describe your stress level?',
    options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
  },
  {
    question: 'How well did you sleep recently?',
    options: ['Very well', 'Well', 'Average', 'Poorly', 'Very poorly'],
  },
  {
    question: 'How energetic do you feel today?',
    options: ['Very energetic', 'Energetic', 'Normal', 'Tired', 'Very tired'],
  },
];

export default function MentalHealthScreen() {
    const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];

  const selectAnswer = (answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);
  };

  const nextQuestion = () => {
    if (!answers[currentQuestion]) {
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCompleted(true);
    }
  };

  // Calculate score
  const getScore = () => {
    return answers.reduce((total, answer, index) => {
      if (!answer) return total;

      const optionIndex = questions[index].options.indexOf(answer);

      return total + optionIndex + 1;
    }, 0);
  };

  const getWellnessLevel = () => {
    const score = getScore();

    if (score <= 8) {
      return 'Positive Wellness';
    }

    if (score <= 14) {
      return 'Moderate';
    }

    return 'Needs Attention';
  };

  const getWellnessMessage = () => {
    const score = getScore();

    if (score <= 8) {
      return 'Your responses suggest that you are generally feeling positive. Keep maintaining healthy routines and habits.';
    }

    if (score <= 14) {
      return 'Your responses suggest that some areas of your wellbeing may need a little more attention. Consider focusing on rest, stress management, and activities that support your wellbeing.';
    }

    return 'Your responses suggest that you may be experiencing difficulties in several areas. Consider talking with someone you trust and seeking professional support if these feelings persist or interfere with daily life.';
  };

  const getAreaStatus = (answer: string, type: string) => {
    if (!answer) return 'Not answered';

    const index = questions
      .find((q) => q.question === type)
      ?.options.indexOf(answer);

    if (index === undefined) return answer;

    if (index <= 1) {
      return 'Good';
    }

    if (index === 2) {
      return 'Moderate';
    }

    return 'Needs attention';
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setCompleted(false);
  };

  // RESULT SCREEN
  if (completed) {
    const score = getScore();
    const wellnessLevel = getWellnessLevel();

    return (
      <ScrollView
        contentContainerStyle={styles.completedContainer}
      >
        <Text style={styles.completedTitle}>
          Assessment Complete
        </Text>

        <Text style={styles.completedText}>
          Here is your general wellness summary.
        </Text>

        {/* Overall Result */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>
            Overall Wellness
          </Text>

          <Text style={styles.scoreLevel}>
            {wellnessLevel}
          </Text>

          <Text style={styles.scoreValue}>
            Score: {score} / 20
          </Text>
        </View>

        {/* Areas */}
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Your Wellness Areas
          </Text>

          <View style={styles.areaRow}>
            <Text style={styles.areaName}>Mood</Text>
            <Text style={styles.areaValue}>
              {getAreaStatus(
                answers[0],
                'How are you feeling today?'
              )}
            </Text>
          </View>

          <View style={styles.areaRow}>
            <Text style={styles.areaName}>Stress</Text>
            <Text style={styles.areaValue}>
              {getAreaStatus(
                answers[1],
                'How would you describe your stress level?'
              )}
            </Text>
          </View>

          <View style={styles.areaRow}>
            <Text style={styles.areaName}>Sleep</Text>
            <Text style={styles.areaValue}>
              {getAreaStatus(
                answers[2],
                'How well did you sleep recently?'
              )}
            </Text>
          </View>

          <View style={styles.areaRow}>
            <Text style={styles.areaName}>Energy</Text>
            <Text style={styles.areaValue}>
              {getAreaStatus(
                answers[3],
                'How energetic do you feel today?'
              )}
            </Text>
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationCard}>
          <Text style={styles.resultTitle}>
            Wellness Guidance
          </Text>

          <Text style={styles.resultText}>
            {getWellnessMessage()}
          </Text>

          <Text style={styles.guidanceItem}>
            • Maintain a consistent sleep routine.
          </Text>

          <Text style={styles.guidanceItem}>
            • Take regular breaks and make time to relax.
          </Text>

          <Text style={styles.guidanceItem}>
            • Stay physically active when possible.
          </Text>

          <Text style={styles.guidanceItem}>
            • Stay connected with friends, family, or people you trust.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          This assessment is intended for general wellness awareness
          and is not a medical diagnosis.
        </Text>

        <TouchableOpacity
          style={styles.restartButton}
          onPress={resetAssessment}
        >
          <Text style={styles.restartText}>
            Take Again
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // QUESTION SCREEN
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Mental Health Check-in
        </Text>

        <Text style={styles.headerSubtitle}>
          Take a moment to check in with yourself
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.progress}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestion + 1) / questions.length) * 100
                }%`,
              },
            ]}
          />
        </View>

        <Text style={styles.question}>
          {question.question}
        </Text>

        <View style={styles.options}>
          {question.options.map((option) => {
            const selected =
              answers[currentQuestion] === option;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  selected && styles.selectedOption,
                ]}
                onPress={() => selectAnswer(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !answers[currentQuestion] &&
              styles.disabledButton,
          ]}
          onPress={nextQuestion}
          disabled={!answers[currentQuestion]}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1
              ? 'Complete'
              : 'Next'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#2E7D6B',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#E8F5F1',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  progress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },

  progressBar: {
    height: 8,
    backgroundColor: '#DDE8E5',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 35,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D6B',
  },

  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 25,
  },

  options: {
    gap: 12,
  },

  option: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 14,
  },

  selectedOption: {
    backgroundColor: '#2E7D6B',
    borderColor: '#2E7D6B',
  },

  optionText: {
    fontSize: 16,
    color: '#333333',
  },

  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  nextButton: {
    marginTop: 30,
    backgroundColor: '#2E7D6B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  completedContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F7F9FC',
  },

  completedTitle: {
    marginTop: 30,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D6B',
    textAlign: 'center',
  },

  completedText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },

  scoreCard: {
    marginTop: 25,
    padding: 25,
    borderRadius: 18,
    backgroundColor: '#2E7D6B',
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 15,
    color: '#E8F5F1',
  },

  scoreLevel: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  scoreValue: {
    marginTop: 8,
    fontSize: 15,
    color: '#E8F5F1',
  },

  resultCard: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  resultTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },

  areaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  areaName: {
    fontSize: 16,
    color: '#333333',
  },

  areaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D6B',
  },

  recommendationCard: {
    width: '100%',
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
    marginBottom: 12,
  },

  guidanceItem: {
    fontSize: 15,
    lineHeight: 23,
    color: '#444444',
    marginTop: 8,
  },

  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: '#777777',
    textAlign: 'center',
  },

  restartButton: {
    marginTop: 20,
    backgroundColor: '#2E7D6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  restartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});