


let particleContainer;
let mobileMenuBtn;
let mobileMenu;
let particles = [];
let particleColors = [];
let mainNav;
let typewriterElement;
let heroParallaxState = {
    enabled: false,
    homeEl: null,
    contentEl: null,
    particlesEl: null,
    auraEl: null,
    auraLayers: [],
    mouse: { x: 0, y: 0 }
};
let auraCanvasState = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1,
    t: 0,
    raf: 0,
    enabled: false
};
let scrollProgressEl;
let imageModalState = {
    modal: null,
    content: null,
    img: null,
    gallery: [],
    index: -1
};
let magneticButtons = [];
let lastScrollY = 0;
let navHidden = false;

const TYPEWRITER_CONFIG = {
    text: (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'en')
        ? "Hi, I'm\nFrancisco"
        : "Hola, soy\nFrancisco",
    speed: 80,
    deleteSpeed: 50,
    pauseTime: 2000
};


const FALLBACK_PARTICLE_COLORS = [
    'rgba(57, 255, 20, 0.18)',
    'rgba(57, 255, 20, 0.12)',
    'rgba(120, 255, 203, 0.22)'
];

const FALLBACK_AURA_COLORS = [
    'rgba(57, 255, 20, 0.55)',
    'rgba(17, 209, 140, 0.48)',
    'rgba(0, 141, 255, 0.4)'
];
const FALLBACK_AURA_HIGHLIGHT = 'rgba(203, 255, 233, 0.32)';

const PARTICLE_CONFIG = {
    count: 100,
    minSize: 1,
    maxSize: 4,
    minDuration: 5,
    maxDuration: 15
};




function random(min, max) {
    return Math.random() * (max - min) + min;
}


function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


function getCSSVarPalette(varNames, fallback) {
    if (typeof window === 'undefined' || !document?.documentElement) {
        return fallback.slice();
    }

    try {
        const computed = getComputedStyle(document.documentElement);
        const palette = varNames.map((varName, index) => {
            const value = computed.getPropertyValue(varName).trim();
            return value || fallback[index] || fallback[0];
        }).filter(Boolean);

        return palette.length ? palette : fallback.slice();
    } catch (error) {
        return fallback.slice();
    }
}

function refreshParticleColors() {
    return getCSSVarPalette([
        '--particle-color-1',
        '--particle-color-2',
        '--particle-color-3'
    ], FALLBACK_PARTICLE_COLORS);
}

function refreshAuraColors() {
    return getCSSVarPalette([
        '--aura-color-1',
        '--aura-color-2',
        '--aura-color-3'
    ], FALLBACK_AURA_COLORS);
}



