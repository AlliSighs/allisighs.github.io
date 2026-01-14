(function() {
    // 1. Иконка (Умный поиск пути)
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    
    let prefix = '';
    // Ищем assets относительно CSS файла, это самый надежный способ
    const cssLink = document.querySelector('link[href*="css/style.css"]');
    if (cssLink) {
        const cssPath = cssLink.getAttribute('href');
        prefix = cssPath.replace('css/style.css', '');
    } else if (window.location.pathname.includes('/pages/')) {
        // Фоллбек, если css не найден
        prefix = '../../';
        if (window.location.pathname.includes('/discord/') || window.location.pathname.includes('/minecraft/') || window.location.pathname.includes('/utils/')) {
             prefix = '../../../';
        }
    }
    
    link.href = prefix + 'assets/siteicon.png';

    // 2. Инициализация языка
    function initLanguageSwitcher() {
        if (!document.getElementById('google-script')) {
            const s = document.createElement('script');
            s.id = 'google-script';
            s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.head.appendChild(s);
        }

        if (!document.getElementById('google_translate_element')) {
            const d = document.createElement('div');
            d.id = 'google_translate_element';
            document.body.appendChild(d);
        }

        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'ru',
                includedLanguages: 'en,ru',
                autoDisplay: false
            }, 'google_translate_element');
        };

        const isEn = document.cookie.includes('googtrans=/ru/en');

        function createLangButtons() {
            const container = document.createElement('div');
            container.className = 'lang-switcher-container';
            
            container.innerHTML = `
                <button class="lang-btn ${!isEn ? 'active' : ''}" id="btn-ru">RU</button>
                <button class="lang-btn ${isEn ? 'active' : ''}" id="btn-en">EN</button>
            `;

            container.querySelector('#btn-ru').onclick = (e) => {
                e.preventDefault();
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
                localStorage.removeItem('as_geo_checked');
                location.reload();
            };

            container.querySelector('#btn-en').onclick = (e) => {
                e.preventDefault();
                document.cookie = "googtrans=/ru/en; path=/";
                localStorage.setItem('as_geo_checked', '1');
                location.reload();
            };

            return container;
        }

        // Вставка кнопок языка
        const authScreen = document.getElementById('auth-screen');
        if (authScreen && !authScreen.querySelector('.lang-switcher-container')) {
            const btns = createLangButtons();
            authScreen.appendChild(btns);
        }

        // Логика поиска хедера для языка (универсальная)
        const header = document.querySelector('header');
        if (header && !header.querySelector('.lang-switcher-container')) {
            const btns = createLangButtons();
            const rightBlock = header.querySelector('.flex.items-center.gap-3:last-child');
            
            if (rightBlock) {
                // Обычная страница: вставляем в правый блок
                rightBlock.insertBefore(btns, rightBlock.firstChild);
            } else {
                // Портфолио: вставляем перед последним элементом (кнопкой выхода)
                const lastEl = header.lastElementChild;
                if(lastEl) {
                    header.insertBefore(btns, lastEl);
                    btns.style.marginRight = '10px'; // Отступ для портфолио
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }
})();

// --- CONFIG ---
const STORAGE_KEY = 'allisighs_local_user';
const DISCORD_TOKEN_KEY = 'allisighs_discord_token';
const DISCORD_USER_KEY = 'allisighs_discord_user_cache';
const MUSIC_URL = "https://zvukipro.com/uploads/files/2020-05/1588413238_kevin-macleod-8bit-dungeon-level.mp3"; 
const MUSIC_STATE_KEY = 'allisighs_music_state'; 

