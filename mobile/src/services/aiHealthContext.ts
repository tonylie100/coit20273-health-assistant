import {
  getHealthState,
  type HealthState,
} from './healthState';

export type AIHealthContext = {
  summary: string;
  metrics: {
    heartRate: number | null;
    steps: number;
    sleepHours: number | null;
    waterIntake: number;
    caloriesBurned: number;
    activeMinutes: number;
    distanceKm: number;
    oxygenSaturation: number | null;
    temperatureC: number | null;
    mood: string | null;
    energyLevel: number | null;
    stressLevel: string | null;
    wellnessScore: number | null;
  };
  device: {
    connected: boolean;
    name: string | null;
    isDemo: boolean;
    lastUpdated: string | null;
  };
  insights: string[];
  updatedAt: string;
};

/**
 * Creates a structured snapshot of the current shared health state.
 *
 * This is intentionally frontend-side.
 * It allows the AI Assistant UI to react immediately whenever
 * healthState changes without requiring another API request.
 */
export function createAIHealthContext(
  health: HealthState = getHealthState()
): AIHealthContext {
  const insights = generateRealtimeInsights(health);

  return {
    summary: buildHealthSummary(health),

    metrics: {
      heartRate: health.heartRate,
      steps: health.steps,
      sleepHours: health.sleepHours,
      waterIntake: health.waterIntake,
      caloriesBurned: health.caloriesBurned,
      activeMinutes: health.activeMinutes,
      distanceKm: health.distanceKm,
      oxygenSaturation: health.oxygenSaturation,
      temperatureC: health.temperatureC,
      mood: health.mood,
      energyLevel: health.energyLevel,
      stressLevel: health.stressLevel,
      wellnessScore: health.wellnessScore,
    },

    device: {
      connected: health.deviceConnected,
      name: health.deviceName,
      isDemo: health.isDemoDevice,
      lastUpdated: health.lastUpdated,
    },

    insights,

    updatedAt:
      health.lastUpdated ??
      new Date().toISOString(),
  };
}

/**
 * Builds the context that is sent alongside a user's
 * chatbot question.
 */
export function buildAIMessageContext(
  question: string,
  health: HealthState = getHealthState()
): string {
  const context = createAIHealthContext(health);

  const metricLines = [
    `Heart rate: ${
      context.metrics.heartRate !== null
        ? `${context.metrics.heartRate} bpm`
        : 'not available'
    }`,

    `Steps: ${
      context.metrics.steps > 0
        ? context.metrics.steps
        : 'not available'
    }`,

    `Sleep: ${
      context.metrics.sleepHours !== null
        ? `${context.metrics.sleepHours.toFixed(1)} hours`
        : 'not available'
    }`,

    `Water intake: ${
      context.metrics.waterIntake > 0
        ? `${context.metrics.waterIntake.toFixed(1)} litres`
        : 'not available'
    }`,

    `Calories burned: ${
      context.metrics.caloriesBurned > 0
        ? Math.round(
            context.metrics.caloriesBurned
          )
        : 'not available'
    }`,

    `Active minutes: ${
      context.metrics.activeMinutes > 0
        ? context.metrics.activeMinutes
        : 'not available'
    }`,

    `Distance: ${
      context.metrics.distanceKm > 0
        ? `${context.metrics.distanceKm.toFixed(2)} km`
        : 'not available'
    }`,

    `Oxygen saturation: ${
      context.metrics.oxygenSaturation !== null
        ? `${context.metrics.oxygenSaturation}%`
        : 'not available'
    }`,

    `Temperature: ${
      context.metrics.temperatureC !== null
        ? `${context.metrics.temperatureC.toFixed(1)} C`
        : 'not available'
    }`,

    `Mood: ${
      context.metrics.mood ??
      'not available'
    }`,

    `Energy: ${
      context.metrics.energyLevel !== null
        ? `${context.metrics.energyLevel}/10`
        : 'not available'
    }`,

    `Stress: ${
      context.metrics.stressLevel ??
      'not available'
    }`,

    `Wellness score: ${
      context.metrics.wellnessScore !== null
        ? `${context.metrics.wellnessScore}/100`
        : 'not available'
    }`,
  ];

  const deviceLine = context.device.connected
    ? `Connected device: ${
        context.device.name ??
        'Health device'
      }${
        context.device.isDemo
          ? ' (simulated demo wearable)'
          : ''
      }`
    : 'Connected device: none';

  const insightLines =
    context.insights.length > 0
      ? context.insights
          .map(
            (insight) =>
              `- ${insight}`
          )
          .join('\n')
      : '- No realtime wellness observations currently available.';

  return `
User question:
${question}

CURRENT REALTIME WELLNESS CONTEXT
---------------------------------
${metricLines.join('\n')}

${deviceLine}

Realtime wellness observations:
${insightLines}

Context summary:
${context.summary}

The health data above represents the latest available application state.
Use it when relevant to the user's question.

The wellness score is an application wellness heuristic and is not a
clinically validated measurement.

Provide practical general wellness information.
Do not diagnose medical conditions.
Do not claim that application readings confirm or rule out a medical condition.
If the user describes urgent or potentially serious symptoms, recommend
appropriate professional medical care.

Answer the user's question naturally and directly.
`.trim();
}

