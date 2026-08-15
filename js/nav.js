// Mobile nav collapse
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.getElementById('site-nav');
  var toggle = nav && nav.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
