/* ========================================
   Wedding Website - Interactive JavaScript
   Jülide & Göktuğ - 13 Eylül 2026
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        weddingDate: new Date('2026-09-13T19:00:00+03:00').getTime(),
        envelopeAnimationDuration: 1000,
        countdownUpdateInterval: 1000,
        particleSpawnInterval: 3000,
        maxParticles: 15
    };

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        envelopeContainer: document.getElementById('envelopeContainer'),
        envelope: document.getElementById('envelope'),
        envelopeFlap: document.getElementById('envelopeFlap'),
        invitationMain: document.getElementById('invitationMain'),
        countdown: {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        },
        musicToggle: document.getElementById('musicToggle'),
        scrollIndicator: document.getElementById('scrollIndicator')
    };

    // ========================================
    // State
    // ========================================
    const state = {
        isEnvelopeOpen: false,
        isInvitationVisible: false,
        isMusicPlaying: false,
        countdownInterval: null,
        particleInterval: null,
        audioContext: null,
        audioElement: null
    };

    // ========================================
    // Utility Functions
    // ========================================
    const utils = {
        padZero: (num) => String(num).padStart(2, '0'),
        
        formatTime: (ms) => {
            const totalSeconds = Math.max(0, Math.floor(ms / 1000));
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return { days, hours, minutes, seconds };
        },

        throttle: (fn, delay) => {
            let lastCall = 0;
            return (...args) => {
                const now = Date.now();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    fn(...args);
                }
            };
        },

        prefersReducedMotion: () => 
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // ========================================
    // Countdown Timer
    // ========================================
    function updateCountdown() {
        const now = Date.now();
        const distance = CONFIG.weddingDate - now;

        if (distance <= 0) {
            // Wedding day has arrived
            elements.countdown.days.textContent = '00';
            elements.countdown.hours.textContent = '00';
            elements.countdown.minutes.textContent = '00';
            elements.countdown.seconds.textContent = '00';
            
            if (state.countdownInterval) {
                clearInterval(state.countdownInterval);
                state.countdownInterval = null;
            }
            return;
        }

        const time = utils.formatTime(distance);
        
        // Animate number changes
        animateNumber(elements.countdown.days, time.days);
        animateNumber(elements.countdown.hours, time.hours);
        animateNumber(elements.countdown.minutes, time.minutes);
        animateNumber(elements.countdown.seconds, time.seconds);
    }

    function animateNumber(element, newValue) {
        const formatted = utils.padZero(newValue);
        if (element.textContent !== formatted) {
            element.style.transform = 'scale(1.1)';
            element.style.color = 'var(--gold)';
            element.textContent = formatted;
            
            requestAnimationFrame(() => {
                element.style.transform = 'scale(1)';
                element.style.color = 'var(--burgundy)';
            });
        }
    }

    function startCountdown() {
        updateCountdown(); // Initial call
        state.countdownInterval = setInterval(updateCountdown, CONFIG.countdownUpdateInterval);
    }

    // ========================================
    // Envelope Animation
    // ========================================
    function openEnvelope() {
        if (state.isEnvelopeOpen) return;
        
        state.isEnvelopeOpen = true;
        
        // Add open class for CSS animation
        elements.envelope.classList.add('open');
        
        // Hide envelope container after animation
        setTimeout(() => {
            elements.envelopeContainer.classList.add('hidden');
            
            // Show invitation
            setTimeout(() => {
                showInvitation();
            }, 300);
        }, CONFIG.envelopeAnimationDuration);
        
        // Create burst particles
        createBurstParticles();
        
        // Start countdown
        startCountdown();
        
        // Play opening sound
        playOpenSound();
    }

    function showInvitation() {
        state.isInvitationVisible = true;
        elements.invitationMain.classList.add('visible');
        elements.scrollIndicator.classList.add('visible');
        
        // Initialize particles
        startParticleSystem();
        
        // Initialize scroll animations
        initScrollAnimations();
    }

    // ========================================
    // Particle System
    // ========================================
    function createParticle(x, y, isBurst = false) {
        if (utils.prefersReducedMotion()) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = isBurst ? Math.random() * 8 + 4 : Math.random() * 6 + 2;
        const colors = ['var(--gold)', 'var(--burgundy)', 'var(--burgundy-light)', 'var(--gold-light)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            opacity: ${isBurst ? 1 : 0.6};
            animation-duration: ${isBurst ? '2s' : (Math.random() * 10 + 8)}s;
            animation-delay: 0s;
        `;
        
        document.body.appendChild(particle);
        
        // Remove after animation
        const duration = isBurst ? 2000 : parseFloat(particle.style.animationDuration) * 1000;
        setTimeout(() => {
            particle.remove();
        }, duration);
    }

    function createBurstParticles() {
        const rect = elements.envelope.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 100 + Math.random() * 100;
                const x = centerX + Math.cos(angle) * velocity;
                const y = centerY + Math.sin(angle) * velocity;
                createParticle(x, y, true);
            }, i * 30);
        }
    }

    function startParticleSystem() {
        if (utils.prefersReducedMotion()) return;
        
        state.particleInterval = setInterval(() => {
            const particles = document.querySelectorAll('.particle:not([style*="animation-duration: 2s"])');
            if (particles.length < CONFIG.maxParticles) {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight + 20;
                createParticle(x, y);
            }
        }, CONFIG.particleSpawnInterval);
    }

    // ========================================
    // Scroll Animations
    // ========================================
    function initScrollAnimations() {
        if (utils.prefersReducedMotion()) {
            document.querySelectorAll('.venue-card, .parent-side, .rsvp-card').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.venue-card, .parent-side, .rsvp-card');
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s`;
            observer.observe(el);
        });
    }

    // ========================================
    // Music Toggle
    // ========================================
    function initMusicToggle() {
        // Create a simple ambient sound using Web Audio API
        function createAmbientSound() {
            if (!state.audioContext) {
                state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = state.audioContext.createOscillator();
            const gainNode = state.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, state.audioContext.currentTime); // A3
            oscillator.frequency.exponentialRampToValueAtTime(440, state.audioContext.currentTime + 4); // A4
            oscillator.frequency.exponentialRampToValueAtTime(330, state.audioContext.currentTime + 8); // E4
            oscillator.frequency.exponentialRampToValueAtTime(220, state.audioContext.currentTime + 12); // A3
            
            gainNode.gain.setValueAtTime(0, state.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05, state.audioContext.currentTime + 1);
            gainNode.gain.linearRampToValueAtTime(0, state.audioContext.currentTime + 12);
            
            oscillator.connect(gainNode);
            gainNode.connect(state.audioContext.destination);
            
            oscillator.start(state.audioContext.currentTime);
            oscillator.stop(state.audioContext.currentTime + 12);
            
            // Loop
            setTimeout(() => {
                if (state.isMusicPlaying && state.audioContext && state.audioContext.state !== 'closed') {
                    createAmbientSound();
                }
            }, 11000);
        }

        elements.musicToggle.addEventListener('click', () => {
            if (!state.isMusicPlaying) {
                // Resume audio context if suspended
                if (state.audioContext && state.audioContext.state === 'suspended') {
                    state.audioContext.resume();
                }
                
                state.isMusicPlaying = true;
                elements.musicToggle.classList.remove('muted');
                elements.musicToggle.setAttribute('aria-label', 'Müziği kapat');
                elements.musicToggle.title = 'Müziği kapat';
                
                createAmbientSound();
            } else {
                state.isMusicPlaying = false;
                elements.musicToggle.classList.add('muted');
                elements.musicToggle.setAttribute('aria-label', 'Müziği aç');
                elements.musicToggle.title = 'Müziği aç';
                
                if (state.audioContext) {
                    state.audioContext.suspend();
                }
            }
        });
    }

    // ========================================
    // Sound Effects
    // ========================================
    function playOpenSound() {
        if (utils.prefersReducedMotion()) return;
        
        try {
            if (!state.audioContext) {
                state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (state.audioContext.state === 'suspended') {
                state.audioContext.resume();
            }
            
            const oscillator = state.audioContext.createOscillator();
            const gainNode = state.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, state.audioContext.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(659.25, state.audioContext.currentTime + 0.3); // E5
            oscillator.frequency.exponentialRampToValueAtTime(783.99, state.audioContext.currentTime + 0.6); // G5
            
            gainNode.gain.setValueAtTime(0, state.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, state.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, state.audioContext.currentTime + 1);
            
            oscillator.connect(gainNode);
            gainNode.connect(state.audioContext.destination);
            
            oscillator.start(state.audioContext.currentTime);
            oscillator.stop(state.audioContext.currentTime + 1);
        } catch (e) {
            // Silently fail if audio not supported
        }
    }

    // ========================================
    // Keyboard Navigation
    // ========================================
    function initKeyboardNavigation() {
        elements.envelope.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEnvelope();
            }
        });

        // Add tabindex to envelope for keyboard access
        elements.envelope.setAttribute('tabindex', '0');
        elements.envelope.setAttribute('role', 'button');
        elements.envelope.setAttribute('aria-label', 'Davetiyeyi aç');
    }

    // ========================================
    // Touch Support
    // ========================================
    function initTouchSupport() {
        let touchStartY = 0;
        
        elements.envelope.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        elements.envelope.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            // Swipe up to open
            if (diff > 50) {
                openEnvelope();
            }
        }, { passive: true });
    }

    // ========================================
    // Scroll Indicator Hide on Scroll
    // ========================================
    function initScrollIndicator() {
        const handleScroll = utils.throttle(() => {
            if (window.scrollY > 100) {
                elements.scrollIndicator.classList.remove('visible');
            } else {
                elements.scrollIndicator.classList.add('visible');
            }
        }, 100);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ========================================
    // Cleanup on Page Unload
    // ========================================
    function cleanup() {
        if (state.countdownInterval) clearInterval(state.countdownInterval);
        if (state.particleInterval) clearInterval(state.particleInterval);
        if (state.audioContext && state.audioContext.state !== 'closed') {
            state.audioContext.close();
        }
    }

    window.addEventListener('beforeunload', cleanup);

    // ========================================
    // Initialize Everything
    // ========================================
    function init() {
        // Check if already opened (session storage)
        const wasOpened = sessionStorage.getItem('envelopeOpened');
        
        if (wasOpened) {
            // Skip envelope animation
            elements.envelopeContainer.style.display = 'none';
            elements.invitationMain.classList.add('visible');
            elements.scrollIndicator.classList.add('visible');
            state.isEnvelopeOpen = true;
            state.isInvitationVisible = true;
            startCountdown();
            startParticleSystem();
            initScrollAnimations();
        } else {
            // Set up envelope click/touch/keyboard
            elements.envelope.addEventListener('click', () => {
                openEnvelope();
                sessionStorage.setItem('envelopeOpened', 'true');
            });
            
            initKeyboardNavigation();
            initTouchSupport();
        }
        
        initMusicToggle();
        initScrollIndicator();
        
        // Handle visibility change for countdown
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (state.countdownInterval) {
                    clearInterval(state.countdownInterval);
                    state.countdownInterval = null;
                }
            } else if (state.isInvitationVisible && !state.countdownInterval) {
                startCountdown();
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();