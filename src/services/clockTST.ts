/**
 * @author Arne Rantzen <Tyx> http://rantzen.net
 *
 * Class clockTST - Holds static functions to deal with Clock - Tamriel Standard Time
 */

import {
  Injectable
} from '@angular/core';

export interface ITst {
  updated: number;
  year: number;
  month: number;
  weekday: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  ratio: number; // 1ms real time equals ratio ms lore time
}

export interface ISettings {
  game: {
    'start': number,
    'era': number,
    'year': number,
    'month': number,
    'weekday': number,
    'day': number,
    'calendar': number[],
  };
  time: {
    'start': number,
    'day': number,
    'night': number,
  };
  moon: {
    'start': number,
    'state': number,
    'waxing': boolean,
    'cycle': number,
    'full': number,
    'new': number,
    'way': number
  };
  format: {
    'lore': string
  };
  tst ?: ITst;
}
export interface IYear {
  era: number;
  year: number;
}

@Injectable()
  /**
   * TSTDate works similiar to the JS Date class. But instead of a real time date it is an enviroment for the
   * The Elder Scrolls Online time or any time which will be defined.
   */
export class TSTDate {
  static _Version: number = 0.1;
  private settings: ISettings;
  private time: number;
  private defaults: ISettings = {
    'game': {
      'start': 1396569600000,
      'era': 2,
      'year': 382,
      'month': 4,
      'weekday': 0,
      'day': 4,
      'calendar': [
        31,
        28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
      ]
    },
    'time': {
      'start': 1398044126000, // UNIX time in milliseconds at noon
      'day': 20955000,
      'night': 7200000
    },
    'moon': {
      'start': 1425169441000,
      'state': 1, // in percent -- 1 = full, 0 = new
      'waxing': false,
      'cycle': 30, // length of a full cycle
      'full': 0.1, // in percent of time
      'new': 0.05,
      'way': 0.85
    },
    'format': {
      'lore': '_DDD, _D. _MMM _YY _hh:_mm_ss'
    }
  };

  /**
   *
   * @param milliseconds set a specific time as the current time in ms
   * @param cookie @TODO use cookies to save the settings and data
   */
  constructor(milliseconds ?: number, cookie = false) {

    this.time = 0;
    if (milliseconds) {
      this.time = milliseconds;
    }

    if (cookie) {
      // @TODO: Load Settings from Cookie
      this.settings = this.defaults;
      this.update();
    } else {
      let set = this.defaults;
      let game = set.game;
      let time = set.time;

      let daylength = (time.day + time.night);
      // if day at game start is not the first day of the month
      while (game.day > 1) {
        game.start -= daylength;
        game.day--;
      }
      // if month at game start is not the first month of the year
      while (game.month > 1) {
        // -2 because we have 01.04. -1 because 3 is april and -2 because we need march length
        game.start -= daylength * game.calendar[game.month - 2];
        game.month--;
      }
      this.settings = set;
      this.settings.tst = this.init();
    }
  }

  /**
   * @returns the year
   */
  getFullYear() {
      this.update();
      return {
        era: this.settings.game.era,
        year: this.settings.tst.year
      };
    }
    /**
     * @returns the month (from 0-11)
     */
  getMonth() {
    this.update();
    return this.settings.tst.minute;
  }

  /**
   * @returns the day of the month (from 1-31)
   */
  getDate() {
    this.update();
    return this.settings.tst.day;
  }

  /**
   * @returns the day of the week (from 0-6)
   */
  getDay() {
    this.update();
    return this.settings.tst.weekday;
  }

  /**
   * @returns the hours (from 0-23)
   */
  getHours() {
    this.update();
    return this.settings.tst.hour;
  }

  /**
   * @returns the minutes (from 0-59)
   */
  getMinutes() {
    this.update();
    return this.settings.tst.minute;
  }

  /**
   * @returns the seconds (from 0-59)
   */
  getSeconds() {
    this.update();
    return this.settings.tst.second;
  }

  /**
   * @returns the milliseconds (from 0-999)
   */
  getMilliseconds() {
    this.update();
    return this.settings.tst.millisecond;
  }

  /**
   * @returns the number of milliseconds (in lore time) since game start
   */
  now() {
    this.update();
    let milliseconds = Date.now();
    milliseconds -= this.settings.game.start;
    milliseconds = milliseconds * this.settings.tst.ratio;
    return milliseconds;
  }

  /**
   * JSON = ISO-8601
   * Changed for Tamriel: E-YYY-MM-DDTHH:mm:ss.sssZ
   * where E stands for era
   *
   * @returns the date as a string, formatted as a JSON date
   */
  toJSON() {
    this.update();
    let tst = this.settings.tst;
    let date = [
      this.settings.game.era,
      tst.year,
      tst.month,
      tst.day
    ];
    let time = [
      tst.hour,
      tst.minute,
      tst.second
    ];
    let ms = tst.millisecond.toString();
    while (ms.length < 3) {
      ms = '0'.concat(ms);
    }
    let out = date.join('-').concat('T', time.join(':'), '.', ms, 'Z');
    return out;
  }

  /**
   * Set the start of any game
   *
   * @param milliseconds in UTC, midnight first day of time
   */
  setGameStart(milliseconds: number) {
    this.settings.game.start = milliseconds;
    this.settings.tst = this.init();
  }

  /**
   * Create new values for the time calculation
   * @param era
   * @param year
   * @param month
   * @param day
   */
  setGameValues(era: number, year: number, month: number, weekday: number, day: number) {
    let game = this.settings.game;
    game.era = era;
    game.year = year;
    game.month = month;
    game.weekday = weekday;
    game.day = day;
    this.settings.game = game;
    this.settings.tst = this.init();
  }

