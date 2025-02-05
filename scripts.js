// Update time every minute
function updateTime() {
    const timeEl = document.getElementById('time');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeEl.textContent = timeString;
}
setInterval(updateTime, 60000); 
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

// Fetch and display RSS feed with images or videos using a Cloudflare Worker
async function fetchRSSFeed(feedUrl, containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    try {
        const workerUrl = 'https://newtab.nocthyr.workers.dev/?url=' + encodeURIComponent(feedUrl);
        const response = await fetch(workerUrl);

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

            const mediaContent = item.querySelector('media\\:content, enclosure');
            const mediaUrl = mediaContent?.getAttribute('url') || 
                             description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || 
                             null;

            return { title, link, mediaUrl };
        });

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


// To-Do List functionality
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const tasksUl = document.getElementById('tasks');
    const li = document.createElement('li');
    li.textContent = taskText;

    // Make the task draggable
    li.setAttribute('draggable', true);
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = () => tasksUl.removeChild(li);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-button';
    editButton.onclick = () => editTask(li, taskText);

    li.appendChild(editButton);
    li.appendChild(deleteButton);
    tasksUl.appendChild(li);

    // Add click event to read the task
    li.addEventListener('click', () => alert(taskText));

    taskInput.value = ''; // Clear the input field
}

function editTask(li, oldText) {
    const newText = prompt("Edit your task:", oldText);
    if (newText !== null && newText.trim() !== '') {
        li.firstChild.textContent = newText;
    }
}

document.getElementById('new-task').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Notes functionality
function addNote() {
    const noteContent = document.getElementById('note-content').value.trim();
    if (noteContent === '') return;

    const notesList = document.getElementById('notes-list');
    const noteTitle = noteContent.split(' ').slice(0, 3).join(' ') || 'Untitled Note';

    const noteDiv = document.createElement('div');
    noteDiv.textContent = noteTitle;

    // Make the note draggable
    noteDiv.setAttribute('draggable', true);
    noteDiv.addEventListener('dragstart', dragStart);
    noteDiv.addEventListener('dragover', dragOver);
    noteDiv.addEventListener('drop', drop);

    const readButton = document.createElement('button');
    readButton.textContent = 'Read';
    readButton.className = 'read-button';
    readButton.onclick = () => alert(noteContent);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-button';
    editButton.onclick = () => editNote(noteDiv, noteContent);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.onclick = () => notesList.removeChild(noteDiv);

    noteDiv.appendChild(readButton);
    noteDiv.appendChild(editButton);
    noteDiv.appendChild(deleteButton);
    notesList.appendChild(noteDiv);

    // Add click event to read the note
    noteDiv.addEventListener('click', () => alert(noteContent));

    document.getElementById('note-content').value = ''; // Clear the textarea
}

function editNote(noteDiv, oldContent) {
    const newContent = prompt("Edit your note:", oldContent);
    if (newContent !== null && newContent.trim() !== '') {
        noteDiv.firstChild.textContent = newContent.split(' ').slice(0, 3).join(' ') || 'Untitled Note';
    }
}

document.getElementById('note-content').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent newline in textarea
        addNote();
    }
});

// Drag and Drop Functions
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.outerHTML);
    e.dataTransfer.effectAllowed = 'move';
}

function dragOver(e) {
    e.preventDefault(); // Prevent default to allow drop
}

function drop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const newElement = document.createElement('div');
    newElement.innerHTML = data;
    this.parentNode.insertBefore(newElement, this.nextSibling);
    this.parentNode.removeChild(this);
}

// Initialize draggable functionality for existing tasks and notes
function initializeDraggable() {
    const tasks = document.querySelectorAll('#tasks li');
    tasks.forEach(task => {
        task.setAttribute('draggable', true);
        task.addEventListener('dragstart', dragStart);
        task.addEventListener('dragover', dragOver);
        task.addEventListener('drop', drop);
    });

    const notes = document.querySelectorAll('#notes-list div');
    notes.forEach(note => {
        note.setAttribute('draggable', true);
        note.addEventListener('dragstart', dragStart);
        note.addEventListener('dragover', dragOver);
        note.addEventListener('drop', drop);
    });
}

// Call initializeDraggable after adding tasks and notes
initializeDraggable();

// Search function
function search() {
    const query = document.getElementById('search-input').value;
    if (query) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
}
