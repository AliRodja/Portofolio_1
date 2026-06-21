

document.addEventListener('DOMContentLoaded', () => {

  /*      1. PRELOADER
    */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 400);
  });
  // Fallback: hide preloader after 3s max
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 3000);

  /*      2. DARK MODE TOGGLE
    */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlEl.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  /*      3. NAVBAR — Hide on scroll down, show on scroll up
    */
  const navbar = document.getElementById('navbar');
  let lastScrollY = 0;
  let ticking = false;

  const updateNavbar = () => {
    const scrollY = window.scrollY;

    // Add scrolled class for glassmorphism bg
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide/show on scroll direction
    if (scrollY > lastScrollY && scrollY > 150) {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    lastScrollY = scrollY <= 0 ? 0 : scrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  });

  /*      4. MOBILE MENU
    */
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menu-toggle');
  const navClose = document.getElementById('nav-close');
  const navOverlay = document.getElementById('navOverlay');

  const openMenu = () => {
    navLinks.classList.add('open');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', openMenu);
  menuToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openMenu();
  });
  navClose.addEventListener('click', closeMenu);
  navOverlay.addEventListener('click', closeMenu);

  // Close menu when nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /*      5. TIMELINE TAB SWITCHING
    */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const timelines = document.querySelectorAll('.timeline');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      timelines.forEach(t => t.classList.remove('active'));

      // Add active to clicked
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  /*      6. BACK TO TOP BUTTON
    */
  const backToTop = document.getElementById('back-to-top');

  const toggleBackToTop = () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /*      7. COUNTER ANIMATION (Intersection Observer)
    */
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const duration = 1500; // ms
      const step = target / (duration / 16); // ~60fps
      let current = 0;

      const updateCounter = () => {
        current += step;
        if (current < target) {
          stat.textContent = Math.floor(current) + '+';
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = target + '+';
        }
      };

      updateCounter();
    });
  };

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          animateCounters();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  /*      8. ACTIVE NAV LINK — Scroll spy
    */
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-links li a');

  const updateActiveNav = () => {
    const scrollY = window.scrollY + 150;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinkItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Run once on load

  /*      9. CONTACT FORM — Submit to Google Sheet
    */
  const scriptURL = 'https://script.google.com/macros/s/AKfycbwBxpZKL_V3u2HuZWdVH41jKXuLm6oEGXh00Lu8CBYnUrt51er6mSRYFd_JgIcnEUSp/exec';
  const form = document.forms['submit-to-google-sheet'];
  const msg = document.getElementById('msg');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(() => {
          msg.innerHTML = '✓ Message sent successfully!';
          msg.style.color = '#22c55e';
          form.reset();
          setTimeout(() => { msg.innerHTML = ''; }, 5000);
        })
        .catch((error) => {
          msg.innerHTML = '✕ Something went wrong. Please try again.';
          msg.style.color = '#ef4444';
          console.error('Error!', error.message);
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  /*      10. TYPED.JS INITIALIZATION
    */
  if (typeof Typed !== 'undefined') {
    new Typed('.typing', {
      strings: ['UI/UX Designer', 'Student', 'Junior Developer'],
      typeSpeed: 100,
      backSpeed: 60,
      loop: true
    });
  }

  /*      11. AOS INITIALIZATION
    */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      duration: 800,
      offset: 80
    });
  }

});