tailwind.config = {
    theme: {
        extend: {
            colors: { lime: '#ccff00', black: '#050505', dark: '#0a0a0a', glass: 'rgba(255, 255, 255, 0.03)', 'glass-hover': 'rgba(255, 255, 255, 0.08)', err: '#da373c', suc: '#23a559', wrn: '#f0b232' },
            fontFamily: { sans: ['"Inter"', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
            animation: { 'blob': 'blob 10s infinite', 'matrix': 'matrix 0.1s infinite' },
            keyframes: {
                blob: { '0%': { transform: 'translate(0px, 0px) scale(1)' }, '33%': { transform: 'translate(30px, -50px) scale(1.1)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }, '100%': { transform: 'translate(0px, 0px) scale(1)' } },
                matrix: { '0%': { opacity: '1' }, '50%': { opacity: '0.7', transform: 'skewX(-10deg)' }, '100%': { opacity: '1', transform: 'skewX(10deg)' } }
            }
        }
    }
}

// --- INIT ---
window.addEventListener('load', () => {
    const loader = document.getElementById('system-loader');
    if(loader) setTimeout(() => { loader.classList.add('hidden-screen'); }, 800);
    
    // Auth Check
    const savedName = localStorage.getItem(STORAGE_KEY);
    const authScreen = document.getElementById('auth-screen');
    const userGreeting = document.getElementById('user-greeting');
    const heroName = document.getElementById('hero-name');

    if (savedName) {
        if(authScreen) authScreen.style.display = 'none';
        if(userGreeting) userGreeting.textContent = savedName;
        if(heroName) heroName.textContent = savedName;
        const appContent = document.getElementById('app-content');
        if(appContent) appContent.classList.remove('opacity-0');
    } else {
        // Если мы НЕ в портфолио, требуем вход
        if(!window.location.pathname.includes('portfolio') && authScreen) {
             authScreen.style.display = 'flex';
        } else if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('portfolio')) {
             // Редирект с внутренних страниц
             window.location.href = '../../index.html';
        }
    }

    if(document.getElementById('discord-auth-overlay')) {
        checkDiscordAuth();
    }
    
    // Запуск музыки
    initMusicPlayer();
});

// --- MUSIC PLAYER (FIXED) ---
function initMusicPlayer() {
    // Проверка дублей
    if(document.querySelector('.music-trigger')) return;

    const header = document.querySelector('header');
    if (!header) return;

    // Создаем кнопку
    const btn = document.createElement('button');
    btn.className = "music-trigger relative text-gray-500 hover:text-white transition-colors group z-[100]";
    btn.title = "music: on/off";
    // Добавляем отступы, чтобы не прилипало
    btn.style.marginRight = "15px";
    btn.style.marginLeft = "15px";
    
    btn.innerHTML = `
        <span class="material-symbols-rounded text-[24px] music-icon">music_note</span>
        <div class="music-notes-container">
            <span class="material-symbols-rounded pixel-note note-1">music_note</span>
            <span class="material-symbols-rounded pixel-note note-2">music_note</span>
        </div>
    `;

    // --- ЛОГИКА ВСТАВКИ (FIXED) ---
    // 1. Ищем правый блок инструментов (div с gap-3)
    const toolsRight = header.querySelector('.flex.items-center.gap-3:last-child');
    
    if (toolsRight) {
        // Это страница инструментов -> вставляем внутрь блока
        // Ищем переключатель языка внутри
        const langSwitch = toolsRight.querySelector('.lang-switcher-container');
        if (langSwitch) {
            toolsRight.insertBefore(btn, langSwitch.nextSibling);
        } else {
            toolsRight.insertBefore(btn, toolsRight.firstChild);
        }
        btn.style.marginRight = "15px"; // margin внутри flex
        btn.style.marginLeft = "0";
    } else {
        // Это Портфолио (там нет gap-3 справа, там ссылка <a>) -> вставляем ПЕРЕД последним элементом
        const lastEl = header.lastElementChild;
        if (lastEl) {
            header.insertBefore(btn, lastEl);
        } else {
            header.appendChild(btn);
        }
    }

    // Аудио логика
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.3;

    // Восстановление состояния
    let savedState = JSON.parse(localStorage.getItem(MUSIC_STATE_KEY) || '{"isPlaying": false, "currentTime": 0}');
    audio.currentTime = savedState.currentTime;

    const togglePlay = () => {
        if(audio.paused) {
            const p = audio.play();
            if (p) {
                p.then(() => {
                    btn.classList.add('music-playing');
                    btn.querySelector('.music-icon').innerText = 'volume_up';
                    btn.style.color = '#ccff00';
                }).catch(e => {
                    console.log("Autoplay blocked", e);
                    btn.classList.add('animate-pulse'); // Подсказка юзеру нажать
                });
            }
        } else {
            audio.pause();
            btn.classList.remove('music-playing');
            btn.querySelector('.music-icon').innerText = 'music_note';
            btn.style.color = '';
            btn.classList.remove('animate-pulse');
        }
    };

    if(savedState.isPlaying) {
        togglePlay();
    }

    btn.onclick = (e) => {
        e.preventDefault(); // Чтобы не переходило по ссылкам если вдруг
        togglePlay();
    };

    window.addEventListener('beforeunload', () => {
        localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
            isPlaying: !audio.paused,
            currentTime: audio.currentTime
        }));
    });

    setInterval(() => {
        if(audio.paused) {
            btn.classList.add('music-beckon');
            setTimeout(() => { btn.classList.remove('music-beckon'); }, 4000);
        }
    }, 15000);
}

