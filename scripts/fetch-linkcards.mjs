import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'linkcards.json');

// URL抽出用の正規表現
const URL_REGEX = /https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&*+,;=]+/g;

async function walkDir(dir) {
    let results = [];
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(await walkDir(fullPath));
        } else if (file.isFile() && fullPath.endsWith('.md')) {
            results.push(fullPath);
        }
    }
    return results;
}

function extractUrls(text) {
    const urls = new Set();
    let match;
    while ((match = URL_REGEX.exec(text)) !== null) {
        let url = match[0];
        // 末尾の記号を取り除く（Markdownのカッコなどにマッチした場合）
        url = url.replace(/[.,;:)\]]+$/, '');
        urls.add(url);
    }
    return Array.from(urls);
}

async function fetchOgp(url) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(5000) // 5s timeout
        });
        if (!res.ok) return null;
        const html = await res.text();

        let title = '';
        let desc = '';
        let image = '';

        // Extract Title
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (ogTitleMatch) {
            title = ogTitleMatch[1];
        } else {
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) title = titleMatch[1];
        }

        // Extract Description
        const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (ogDescMatch) {
            desc = ogDescMatch[1];
        } else {
            const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
            if (descMatch) desc = descMatch[1];
        }

        // Extract Image
        const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (ogImageMatch) {
            image = ogImageMatch[1];
        }

        // Decode HTML entities roughly
        title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        desc = desc.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

        if (!title && !desc && !image) return null;

        return { title, desc, image };
    } catch (e) {
        return null; // Ignore errors (timeout, invalid URL, etc)
    }
}

async function main() {
    console.log('--- Start fetching linkcards OGP ---');

    // Read existing cache
    let cache = {};
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        cache = JSON.parse(data);
    } catch (e) {
        // Assume file doesn't exist
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    }

    // Find all markdown files
    const mdFiles = await walkDir(CONTENT_DIR);
    console.log(`Found ${mdFiles.length} markdown files.`);

    // Extract all URLs
    const allUrls = new Set();
    for (const file of mdFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const urls = extractUrls(content);
        for (const url of urls) {
            allUrls.add(url);
        }
    }
    console.log(`Found ${allUrls.size} unique URLs.`);

    // Filter to only new URLs
    const urlsToFetch = Array.from(allUrls).filter(url => !cache.hasOwnProperty(url));
    console.log(`Need to fetch OGP for ${urlsToFetch.length} new URLs.`);

    let added = 0;
    // Process in batches of 10
    for (let i = 0; i < urlsToFetch.length; i += 10) {
        const batch = urlsToFetch.slice(i, i + 10);
        const promises = batch.map(async (url) => {
            const ogp = await fetchOgp(url);
            if (ogp) {
                cache[url] = ogp;
                added++;
                console.log(`[Fetched] ${url}`);
            } else {
                // Save empty or null to avoid re-fetching failed URLs
                cache[url] = null;
                console.log(`[Failed/No OGP] ${url}`);
            }
        });
        await Promise.all(promises);
    }

    if (added > 0 || urlsToFetch.length > 0) {
        await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), 'utf-8');
        console.log(`Saved ${added} new OGP records to data/linkcards.json`);
    } else {
        console.log('No new OGP records to save.');
    }
    console.log('--- Done ---');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
