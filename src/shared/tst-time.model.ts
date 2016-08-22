export interface TstTime {
  updated: number;
  time: number;
  era: number;
  year: number;
  month: number;
  weekday: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  moon: number; // mod 4: i: 0 = new, 1 = waxing, 2 = full, 3 = waning; i.x | x in percent
  ratio: number; // 1ms real time equals ratio ms lore time
}
