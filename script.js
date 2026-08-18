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
//   SCROLL-SPY (ACTIVE NAV LINK)
// ============================================
const spyLinks = document.querySelectorAll('nav a[href^="#"]');
const spySections = document.querySelectorAll('section[id]');

const sectionSpy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const targetHref = '#' + entry.target.id;
            spyLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === targetHref);
            });
        }
    });
}, {
    threshold: 0.25,
    rootMargin: '-70px 0px -50% 0px'
});

spySections.forEach(section => sectionSpy.observe(section));

// ============================================
//   GALLERY STAGGERED ANIMATION
// ============================================
const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('animate'), Math.min(index * 80, 400));
        }
    });
}, { threshold: 0.05 });

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

    // Only the currently-visible (non-filtered-out) items participate in the lightbox
    function getVisibleItems() {
        return Array.from(galleryItems).filter(item => !item.classList.contains('filtered-out'));
    }

    function openLightbox(item) {
        const visibleItems = getVisibleItems();
        currentIndex = visibleItems.indexOf(item);
        lightboxImg.src = item.getAttribute('data-full');
        lightboxCaption.textContent = item.querySelector('img').alt;
        lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
        lightbox.style.display = 'block';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            openLightbox(visibleItems[(currentIndex - 1 + visibleItems.length) % visibleItems.length]);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            openLightbox(visibleItems[(currentIndex + 1) % visibleItems.length]);
        });
    }

    document.addEventListener('keydown', function (e) {
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
            else if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
        }
    });

    // --- Portfolio Filters ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryDescription = document.getElementById('gallery-description');
    const filterDescriptions = {
        commercial: 'Commercial photography — a plant technician maintaining and installing interior plants at dealerships and businesses across Tulsa.'
    };

    let filterTimeout = null;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');

            if (galleryDescription) {
                galleryDescription.textContent = filterDescriptions[filter] || '';
            }

            // Cancel any in-flight fade and instantly resolve stuck items
            if (filterTimeout) clearTimeout(filterTimeout);
            galleryItems.forEach(item => {
                if (item.classList.contains('fading-out')) {
                    item.classList.remove('fading-out');
                    item.classList.add('filtered-out');
                }
            });

            // Fade out visible items that no longer match
            galleryItems.forEach(item => {
                const matches = filter === 'all' || item.getAttribute('data-category') === filter;
                if (!matches && !item.classList.contains('filtered-out')) {
                    item.classList.add('fading-out');
                }
            });

            // After fade completes: hide non-matching, reveal matching
            filterTimeout = setTimeout(() => {
                galleryItems.forEach(item => {
                    const matches = filter === 'all' || item.getAttribute('data-category') === filter;
                    if (!matches) {
                        item.classList.remove('fading-out');
                        item.classList.add('filtered-out');
                    } else {
                        item.classList.remove('filtered-out');
                        item.classList.remove('animate');
                        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.add('animate')));
                    }
                });

                const gallery = document.querySelector('.gallery');
                if (gallery) {
                    const visibleCount = Array.from(galleryItems).filter(i => !i.classList.contains('filtered-out')).length;
                    gallery.classList.toggle('few-items', visibleCount <= 4);
                }

                filterTimeout = null;
            }, 380);
        });
    });

    document.querySelector('.filter-btn[data-filter="portraits"]').click();

    // --- Mobile Menu ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    const navOverlay = document.getElementById('nav-overlay');

    function closeMenu() {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            const isOpen = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        if (navOverlay) navOverlay.addEventListener('click', closeMenu);
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
        const feedback = document.getElementById('booking-feedback');

        function showFeedback(type, title, message) {
            if (!feedback) return;
            feedback.className = `booking-feedback ${type}`;
            feedback.innerHTML = `<div class="booking-feedback-title">${title}</div><p>${message}</p>`;
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        bookingForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const lang = localStorage.getItem('language') || 'en';
            submitButton.disabled = true;
            submitButton.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';
            if (feedback) feedback.className = 'booking-feedback';

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: new FormData(this),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.reset();
                    showFeedback(
                        'success',
                        lang === 'es' ? '¡Solicitud enviada!' : 'Request Sent',
                        lang === 'es'
                            ? 'Gracias por tu solicitud. Me pondré en contacto contigo en 24 horas para confirmar tu sesión.'
                            : 'Thank you for reaching out. I\'ll be in touch within 24 hours to confirm your session.'
                    );
                } else {
                    showFeedback(
                        'error',
                        lang === 'es' ? 'Algo salió mal' : 'Something went wrong',
                        lang === 'es'
                            ? 'Por favor envíame un correo directamente a contact@carlosesquivelstudios.com'
                            : 'Please email me directly at contact@carlosesquivelstudios.com'
                    );
                }
            } catch {
                showFeedback(
                    'error',
                    lang === 'es' ? 'Algo salió mal' : 'Something went wrong',
                    lang === 'es'
                        ? 'Por favor envíame un correo directamente a contact@carlosesquivelstudios.com'
                        : 'Please email me directly at contact@carlosesquivelstudios.com'
                );
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
