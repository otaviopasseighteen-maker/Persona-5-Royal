/* =====================================================
   PERSONA 5 ROYAL — SITE LOGIC
   Data-driven navigation + page interactions
===================================================== */

const loadingScreen = document.getElementById("loading-screen");
const loadingProgress = document.getElementById("loading-progress");
const loadingText = document.getElementById("loading-text");
const trailerScreen = document.getElementById("trailer-screen");
const mainSite = document.getElementById("main-site");
const skipTrailer = document.getElementById("skip-trailer");

if (loadingScreen && loadingProgress && loadingText) {
    document.body.classList.add("loading");
    let progress = 0;
    const messages = ["INITIALIZING METAVERSE...", "LOADING PHANTOM THIEVES...", "ACCESSING PALACES...", "SYNCHRONIZING PERSONAS...", "PREPARING TOKYO...", "WELCOME, PHANTOM THIEF."];
    const interval = setInterval(() => {
        progress = Math.min(100, progress + Math.floor(Math.random() * 8) + 3);
        loadingProgress.style.width = `${progress}%`;
        loadingText.textContent = messages[Math.min(messages.length - 1, Math.floor((progress / 100) * (messages.length - 1)))];
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add("loaded");
                document.body.classList.remove("loading");
                if (trailerScreen) trailerScreen.style.display = "flex";
            }, 500);
        }
    }, 120);
}

function closeTrailer() {
    if (!trailerScreen) return;
    trailerScreen.style.opacity = "0";
    trailerScreen.style.pointerEvents = "none";
    setTimeout(() => {
        trailerScreen.style.display = "none";
        if (mainSite) mainSite.classList.add("visible");
    }, 700);
}
if (skipTrailer) skipTrailer.addEventListener("click", closeTrailer);

/* =====================================================
   SITE NAVIGATION
===================================================== */
const menuButton = document.getElementById("menu-button");
const navigation = document.querySelector(".navbar nav");
if (menuButton && navigation) menuButton.addEventListener("click", () => navigation.classList.toggle("open"));
document.querySelectorAll(".navbar nav a").forEach(link => link.addEventListener("click", () => navigation?.classList.remove("open")));

/* =====================================================
   CHARACTER SELECTOR
===================================================== */
const characters = document.querySelectorAll(".character");
const characterButtons = document.querySelectorAll(".character-navigation button");
const characterNames = ["joker", "ryuji", "ann", "morgana", "yusuke", "makoto", "futaba", "haru", "akechi", "kasumi"];
let currentCharacter = 0;
function showCharacter(id) {
    characters.forEach(item => item.classList.toggle("active", item.dataset.character === id));
    characterButtons.forEach(button => button.classList.toggle("active", button.dataset.target === id));
    const index = characterNames.indexOf(id);
    if (index >= 0) currentCharacter = index;
}
characterButtons.forEach(button => button.addEventListener("click", () => showCharacter(button.dataset.target)));
if (characters.length) showCharacter("joker");
document.addEventListener("keydown", event => {
    if (!characters.length) return;
    if (event.key === "ArrowRight") currentCharacter = (currentCharacter + 1) % characterNames.length;
    else if (event.key === "ArrowLeft") currentCharacter = (currentCharacter - 1 + characterNames.length) % characterNames.length;
    else return;
    showCharacter(characterNames[currentCharacter]);
});

/* =====================================================
   DATA LAYER — JSON IS THE SOURCE OF TRUTH FOR NOW
===================================================== */
const DATA_FILES = {
    characters: "data/characters.json",
    palaces: "data/palaces.json",
    confidants: "data/confidants.json",
    personas: "data/personas.json",
    shadows: "data/shadows.json"
};

async function loadData(type) {
    const file = DATA_FILES[type];
    if (!file) throw new Error(`Unknown data type: ${type}`);
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Could not load ${file}`);
    return response.json();
}

/* =====================================================
   DATABASE ROUTER
   database.html?type=palaces&id=kamoshida
===================================================== */
function createDatabaseCard(item, type) {
    const card = document.createElement("article");
    card.className = "p5-card";
    card.dataset.id = item.id;
    card.dataset.type = type;
    if (type === "palaces") card.innerHTML = `<h2>${item.name}</h2><p>Location: ${item.location}</p><p>Sin: ${item.sin}</p><p>Boss: ${item.boss}</p>`;
    if (type === "characters") card.innerHTML = `<h2>${item.name}</h2><p>Codename: ${item.codename}</p><p>Role: ${item.role}</p><p>Persona: ${item.persona}</p>`;
    if (type === "confidants") card.innerHTML = `<h2>${item.name}</h2><p>Arcana: ${item.arcana}</p>`;
    if (type === "personas") card.innerHTML = `<h2>${item.name}</h2><p>Arcana: ${item.arcana}</p><p>Level: ${item.level}</p>`;
    if (type === "shadows") card.innerHTML = `<h2>${item.name}</h2><p>Persona: ${item.persona}</p><p>Arcana: ${item.arcana}</p><p>Level: ${item.level}</p>`;
    card.addEventListener("click", () => window.location.href = `database.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(item.id)}`);
    return card;
}

async function initializeDatabasePage() {
    const list = document.getElementById("database-list");
    const title = document.getElementById("database-title");
    const status = document.getElementById("database-status");
    if (!list || !title || !status) return;
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || "characters";
    const selectedId = params.get("id");
    try {
        const data = await loadData(type);
        const items = data[type] || [];
        title.textContent = type.toUpperCase();
        list.innerHTML = "";
        if (!items.length) { status.textContent = "No records found."; return; }
        if (selectedId) {
            const selected = items.find(item => item.id === selectedId);
            if (selected) {
                status.textContent = `Selected record: ${selected.name}`;
                list.appendChild(createDatabaseCard(selected, type));
                const back = document.createElement("a");
                back.href = `database.html?type=${encodeURIComponent(type)}`;
                back.textContent = "← VIEW ALL";
                list.appendChild(back);
                return;
            }
        }
        status.textContent = `${items.length} records loaded from JSON.`;
        items.forEach(item => list.appendChild(createDatabaseCard(item, type)));
    } catch (error) {
        console.error(error);
        status.textContent = "Database data could not be loaded.";
    }
}

/* =====================================================
   HOMEPAGE → DATABASE CONNECTIONS
===================================================== */
const databaseLinks = {
    palaces: "database.html?type=palaces",
    confidants: "database.html?type=confidants",
    characters: "database.html?type=characters"
};

const palaceCards = document.querySelectorAll("#palaces .p5-card");
palaceCards.forEach((card, index) => {
    const ids = ["kamoshida", "madarame", "kaneshiro", "futaba", "okumura", "shido"];
    if (ids[index]) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => window.location.href = `database.html?type=palaces&id=${ids[index]}`);
    }
});

document.querySelectorAll("#confidants .p5-card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => window.location.href = databaseLinks.confidants);
});

document.querySelectorAll(".hero-buttons a").forEach(link => {
    if (link.textContent.includes("ENTER THE DATABASE")) link.href = databaseLinks.characters;
    if (link.textContent.includes("EXPLORE PALACES")) link.href = databaseLinks.palaces;
});

initializeDatabasePage();
