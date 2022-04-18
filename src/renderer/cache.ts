
import dayjs from 'dayjs';

interface CacheRecord {
    ttl: number;
    value: any;
}

const cacheMap: Record<string, CacheRecord> = {};

export class Cache {
    static get<T>(name: string): T | undefined {
        const record = cacheMap[name];
        if (record) {
            if (record.ttl <= dayjs().unix()) {
                delete cacheMap[name];
            } else {
                return record.value as T;
            }
        }
        return undefined;
    }

    static set<T>(name: string, value: T) {
        const record = cacheMap[name];
        if (record) {
            record.value = value;
            record.ttl = dayjs().add(30, 'second').unix();
        } else {
            cacheMap[name] = { value: value, ttl: dayjs().add(30, 'second').unix() };
        }
    }
}

export default Cache;