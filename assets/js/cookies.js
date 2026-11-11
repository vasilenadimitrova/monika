/* cookies.js — informational notice only.
 * The site uses strictly-necessary localStorage only (language preference).
 * No tracking cookies, no analytics at launch.
 * ePrivacy/GDPR consent banner is NOT legally required in this configuration.
 *
 * When GoatCounter (cookieless analytics) is added later, no banner will be
 * needed — see DEPLOY.md for the drop-in instructions.
 */
(function(){
  'use strict';

  var NOTICE_KEY  = 'notice_dismissed';
  var lang = localStorage.getItem('lang') || 'bg';

  var texts = {
    bg: {
      text: 'Сайтът използва само технически необходим локален запис за запомняне на езиковите ви предпочитания.',
      close: 'Разбрах'
    },
    en: {
      text: 'This site uses only technically-necessary local storage to remember your language preference.',
      close: 'Got it'
    }
  };

  function buildNotice(){
    var t = texts[lang] || texts.bg;
    var el = document.createElement('div');
    el.id        = 'cookie-banner';
    el.className = 'cookie-banner';
    el.setAttribute('role','note');
    el.innerHTML =
      '<div class="cookie-inner">' +
        '<div class="cookie-copy">' +
          '<p>' + t.text + '</p>' +
        '</div>' +
        '<div class="cookie-actions">' +
          '<button id="cookie-dismiss" class="btn btn-primary btn-sm">' + t.close + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(el);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ el.classList.add('visible'); });
    });

    document.getElementById('cookie-dismiss').addEventListener('click', function(){
      localStorage.setItem(NOTICE_KEY, '1');
      el.classList.remove('visible');
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 420);
    });
  }

  /* Re-show notice when user clicks "Настройки за бисквитки" footer button */
  document.addEventListener('click', function(e){
    var target = e.target.closest('.cookie-settings-btn');
    if(target){
      e.preventDefault();
      localStorage.removeItem(NOTICE_KEY);
      var existing = document.getElementById('cookie-banner');
      if(existing) existing.parentNode.removeChild(existing);
      buildNotice();
    }
  });

  if(!localStorage.getItem(NOTICE_KEY)){
    setTimeout(buildNotice, 900);
  }

})();
