const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');

/**
 * 扫描目录并生成更新列表
 * @param {string} baseDir - 要扫描的根目录
 * @param {string} outputFile - 输出的 Markdown 文件路径
 */
function generateUpdateList(baseDir, outputFile) {
    // 递归扫描 Markdown 文件
    function scanDirectory(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        let files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files = files.concat(scanDirectory(fullPath)); // 递归子目录
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

    // 按创建日期分组
    const grouped = files.reduce((acc, file) => {
        const date = format(file.createdAt, 'yyyy-MM-dd'); // 格式化创建日期
        if (!acc[date]) acc[date] = [];
        acc[date].push(file);
        return acc;
    }, {});

    const sortedGroups = Object.keys(grouped).sort(); // 按日期排序

    // 生成 Markdown 内容
    let content = '# 更新文章列表\n\n';
    for (const date of sortedGroups) {
        content += `## ${date}\n`;
        const items = grouped[date].sort((a, b) => a.createdAt - b.createdAt); // 按时间排序
        for (const item of items) {
            const relativePath = path.relative(baseDir, item.path); // 转为相对路径
            content += `- **[${item.name}](${relativePath})**  
  创建时间: ${format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}  
  更新时间: ${format(item.updatedAt, 'yyyy-MM-dd HH:mm:ss')}\n\n`;
        }
    }

    // 写入文件
    fs.writeFileSync(outputFile, content, 'utf8');
}

/**
 * VitePress 插件
 * @param {Object} options - 插件配置
 */
function vitePressUpdatePlugin(options) {
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

module.exports = vitePressUpdatePlugin;
