const windowsContainer = document.getElementById('windows-container');
const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');
const timeElement = document.getElementById('time');
const taskbarApps = document.getElementById('taskbar-apps');

// In-memory file system
let fileSystem = [
  { name: 'notes.txt', content: 'This is notes.txt' },
  { name: 'todo.md', content: 'This is todo.md' }
];

startButton.addEventListener('click', () => {
  startMenu.classList.toggle('hidden');
});

function updateTime() {
  const now = new Date();
  timeElement.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
setInterval(updateTime, 1000);
updateTime();

window.addEventListener('load', () => {
  setTimeout(() => {
    const startupScreen = document.getElementById('startup-screen');
    startupScreen.style.opacity = 0;
    setTimeout(() => {
      startupScreen.style.display = 'none';
    }, 1000);
  }, 2000);
});

function createWindow(id, title, contentHTML) {
  let existing = document.getElementById(id);
  if (existing) {
    bringToFront(existing);
    return;
  }

  const win = document.createElement('div');
  win.classList.add('app-window');
  win.id = id;
  win.style.top = '100px';
  win.style.left = '100px';
  win.style.width = '400px';
  win.style.height = '300px';

  win.innerHTML = `
    <div class="titlebar">
      <span>${title}</span>
      <div class="window-controls">
        <button class="minimize-btn" title="Minimize">➖</button>
        <button class="maximize-btn" title="Maximize">🔳</button>
        <button class="close-btn" title="Close">&times;</button>
      </div>
    </div>
    <div class="content" style="height: calc(100% - 30px); overflow: auto;">${contentHTML}</div>
  `;

  windowsContainer.appendChild(win);

  // Create taskbar button
  const taskbarBtn = document.createElement('button');
  taskbarBtn.textContent = title;
  taskbarBtn.className = 'taskbar-btn';
  taskbarBtn.onclick = () => {
    if (win.style.display === 'none') {
      win.style.display = 'flex';
      bringToFront(win);
    } else {
      win.style.display = 'none';
    }
  };
  taskbarApps.appendChild(taskbarBtn);
  win.taskbarBtn = taskbarBtn;

  // Close window
  win.querySelector('.close-btn').onclick = () => {
    win.taskbarBtn.remove();
    win.remove();
  };

  // Minimize window
  win.querySelector('.minimize-btn').onclick = () => {
    win.style.display = 'none';
  };

  // Maximize / Restore window
  win.querySelector('.maximize-btn').onclick = () => {
    if (win.classList.contains('maximized')) {
      win.style.top = '100px';
      win.style.left = '100px';
      win.style.width = '400px';
      win.style.height = '300px';
      win.classList.remove('maximized');
    } else {
      win.style.top = '0';
      win.style.left = '0';
      win.style.width = '100%';
      win.style.height = 'calc(100% - 40px)';
      win.classList.add('maximized');
    }
  };

  let isDragging = false, offsetX, offsetY;
  const titlebar = win.querySelector('.titlebar');

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return; // Ignore drag if clicking buttons

    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    bringToFront(win);
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    win.style.left = (e.clientX - offsetX) + 'px';
    win.style.top = (e.clientY - offsetY) + 'px';
  });

  bringToFront(win);
}

let zIndexCounter = 1000;
function bringToFront(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

function openApp(app) {
  switch (app) {
    case 'explorer': openFileExplorer(); break;
    case 'settings': openSettings(); break;
    case 'notepad': openNotepad(); break;
    case 'browser': openBrowser(); break;
    case 'credits': openCredits(); break;
    case 'games': openGames(); break;
    default: alert(`App "${app}" not found.`);
  }
  startMenu.classList.add('hidden');
}

function openFileExplorer() {
  let fileList = fileSystem.map(file => `
    <div class="file" onclick="openFile('${file.name}')">📄 ${file.name}</div>
  `).join('');
  createWindow('file-explorer', 'File Explorer', `
    <div id="explorer-view">
      ${fileList}
    </div>
  `);
}

function openFile(filename) {
  let file = fileSystem.find(f => f.name === filename);
  if (!file) {
    alert('File not found');
    return;
  }
  createWindow(`file-${filename}`, filename, `
    <p><strong>${filename}</strong></p>
    <pre>${file.content}</pre>
  `);
}

function openSettings() {
  createWindow('settings', 'Settings', `
    <div>
      <label>
        <input type="checkbox" id="dark-mode-toggle" />
        Dark Mode
      </label>
      <br /><br />
      <label>
        Volume: <input type="range" id="volume-slider" min="0" max="100" value="50" />
      </label>
      <br /><br />
      <label>
        Username: <input type="text" id="username-input" placeholder="Enter username" />
      </label>
      <br /><br />
      <label>
        <input type="checkbox" id="launch-blank-toggle" />
        Launch apps in about:blank popup
      </label>
    </div>
  `);

  setTimeout(() => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.checked = document.body.classList.contains('dark-mode');
    darkModeToggle.onchange = () => {
      document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    };

    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.oninput = () => {
      console.log('Volume:', volumeSlider.value);
    };

    const usernameInput = document.getElementById('username-input');
    usernameInput.onchange = () => {
      alert(`Username changed to: ${usernameInput.value}`);
    };

    const launchBlankToggle = document.getElementById('launch-blank-toggle');
    launchBlankToggle.checked = localStorage.getItem('launchInBlank') === 'true';
    launchBlankToggle.onchange = () => {
      localStorage.setItem('launchInBlank', launchBlankToggle.checked);
    };
  }, 0);
}

function openNotepad() {
  createWindow('notepad', 'Notepad', `
    <textarea id="note-content" rows="10" style="width:100%; height:150px;"></textarea>
    <br />
    <input type="text" id="filename-input" placeholder="Enter filename" />
    <button onclick="saveNote()">Save</button>
  `);
}

function saveNote() {
  const content = document.getElementById('note-content').value;
  const filename = document.getElementById('filename-input').value.trim();
  if (!filename) {
    alert('Enter a filename');
    return;
  }

  fileSystem.push({ name: filename, content: content });
  alert(`Saved "${filename}"`);
}

function openBrowser() {
  createWindow('browser', 'XLITE Browser', `
    <input id="browser-url" type="text" placeholder="Enter URL" style="width: 80%;" />
    <button onclick="loadURL()">Go</button>
    <iframe id="browser-frame" src="about:blank" style="width: 100%; height: 85%; border: none; margin-top: 10px;"></iframe>
  `);
}

function loadURL() {
  const urlInput = document.getElementById('browser-url');
  const iframe = document.getElementById('browser-frame');
  let url = urlInput.value.trim();
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  iframe.src = url;
}

function openCredits() {
  createWindow('credits', 'Credits', `
    <div style="padding: 10px; font-size: 14px; line-height: 1.5; color: white;">
      <h2>XLITE Credits</h2>
      <p><strong>Developed by:</strong> xXmizzeryXx, @ho0ks, and others.</p>
      <p><strong>Collaboration:</strong> Elusion x VPLAZA</p>
      <p><strong>Special Thanks: VPLAZA</strong></p>
      <ul>
        <li>Community testers and supporters</li>
        <li>All open source projects used</li>
      </ul>
      <p>© 2025 XLITE. All rights reserved.</p>
    </div>
  `);
}

function openGames() {
  createWindow('games', 'Games', `
    <iframe src="games.html" style="width: 100%; height: 100%; border: none;"></iframe>
  `);
}
