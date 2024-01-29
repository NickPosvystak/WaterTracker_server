const getWaterInPercent = (consumedWater, dailyWaterIntake) => {
  if (consumedWater === 0) {
    return 0;
  }
  return (consumedWater * 100) / dailyWaterIntake || null;
};

module.exports = getWaterInPercent;
