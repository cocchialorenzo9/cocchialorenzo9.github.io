import { useState, useEffect } from 'react';

export const typeColors = {
  easy: "#4CAF93",
  tempo: "#E8A838",
  long: "#7B68EE",
  race: "#E05C5C",
  swim: "#4FC3F7",
  rest: "#9E9E9E",
};

export const typeLabels = {
  easy: "Easy",
  tempo: "Quality",
  long: "Long Run",
  race: "RACE",
  swim: "Swim",
  rest: "Rest",
};

const activityLabels = {
  outdoor_running: "🏃 Run",
  indoor_running: "🏃 Treadmill",
  treadmill_running: "🏃 Treadmill",
  swimming: "🏊 Swim",
  open_water_swimming: "🏊 Swim",
  outdoor_cycling: "🚴 Bike",
  indoor_cycling: "🚴 Bike",
  walking: "🚶 Walk",
};

export function activityLabel(type) {
  if (activityLabels[type]) return activityLabels[type];
  if (!type) return "Session";
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatPace(minPerKm) {
  if (minPerKm == null) return "—";
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  return `${min}:${String(sec).padStart(2, '0')}/km`;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