  /**
   * Set the start of any time
   *
   * @param milliseconds in UTC, midnight first day of time
   */
  setTimeStart(milliseconds: number) {
    this.settings.time.start = milliseconds;
    this.settings.tst = this.init();
  }

  /**
   *
   * @param day in ms
   * @param night in ms
   */
  setDayLength(day: number, night: number) {
    this.settings.time.day = day;
    this.settings.time.night = night;
    this.settings.tst = this.init();
  }

  /**
   * Set the start of a moon phase
   *
   * @param milliseconds in UTC at beginning of full moon
   */
  setMoonStart(milliseconds: number) {
    this.settings.moon.start = milliseconds;
  }

  /**
   *
   * @param full in percent (0-1)
   * @param way in percent
   * @param dark in percent (new moon)
   * @param days of the complete cycle (full to full)
   */
  setCycleLength(full: number, way: number, dark: number, days: number) {
    let moon = this.settings.moon;
    moon.state = 1;
    moon.waxing = false;

    moon.full = full;
    moon.way = way;
    moon.new = dark;

    moon.cycle = days;

    this.settings.moon = moon;
  }

  /**
   *
   * @param timeSinceUpdate
   * @param ratio
   * @returns {{
   *  updated: number,
   *  year: number, month: number, weekday: number, day: number,
   *  hour: number, minute: number, second: number, millisecond: number,
   *  ratio: number}}
   */
  private createTST(timeSinceUpdate: number, ratio = 1) {
    let time = this.settings.time;
    let game = this.settings.game;
    let tst = this.settings.tst;

    let lengthDay = (time.day + time.night);
    let daysInYear = game.calendar.reduce((pv, cv) => pv + cv, 0); // days in year

    let year = tst.year;
    while (timeSinceUpdate - daysInYear * lengthDay >= 0) {
      timeSinceUpdate -= daysInYear * lengthDay;
      year++;
    }

    let month = tst.month;
    while (timeSinceUpdate - game.calendar[month - 1] * lengthDay >= 0) {
      timeSinceUpdate -= game.calendar[month - 1] * lengthDay;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    let day = tst.day;
    while (timeSinceUpdate - lengthDay >= 0) {
      timeSinceUpdate -= lengthDay;
      day++;
      if (day > game.calendar[month - 1]) {
        day = 1;
        month++;
      }
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    let weekday = year - tst.year;
    weekday = weekday * daysInYear;
    for (let i = 1; i < month; i++) {
      weekday += game.calendar[i];
    }
    weekday += day;
    weekday += tst.weekday;
    weekday = weekday % 7;

    let s = 1000; // 1000ms = 1s
    let t = 60; // 60s = 1m, 60m = 1h

    console.log(timeSinceUpdate);
    let seconds = tst.second;
    while (timeSinceUpdate - s >= 0) {
      timeSinceUpdate -= s;
      seconds++;
    }

    let minutes = tst.minute;
    while (seconds - t >= 0) {
      seconds -= t;
      minutes++;
    }

    let hours = tst.hour;
    while (minutes - t >= 0) {
      minutes -= t;
      hours++;
      if (hours > 23) {
        day++;
        hours = 0;
      }
    }

    if (day > game.calendar[month - 1]) {
      day -= game.calendar[month - 1];
      month++;
    }
    if (month > game.calendar.length) {
      year++;
      month = 1;
    }

    let milliseconds = tst.millisecond + timeSinceUpdate;

    return {
      updated: Date.now(),
      year: year,
      month: month,
      weekday: weekday,
      day: day,
      hour: hours,
      minute: minutes,
      second: seconds,
      millisecond: milliseconds,
      ratio: ratio
    };
  }

  /**
   * Calc will calculate the current TST
   * @returns {{updated: number,
   *            year: number, month: number, day: number,
   *            hour: number, minute: number, second: number, millisecond: number}}
   */
  private calc(): ITst {
      let time = this.settings.time;
      let game = this.settings.game;
      this.settings.tst = {
        updated: game.start,
        year: game.year,
        month: game.month,
        weekday: game.weekday,
        day: game.day,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        ratio: 1
      };
      let midnight: number; // midnight in lore time at time of sync
      midnight = time.start - (time.day + time.night) / 2;
      let timeSinceStart: number;
      if (this.time === 0) {
        timeSinceStart = Date.now(); // current real time in ms
      } else {
        timeSinceStart = this.time; // set time @TODO: Must be bigger than game.start
      }
      timeSinceStart = Math.abs(timeSinceStart - game.start); // ms since game start

      return this.createTST(timeSinceStart);
    }
    /**
     * initial function. Will create the Tamriel Standard Time data
     * @returns {ITst}
     */
  private init(): ITst {
    let t1 = this.calc();
    if (this.time !== 0) {
      return t1;
    }
    let t2 = this.calc();
    let realDif = t1.updated - t2.updated;
    let loreDif = t1.millisecond + t1.second * 1000 + t1.minute * 60 * 1000;
    loreDif -= t2.millisecond + t2.second * 1000 + t2.minute * 60 * 1000;
    t2.ratio = loreDif / realDif;
    return t2;
  }

  /**
   * Updates the saved data to the current time.
   */
  private update(): void {
    let tst = this.settings.tst;
    let time = Date.now();

    time -= tst.updated; // ms in real time since update
    time = time * tst.ratio; // ms in lore time since update

    tst = this.createTST(time, tst.ratio);
    this.settings.tst = tst;
  }
}
