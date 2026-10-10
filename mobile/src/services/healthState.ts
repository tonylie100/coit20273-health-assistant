export type HealthState = {
  userId: number | null;

  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;

  activityLevel: string | null;
  fitnessGoal: string | null;

  stepGoal: number;
  waterGoalLitres: number;
  sleepGoalHours: number;

  heartRate: number | null;
  restingHeartRate: number | null;

  steps: number;
  sleepHours: number | null;
  waterIntake: number;
  caloriesBurned: number;

  distanceKm: number;
  activeMinutes: number;

  oxygenSaturation: number | null;
  temperatureC: number | null;

  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;

  mood: string | null;
  energyLevel: number | null;
  stressLevel: string | null;
  symptoms: string;

  wellnessScore: number | null;

  deviceConnected: boolean;
  deviceName: string | null;
  isDemoDevice: boolean;

  lastUpdated: string | null;
};

export const defaultHealthState: HealthState = {
  userId: null,

  age: null,
  heightCm: null,
  weightKg: null,
  targetWeightKg: null,

  activityLevel: null,
  fitnessGoal: null,

  stepGoal: 8000,
  waterGoalLitres: 2.5,
  sleepGoalHours: 8,

  heartRate: null,
  restingHeartRate: null,

  steps: 0,
  sleepHours: null,
  waterIntake: 0,
  caloriesBurned: 0,

  distanceKm: 0,
  activeMinutes: 0,

  oxygenSaturation: null,
  temperatureC: null,

  bloodPressureSystolic: null,
  bloodPressureDiastolic: null,

  mood: null,
  energyLevel: null,
  stressLevel: null,
  symptoms: '',

  wellnessScore: null,

  deviceConnected: false,
  deviceName: null,
  isDemoDevice: false,

  lastUpdated: null,
};

let healthState: HealthState = {
  ...defaultHealthState,
};

type HealthListener = (
  state: HealthState
) => void;

const listeners = new Set<HealthListener>();

export function getHealthState(): HealthState {
  return healthState;
}

export function updateHealthState(
  updates: Partial<HealthState>
): HealthState {
  healthState = {
    ...healthState,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  listeners.forEach((listener) => {
    listener(healthState);
  });

  return healthState;
}

export function subscribeToHealthState(
  listener: HealthListener
): () => void {
  listeners.add(listener);

  listener(healthState);

  return () => {
    listeners.delete(listener);
  };
}

export function resetHealthState(): void {
  healthState = {
    ...defaultHealthState,
  };

  listeners.forEach((listener) => {
    listener(healthState);
  });
}

export function calculateBMI(
  heightCm: number | null,
  weightKg: number | null
): number | null {
  if (
    heightCm === null ||
    weightKg === null ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return null;
  }

  const heightMetres = heightCm / 100;

  return Number(
    (
      weightKg /
      (heightMetres * heightMetres)
    ).toFixed(1)
  );
}

export function calculateWellnessScore(
  health: Pick<
    HealthState,
    'heartRate' | 'steps' | 'sleepHours' | 'waterIntake'
  >
): number | null {
  let score = 0;
  let availableFactors = 0;

  if (health.heartRate !== null) {
    availableFactors += 1;

    if (
      health.heartRate >= 60 &&
      health.heartRate <= 100
    ) {
      score += 25;
    } else if (
      health.heartRate >= 50 &&
      health.heartRate <= 110
    ) {
      score += 18;
    } else {
      score += 10;
    }
  }

  if (health.steps > 0) {
    availableFactors += 1;

    if (health.steps >= 8000) {
      score += 25;
    } else if (health.steps >= 5000) {
      score += 20;
    } else if (health.steps >= 2500) {
      score += 14;
    } else {
      score += 8;
    }
  }

  if (health.sleepHours !== null) {
    availableFactors += 1;

    if (
      health.sleepHours >= 7 &&
      health.sleepHours <= 9
    ) {
      score += 25;
    } else if (health.sleepHours >= 6) {
      score += 18;
    } else {
      score += 10;
    }
  }

  if (health.waterIntake > 0) {
    availableFactors += 1;

    if (health.waterIntake >= 2) {
      score += 25;
    } else if (health.waterIntake >= 1.5) {
      score += 18;
    } else {
      score += 10;
    }
  }

  if (availableFactors === 0) {
  return null;
}

  return Math.round(
    (score / availableFactors) * 4
  );
}

export function getWellnessLabel(
  score: number | null
): string {
  if (score === null) {
    return 'No data yet';
  }

  if (score >= 80) {
    return 'Good';
  }

  if (score >= 60) {
    return 'Needs attention';
  }

  return 'Focus on recovery';
}

export function getHealthInsight(
  health: HealthState
): string {
  if (
    health.sleepHours !== null &&
    health.sleepHours < 6
  ) {
    return 'Your sleep is below the recommended range. Prioritise recovery today.';
  }

  if (
    health.waterIntake > 0 &&
    health.waterIntake < 1.5
  ) {
    return 'Your hydration is currently low. Try drinking water regularly throughout the day.';
  }

  if (
    health.heartRate !== null &&
    health.heartRate > 100
  ) {
    return 'Your current heart rate is elevated. Consider slowing down and allowing yourself time to recover.';
  }

  if (
    health.steps >= health.stepGoal
  ) {
    return 'Your activity level is strong today. Keep maintaining a balanced routine.';
  }

  if (health.steps > 0) {
    return 'You are making progress today. A little more movement can help you reach your activity goal.';
  }

  return 'Add your health data or start live monitoring to receive a personalised wellness insight.';
}