// --- SYSTEM FUNCTIONS ---
function register(event) {
    event.preventDefault();
    const input = document.getElementById('nickname-input');
    const name = input.value.trim();
    if (name) {
        localStorage.setItem(STORAGE_KEY, name);
        location.reload();
    }
}

function loginAnon() {
    localStorage.setItem(STORAGE_KEY, "аноним");
    location.reload();
}

function logout() {
    if(confirm('выйти из системы?')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MUSIC_STATE_KEY); 
        window.location.href = window.location.href.includes('pages') ? '../../index.html' : 'index.html';
    }
}

function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    const text = el.textContent || el.innerText;
    navigator.clipboard.writeText(text).then(() => alert('скопировано!'));
}

async function checkDiscordAuth() {
    const token = localStorage.getItem(DISCORD_TOKEN_KEY);
    if (!token) {
        showDiscordAuth();
    } else {
        const cachedUser = localStorage.getItem(DISCORD_USER_KEY);
        if (cachedUser) {
            updateDiscordHeader(JSON.parse(cachedUser));
            if(window.onDiscordReady) window.onDiscordReady(); 
        } else {
            const user = await fetchDiscordUser(token);
            if (user) {
                localStorage.setItem(DISCORD_USER_KEY, JSON.stringify(user));
                updateDiscordHeader(user);
                if(window.onDiscordReady) window.onDiscordReady();
            } else {
                logoutDiscord();
            }
        }
    }
}

function showDiscordAuth() {
    const el = document.getElementById('discord-auth-overlay');
    if(el) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
    }
}

async function submitDiscordToken() {
    const input = document.getElementById('discord-token-input');
    let token = input.value.replace(/Bot\s?/i, '').trim();
    if(!token) return alert('введи токен');
    
    const btn = document.getElementById('discord-auth-btn');
    const originalText = btn.innerText;
    btn.innerText = 'проверка...';
    
    const user = await fetchDiscordUser(token);
    if(user) {
        localStorage.setItem(DISCORD_TOKEN_KEY, token);
        localStorage.setItem(DISCORD_USER_KEY, JSON.stringify(user));
        document.getElementById('discord-auth-overlay').style.display = 'none';
        updateDiscordHeader(user);
        if(window.onDiscordReady) window.onDiscordReady();
    } else {
        alert('неверный токен');
    }
    btn.innerText = originalText;
}

async function fetchDiscordUser(token) {
    try {
        const res = await fetch('https://discord.com/api/v9/users/@me', {
            headers: { 'Authorization': token }
        });
        if(res.ok) return await res.json();
    } catch(e) { console.error(e); }
    return null;
}

function updateDiscordHeader(user) {
    const container = document.getElementById('discord-profile');
    if(!container) return;
    
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

    container.innerHTML = `
        <div class="flex items-center gap-3 bg-white/5 pr-4 rounded-full border border-white/10">
            <img src="${avatarUrl}" class="w-8 h-8 rounded-full object-cover">
            <span class="font-mono text-xs font-bold text-white">${user.username}</span>
            <button onclick="logoutDiscord()" class="ml-2 text-gray-500 hover:text-red-500 transition-colors" title="выйти из аккаунта">
                <span class="material-symbols-rounded text-[16px]">logout</span>
            </button>
        </div>
    `;
}

function logoutDiscord() {
    localStorage.removeItem(DISCORD_TOKEN_KEY);
    localStorage.removeItem(DISCORD_USER_KEY);
    location.reload();
}
