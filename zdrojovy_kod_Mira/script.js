// Parallax hloubka

window.addEventListener('scroll', () => {

const scrolled = window.pageYOffset;

document.body.style.transform = `translateY(${scrolled * 0.5}px)`; // Jemné pohyb

});


// Particles (20 kusů pro "zahradu") 
// Animace snehovych vloček padajících nahoru

function createParticles() {

const particles = document.getElementById('particles');

for (let i = 0; i < 20; i++) {

const p = document.createElement('div');

p.className = 'particle';

p.style.left = Math.random() * 100 + '%';

p.style.animationDelay = Math.random() * 20 + 's';

p.style.animationDuration = (15 + Math.random() * 10) + 's';

particles.appendChild(p);

}

}

createParticles();


// Smooth load

window.addEventListener('load', () => document.body.style.opacity = '1');

