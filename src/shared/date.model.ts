import { Data } from './data.model';

export class Date {
  protected data: Data;

  constructor () {
  }

  getFullYear = (): number => {
    return this.data.getTst().year;
  };

  getMonth = (): number => {
    return this.data.getTst().month;
  };
  getDay = (): number => {
    return this.data.getTst().weekday;
  };

  getDate = (): number => {
    return this.data.getTst().day;
  };

  getHours = (): number => {
    return this.data.getTst().hour;
  };

  getMinutes = (): number => {
    return this.data.getTst().minute;
  };

  getSeconds = (): number => {
    return this.data.getTst().second;
  };

  getMilliseconds = (): number => {
    return this.data.getTst().millisecond;
  };

  getTime = (): number => {
    return this.data.getTst().time;
  };


  getUpdate = (): number => {
    return this.data.getTst().updated;
  };

  getEra = (): number => {
    return this.data.getTst().era;
  };

  getMoonState = (): number => {
    return this.data.getTst().moon;
  };

  getRatio = (): number => {
    return this.data.getTst().ratio;
  };


  setFullYear = (year: number): void => {
    this.data.getTst().year = year;
  };

  setMonth = (month: number): void => {
    this.data.getTst().month = month;
  };

  setDay = (day: number): void => {
    this.data.getTst().weekday = day;
  };

  setDate = (date: number): void => {
    this.data.getTst().day = date;
  };

  setHours = (hours: number): void => {
    this.data.getTst().hour = hours;
  };

  setMinutes = (minutes: number): void => {
    this.data.getTst().minute = minutes;
  };

  setSeconds = (seconds: number): void => {
    this.data.getTst().second = seconds;
  };

  setMilliseconds = (milliseconds: number): void => {
    this.data.getTst().millisecond = milliseconds;
  };

  setTime = (time: number): void => {
    this.data.getTst().time = time;
  };


  setUpdate = (update: number): void => {
    this.data.getTst().updated = update;
  };

  setEra = (era: number): void => {
    this.data.getTst().era = era;
  };

  setMoonState = (state: number): void => {
    this.data.getTst().moon = state;
  };

  setRatio = (ratio: number): void => {
    this.data.getTst().ratio = ratio;
  };
}