/**
 * Generates lightweight realtime wellness observations.
 *
 * These are deliberately conservative.
 * They are UI/assistant context, not medical alerts.
 */
export function generateRealtimeInsights(
  health: HealthState
): string[] {
  const insights: string[] = [];

  if (
    health.heartRate !== null &&
    health.heartRate >= 100
  ) {
    insights.push(
      'Heart rate is currently elevated compared with the application wellness range.'
    );
  } else if (
    health.heartRate !== null &&
    health.heartRate >= 60 &&
    health.heartRate < 100
  ) {
    insights.push(
      'Current heart rate is within the application wellness range.'
    );
  }

  if (
    health.steps > 0 &&
    health.stepGoal > 0
  ) {
    const stepProgress =
      health.steps /
      health.stepGoal;

    if (stepProgress >= 1) {
      insights.push(
        'Daily step goal has been reached.'
      );
    } else if (stepProgress >= 0.75) {
      insights.push(
        'Daily activity is progressing well toward the step goal.'
      );
    } else if (stepProgress >= 0.4) {
      insights.push(
        'There is meaningful progress toward the daily step goal.'
      );
    }
  }

  if (
    health.sleepHours !== null
  ) {
    if (health.sleepHours < 6) {
      insights.push(
        'Recorded sleep is below the preferred recovery range.'
      );
    } else if (
      health.sleepHours >= 7 &&
      health.sleepHours <= 9
    ) {
      insights.push(
        'Recorded sleep is within the preferred recovery range.'
      );
    }
  }

  if (
    health.waterIntake > 0 &&
    health.waterGoalLitres > 0
  ) {
    const hydrationProgress =
      health.waterIntake /
      health.waterGoalLitres;

    if (hydrationProgress >= 1) {
      insights.push(
        'Daily hydration target has been reached.'
      );
    } else if (
      hydrationProgress < 0.5
    ) {
      insights.push(
        'Hydration is currently below half of the configured daily target.'
      );
    }
  }

  if (
    health.stressLevel
  ) {
    const stress =
      health.stressLevel.toLowerCase();

    if (
      stress.includes('high') ||
      stress.includes('very high')
    ) {
      insights.push(
        'The user has reported a higher stress level and may benefit from a recovery-focused check-in.'
      );
    }
  }

  if (
    health.energyLevel !== null
  ) {
    if (
      health.energyLevel <= 3
    ) {
      insights.push(
        'Reported energy is currently low.'
      );
    } else if (
      health.energyLevel >= 8
    ) {
      insights.push(
        'Reported energy level is currently strong.'
      );
    }
  }

  if (
    health.deviceConnected
  ) {
    insights.push(
      health.isDemoDevice
        ? 'Live monitoring is currently using simulated demo wearable data.'
        : 'Live health monitoring is currently connected.'
    );
  }

  return insights.slice(0, 5);
}

/**
 * Produces a short human-readable summary for the UI.
 */
export function buildHealthSummary(
  health: HealthState
): string {
  const available: string[] = [];

  if (health.heartRate !== null) {
    available.push(
      `heart rate ${health.heartRate} bpm`
    );
  }

  if (health.steps > 0) {
    available.push(
      `${health.steps.toLocaleString()} steps`
    );
  }

  if (health.sleepHours !== null) {
    available.push(
      `${health.sleepHours.toFixed(1)} hours sleep`
    );
  }

  if (health.waterIntake > 0) {
    available.push(
      `${health.waterIntake.toFixed(1)} L hydration`
    );
  }

  if (
    health.mood
  ) {
    available.push(
      `mood ${health.mood}`
    );
  }

  if (
    health.stressLevel
  ) {
    available.push(
      `stress ${health.stressLevel}`
    );
  }

  if (available.length === 0) {
    return 'No health measurements are currently available.';
  }

  return `Latest available data: ${available.join(', ')}.`;
}

/**
 * Determines whether the application currently has
 * enough health data to show a meaningful AI context.
 */
export function hasAIHealthContext(
  health: HealthState = getHealthState()
): boolean {
  return (
    health.heartRate !== null ||
    health.steps > 0 ||
    health.sleepHours !== null ||
    health.waterIntake > 0 ||
    health.mood !== null ||
    health.energyLevel !== null ||
    health.stressLevel !== null ||
    health.wellnessScore !== null
  );
}

/**
 * Returns a relative freshness label for the UI.
 */
export function getHealthContextFreshness(
  health: HealthState = getHealthState()
): string {
  if (!health.lastUpdated) {
    return 'Waiting for health data';
  }

  const updatedAt =
    new Date(
      health.lastUpdated
    ).getTime();

  const secondsAgo = Math.max(
    0,
    Math.floor(
      (Date.now() - updatedAt) /
        1000
    )
  );

  if (secondsAgo < 5) {
    return 'Updated just now';
  }

  if (secondsAgo < 60) {
    return `Updated ${secondsAgo}s ago`;
  }

  const minutesAgo =
    Math.floor(secondsAgo / 60);

  if (minutesAgo < 60) {
    return `Updated ${minutesAgo}m ago`;
  }

  return 'Health data may be out of date';
}