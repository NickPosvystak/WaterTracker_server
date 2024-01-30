const getWaterInPercent = (consumedWater, dailyWaterIntake) => {
  if (
    consumedWater === 0 ||
    dailyWaterIntake === 0 ||
    dailyWaterIntake === null
  ) {
    return 0;
  }
  const percentage = (consumedWater * 100) / dailyWaterIntake || null;

  return Math.round(percentage);
};

module.exports = getWaterInPercent;
