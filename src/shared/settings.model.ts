import { TstTime } from './tst-time.model';

export interface Game {
    start: number;
    era: number;
    year: number;
    month: number;
    weekday: number;
    day: number;
    calendar: number[];
}

export interface Time {
    start: number;
    day: number;
    night: number;
}

export interface Moon {
    start: number;
    dark: number;
    full: number;
    way: number;
    length: number;
}

/**
 * Settings to be safed
 */
export interface Settings {
  // game states the start values of the game
  game: Game;
  // time states the start of the time messurment and the length of day and night
  time: Time;
  // moon states the values of the moon cycle and the start time.
  moon: Moon;
  // current time in TST - EMPTY at start of calculation
  tst: TstTime;
}
