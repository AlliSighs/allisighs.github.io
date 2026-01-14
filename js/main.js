(function() {
    // 1. Иконка (Умный поиск пути)
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    
    // Определяем, насколько глубоко мы находимся
    // Считаем количество слешей в пути после домена
    const depth = window.location.pathname.split('/').length - 2; 
    // -2 потому что первый слеш пустой, и последний файл не в счет
    
    let prefix = '';
    // Если мы на главной (корень), prefix пустой. 
    // Если в папках - добавляем ../
    // (Логика упрощенная: если мы не в корне, пробуем подняться)
    if (window.location.pathname.includes('/pages/')) {
        // Если мы в pages/portfolio/index.html -> нам нужно ../../
        // Если мы в pages/discord/cloner/index.html -> нам нужно ../../../
        
        // Простой хак: считаем сегменты пути
        const pathSegments = window.location.pathname.split('/').filter(p => p.length > 0 && !p.includes('.html'));
        // pathSegments для cloner будет: ['repo_name', 'pages', 'discord', 'cloner']
        
        // Для GitHub Pages обычно repo_name - это первая папка.
        // Давай сделаем проще: будем искать assets относительно текущей папки
        
        if (document.querySelector('link[href*="css/style.css"]')) {
             // Берем префикс из уже рабочей ссылки на CSS (мы же их руками поправили)
             const cssPath = document.querySelector('link[href*="css/style.css"]').getAttribute('href');
             prefix = cssPath.replace('css/style.css', '');
        } else {
             prefix = '../../'; // Фоллбек
        }
    }
    
    link.href = prefix + 'assets/siteicon.png';

    // 2. Инициализация языка
    function initLanguageSwitcher() {
        // Подключаем Google Translate
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

        // Создаем контейнер кнопок
        function createLangButtons() {
            const container = document.createElement('div');
            container.className = 'lang-switcher-container';
            
            container.innerHTML = `
                <button class="lang-btn ${!isEn ? 'active' : ''}" id="btn-ru">RU</button>
                <button class="lang-btn ${isEn ? 'active' : ''}" id="btn-en">EN</button>
            `;

            container.querySelector('#btn-ru').onclick = (e) => {
                e.preventDefault(); // Предотвращаем переход по ссылке, если кнопка внутри ссылки
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

        // --- ВСТАВКА КНОПОК ---
        
        // 1. Экран авторизации
        const authScreen = document.getElementById('auth-screen');
        if (authScreen && !authScreen.querySelector('.lang-switcher-container')) {
            const btns = createLangButtons();
            authScreen.appendChild(btns);
        }

        // 2. Хедер (Главная и Тулзы)
        // Ищем правый блок (где музыка и выход)
        let toolsHeaderRight = document.querySelector('header .flex.items-center.gap-3:last-child');
        
        // 3. Хедер (Портфолио - там структура другая, нет gap-3 справа)
        if (!toolsHeaderRight) {
             // Ищем просто контейнер хедера
             const header = document.querySelector('header');
             if(header) {
                 // В портфолио кнопка "Зайти на сайт" обычно последняя
                 const lastItem = header.lastElementChild;
                 if(lastItem && !document.querySelector('.lang-switcher-container')) {
                     const btns = createLangButtons();
                     // Вставляем ПЕРЕД кнопкой "Зайти на сайт"
                     header.insertBefore(btns, lastItem);
                     return;
                 }
             }
        } else if (!toolsHeaderRight.querySelector('.lang-switcher-container')) {
            const btns = createLangButtons();
            // Вставляем в начало правого блока (перед музыкой)
            toolsHeaderRight.insertBefore(btns, toolsHeaderRight.firstChild);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
    } else {
        initLanguageSwitcher();
    }
})();

// --- ОСТАЛЬНОЙ КОД ---

const STORAGE_KEY = 'allisighs_local_user';
const DISCORD_TOKEN_KEY = 'allisighs_discord_token';
const DISCORD_USER_KEY = 'allisighs_discord_user_cache';
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_341b439502.mp3"; 
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

window.addEventListener('load', () => {
    const loader = document.getElementById('system-loader');
    if(loader) setTimeout(() => { loader.classList.add('hidden-screen'); }, 800);
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
        if(authScreen) {
            authScreen.style.display = 'flex';
        } else if(!window.location.href.includes('index.html')) {
            window.location.href = '../../index.html';
        }
    }

    if(document.getElementById('discord-auth-overlay')) {
        checkDiscordAuth();
    }
    initMusicPlayer();
});

function initMusicPlayer() {
    const headerRight = document.querySelector('header .flex.items-center.gap-3:last-child');
    if(!headerRight) return;
    
    // Проверка дублей
    if(document.querySelector('.music-trigger')) return;

    const btn = document.createElement('button');
    btn.className = "music-trigger relative text-gray-500 hover:text-white transition-colors mr-4 group";
    btn.title = "music: on/off";
    btn.innerHTML = `
        <span class="material-symbols-rounded text-[24px] music-icon">music_note</span>
        <div class="music-notes-container">
            <span class="material-symbols-rounded pixel-note note-1">music_note</span>
            <span class="material-symbols-rounded pixel-note note-2">music_note</span>
        </div>
    `;
    
    // В тулзах вставляем ПОСЛЕ кнопок языка (они уже там есть, если initLanguage сработал раньше)
    const langContainer = headerRight.querySelector('.lang-switcher-container');
    if (langContainer) {
        headerRight.insertBefore(btn, langContainer.nextSibling);
    } else {
        headerRight.insertBefore(btn, headerRight.firstChild);
    }

    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.3;

    let savedState = JSON.parse(localStorage.getItem(MUSIC_STATE_KEY) || '{"isPlaying": false, "currentTime": 0}');
    audio.currentTime = savedState.currentTime;

    const togglePlay = () => {
        if(audio.paused) {
            const p = audio.play();
            if (p) {
                p.then(() => {
                    btn.classList.add('music-playing');
                    btn.querySelector('.music-icon').innerText = 'volume_up';
                }).catch(e => console.log("Autoplay blocked (interaction required)", e));
            }
        } else {
            audio.pause();
            btn.classList.remove('music-playing');
            btn.querySelector('.music-icon').innerText = 'music_note';
        }
    };

    if(savedState.isPlaying) {
        togglePlay();
    }

    btn.onclick = togglePlay;
    window.addEventListener('beforeunload', () => {
        localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify({
            isPlaying: !audio.paused,
            currentTime: audio.currentTime
        }));
    });

    setInterval(() => {
        if(audio.paused) {
            btn.classList.add('music-beckon');
            setTimeout(() => {
                btn.classList.remove('music-beckon');
            }, 4000);
        }
    }, 15000);
}

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
    el.classList.remove('hidden');
    el.style.display = 'flex';
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