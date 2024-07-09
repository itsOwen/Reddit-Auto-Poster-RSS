# RSS to Reddit Poster

This Node.js application fetches articles from an RSS feed and posts them to a specified subreddit on Reddit. It checks for new articles every hour and posts only those that have not been posted before.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The RSS to Reddit Poster application is designed to automate the process of sharing articles from an RSS feed to a subreddit. It uses the `snoowrap` library to interact with the Reddit API and `axios` for fetching RSS feeds. The application runs on a schedule, checking for new articles every hour, and posting them to the specified subreddit if they haven't been posted before.

## Features

- Fetches articles from an RSS feed.
- Posts new articles to a specified subreddit.
- Ensures that duplicate articles are not posted.
- Runs automatically every hour using a cron job.
- Provides a simple HTTP server to indicate the application is running.

## Requirements

- Node.js (version 12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/itsOwen/Reddit-Auto-Poster-RSS.git
    cd Reddit-Auto-Poster-RSS
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1. Open the `index.js` file and replace the placeholders with your Reddit API credentials, subreddit name, and RSS feed URL:
    ```javascript
    const r = new snoowrap({
        userAgent: 'MyRSSPoster/1.0',
        clientId: 'your_client_id',
        clientSecret: 'your_client_secret',
        username: 'your_reddit_username',
        password: 'your_reddit_password'
    });

    const subreddit = 'your_subreddit';
    const rssUrl = 'https://example.com/rss/';
    ```

## Usage

1. Start the application:
    ```bash
    node index.js
    ```

2. The application will start and perform an initial check for new articles. It will continue to check every hour and post new articles to the specified subreddit.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.