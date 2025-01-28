// Update time every second
function updateTime() {
    const timeEl = document.getElementById('time');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    timeEl.textContent = timeString;
}
setInterval(updateTime, 1000);
updateTime();

// Fetch weather data (using a placeholder API)
async function fetchWeather() {
    const weatherEl = document.getElementById('weather');
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true');
        const data = await response.json();
        const temp = data.current_weather.temperature;
        const condition = data.current_weather.weathercode;
        weatherEl.textContent = `Current Temperature: ${temp}°C, Condition: ${condition}`;
    } catch (error) {
        weatherEl.textContent = 'Unable to fetch weather data.';
    }
}
fetchWeather();

// Fetch and display a single RSS feed with images or videos using a proxy
async function fetchRSSFeed(feedUrl, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    try {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + feedUrl, {
            headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${feedUrl}`);
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');

        if (xml.querySelector('parsererror')) {
            throw new Error(`Error parsing XML for feed: ${feedUrl}`);
        }

        const items = Array.from(xml.querySelectorAll('item')).map(item => {
            const title = item.querySelector('title')?.textContent || 'No title';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';

            // Try to extract an image or video from media:content or description
            const mediaContent = item.querySelector('media\\:content, enclosure');
            const mediaUrl = mediaContent?.getAttribute('url') || 
                             description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || 
                             null; // Set to null if no media is found

            return { title, link, mediaUrl };
        });

        // Display the items in a list
        const ul = document.createElement('ul');
        items.forEach(item => {
            const li = document.createElement('li');
            const mediaElement = createMediaElement(item.mediaUrl);
            li.appendChild(mediaElement);
            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.textContent = item.title;
            li.appendChild(link);
            ul.appendChild(li);
        });
        container.innerHTML = '';
        container.appendChild(ul);
    } catch (error) {
        console.error(error);
        container.textContent = 'Unable to fetch RSS feed. Please try again later.';
    }
}

function createMediaElement(url) {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

    if (isImage) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Thumbnail';
        img.style = 'width: 100px; height: 100px; object-fit: cover; margin-right: 10px;';
        img.onerror = () => { img.style.display = 'none'; };
        return img;
    } else if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        video.style = 'width: 100px; height: 100px; object-fit: cover; margin-right: 10px;';
        video.controls = true;
        video.onerror = () => { video.style.display = 'none'; };
        return video;
    }
    return document.createElement('div'); // Return an empty div if no media is found
}

// Fetch multiple RSS feeds
fetchRSSFeed('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'rss-feed-1');
fetchRSSFeed('https://en.eroeronews.com/feed', 'rss-feed-2');
fetchRSSFeed('https://feeds.bbci.co.uk/news/rss.xml', 'rss-feed-3');
