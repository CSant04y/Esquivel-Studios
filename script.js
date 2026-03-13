// ============================================
//   SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
//   SVG LOGO ANIMATION
// ============================================
function setTextAnimation(delay, duration, strokeWidth, timingFunction, strokeColor, repeat) {
    const paths = document.querySelectorAll('path');
    const mode = repeat ? 'infinite' : 'forwards';
    paths.forEach((path, i) => {
        const length = path.getTotalLength();
        path.style['stroke-dashoffset'] = `${length}px`;
        path.style['stroke-dasharray'] = `${length}px`;
        path.style['stroke-width'] = `${strokeWidth}px`;
        path.style['stroke'] = `${strokeColor}`;
        path.style['animation'] = `${duration}s svg-text-anim ${mode} ${timingFunction}`;
        path.style['animation-delay'] = `${i * delay}s`;
    });
}
setTextAnimation(0.1, 3.5, 2, 'linear', '#ffffff', false);

// ============================================
//   SCROLL EFFECTS
// ============================================
const nav = document.querySelector('nav');
const backToTopButton = document.getElementById('back-to-top');
const heroSection = document.querySelector('.hero');

window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;

    // Nav glassmorphism intensity
    if (nav) {
        if (scrolled > 50) {
            nav.style.background = 'rgba(245, 243, 240, 0.95)';
            nav.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
        } else {
            nav.style.background = 'rgba(245, 243, 240, 0.7)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    }

    // Back to top button
    if (backToTopButton) {
        if (scrolled > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }

    // Blob parallax — only while hero is in view
    if (heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const progress = Math.min(scrolled / heroHeight, 1);
        heroSection.style.setProperty('--blob-a-y', `${progress * -280}px`);
        heroSection.style.setProperty('--blob-a-x', `${progress * 220}px`);
        heroSection.style.setProperty('--blob-b-y', `${progress * 220}px`);
        heroSection.style.setProperty('--blob-b-x', `${progress * 280}px`);
    }
});

if (backToTopButton) {
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
//   FADE-IN SECTIONS (INTERSECTION OBSERVER)
// ============================================
const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in-section').forEach(el => appearOnScroll.observe(el));

// ============================================
//   GALLERY STAGGERED ANIMATION
// ============================================
const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('animate'), index * 100);
        }
    });
});

document.querySelectorAll('.gallery-item').forEach(item => galleryObserver.observe(item));

// ============================================
//   DOM-READY FEATURES
// ============================================
document.addEventListener('DOMContentLoaded', function () {

    // --- Lightbox ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    let currentIndex = 0;

    function openLightbox(index) {
        const item = galleryItems[index];
        currentIndex = index;
        lightboxImg.src = item.getAttribute('data-full');
        lightboxCaption.textContent = item.querySelector('img').alt;
        lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
        lightbox.style.display = 'block';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            openLightbox((currentIndex - 1 + galleryItems.length) % galleryItems.length);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            openLightbox((currentIndex + 1) % galleryItems.length);
        });
    }

    document.addEventListener('keydown', function (e) {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
            else if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
        }
    });

    // --- Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active'); // triggers X animation
        });

        // Close menu when a nav link is clicked
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', function () {
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // --- Booking Form (Formspree) ---
    const bookingForm = document.getElementById('bookingForm');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const lang = localStorage.getItem('language') || 'en';
            submitButton.disabled = true;
            submitButton.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    alert(lang === 'es'
                        ? '¡Gracias por tu solicitud de reserva! Me pondré en contacto contigo en 24 horas para confirmar tu sesión.'
                        : 'Thank you for your booking request! I will get back to you within 24 hours to confirm your session.');
                    this.reset();
                } else {
                    alert(lang === 'es'
                        ? 'Ups, hubo un problema. Por favor envíame un correo directamente a contact@carlosesquivelstudios.com'
                        : 'Oops! There was a problem. Please email me directly at contact@carlosesquivelstudios.com');
                }
            } catch {
                alert(lang === 'es'
                    ? 'Ups, hubo un problema. Por favor envíame un correo directamente a contact@carlosesquivelstudios.com'
                    : 'Oops! There was a problem. Please email me directly at contact@carlosesquivelstudios.com');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.getAttribute(`data-${lang}`) || 'Submit Booking Request';
            }
        });
    }

    // --- Language Switcher ---
    const langEN = document.getElementById('lang-en');
    const langES = document.getElementById('lang-es');
    let currentLang = localStorage.getItem('language') || 'en';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);

        if (langEN) langEN.classList.toggle('active', lang === 'en');
        if (langES) langES.classList.toggle('active', lang === 'es');

        document.querySelectorAll('[data-en][data-es]').forEach(el => {
            const value = el.getAttribute(`data-${lang}`);
            if (value.includes('<')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });

        // Update placeholder text on inputs/textareas
        document.querySelectorAll(`[data-placeholder-${lang}]`).forEach(el => {
            el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
        });

        document.documentElement.lang = lang;
    }

    setLanguage(currentLang);
    if (langEN) langEN.addEventListener('click', () => setLanguage('en'));
    if (langES) langES.addEventListener('click', () => setLanguage('es'));

});
