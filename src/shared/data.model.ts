import { TstTime } from './tst-time.model';
import * as settings from './settings.model';

export class Data {
    private settings: settings.Settings;
    private defaults: settings.Settings = {
        'game': {
            'start': 1396569600000, // UNIX time in milliseconds at 4-4-2014T00:00:00.000Z
            'era': 2,
            'year': 582,
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
            'day': 13755000,
            'night': 7200000
        },
        'moon': {
            'start': 1425169441000, // UNIX time in milliseconds at full moon
            'dark': 0.05,
            'full': 0.1,
            'way': 0.85,
            'length': 30,
        },
        'tst' : {
            'updated': 0,
            'time': 0,
            'era': 2,
            'year': 582,
            'month': 3,
            'weekday': 0,
            'day': 4,
            'hour': 12,
            'minute': 0,
            'second': 0,
            'millisecond': 0,
            'moon': 2, // mod 4: i: 0 = new, 1 = waxing, 2 = full, 3 = waning; i.x | x in percent
            'ratio': 4, // 1ms real time equals ratio ms lore time
        }
    };

    constructor(json_settings?: string) {
        if (!json_settings) {
            this.reset();
        } else {
            this.settings = JSON.parse(json_settings);
        }
    }

    reset = (): void => {
        this.settings = this.defaults;
    }

    createGame = (game: settings.Game): void => {
        this.settings.game = game;
    }

    createTime = (time: settings.Time): void => {
        this.settings.time = time;
    }

    createMoon = (moon: settings.Moon): void => {
        this.settings.moon = moon;
    }

    setTst = (tst: TstTime): void => {
        this.settings.tst = tst;
    }

    getGame = (): settings.Game => {
        return this.settings.game;
    }

    getTime = (): settings.Time => {
        return this.settings.time;
    }

    getMoon = (): settings.Moon => {
        return this.settings.moon;
    }

    getTst = (): TstTime => {
        return this.settings.tst;
    }

    toJSON = (): string => {
        return JSON.stringify(this.settings);
    }
}
