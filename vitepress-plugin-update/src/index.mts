// vitepress-update-plugin/index.mjs
import fs from 'fs-extra';
import path from 'path';
import { format } from 'date-fns';

interface FileInfo {
    name: string;
    path: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 扫描目录并生成更新列表
 */
function generateUpdateList(baseDir: string, outputFile: string) {
    function scanDirectory(dir: string): FileInfo[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files: FileInfo[] = [];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files = files.concat(scanDirectory(fullPath));
            } else if (entry.name.endsWith('.md')) {
                const stats = fs.statSync(fullPath);
                files.push({
                    name: entry.name,
                    path: fullPath,
                    createdAt: stats.birthtime,
                    updatedAt: stats.mtime,
                });
            }
        }
        return files;
    }

    const files = scanDirectory(baseDir);
    const grouped: Record<string, FileInfo[]> = files.reduce((acc, file) => {
        const date = format(file.createdAt, 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = []; // 初始化分组数组
        acc[date].push(file);
        return acc;
    }, {} as Record<string, FileInfo[]>); // 类型断言
    const sortedGroups = Object.keys(grouped).sort();

    let content = '# 更新文章列表\n\n';
    for (const date of sortedGroups) {
        content += `## ${date}\n`;
        const items = grouped[date].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        for (const item of items) {
            const relativePath = path.relative(baseDir, item.path);
            content += `- **[${item.name}](${relativePath})**  
  创建时间: ${format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}  
  更新时间: ${format(item.updatedAt, 'yyyy-MM-dd HH:mm:ss')}\n\n`;
        }
    }

    fs.writeFileSync(outputFile, content, 'utf8');
    console.log('Base Directory:', path.resolve(baseDir));
    console.log('Output File:', path.resolve(outputFile));

}

export default function vitePressUpdatePlugin(options) {
    const { baseDir = './', outputFile = './ResentUpdate.md' } = options;

    return {
        name: 'vitepress-update-plugin',
        buildStart() {
            console.log('[vitepress-update-plugin] Generating update list...');
            generateUpdateList(baseDir, outputFile);
        },
        handleHotUpdate() {
            generateUpdateList(baseDir, outputFile);
        },
    };
}

