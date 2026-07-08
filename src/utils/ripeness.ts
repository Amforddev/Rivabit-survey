export const RIPENESS_STAGES = [
  { name: 'Seed', nectar: 0, multiplier: 0.2, color: 'bg-stone-500', icon: 'Leaf' },
  { name: 'Sprout', nectar: 100, multiplier: 1, color: 'bg-emerald-500', icon: 'Sprout' },
  { name: 'Bud', nectar: 400, multiplier: 2, color: 'bg-amber-400', icon: 'Flower2' },
  { name: 'Bloom', nectar: 1200, multiplier: 3, color: 'bg-pink-400', icon: 'Flower' },
  { name: 'Ripe', nectar: 3600, multiplier: 4, color: 'bg-orange-500', icon: 'Sun' },
  { name: 'Golden', nectar: 9000, multiplier: 5, color: 'bg-yellow-500', icon: 'Trophy' },
];

export const getRipenessStage = (nectar: number) => {
  let currentStageIndex = 0;
  for (let i = 0; i < RIPENESS_STAGES.length; i++) {
    if (nectar >= RIPENESS_STAGES[i].nectar) {
      currentStageIndex = i;
    } else {
      break;
    }
  }
  const currentStage = RIPENESS_STAGES[currentStageIndex];
  const nextStage = currentStageIndex < RIPENESS_STAGES.length - 1 ? RIPENESS_STAGES[currentStageIndex + 1] : null;
  
  let progress = 100;
  if (nextStage) {
    progress = ((nectar - currentStage.nectar) / (nextStage.nectar - currentStage.nectar)) * 100;
  }
  
  return {
    currentStage,
    nextStage,
    progress: Math.min(Math.max(progress, 0), 100)
  };
};