function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = random(PARTICLE_CONFIG.minSize, PARTICLE_CONFIG.maxSize);
    const duration = random(PARTICLE_CONFIG.minDuration, PARTICLE_CONFIG.maxDuration);
    const palette = particleColors.length ? particleColors : FALLBACK_PARTICLE_COLORS;
    const color = palette[Math.floor(Math.random() * palette.length)];

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${random(0, 100)}%`;
    particle.style.backgroundColor = color;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `-${random(0, duration)}s`;

    return particle;
}


function initParticles() {
    particleContainer = document.getElementById('particle-container');
    
    if (!particleContainer || prefersReducedMotion()) {
        return;
    }

    particleContainer.innerHTML = '';
    particles = [];
    particleColors = refreshParticleColors();

    for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
        const particle = createParticle();
        particles.push(particle);
        particleContainer.appendChild(particle);
    }
}


function updateParticles() {
    if (prefersReducedMotion()) {
        return;
    }

    particleColors = refreshParticleColors();
    const width = window.innerWidth;
    let newCount = PARTICLE_CONFIG.count;
    
    if (width < 768) {
        newCount = Math.floor(PARTICLE_CONFIG.count * 0.5);
    } else if (width < 1024) {
        newCount = Math.floor(PARTICLE_CONFIG.count * 0.7);
    }
    
    const currentCount = particles.length;
    if (currentCount !== newCount) {
        if (currentCount > newCount) {
            for (let i = newCount; i < currentCount; i++) {
                if (particles[i] && particles[i].parentNode) {
                    particles[i].parentNode.removeChild(particles[i]);
                }
            }
            particles = particles.slice(0, newCount);
        } else {
            for (let i = currentCount; i < newCount; i++) {
                const particle = createParticle();
                particles.push(particle);
                particleContainer.appendChild(particle);
            }
        }
    }
}




function initTypewriter() {
    typewriterElement = document.getElementById('typewriter-text');
    
    if (!typewriterElement) {
        return;
    }
    
    startTypewriter();
}


function startTypewriter() {
    const lines = TYPEWRITER_CONFIG.text.split('\n');
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentLine = lines[currentLineIndex];
        const isLastLine = currentLineIndex === lines.length - 1;
        
        if (!isDeleting) {
            // Escribir caracteres
            const currentText = lines.slice(0, currentLineIndex).join('\n') + 
                              (currentLineIndex > 0 ? '\n' : '') +
                              currentLine.substring(0, currentCharIndex + 1);
            
            if (currentLineIndex === 0) {
                typewriterElement.innerHTML = currentText;
            } else {
                typewriterElement.innerHTML = `${lines[0]}<br><span class="text-[var(--primary-color)]">${lines[1].substring(0, currentCharIndex + 1)}</span>`;
            }
            
            currentCharIndex++;
            
            if (currentCharIndex === currentLine.length) {
                if (isLastLine) {
                    return;
                } else {
                    currentLineIndex++;
                    currentCharIndex = 0;
                    setTimeout(type, TYPEWRITER_CONFIG.speed);
                }
            } else {
                setTimeout(type, TYPEWRITER_CONFIG.speed);
            }
        }
    }
    
    // Iniciar con un pequeño delay
    setTimeout(type, 500);
}




function initStickyNavigation() {
    mainNav = document.getElementById('main-nav');
    
    if (!mainNav) {
        return;
    }
    
    window.addEventListener('scroll', handleNavScroll);
}


function handleNavScroll() {
    const isMobile = window.innerWidth <= 640;
    const scrollThreshold = isMobile ? 30 : 50;
    const scrolled = window.pageYOffset > scrollThreshold;
    
    if (scrolled) {
        mainNav.classList.add('nav-scrolled');
    } else {
        mainNav.classList.remove('nav-scrolled');
    }
    
    if (isMobile && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        if (!handleNavScroll.scrollDebounce) {
            handleNavScroll.scrollDebounce = true;
            setTimeout(() => {
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    closeMobileMenu();
                }
                handleNavScroll.scrollDebounce = false;
            }, 100);
        }
    }
}




function initMobileMenu() {
    mobileMenuBtn = document.getElementById('mobile-menu-btn');
    mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) {
        return;
    }
    
    mobileMenuBtn.addEventListener('click', handleMobileMenuClick);
    
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach((link, i) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(6px)';
        link.style.transition = `opacity 220ms var(--ease-smooth) ${40 + i*40}ms, transform 220ms var(--ease-smooth) ${40 + i*40}ms`;
        link.addEventListener('click', closeMobileMenu);
    });
    
    document.addEventListener('click', handleOutsideClick);
}


function handleMobileMenuClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (handleMobileMenuClick.debounce) return;
    
    handleMobileMenuClick.debounce = true;
    setTimeout(() => {
        handleMobileMenuClick.debounce = false;
    }, 300);
    
    toggleMobileMenu();
}


function handleOutsideClick(e) {
    if (!mobileMenu || !mobileMenuBtn) return;
    
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        closeMobileMenu();
    }
}


function toggleMobileMenu() {
    if (!mobileMenu || !mobileMenuBtn) return;
    
    const isHidden = mobileMenu.classList.contains('hidden');
    
    if (isHidden) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}


function openMobileMenu() {
    if (!mobileMenu || !mobileMenuBtn) return;
    
    mobileMenu.classList.remove('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.setAttribute('aria-label', 'Cerrar menú');
    
    requestAnimationFrame(() => {
        const svg = mobileMenuBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>`;
        }
        const links = mobileMenu.querySelectorAll('a');
        links.forEach((link) => {
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        });
    });
}


