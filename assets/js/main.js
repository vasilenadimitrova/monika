(function(){
  'use strict';

  /* ── Language (WS-B1: also toggle on <html> to work with anti-FOUC script) ── */
  var lang = localStorage.getItem('lang') || 'bg';

  function setLang(l){
    lang = l;
    document.documentElement.classList.toggle('lang-en', l === 'en');
    document.body.classList.toggle('lang-en', l === 'en');
    document.documentElement.lang = l;
    document.querySelectorAll('.lang-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.lang === l);
    });
    localStorage.setItem('lang', l);
  }

  setLang(lang);

  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.dataset.lang); });
  });

  /* ── Header scroll shadow ── */
  var header = document.getElementById('site-header');
  if(header){
    window.addEventListener('scroll', function(){
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, {passive:true});
  }

  /* ── Mobile nav (D5 focus trap + D4 Escape close) ── */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');

  function getFocusable(container){
    return Array.from(container.querySelectorAll(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
    ));
  }

  function closeNav(){
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    mobileNav.classList.remove('open');
    mobileNav.hidden = true;
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if(hamburger && mobileNav){
    hamburger.addEventListener('click', function(){
      var open = !mobileNav.classList.contains('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('open', open);
      mobileNav.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if(open){
        var first = getFocusable(mobileNav)[0];
        if(first) first.focus();
      }
    });

    /* Focus trap */
    mobileNav.addEventListener('keydown', function(e){
      if(mobileNav.hidden) return;
      var focusable = getFocusable(mobileNav);
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if(e.key === 'Escape'){ closeNav(); return; }
      if(e.key === 'Tab'){
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      }
    });

    document.querySelectorAll('.nav-close').forEach(function(a){
      a.addEventListener('click', closeNav);
    });
  }

  /* ── Services carousel (D6: ARIA, keyboard, inertness, live region) ── */
  var track   = document.getElementById('svc-track');
  var dotsEl  = document.getElementById('svc-dots');
  var liveEl  = document.getElementById('svc-live');
  var idx     = 0;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getVisible(){
    if(window.innerWidth <= 768)  return 1;
    if(window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getCards(){ return track.querySelectorAll('.svc-card'); }

  function updateInertness(){
    var cards   = getCards();
    var visible = getVisible();
    var start   = idx * visible;
    cards.forEach(function(card, i){
      var isVisible = i >= start && i < start + visible;
      if(isVisible){
        card.removeAttribute('inert');
        card.removeAttribute('aria-hidden');
      } else {
        card.setAttribute('inert','');
        card.setAttribute('aria-hidden','true');
      }
    });
  }

  function buildDots(){
    if(!dotsEl) return;
    var cards   = getCards();
    var visible = getVisible();
    var pages   = Math.ceil(cards.length / visible);
    dotsEl.innerHTML = '';
    for(var i = 0; i < pages; i++){
      var d = document.createElement('button');
      d.className = 'c-dot' + (i === idx ? ' active' : '');
      d.setAttribute('aria-label', 'Страница ' + (i + 1));
      d.dataset.i = i;
      d.addEventListener('click', function(){ goTo(+this.dataset.i); });
      dotsEl.appendChild(d);
    }
  }

  function goTo(n){
    var cards   = getCards();
    var visible = getVisible();
    var pages   = Math.ceil(cards.length / visible);
    idx = Math.max(0, Math.min(n, pages - 1));
    var cardW = cards[0].offsetWidth + 24;
    track.style.transform = 'translateX(-' + (idx * visible * cardW) + 'px)';
    dotsEl && dotsEl.querySelectorAll('.c-dot').forEach(function(d, i){
      d.classList.toggle('active', i === idx);
    });
    updateInertness();
    /* Announce to screen readers */
    if(liveEl){
      liveEl.textContent = '';
      setTimeout(function(){
        liveEl.textContent = (lang === 'en' ? 'Slide ' : 'Слайд ') + (idx + 1) + ' / ' + pages;
      }, 50);
    }
  }

  if(track){
    var prevBtn = document.getElementById('svc-prev');
    var nextBtn = document.getElementById('svc-next');
    if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(idx - 1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(idx + 1); });
    buildDots();
    updateInertness();

    /* Arrow-key navigation when focus is inside the carousel region */
    var carouselRegion = document.getElementById('carousel-region');
    if(carouselRegion){
      carouselRegion.addEventListener('keydown', function(e){
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
          e.preventDefault();
          goTo(e.key === 'ArrowLeft' ? idx - 1 : idx + 1);
        }
      });
    }

    window.addEventListener('resize', function(){
      idx = 0;
      buildDots();
      goTo(0);
    }, {passive:true});
  }

  /* ── Contact form (D8 a11y validation + Formspree) ── */
  var form      = document.getElementById('contact-form');
  var successEl = document.getElementById('form-success');

  if(form){
    /* Set aria-required on required fields */
    form.querySelectorAll('[required]').forEach(function(el){
      el.setAttribute('aria-required','true');
    });

    var fieldConfig = [
      {id:'cf-name',    errId:'err-name',
       msgBg:'Моля, въведете вашето имe.',       msgEn:'Please enter your name.'},
      {id:'cf-email',   errId:'err-email',
       msgBg:'Моля, въведете валиден имейл.',     msgEn:'Please enter a valid email.'},
      {id:'cf-message', errId:'err-message',
       msgBg:'Моля, въведете съобщение.',         msgEn:'Please enter a message.'},
      {id:'cf-privacy', errId:'err-privacy',
       msgBg:'Моля, приемете политиката за поверителност.',
       msgEn:'Please accept the privacy policy.'}
    ];

    fieldConfig.forEach(function(fc){
      var el = document.getElementById(fc.id);
      if(el) el.setAttribute('aria-describedby', fc.errId);
    });

    function clearErrors(){
      fieldConfig.forEach(function(fc){
        var errEl = document.getElementById(fc.errId);
        var field = document.getElementById(fc.id);
        if(errEl) errEl.textContent = '';
        if(field) field.removeAttribute('aria-invalid');
      });
    }

    function validate(){
      var firstInvalid = null;
      fieldConfig.forEach(function(fc){
        var field  = document.getElementById(fc.id);
        var errEl  = document.getElementById(fc.errId);
        if(!field || !errEl) return;
        var invalid = false;
        if(fc.id === 'cf-email'){
          invalid = !field.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        } else if(fc.id === 'cf-privacy'){
          invalid = !field.checked;
        } else {
          invalid = !field.value.trim();
        }
        if(invalid){
          field.setAttribute('aria-invalid','true');
          errEl.textContent = lang === 'en' ? fc.msgEn : fc.msgBg;
          if(!firstInvalid) firstInvalid = field;
        }
      });
      return firstInvalid;
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      clearErrors();
      var firstInvalid = validate();
      if(firstInvalid){ firstInvalid.focus(); return; }

      var btn = form.querySelector('.form-submit');
      btn.disabled = true;
      fetch(form.action, {
        method:'POST',
        body:new FormData(form),
        headers:{'Accept':'application/json'}
      }).then(function(r){
        if(r.ok){
          successEl && successEl.classList.add('visible');
          form.reset();
          clearErrors();
        } else {
          btn.disabled = false;
        }
      }).catch(function(){ btn.disabled = false; });
    });
  }

  /* ── Scroll reveal (D1: skip if reduced-motion) ── */
  var reveals = document.querySelectorAll('.reveal');
  if(reducedMotion){
    reveals.forEach(function(el){ el.classList.add('visible'); });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('visible'); });
  }

})();
