const calculateBaselineGlucose = (hba1c) => {

  // Step 1 — eAG calculation
  const eAG = (28.7 * hba1c) - 46.7;

  // Step 2 — adjusted baseline
  let baseline = (0.75 * eAG) + (0.25 * 110);

  // Step 3 — clamp between 110–190
  baseline = Math.max(110, Math.min(190, baseline));

  return {
    eAG: Math.round(eAG),
    baseline: Math.round(baseline)
  };

};

module.exports = calculateBaselineGlucose;