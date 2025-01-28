// Update time every minute
function updateTime() {
    const timeEl = document.getElementById('time');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeEl.textContent = timeString;
}
setInterval(updateTime, 60000);
updateTime();

// Fetch weather data
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

// Fetch and display an RSS feed using a Cloudflare Pages API proxy
async function fetchRSSFeed(feedUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Cloudflare Pages API endpoint for RSS proxy
        const response = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
        if (!response.ok) throw new Error(`Failed to fetch feed: ${feedUrl}`);

        const text = await response.text();

        // Ensure proper XML parsing
        const cleanXML = text.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;");
        const parser = new DOMParser();
        const xml = parser.parseFromString(cleanXML, "application/xml");

        if (xml.querySelector("parsererror")) {
            throw new Error(`Error parsing XML for feed: ${feedUrl}`);
        }

        const items = Array.from(xml.querySelectorAll("item")).slice(0, 5).map(item => {
            const title = item.querySelector("title")?.textContent || "No title";
            const link = item.querySelector("link")?.textContent || "#";
            const description = item.querySelector("description")?.textContent || "";

            // Extract images if available
            const mediaUrl = item.querySelector("media\\:content, enclosure")?.getAttribute("url") ||
                description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;

            return { title, link, mediaUrl };
        });

        // Display the items
        const ul = document.createElement("ul");
        items.forEach(item => {
            const li = document.createElement("li");

            if (item.mediaUrl) {
                const mediaElement = createMediaElement(item.mediaUrl);
                li.appendChild(mediaElement);
            }

            const link = document.createElement("a");
            link.href = item.link;
            link.target = "_blank";
            link.textContent = item.title;
            li.appendChild(link);
            ul.appendChild(li);
        });

        container.innerHTML = "";
        container.appendChild(ul);

    } catch (error) {
        console.error(error);
        container.textContent = "Unable to fetch RSS feed.";
    }
}

// Helper function to create image/video elements
function createMediaElement(url) {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

    if (isImage) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Thumbnail";
        img.style = "width: 100px; height: 100px; object-fit: cover; margin-right: 10px;";
        img.onerror = () => { img.style.display = "none"; };
        return img;
    } else if (isVideo) {
        const video = document.createElement("video");
        video.src = url;
        video.style = "width: 100px; height: 100px; object-fit: cover; margin-right: 10px;";
        video.controls = true;
        video.onerror = () => { video.style.display = "none"; };
        return video;
    }
    return document.createElement("div"); // Empty div if no media is found
}

// Fetch multiple RSS feeds
fetchRSSFeed("https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", "rss-feed-1");
fetchRSSFeed("https://en.eroeronews.com/feed", "rss-feed-2");
fetchRSSFeed("https://feeds.bbci.co.uk/news/rss.xml", "rss-feed-3");

// To-Do List functionality
function addTask() {
    const taskInput = document.getElementById("new-task");
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const tasksUl = document.getElementById("tasks");
    const li = document.createElement("li");
    li.textContent = taskText;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";
    deleteButton.onclick = () => tasksUl.removeChild(li);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-button";
    editButton.onclick = () => editTask(li, taskText);

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    tasksUl.appendChild(li);

    // Click event to read task
    li.addEventListener("click", () => alert(taskText));

    taskInput.value = "";
}

function editTask(li, oldText) {
    const newText = prompt("Edit your task:", oldText);
    if (newText !== null && newText.trim() !== "") {
        li.firstChild.textContent = newText;
    }
}

document.getElementById("new-task").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
    }
});

// Notes functionality
function addNote() {
    const noteContent = document.getElementById("note-content").value.trim();
    if (noteContent === "") return;

    const notesList = document.getElementById("notes-list");
    const noteTitle = noteContent.split(" ").slice(0, 3).join(" ") || "Untitled Note";

    const noteDiv = document.createElement("div");
    noteDiv.textContent = noteTitle;

    const readButton = document.createElement("button");
    readButton.textContent = "Read";
    readButton.className = "read-button";
    readButton.onclick = () => alert(noteContent);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-button";
    editButton.onclick = () => editNote(noteDiv, noteContent);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";
    deleteButton.onclick = () => notesList.removeChild(noteDiv);

    noteDiv.appendChild(readButton);
    noteDiv.appendChild(editButton);
    noteDiv.appendChild(deleteButton);
    notesList.appendChild(noteDiv);

    // Click event to read note
    noteDiv.addEventListener("click", () => alert(noteContent));

    document.getElementById("note-content").value = "";
}

function editNote(noteDiv, oldContent) {
    const newContent = prompt("Edit your note:", oldContent);
    if (newContent !== null && newContent.trim() !== "") {
        noteDiv.firstChild.textContent = newContent.split(" ").slice(0, 3).join(" ") || "Untitled Note";
    }
}

document.getElementById("note-content").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addNote();
    }
});
