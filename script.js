// ===== Custom Cursor =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate update for main cursor
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// Smooth follower animation
function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Add hover states to interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .service-card, .portfolio-item, .package-card, .testimonial-card, .award-card, .filter-btn, .whatsapp-cta');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        cursorFollower.classList.add('hovering');
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        cursorFollower.classList.remove('hovering');
    });
});

// Hide cursor on mobile
if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    cursorFollower.style.display = 'none';
    document.body.style.cursor = 'auto';
}

// ===== Navigation Scroll Effect =====
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== Mobile Menu Toggle =====
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        
        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking a link
if (navMenu) {
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
});

// ===== Add reveal class to elements that need animation =====
const animateOnScroll = document.querySelectorAll(
    '.about-visual, .about-content, .service-card, .portfolio-item, .process-step, .testimonial-card, .review-card, .package-card, .contact-info, .contact-form-wrapper'
);

animateOnScroll.forEach(el => {
    el.classList.add('reveal');
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Portfolio Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
let portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        portfolioItems = document.querySelectorAll('.portfolio-item');
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        portfolioItems.forEach(item => {
            const category = item.dataset.category;
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'grid';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = nav.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Form Validation =====
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#e74c3c';
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (isValid) {
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
                .then(response => response.ok ? response.json() : response.json().then(error => Promise.reject(error)))
                .then(() => { submitBtn.textContent = 'Message Sent!'; submitBtn.style.background = '#27ae60'; contactForm.reset(); })
                .catch(error => { submitBtn.textContent = error.error || 'Could not send — try again'; submitBtn.style.background = '#c0392b'; })
                .finally(() => setTimeout(() => { submitBtn.textContent = originalText; submitBtn.style.background = ''; submitBtn.disabled = false; }, 2500));
        }
    });
}

// ===== Package Card Selection =====
const packageBtns = document.querySelectorAll('.package-card .btn');

packageBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const packageName = this.closest('.package-card').querySelector('.package-name').textContent;
        const sessionSelect = document.getElementById('sessionType');
        
        if (sessionSelect) {
            // Scroll to contact form
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            
            // Set the session type based on package
            setTimeout(() => {
                if (packageName === 'Legacy') {
                    sessionSelect.value = 'legacy';
                } else if (packageName === 'Heirloom') {
                    sessionSelect.value = 'newborn';
                } else {
                    sessionSelect.value = 'milestones';
                }
            }, 800);
        }
    });
});

// ===== Parallax Effect for Hero =====
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent && heroVisual && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
        heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// ===== Stats Counter Animation =====
const stats = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const text = target.textContent;
            const number = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/[0-9]/g, '');
            
            let current = 0;
            const increment = number / 50;
            const duration = 1500;
            const stepTime = duration / 50;
            
            const counter = setInterval(() => {
                current += increment;
                if (current >= number) {
                    target.textContent = text;
                    clearInterval(counter);
                } else {
                    target.textContent = Math.floor(current) + suffix;
                }
            }, stepTime);
            
            statsObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

stats.forEach(stat => statsObserver.observe(stat));

// ===== Lazy Loading for Images (when real images are added) =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Add loaded class for initial animations
    document.body.classList.add('loaded');
    
    // Trigger initial reveal for elements in viewport
    setTimeout(() => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 100);
});

// ===== Prevent FOUC (Flash of Unstyled Content) =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ===== Homepage portfolio covers (admin-managed) =====
const portfolioCards = document.querySelectorAll('.portfolio-item[data-category] img');
if (portfolioCards.length) {
    fetch('/api/photos').then(r => r.json()).then(photos => {
        const coverByCategory = {};
        photos.forEach(photo => {
            if (photo.isCover && !coverByCategory[photo.category]) coverByCategory[photo.category] = photo;
        });
        photos.forEach(photo => {
            if (!coverByCategory[photo.category]) coverByCategory[photo.category] = photo;
        });
        portfolioCards.forEach(img => {
            const category = img.closest('.portfolio-item').dataset.category;
            const cover = coverByCategory[category];
            if (cover) {
                img.src = cover.imageUrl;
                img.alt = cover.alt || img.alt;
            }
        });
    }).catch(() => {});
}

// ===== About section photo grid (admin-managed) =====
const aboutGalleryGrid = document.getElementById('aboutGalleryGrid');
if (aboutGalleryGrid) {
    fetch('/api/photos').then(r => r.json()).then(photos => {
        const curated = photos.filter(photo => photo.showInStory);
        const selected = curated.length ? curated : photos;
        aboutGalleryGrid.innerHTML = selected.slice(0, 12).map(photo => {
            const el = document.createElement('span');
            el.textContent = photo.alt || photo.title || 'The Baby Studio photo';
            const safeAlt = el.innerHTML;
            const safeUrl = photo.imageUrl.replace(/"/g, '&quot;');
            return `<div class="about-gallery-item"><img src="${safeUrl}" alt="${safeAlt}" loading="lazy"></div>`;
        }).join('');
    }).catch(() => {});
}
