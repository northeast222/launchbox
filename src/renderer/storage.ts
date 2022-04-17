
import fs from 'fs';
import path from 'path';

const defaultStoragePath = './config';

export class Storage {
    static assertStoragePath(...paths: string[]): string {
        const fullPath = path.resolve(defaultStoragePath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        return path.resolve(defaultStoragePath, ...paths);
    }

    static write(file: string, content: string) {
        const filePath = this.assertStoragePath(file);
        fs.writeFileSync(filePath, content, 'utf-8');
    }

    static read(file: string): string | undefined {
        const filePath = this.assertStoragePath(file);
        if (!fs.existsSync(filePath)) {
            return undefined;
        }
        return fs.readFileSync(filePath, 'utf-8');
    }
}

export default Storage;