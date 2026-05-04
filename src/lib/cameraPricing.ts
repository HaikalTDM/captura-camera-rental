type CameraPricingLike = {
  daily_rate: number;
  weekly_rate?: number | null;
  discount_threshold?: number | null;
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getDiscountThreshold(camera: CameraPricingLike) {
  return camera.discount_threshold && camera.discount_threshold > 1
    ? camera.discount_threshold
    : 3;
}

export function getExtendedDailyRate(camera: CameraPricingLike) {
  const storedRate = Number(camera.weekly_rate || 0);

  if (storedRate <= 0) {
    return roundCurrency(camera.daily_rate * 0.9);
  }

  // Legacy records stored a full weekly total, not a discounted daily rate.
  if (storedRate > camera.daily_rate * 1.5) {
    return roundCurrency(storedRate / 7);
  }

  return roundCurrency(storedRate);
}

export function getRateForDuration(camera: CameraPricingLike, totalDays: number) {
  return totalDays >= getDiscountThreshold(camera)
    ? getExtendedDailyRate(camera)
    : camera.daily_rate;
}
