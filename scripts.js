// Update time every minute
function updateTime() {
    const timeEl = document.getElementById('time');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeEl.textContent = timeString;
}
setInterval(updateTime, 60000);
updateTime();

// Fetch weather data (using Open-Meteo API)
async function fetchWeather() {
    const weatherEl = document.getElementById('weather');
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true');
        const data = await response.json();
        const temp = data.current_weather.temperature;
        weatherEl.textContent = `Current Temperature: ${temp}°C`;
    } catch (error) {
        weatherEl.textContent = 'Unable to fetch weather data.';
    }
}
fetchWeather();

// Fetch and display a single RSS feed using Cloudflare Pages Functions
async function fetchRSSFeed(feedUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
        if (!response.ok) throw new Error(`Failed to fetch feed: ${feedUrl}`);

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');

        if (xml.querySelector('parsererror')) throw new Error(`Error parsing XML for feed: ${feedUrl}`);

        const items = Array.from(xml.querySelectorAll('item')).slice(0, 5).map(item => {
            const title = item.querySelector('title')?.textContent || 'No title';
            const link = item.querySelector('link')?.textContent || '#';
            return { title, link };
        });

        // Display the items in a list
        container.innerHTML = `<ul>${items.map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a></li>`).join('')}</ul>`;

    } catch (error) {
        console.error(error);
        container.textContent = 'Unable to fetch RSS feed.';
    }
}

// Fetch multiple RSS feeds
fetchRSSFeed('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', 'rss-feed-1');
fetchRSSFeed('https://feeds.bbci.co.uk/news/rss.xml', 'rss-feed-2');

// To-Do List functionality
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const tasksUl = document.getElementById('tasks');
    const li = document.createElement('li');
    li.textContent = taskText;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => tasksUl.removeChild(li);

    li.appendChild(deleteButton);
    tasksUl.appendChild(li);
    taskInput.value = '';
}

document.getElementById('new-task').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
});

// Notes functionality
function addNote() {
    const noteContent = document.getElementById('note-content').value.trim();
    if (!noteContent) return;

    const notesList = document.getElementById('notes-list');
    const noteDiv = document.createElement('div');
    noteDiv.textContent = noteContent.substring(0, 20) + '...';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => notesList.removeChild(noteDiv);

    noteDiv.appendChild(deleteButton);
    notesList.appendChild(noteDiv);
    document.getElementById('note-content').value = '';
}

document.getElementById('note-content').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addNote();
    }
});
