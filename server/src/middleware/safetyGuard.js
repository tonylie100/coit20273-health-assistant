/**
 * Short-circuits unsafe metric payloads with immediate standard health warnings.
 */
function safetyGuardMiddleware(req, res, next) {
  const { heart_rate, sleep_hours, calories_burned } = req.body.metrics || {};

  // Flag extreme resting heart rate
  if (heart_rate && (heart_rate > 180 || heart_rate < 35)) {
    return res.status(200).json({
      status: 'safety_override',
      flagged: true,
      recommendation: {
        diet: 'Maintain baseline hydration. Avoid stimulants or caffeine.',
        exercise: 'SAFETY WARNING: Abnormal resting heart rate detected. Refrain from exercise and consult a medical professional immediately.'
      }
    });
  }

  // Flag critical sleep deprivation
  if (sleep_hours !== undefined && sleep_hours < 3) {
    return res.status(200).json({
      status: 'safety_override',
      flagged: true,
      recommendation: {
        diet: 'Focus on light, nutrient-dense meals and steady hydration.',
        exercise: 'REST RECOMMENDED: Severely reduced sleep recorded (< 3 hours). Prioritize full rest over workouts today.'
      }
    });
  }

  next();
}

module.exports = safetyGuardMiddleware;