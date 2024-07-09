const axios = require('axios');
const xml2js = require('xml2js');
const snoowrap = require('snoowrap');
const cron = require('node-cron');
const http = require('http');

console.log('Starting the RSS to Reddit poster app...');

// Reddit API credentials
const r = new snoowrap({
    userAgent: 'MyRSSPoster/1.0',
    clientId: '#',
    clientSecret: '#',
    username: '#',
    password: '#'
});

console.log('Snoowrap instance created with Reddit credentials');

const subreddit = 'mysubreddit';
const rssUrl = 'https://example.com/rss/';
let lastCheckedDate = new Date(0);

console.log(`Subreddit set to: ${subreddit}`);
console.log(`RSS URL set to: ${rssUrl}`);
console.log(`Initial lastCheckedDate set to: ${lastCheckedDate}`);

async function isUrlAlreadyPosted(url) {
    console.log(`Checking if URL is already posted: ${url}`);
    try {
        const recentPosts = await r.getSubreddit(subreddit).getNew({ limit: 100 });
        for (const post of recentPosts) {
            if (post.selftext.includes(url)) {
                console.log(`URL found in post: ${post.title}`);
                return true;
            }
        }
        console.log(`URL not found in recent posts`);
        return false;
    } catch (error) {
        console.error(`Error checking if URL is already posted: ${error.message}`);
        return false;
    }
}

async function checkAndPostNewArticles() {
    console.log('Starting checkAndPostNewArticles function...');
    try {
        console.log(`Fetching RSS feed from ${rssUrl}...`);
        const response = await axios.get(rssUrl);
        console.log('RSS feed fetched successfully');

        console.log('Parsing XML data...');
        const result = await xml2js.parseStringPromise(response.data);
        console.log('XML data parsed successfully');

        const items = result.rss.channel[0].item;
        console.log(`Found ${items.length} items in the RSS feed`);

        let articlePosted = false;

        for (const item of items) {
            const pubDate = new Date(item.pubDate[0]);
            console.log(`Checking item published on: ${pubDate}`);

            if (pubDate > lastCheckedDate) {
                const title = item.title[0];
                const link = item.link[0];
                let description = item.description[0].replace(/<!\[CDATA\[|\]\]>/g, '').trim();

                description = description.replace(/\[.*$/, '').trim();

                description = description.replace(/\.{3,}$|…$/, '').trim();

                const lastPeriodIndex = description.lastIndexOf('.');
                if (lastPeriodIndex !== -1) {
                    description = description.substring(0, lastPeriodIndex + 1).trim();
                }

                console.log(`Cleaned description: "${description}"`);

                console.log(`Checking if article is already posted: ${link}`);
                const alreadyPosted = await isUrlAlreadyPosted(link);
                console.log(`Article already posted: ${alreadyPosted}`);

                if (!alreadyPosted) {
                    console.log(`New article found: "${title}"`);
                    console.log(`Posting to Reddit...`);

                    try {
                        const submission = await r.getSubreddit(subreddit).submitSelfpost({
                            title: title,
                            text: `${description}\n\nSource: ${link}`
                        });
                        console.log(`Successfully posted: ${title}`);

                        try {
                            await submission.approve();
                            console.log('Post approved successfully');
                        } catch (approveError) {
                            console.error(`Error approving post: ${approveError.message}`);
                        }

                        lastCheckedDate = pubDate;
                        console.log(`Updated lastCheckedDate to: ${lastCheckedDate}`);
                        articlePosted = true;
                        break;
                    } catch (postError) {
                        console.error(`Error posting to Reddit: ${postError.message}`);
                    }
                } else {
                    console.log(`Article "${title}" has already been posted. Checking next article.`);
                }
            } else {
                console.log(`No new articles found since last check`);
                break;
            }
        }

        if (!articlePosted) {
            console.log('No new articles found to post in this check');
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        console.error('Stack trace:', error.stack);
    }
    console.log('Finished checkAndPostNewArticles function');
}

console.log('Setting up cron job to run every hour...');
// Run the check every hour
cron.schedule('0 * * * *', () => {
    console.log('Cron job triggered, running checkAndPostNewArticles...');
    checkAndPostNewArticles();
});

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('RSS to Reddit poster is running');
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

console.log('RSS to Reddit poster is now running. Press Ctrl+C to stop.');

console.log('Performing initial check...');
checkAndPostNewArticles();