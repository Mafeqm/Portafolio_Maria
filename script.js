/* ==========================================================================
   CYBERPUNK-KAWAII INTERACTIONS & LOGIC
   María | Full-Stack Java Developer Portfolio
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Custom Cursor Script
       ========================================================================== */
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!cursor.classList.contains('visible')) {
            cursor.classList.add('visible');
        }
    });

    // Make cursor follow mouse smoothly (Lerp)
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.15;
        cursorY += dy * 0.15;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .project-card, .ctrl-btn');
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Hide if mouse leaves screen coordinates
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('visible'));


    /* ==========================================================================
       2. Dark / Light Theme Toggle & Persistence
       ========================================================================= */
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });


    /* ==========================================================================
       3. Interactive Canvas Particle System (Responsive Streams)
       ========================================================================== */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const minDistance = 100;
    
    // Mouse coords object for physics pull
    let mouse = {
        x: null,
        y: null,
        radius: 170
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Adjust canvas resolution dynamically
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(x, y, vx, vy, size, color) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.size = size;
            this.color = color;
            this.baseSize = size;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Check boundary limits and bounce
            if (this.x > canvas.width || this.x < 0) {
                this.vx = -this.vx;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.vy = -this.vy;
            }

            // Normal movement
            this.x += this.vx;
            this.y += this.vy;

            // Physics reaction to cursor coordinates
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    // Pull particles closer to cursor (cyber stream effect)
                    const force = (mouse.radius - distance) / mouse.radius;
                    const strength = 1.8;
                    this.x += (dx / distance) * force * strength;
                    this.y += (dy / distance) * force * strength;
                    
                    // Increase size slightly in active glow zone
                    this.size = this.baseSize * 1.5;
                } else {
                    if (this.size > this.baseSize) {
                        this.size -= 0.1;
                    }
                }
            } else {
                if (this.size > this.baseSize) {
                    this.size -= 0.1;
                }
            }
            this.draw();
        }
    }

    // Initialize/Create particles array
    function initParticles() {
        particlesArray = [];
        // Scale quantity dynamically based on width limits
        const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 11000), 120);
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            // Slow stream velocities
            let vx = (Math.random() - 0.5) * 0.7;
            let vy = (Math.random() - 0.5) * 0.7;
            
            // Neon cyan or purple stream particles
            let isPurple = Math.random() > 0.4;
            let color = isPurple ? 'rgba(157, 78, 221, 0.45)' : 'rgba(0, 245, 255, 0.45)';
            
            particlesArray.push(new Particle(x, y, vx, vy, size, color));
        }
    }

    // Draws connection grid lines between nodes
    function connectParticles() {
        const isLightTheme = body.classList.contains('light-theme');
        const lineColor = isLightTheme ? 'rgba(123, 44, 191, 0.04)' : 'rgba(157, 78, 221, 0.08)';
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop
    function runParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        requestAnimationFrame(runParticles);
    }

    // Begin particle animation
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    runParticles();


    /* ==========================================================================
       4. Command-Line Autotyping Simulator (Hero Section)
       ========================================================================== */
    const welcomeTextContainer = document.getElementById('typed-welcome-text');
    const skillsContainer = document.querySelector('.skills-chips-wrapper');
    const welcomeStr = `¡Hola! Soy María, desarrolladora Full-Stack comprometida con crear lógica Backend impecable en Java y diseños Frontend de alto impacto.

Ejecutando inicialización modular de habilidades...`;
    
    let typedIndex = 0;
    
    function startWelcomeTyping() {
        if (typedIndex < welcomeStr.length) {
            welcomeTextContainer.textContent += welcomeStr.charAt(typedIndex);
            typedIndex++;
            // Slightly randomized typing speed
            setTimeout(startWelcomeTyping, Math.random() * 15 + 15);
        } else {
            // Once typing finishes, reveal the tech stack chips nicely
            document.querySelector('.terminal-response .typing-cursor').style.display = 'none';
            skillsContainer.style.opacity = '1';
            skillsContainer.style.transition = 'opacity 0.8s ease-in-out';
        }
    }
    
    // Spawn welcome text after small delay
    setTimeout(startWelcomeTyping, 600);


    /* ==========================================================================
       5. Scroll-Triggered Terminal Autotyping Headers
       ========================================================================== */
    const typewriterHeaders = document.querySelectorAll('.typewriter-header');
    
    const headerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const header = entry.target;
                const text = header.getAttribute('data-text');
                header.textContent = '';
                header.classList.add('typing-active');
                
                let i = 0;
                function typeHeader() {
                    if (i < text.length) {
                        header.textContent += text.charAt(i);
                        i++;
                        setTimeout(typeHeader, 60);
                    } else {
                        header.classList.remove('typing-active');
                    }
                }
                typeHeader();
                observer.unobserve(header);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    typewriterHeaders.forEach(header => {
        headerObserver.observe(header);
    });


    /* ==========================================================================
       6. 3D Rotating Project Carousel
       ========================================================================== */
    const slider = document.getElementById('carousel-slider');
    const cards = document.querySelectorAll('.project-card');
    const prevBtn = document.getElementById('prev-project-btn');
    const nextBtn = document.getElementById('next-project-btn');
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Separate in degrees: 3 cards = 120deg difference
    const angleIncrement = 120; 
    let currentYRotation = 0;

    function updateCarousel() {
        if (window.innerWidth <= 768) {
            // Mobile layout does not rotate in 3D (styled as flex column)
            // Clear styles if viewport resized
            slider.style.transform = '';
            cards.forEach(card => {
                card.style.transform = '';
                card.classList.remove('active', 'inactive');
            });
            return;
        }

        // Apply 3D attributes dynamically to slider rotators
        // Rotating the slider by negative rotation angles to bring the requested index card to the front
        slider.style.transform = `rotateY(${currentYRotation}deg)`;
        
        cards.forEach((card, idx) => {
            const cardIndex = parseInt(card.getAttribute('data-index'), 10);
            
            // Calculate absolute difference to find which card faces front
            const angleVal = cardIndex * angleIncrement;
            
            // Position individual card around the Y-axis ring and push out by translateZ
            card.style.transform = `rotateY(${angleVal}deg) translateZ(320px)`;
            
            // Calculate normalized index of card relative to current rotation index
            let diff = (cardIndex - currentIndex) % totalCards;
            if (diff < 0) diff += totalCards;
            
            if (diff === 0) {
                card.classList.add('active');
                card.classList.remove('inactive');
                card.style.pointerEvents = 'auto';
            } else {
                card.classList.add('inactive');
                card.classList.remove('active');
                card.style.pointerEvents = 'none';
            }
        });
    }

    // Handlers for Carousel control elements
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        currentYRotation += angleIncrement;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        currentYRotation -= angleIncrement;
        updateCarousel();
    });

    // Make clicking inactivate adjacent cards directly rotate to them
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (body.classList.contains('light-theme') && window.innerWidth <= 768) return;
            const targetIdx = parseInt(card.getAttribute('data-index'), 10);
            if (targetIdx !== currentIndex) {
                // Calculate minimum rotation steps
                let diff = targetIdx - currentIndex;
                // Normalize index steps
                if (diff > totalCards / 2) diff -= totalCards;
                if (diff < -totalCards / 2) diff += totalCards;
                
                currentIndex = targetIdx;
                currentYRotation -= diff * angleIncrement;
                updateCarousel();
            }
        });
    });

    // Trigger initial calculation
    updateCarousel();

    // Watch navigation resize to correctly reset active states or layouts on mobile
    window.addEventListener('resize', updateCarousel);


    /* ==========================================================================
       7. Scroll Link Highlight Helper
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    function highlightNavOnScroll() {
        let scrollY = window.pageYOffset + 150; // offset for nav header height
        
        sections.forEach(sec => {
            const secTop = sec.offsetTop;
            const secHeight = sec.offsetHeight;
            const secId = sec.getAttribute('id');
            
            if (scrollY >= secTop && scrollY < secTop + secHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${secId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavOnScroll);
});
