import {
  calculateWellnessScore,
  defaultHealthState,
  getHealthState,
  updateHealthState,
} from './healthState';

let streamTimer: ReturnType<typeof setInterval> | null = null;

let monitoringStartedAt: string | null = null;

let demoHeartRate = 72;
let demoSteps = 0;
let demoCalories = 0;
let demoDistance = 0;
let demoActiveMinutes = 0;
let demoOxygen = 98;
let demoTemperature = 36.6;

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function generateHeartRate(): number {
  const change = Math.round(randomBetween(-3, 4));

  demoHeartRate = clamp(
    demoHeartRate + change,
    58,
    115
  );

  return Math.round(demoHeartRate);
}

function generateSteps(): number {
  const increase = Math.floor(randomBetween(8, 25));

  demoSteps += increase;

  return demoSteps;
}

function generateCalories(): number {
  demoCalories += randomBetween(0.5, 1.8);

  return Number(demoCalories.toFixed(1));
}

function generateDistance(): number {
  demoDistance += randomBetween(0.005, 0.018);

  return Number(demoDistance.toFixed(2));
}

function generateActiveMinutes(): number {
  if (Math.random() > 0.55) {
    demoActiveMinutes += 1;
  }

  return demoActiveMinutes;
}

function generateOxygen(): number {
  const change = Math.round(randomBetween(-1, 1));

  demoOxygen = clamp(
    demoOxygen + change,
    95,
    100
  );

  return Math.round(demoOxygen);
}

function generateTemperature(): number {
  demoTemperature += randomBetween(-0.03, 0.03);

  demoTemperature = clamp(
    demoTemperature,
    36.2,
    37.1
  );

  return Number(demoTemperature.toFixed(1));
}

function updateDemoHealthData() {
  const current = getHealthState();

  const heartRate = generateHeartRate();
  const steps = generateSteps();
  const caloriesBurned = generateCalories();
  const distanceKm = generateDistance();
  const activeMinutes = generateActiveMinutes();
  const oxygenSaturation = generateOxygen();
  const temperatureC = generateTemperature();

  const wellnessScore = calculateWellnessScore({
    heartRate,
    steps,
    sleepHours: current.sleepHours,
    waterIntake: current.waterIntake,
  });

  updateHealthState({
    heartRate,
    steps,
    caloriesBurned,
    distanceKm,
    activeMinutes,
    oxygenSaturation,
    temperatureC,

    restingHeartRate:
      current.restingHeartRate ?? 64,

    wellnessScore,

    deviceConnected: true,

    deviceName: 'Demo Wearable',

    isDemoDevice: true,
  });
}

export function startHealthStream(): void {
  if (streamTimer !== null) {
    return;
  }

  const current = getHealthState();

  demoHeartRate =
    current.heartRate ??
    defaultHealthState.heartRate ??
    72;

  demoSteps = current.steps || 0;

  demoCalories = current.caloriesBurned || 0;

  demoDistance = current.distanceKm || 0;

  demoActiveMinutes =
    current.activeMinutes || 0;

  demoOxygen =
    current.oxygenSaturation ?? 98;

  demoTemperature =
    current.temperatureC ?? 36.6;

  monitoringStartedAt =
    new Date().toISOString();

  updateDemoHealthData();

  streamTimer = setInterval(() => {
    updateDemoHealthData();
  }, 3000);
}

export function stopHealthStream(): void {
  if (streamTimer !== null) {
    clearInterval(streamTimer);
    streamTimer = null;
  }

  updateHealthState({
    deviceConnected: false,
    deviceName: null,
    isDemoDevice: false,
  });

  monitoringStartedAt = null;
}

export function isHealthStreamRunning(): boolean {
  return streamTimer !== null;
}

export function getMonitoringStartedAt(): string | null {
  return monitoringStartedAt;
}

export function resetHealthStream(): void {
  stopHealthStream();

  demoHeartRate = 72;
  demoSteps = 0;
  demoCalories = 0;
  demoDistance = 0;
  demoActiveMinutes = 0;
  demoOxygen = 98;
  demoTemperature = 36.6;
}