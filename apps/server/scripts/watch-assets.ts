import chokidar from 'chokidar';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');
const watchMode = process.argv.includes('--watch');

function isAsset(filePath: string): boolean {
    return filePath.endsWith('.json');
}

function getDistPath(srcPath: string): string {
    const relativePath = path.relative(SRC_DIR, srcPath);
    return path.join(DIST_DIR, relativePath);
}

function copyFile(srcPath: string) {
    if (!isAsset(srcPath)) return;
    const destPath = getDistPath(srcPath);
    fs.mkdirSync(path.dirname(destPath), {
        recursive: true,
    });
    fs.copyFileSync(srcPath, destPath);
    console.log(`[assets] copied ${srcPath}`);
}

function deleteFile(srcPath: string): void {
    if (!isAsset(srcPath)) {
        return;
    }

    const destPath = getDistPath(srcPath);

    if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
        console.log(`[assets] deleted ${destPath}`);
    }
}

function copyAllAssets(dir: string): void {
    const entries = fs.readdirSync(dir, {
        withFileTypes: true,
    });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (!entry.isDirectory()) {
            copyFile(fullPath);
        } else {
            copyAllAssets(fullPath);
        }
    }
}

function main() {
    if (watchMode) {
        console.log('[assets] watch mode enabled');
        chokidar
            .watch(SRC_DIR, {
                ignoreInitial: true,
            })
            .on('add', copyFile)
            .on('change', copyFile)
            .on('unlink', deleteFile);
    } else {
        copyAllAssets(SRC_DIR);
    }
}

void main();
