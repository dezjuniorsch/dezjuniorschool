/* =========================================================
   NILE CREST HIGH SCHOOL — SITE SCRIPT
   Handles: nav toggle, active link, sticky header shadow,
   scroll reveal, staff directory filter/search,
   FAQ accordion, contact form validation.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Highlight active nav link ---------- */
  var current = (document.body.getAttribute('data-page') || '').toLowerCase();
  document.querySelectorAll('.nav-links a[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === current) {
      a.classList.add('is-active');
    }
  });

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Image slideshow(s) (automatic, with manual override) ---------- */
  var slideshows = Array.prototype.slice.call(document.querySelectorAll('[data-slideshow]'));
  slideshows.forEach(function (slideshow) {
    var slides = Array.prototype.slice.call(slideshow.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(slideshow.querySelectorAll('[data-slide-dot]'));
    var prevBtn = slideshow.querySelector('[data-slide-prev]');
    var nextBtn = slideshow.querySelector('[data-slide-next]');
    var current = 0;
    var AUTOPLAY_MS = 6500;
    var autoplayTimer = null;

    function goToSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () { goToSlide(current + 1); }, AUTOPLAY_MS);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }
    function restartAutoplay() {
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(current - 1); restartAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(current + 1); restartAutoplay(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goToSlide(i); restartAutoplay(); });
    });

    slideshow.addEventListener('mouseenter', stopAutoplay);
    slideshow.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  });

  /* ---------- Staff directory: search + department filter ---------- */
  var staffGrid = document.querySelector('[data-staff-grid]');
  if (staffGrid) {
    var cards = Array.prototype.slice.call(staffGrid.querySelectorAll('.staff-card'));
    var searchInput = document.querySelector('[data-staff-search]');
    var pills = document.querySelectorAll('.pill[data-dept]');
    var emptyState = document.querySelector('.staff-empty');
    var activeDept = 'all';

    function applyFilters() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var dept = card.getAttribute('data-dept');
        var name = (card.getAttribute('data-name') || '').toLowerCase();
        var role = (card.getAttribute('data-role') || '').toLowerCase();
        var matchesDept = activeDept === 'all' || dept === activeDept;
        var matchesQuery = !query || name.indexOf(query) !== -1 || role.indexOf(query) !== -1;
        var show = matchesDept && matchesQuery;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        activeDept = pill.getAttribute('data-dept');
        applyFilters();
      });
    });

    applyFilters();
  }

  /* ---------- FAQ accordion (admissions page) ---------- */
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      accordionItems.forEach(function (other) {
        other.classList.remove('is-open');
        var otherPanel = other.querySelector('.accordion-panel');
        if (otherPanel) otherPanel.style.maxHeight = null;
        var otherTrigger = other.querySelector('.accordion-trigger');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = document.querySelector('.form-status');

    function setError(field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.add('has-error');
      var errorEl = wrap.querySelector('.field-error');
      if (errorEl) errorEl.textContent = message;
    }
    function clearError(field) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.remove('has-error');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var name = form.querySelector('#cf-name');
      var email = form.querySelector('#cf-email');
      var subject = form.querySelector('#cf-subject');
      var message = form.querySelector('#cf-message');

      [name, email, subject, message].forEach(function (f) { if (f) clearError(f); });

      if (!name.value.trim()) {
        setError(name, 'Please tell us your name.');
        valid = false;
      }
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setError(email, 'Please enter a valid email address.');
        valid = false;
      }
      if (!subject.value) {
        setError(subject, 'Please choose who you would like to reach.');
        valid = false;
      }
      if (!message.value.trim() || message.value.trim().length < 10) {
        setError(message, 'Please add a short message (at least 10 characters).');
        valid = false;
      }

      if (!valid) {
        if (status) status.classList.remove('is-visible');
        return;
      }

      if (status) {
        status.textContent = 'Thank you, ' + name.value.trim().split(' ')[0] + '. Your message has been received — our team will respond within two working days.';
        status.classList.add('is-visible');
      }
      form.reset();
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
