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













// Fetch and display a single RSS feed with images
async function fetchRSSFeed(feedUrl, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    try {
        const response = await fetch(feedUrl, {
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

            // Try to extract an image from media:content or description
            const mediaContent = item.querySelector('media\\:content, enclosure');
            const imageUrl = mediaContent?.getAttribute('url') || 
                             description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || 
                             'https://via.placeholder.com/100';

            return { title, link, imageUrl };
        });

        // Display the items in a list
        const ul = document.createElement('ul');
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${item.imageUrl}" alt="Thumbnail" style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px;">
                    <a href="${item.link}" target="_blank">${item.title}</a>
                </div>
            `;
            ul.appendChild(li);
        });
        container.innerHTML = '';
        container.appendChild(ul);
    } catch (error) {
        console.error(error);
        container.textContent = 'Unable to fetch RSS feed. Please try again later.';
    }
}

// Fetch a single RSS feed and display it
fetchRSSFeed('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'rss-feed-1');
