


let particleContainer;
let mobileMenuBtn;
let mobileMenu;
let particles = [];
let mainNav;
let typewriterElement;

const TYPEWRITER_CONFIG = {
    text: (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'en')
        ? "Hi, I'm\nFrancisco"
        : "Hola, soy\nFrancisco",
    speed: 80,
    deleteSpeed: 50,
    pauseTime: 2000
};


const PARTICLE_CONFIG = {
    count: 100,
    minSize: 1,
    maxSize: 4,
    minDuration: 5,
    maxDuration: 15,
    colors: [
        'rgba(57, 255, 20, 0.1)',
        'rgba(57, 255, 20, 0.05)',
        'rgba(57, 255, 20, 0.15)'
    ]
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




function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const size = random(PARTICLE_CONFIG.minSize, PARTICLE_CONFIG.maxSize);
    const duration = random(PARTICLE_CONFIG.minDuration, PARTICLE_CONFIG.maxDuration);
    const color = PARTICLE_CONFIG.colors[Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)];
    
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
    menuLinks.forEach(link => {
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




const handleResize = throttle(() => {
    updateParticles();
}, 250);


const handleScroll = throttle(() => {
    handleNavScroll();
    updateActiveNavigation();
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