function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuBtn) return;
    
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Abrir menú');
    
    requestAnimationFrame(() => {
        const svg = mobileMenuBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>`;
        }
        const links = mobileMenu.querySelectorAll('a');
        links.forEach((link) => {
            link.style.opacity = '0';
            link.style.transform = 'translateY(6px)';
        });
    });
}




function initSmoothNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Altura de la navbar fija
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                closeMobileMenu();
            }
        });
    });
}


function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link-pill[href^="#"]');
    
    if (!sections.length || !navLinks.length) return;
    
    let currentSection = '';
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const offset = 120; 
    
    if (scrollPosition + windowHeight >= docHeight - 100) {
        currentSection = 'contact';
    } else {
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition + offset >= sectionTop) {
                currentSection = sectionId;
                break;
            }
        }
        
        if (!currentSection && sections.length > 0) {
            currentSection = sections[0].getAttribute('id');
        }
    }
    
    // Actualizar enlaces activos
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
    
    
}




function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.project-card, .skill-category, .section-title'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}
// --- Hero Parallax (ambient) ---
function initHeroParallax() {
    if (prefersReducedMotion()) return;

    const home = document.getElementById('home');
    if (!home) return;

    const content = home.querySelector('.z-10');
    const particlesEl = document.getElementById('particle-container');
    const auraWrapper = document.getElementById('hero-aurora');
    const auraEl = auraWrapper || document.getElementById('aura-canvas') || document.getElementById('aura-bg');
    if (!content || !particlesEl) return;

    heroParallaxState.homeEl = home;
    heroParallaxState.contentEl = content;
    heroParallaxState.particlesEl = particlesEl;
    heroParallaxState.auraEl = auraEl || null;
    heroParallaxState.auraLayers = auraWrapper
        ? Array.from(auraWrapper.querySelectorAll('.hero-aurora__layer, .hero-aurora__highlight'))
        : [];
    heroParallaxState.enabled = true;

    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        home.addEventListener('mousemove', throttle(handleHeroMouseMove, 16));
    }

    handleHeroParallaxScroll();
}

function handleHeroMouseMove(e) {
    const homeRect = heroParallaxState.homeEl.getBoundingClientRect();
    const cx = homeRect.left + homeRect.width / 2;
    const cy = homeRect.top + homeRect.height / 2;
    const dx = (e.clientX - cx) / homeRect.width;   // ~ -0.5..0.5
    const dy = (e.clientY - cy) / homeRect.height;  // ~ -0.5..0.5
    heroParallaxState.mouse.x = Math.max(-0.6, Math.min(0.6, dx));
    heroParallaxState.mouse.y = Math.max(-0.6, Math.min(0.6, dy));
    applyHeroParallax();
}

function handleHeroParallaxScroll() {
    if (!heroParallaxState.enabled) return;
    applyHeroParallax();
}

function applyHeroParallax() {
    const { contentEl, particlesEl, auraEl, homeEl, mouse, auraLayers } = heroParallaxState;
    if (!contentEl || !particlesEl || !homeEl) return;

    const rect = homeEl.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
    const scrollOffsetY = -10 * progress; // up to -10px

    const mx = mouse.x;
    const my = mouse.y;

    // Content: subtle
    const contentTx = mx * 6;
    const contentTy = my * 4 + scrollOffsetY;
    contentEl.style.transform = `translate3d(${contentTx}px, ${contentTy}px, 0)`;

    // Particles: opposite for depth + slight scale
    const pTx = mx * -10;
    const pTy = my * -8 + scrollOffsetY * 0.6;
    particlesEl.style.transform = `translate3d(${pTx}px, ${pTy}px, 0) scale(1.02)`;

    // Aura background: subtle larger drift
    if (auraEl) {
        const aTx = mx * 14;
        const aTy = my * 10 + scrollOffsetY * 0.4;
        auraEl.style.transform = `translate3d(${aTx}px, ${aTy}px, 0)`;
    }

    if (auraLayers && auraLayers.length) {
        auraLayers.forEach((layer, index) => {
            const depth = 8 + index * 3.5;
            const layerTx = mx * depth;
            const layerTy = my * (5 + index * 2.4) + scrollOffsetY * (0.22 + index * 0.09);
            layer.style.setProperty('--aurora-parallax-x', `${layerTx}px`);
            layer.style.setProperty('--aurora-parallax-y', `${layerTy}px`);
        });
    }
}

// --- Canvas aura (curved light streaks) ---
function initAuraCanvas() {
    if (prefersReducedMotion()) return;
    const canvas = document.getElementById('aura-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    auraCanvasState.canvas = canvas;
    auraCanvasState.ctx = ctx;
    auraCanvasState.dpr = dpr;
    auraCanvasState.enabled = true;

    let palette = refreshAuraColors();
    const highlightColor = getCSSVarPalette(['--aura-highlight'], [FALLBACK_AURA_HIGHLIGHT])[0];

    const updatePalette = () => {
        palette = refreshAuraColors();
    };

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        auraCanvasState.width = Math.floor(rect.width * dpr);
        auraCanvasState.height = Math.floor(rect.height * dpr);
        canvas.width = auraCanvasState.width;
        canvas.height = auraCanvasState.height;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        updatePalette();
    };
    resize();
    window.addEventListener('resize', throttle(resize, 250));
    const home = document.getElementById('home');
    if (home && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => resize());
        ro.observe(home);
    }

    const draw = () => {
        const { ctx, width, height } = auraCanvasState;
        auraCanvasState.t += 0.008; // slower
        ctx.clearRect(0, 0, width, height);

        // Background glow
        ctx.globalCompositeOperation = 'source-over';
        const bgGradient = ctx.createRadialGradient(
            width * 0.5,
            height * 0.15,
            Math.max(width, height) * 0.05,
            width * 0.5,
            height * 0.5,
            Math.max(width, height) * 0.8
        );
        bgGradient.addColorStop(0, highlightColor);
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'lighter';

        const baseAmp = height * 0.18;
        const lines = 9;
        const spacing = height * 0.06;
        const centerY = height * 0.52; // slightly below center

        for (let i = 0; i < lines; i++) {
            const color = palette[i % palette.length];
            const amp = baseAmp * (0.7 + 0.35 * Math.sin(auraCanvasState.t * 0.5 + i));
            const freq = 0.9 + 0.12 * i;
            const phase = auraCanvasState.t * (0.35 + i * 0.05) + i * 0.45;
            const offset = (i - (lines - 1) / 2) * spacing;

            ctx.beginPath();
            for (let x = 0; x <= width; x += 4) {
                const nx = x / width;
                const y = centerY + offset + Math.sin(nx * Math.PI * freq + phase) * amp;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            const grad = ctx.createLinearGradient(0, centerY - baseAmp, width, centerY + baseAmp);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.22, color);
            grad.addColorStop(0.5, color);
            grad.addColorStop(0.78, 'rgba(0,0,0,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 6;
            ctx.shadowColor = color;
            ctx.shadowBlur = 35;
            ctx.stroke();
        }

        auraCanvasState.raf = requestAnimationFrame(draw);
    };

    if (auraCanvasState.raf) cancelAnimationFrame(auraCanvasState.raf);
    updatePalette();
    draw();
}


// --- Scroll progress bar ---
function initScrollProgress() {
    if (prefersReducedMotion()) return;
    scrollProgressEl = document.getElementById('scroll-progress');
    if (!scrollProgressEl) {
        const barWrap = document.createElement('div');
        barWrap.id = 'scroll-progress';
        const bar = document.createElement('div');
        bar.className = 'bar';
        barWrap.appendChild(bar);
        document.body.appendChild(barWrap);
        scrollProgressEl = barWrap;
    }
    updateScrollProgress();
}

function updateScrollProgress() {
    if (!scrollProgressEl) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
    const bar = scrollProgressEl.firstElementChild;
    if (bar) bar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
}


// --- Image modal (lightbox) ---
function initImageModal() {
    imageModalState.modal = document.createElement('div');
    imageModalState.modal.className = 'image-modal';
    imageModalState.modal.setAttribute('role', 'dialog');
    imageModalState.modal.setAttribute('aria-modal', 'true');

    const content = document.createElement('div');
    content.className = 'image-modal__content';
    const img = document.createElement('img');
    img.className = 'image-modal__img';
    content.appendChild(img);
    // Nav controls
    const nav = document.createElement('div');
    nav.className = 'image-modal__nav';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'image-modal__btn';
    prevBtn.setAttribute('aria-label', 'Anterior');
    prevBtn.innerHTML = '&#10094;';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'image-modal__btn';
    nextBtn.setAttribute('aria-label', 'Siguiente');
    nextBtn.innerHTML = '&#10095;';
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    content.appendChild(nav);
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-modal__btn image-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = '&#10005;';
    content.appendChild(closeBtn);
    imageModalState.modal.appendChild(content);
    document.body.appendChild(imageModalState.modal);

    imageModalState.content = content;
    imageModalState.img = img;

    imageModalState.modal.addEventListener('click', (e) => {
        if (e.target === imageModalState.modal || e.target === imageModalState.content) {
            closeImageModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImageModal();
        if (!imageModalState.modal.classList.contains('open')) return;
        if (e.key === 'ArrowRight') galleryNext();
        if (e.key === 'ArrowLeft') galleryPrev();
    });

    // Delegado: abrir modal al click en imágenes con data-lightbox
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.matches('img[data-lightbox]')) {
            e.preventDefault();
            // Build gallery within same section/grid
            const scope = target.closest('#projects, #about, #home, #skills, body') || document;
            const candidates = Array.from(scope.querySelectorAll('img[data-lightbox]'));
            imageModalState.gallery = candidates.map(el => el.getAttribute('src') || el.getAttribute('data-src')).filter(Boolean);
            imageModalState.index = Math.max(0, imageModalState.gallery.indexOf(target.getAttribute('src') || target.getAttribute('data-src')));
            openImageModal(imageModalState.gallery[imageModalState.index]);
        }
    });

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); galleryPrev(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); galleryNext(); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeImageModal(); });
}

function openImageModal(src) {
    if (!src || !imageModalState.modal) return;
    imageModalState.img.src = src;
    imageModalState.modal.classList.add('open');
}

function closeImageModal() {
    if (!imageModalState.modal) return;
    imageModalState.modal.classList.remove('open');
}

function galleryNext() {
    if (!imageModalState.gallery.length) return;
    imageModalState.index = (imageModalState.index + 1) % imageModalState.gallery.length;
    imageModalState.img.src = imageModalState.gallery[imageModalState.index];
}

function galleryPrev() {
    if (!imageModalState.gallery.length) return;
    imageModalState.index = (imageModalState.index - 1 + imageModalState.gallery.length) % imageModalState.gallery.length;
    imageModalState.img.src = imageModalState.gallery[imageModalState.index];
}
// --- View Transitions (ES <-> EN) ---
function initViewTransitions() {
    const supportsVT = 'startViewTransition' in document;
    if (!supportsVT) return;

    const langLinks = document.querySelectorAll('a[hreflang]');
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.getAttribute('href');
            if (!url || url.startsWith('#')) return;
            e.preventDefault();
            document.startViewTransition(() => {
                window.location.href = url;
            });
        });
    });
}


// --- Lazy images + shimmer ---
function initLazyImages() {
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const onIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            observer.unobserve(img);
            const src = img.getAttribute('data-src');
            if (!src) return;

            img.decoding = 'async';
            img.loading = 'lazy';
            img.classList.add('img-loading');
            img.src = src;
            img.addEventListener('load', () => {
                img.classList.remove('img-loading');
                img.classList.add('lazy-loaded');
            }, { once: true });
        });
    };

    const io = new IntersectionObserver(onIntersect, { rootMargin: '200px 0px' });
    imgs.forEach(img => io.observe(img));
}




const handleResize = throttle(() => {
    updateParticles();
}, 250);


const handleScroll = throttle(() => {
    handleNavScroll();
    updateActiveNavigation();
    handleHeroParallaxScroll();
    updateScrollProgress();
    handleAutoHideNav();
}, 50); 


function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    try {
        initParticles();
        initTypewriter();
        initStickyNavigation();
        initMobileMenu();
        initSmoothNavigation();
        initScrollEffects();
        initProjectsToggle();
        initHeroParallax();
        initAuraCanvas();
        initViewTransitions();
        initLazyImages();
        initScrollProgress();
        initImageModal();
        initMagneticButtons();
        initSkillsFilters();
        initSkillMeters();
        initSkillCardTilt();
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        updateActiveNavigation();
        
        // Forzar actualización después de que se cargue todo
        setTimeout(() => {
            updateActiveNavigation();
        }, 100);
        
        
    } catch (error) {
    }
}
// --- Skills: filters ---
function initSkillsFilters() {
    const filtersWrap = document.querySelector('.skills-filters');
    if (!filtersWrap) return;
    const buttons = Array.from(filtersWrap.querySelectorAll('.skills-filter'));
    const cards = Array.from(document.querySelectorAll('#skills .skill-category'));
    const grid = document.querySelector('#skills .grid');
    if (!buttons.length || !cards.length || !grid) return;

    const updateLayout = () => {
        const visible = cards.filter(c => !c.classList.contains('hidden'));
        if (visible.length === 1) grid.classList.add('skills-single');
        else grid.classList.remove('skills-single');
    };

    const applyFilter = (key) => {
        buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === key));
        cards.forEach(card => {
            const cat = card.getAttribute('data-cat') || 'all';
            if (key === 'all' || key === cat) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
        updateLayout();
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-filter') || 'all';
            if ('startViewTransition' in document) {
                document.startViewTransition(() => applyFilter(key));
            } else {
                applyFilter(key);
            }
        });
    });

    // Initial state
    updateLayout();
}

// --- Skills: meters animation on view ---
function initSkillMeters() {
    // No meters/rings in current design; keep function for compatibility
    return;
}

// --- Skills: card tilt + moving glow ---
function initSkillCardTilt() {
    const cards = Array.from(document.querySelectorAll('#skills .skill-category'));
    if (!cards.length) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const maxTilt = 5; // degrees
    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const dx = (e.clientX - cx) / (rect.width/2);
            const dy = (e.clientY - cy) / (rect.height/2);
            const tiltX = Math.max(-1, Math.min(1, -dy)) * maxTilt;
            const tiltY = Math.max(-1, Math.min(1, dx)) * maxTilt;
            const mx = ((e.clientX - rect.left) / rect.width) * 100;
            const my = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--tiltX', tiltX + 'deg');
            card.style.setProperty('--tiltY', tiltY + 'deg');
            card.style.setProperty('--mx', mx + '%');
            card.style.setProperty('--my', my + '%');
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tiltX', '0deg');
            card.style.setProperty('--tiltY', '0deg');
        });
    });
}

// --- Magnetic buttons ---
function initMagneticButtons() {
    magneticButtons = Array.from(document.querySelectorAll('.button_primary, .button_secondary'));
    if (!magneticButtons.length) return;
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    magneticButtons.forEach(btn => {
        const strength = 0.25; // subtle
        btn.style.willChange = 'transform';
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const mx = e.clientX - (rect.left + rect.width/2);
            const my = e.clientY - (rect.top + rect.height/2);
            btn.style.transform = `translate(${mx*strength}px, ${my*strength}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// --- Auto-hide navbar on scroll down ---
function handleAutoHideNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    lastScrollY = currentY;
    const threshold = 8;
    if (Math.abs(delta) < threshold) return;
    if (delta > 0 && currentY > 80 && !navHidden) {
        nav.style.transform = 'translateY(-110%)';
        navHidden = true;
    } else if (delta < 0 && navHidden) {
        nav.style.transform = 'translateY(0)';
        navHidden = false;
    }
}




function initProjectsToggle() {
    const toggleBtn = document.getElementById('toggle-projects');
    const toggleText = document.getElementById('toggle-text');
    const toggleIcon = document.getElementById('toggle-icon');
    const additionalProjects = document.querySelector('.additional-projects');
    
    if (!toggleBtn || !toggleText || !toggleIcon || !additionalProjects) {
        return;
    }
    
    let isExpanded = false;
    
    toggleBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            // Mostrar proyectos adicionales
            additionalProjects.classList.remove('hidden');
            toggleText.textContent = 'Ver menos proyectos';
            toggleIcon.style.transform = 'rotate(180deg)';
            
            setTimeout(() => {
                const firstAdditionalProject = additionalProjects.querySelector('.project-card');
                if (firstAdditionalProject) {
                    firstAdditionalProject.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 100);
            
        } else {
            // Ocultar proyectos adicionales
            additionalProjects.classList.add('hidden');
            toggleText.textContent = 'Ver más proyectos';
            toggleIcon.style.transform = 'rotate(0deg)';
            
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    });
}




async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        return false;
    }
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white font-medium transform transition-all duration-300 translate-x-full`;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}


window.portfolioUtils = {
    copyToClipboard,
    showNotification
};


init();


