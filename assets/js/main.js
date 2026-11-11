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
    document.querySelectorAll('#cf-service option[data-bg]').forEach(function(o){
      o.textContent = l === 'en' ? o.dataset.en : o.dataset.bg;
    });
    var msg = document.getElementById('cf-message');
    if(msg && msg.dataset.phBg){
      msg.placeholder = l === 'en' ? msg.dataset.phEn : msg.dataset.phBg;
    }
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

  /* ── Scroll-spy: highlight active section in desktop nav (F1) ── */
  var navLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
  var spyTargets = [];
  navLinks.forEach(function(a){
    var el = document.getElementById(a.getAttribute('href').slice(1));
    if(el) spyTargets.push({link:a, el:el});
  });
  if(spyTargets.length && 'IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          navLinks.forEach(function(a){ a.classList.remove('active'); });
          var match = spyTargets.filter(function(t){ return t.el === e.target; })[0];
          if(match) match.link.classList.add('active');
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    spyTargets.forEach(function(t){ spy.observe(t.el); });
  }

  /* ── Intent routing: prefill contact form from service/event CTAs (F17) ── */
  var serviceSel = document.getElementById('cf-service');
  var intentEl   = document.getElementById('cf-intent');
  var eventEl    = document.getElementById('cf-event');
  var contextEl  = document.getElementById('form-context');
  var contextMsg = {
    booking:{bg:'Записвате час. Попълнете данните по-долу и ще се свържа с вас лично.',
             en:'Booking a session. Fill in the details below and I will contact you personally.'},
    event:  {bg:'Запитване за събитие. Детайлите са добавени към съобщението ви.',
             en:'Event enquiry. The details have been added to your message.'},
    subscribe:{bg:'Абонамент за предстоящи събития. Оставете имейла си по-долу.',
               en:'Subscribing to upcoming events. Leave your email below.'}
  };

  function applyContext(intent, ev){
    if(!contextEl) return;
    var m = contextMsg[intent];
    if(m){
      var txt = lang === 'en' ? m.en : m.bg;
      if(intent === 'event' && ev){
        txt = (lang === 'en' ? 'Enquiry about: ' : 'Запитване относно: ') + ev;
      }
      contextEl.textContent = txt;
      contextEl.hidden = false;
    } else {
      contextEl.hidden = true;
    }
  }

  document.querySelectorAll('[data-intent]').forEach(function(l){
    l.addEventListener('click', function(){
      var svc    = l.dataset.service || '';
      var intent = l.dataset.intent || 'booking';
      var ev     = l.dataset.event || '';
      if(serviceSel && svc) serviceSel.value = svc;
      if(intentEl) intentEl.value = intent;
      if(eventEl)  eventEl.value = ev;
      applyContext(intent, ev);
    });
  });

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
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
