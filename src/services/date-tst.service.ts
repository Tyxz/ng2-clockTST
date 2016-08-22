import { Injectable } from '@angular/core';

import * as models from '../shared';

const state = {
  dark : 0,
  waxing : 1,
  full : 2,
  waning : 3,
};

@Injectable()
class DateTSTService extends models.Date {
  private game: models.Game;
  private time: models.Time;
  private moon: models.Moon;
  private lengthDay: number;
  private lengthCycle: number;
  private Cookie = models.Cookie;
  private cookie_name = 'clockTST';

  static now = () => {
    let date = new DateTSTService();
    return date.getTime();
  }

  constructor () {
    super();
    let st = Date.now();
    console.log('start time: '.concat(st.toString()));

    let C = this.Cookie;
    let name = this.cookie_name;

    if (C.check(name)) {
      this.data = new models.Data(C.get(name));
      this.init(true);
    } else {
      this.data = new models.Data();
      this.init(false);
    }

    console.log('update:before: '.concat((Date.now() - st).toString()));
    this.update();
    console.log('update:after: '.concat((Date.now() - st).toString()));
  }

  private createMoonState = (timeSinceUpdate: number, moon_state: number): number => {
    // Create phase times in ms based on length of one day
    let full = this.moon.full * this.lengthCycle;
    let dark = this.moon.dark * this.lengthCycle;
    let way = this.moon.way * this.lengthCycle;
    let waxing = dark + way;

    let stateTime: number;
    if (moon_state > state.waxing) {
      if (moon_state > state.full) {
        if (moon_state > state.waning) { // waning
          stateTime = waxing + full;
          stateTime += (moon_state - state.waning) * way;
        } else { // full
          stateTime = waxing;
          stateTime += (moon_state - state.full) * full;
        }
      } else { // waxing
          stateTime = dark;
          stateTime += (moon_state - state.waxing) * way;
      }
    } else { // dark
          stateTime = state.dark;
          stateTime += (moon_state) * dark;
    }

    timeSinceUpdate += stateTime;
    while (timeSinceUpdate > this.lengthCycle) {
      timeSinceUpdate -= this.lengthCycle;
    }

    if (timeSinceUpdate > dark) {
      if (timeSinceUpdate > waxing) {
        if (timeSinceUpdate > waxing + full) { // waning
          timeSinceUpdate -= waxing + full;
          moon_state = state.waning;
          moon_state += timeSinceUpdate / way;
        } else { // full
          timeSinceUpdate -= waxing;
          moon_state = state.full;
          moon_state += timeSinceUpdate / full;
        }
      } else { // waxing
          timeSinceUpdate -= dark;
          moon_state = state.waxing;
          moon_state += timeSinceUpdate / way;
      }
    } else { // dark
          moon_state = state.dark;
          moon_state += timeSinceUpdate / dark;
    }
    return moon_state;
  }

  private createStart = (): { game_start: number, moon_state: number } => {
    // Start time
    let timeDiff = this.time.start - this.game.start;
    while (timeDiff > this.lengthDay) {
      timeDiff -= this.lengthDay;
    }
    let game_start = this.game.start + timeDiff;
    // Moon phase
    let moon_state = this.getMoonState();
    timeDiff = this.moon.start - game_start;
    while (timeDiff > this.lengthCycle) {
      timeDiff -= this.lengthCycle;
    }
    moon_state = this.createMoonState(timeDiff, moon_state);
    return { game_start, moon_state};
  }

  private createTst = (timeSinceUpdate: number, time: models.TstTime): models.TstTime => {
    time.time += timeSinceUpdate;

    let hour = this.lengthDay / 24;
    let minute = hour / 60;
    let second = minute / 60;
    let millisecond = second / 1000;

    timeSinceUpdate += time.hour * hour;
    timeSinceUpdate += time.minute * minute;
    timeSinceUpdate += time.second * second;
    timeSinceUpdate += time.millisecond * millisecond;

    let days = Math.floor(timeSinceUpdate / this.lengthDay);
    let day = timeSinceUpdate % this.lengthDay;

    while (days > 0) {
      time.day++;
      time.weekday++;
      time.weekday %= 7;
      if (time.day > this.game.calendar[time.month]) {
        time.day = 1;
        time.month++;
        if (time.month + 1 > this.game.calendar.length) {
          time.month = 0;
          time.year++;
        }
      }
      days--;
    }

    time.hour = Math.floor(day / hour);
    day -= time.hour * hour;
    time.minute = Math.floor(day / minute);
    day -= time.minute * minute;
    time.second = Math.floor(day / second);
    day -= time.second * second;
    time.millisecond = Math.floor(day / millisecond);

    return time;
  }

  private init = (hasTst: boolean): void => {
    this.game = this.data.getGame();
    this.time = this.data.getTime();
    this.moon = this.data.getMoon();
    this.lengthDay = this.time.day + this.time.night;
    this.lengthCycle = this.moon.length * this.lengthDay;

    if (!hasTst) {
      let start = this.createStart();
      this.game.start = start.game_start;
      this.setMoonState(start.moon_state);
      this.setUpdate(this.game.start);

      let day = 24 * 60 * 60 * 1000;
      this.setRatio(day / this.lengthDay);
    }
  }

  private addZeros = (num: number, length: number): string => {
    let number = num.toString();
    while (number.length < length) {
      number = '0'.concat(number);
    }
    return number;
  }

  update = (time = Date.now()): void => {
    let update = time;
    time -= this.getUpdate();
    let tstTime = this.data.getTst();

    tstTime = this.createTst(time, tstTime);
    this.setUpdate(update);
    this.data.setTst(tstTime);
    this.Cookie.set(this.cookie_name, this.data.toJSON());
  }

  toString = (): string => {
    this.update();
    let date = [
      this.getEra(),
      this.getFullYear(),
      this.addZeros(this.getMonth(), 2),
      this.addZeros(this.getDate(), 2)
    ];
    let seconds = this.addZeros(this.getSeconds(), 2);
    seconds = seconds.concat('.', this.addZeros(this.getMilliseconds(), 3));
    let time = [
      this.addZeros(this.getHours(), 2),
      this.addZeros(this.getMinutes(), 2),
      seconds
    ];
    let moon = this.getMoonState().toFixed(2);
    let out = moon.concat('M', date.join('-'), 'T', time.join(':'), 'Z');
    return out;
  }

  toJSON = (): string => {
    return JSON.stringify(this.data.getTst());
  }

}

export { DateTSTService as DateTST};
