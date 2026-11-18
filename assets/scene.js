(function () {
  var scene = document.getElementById('scene');
  if (!scene) return;

  var trail = document.getElementById('trail');
  var duo = document.getElementById('duo');
  var sun = document.getElementById('sun');
  var halo = document.getElementById('halo');
  var tree = document.getElementById('tree');
  var house = document.getElementById('house');
  var flowers = document.getElementById('flowers');
  var stars = document.getElementById('stars');
  var ageEl = document.getElementById('age');
  var phaseEl = document.getElementById('phase');
  var len = trail.getTotalLength();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) scene.classList.add('animated');

  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a)); };
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  // cores em RGB para interpolar
  var hex = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  var mix = function (stops, p) {
    // stops: [[pos, '#rrggbb'], ...] em ordem crescente
    if (p <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        var t = (p - a[0]) / (b[0] - a[0]);
        var ca = hex(a[1]), cb = hex(b[1]);
        return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(lerp(ca[k], cb[k], t)); }).join(',') + ')';
      }
    }
    return stops[stops.length - 1][1];
  };

  // o cabelo prateia aos poucos; o resto do corpo não muda: a pessoa segue inteira, em pé e ativa
  var HAIR = [[0, '#2b2230'], [0.25, '#3a2f3f'], [0.5, '#7d7787'], [0.72, '#bdb9c6'], [1, '#efedf5']];
  var SKY1 = [[0, '#cfe3ff'], [0.3, '#bfe0ff'], [0.62, '#ffd9a8'], [0.85, '#8f7bd6'], [1, '#2a2160']];
  var SKY2 = [[0, '#fff1e0'], [0.3, '#ffffff'], [0.62, '#ffb8a0'], [0.85, '#ffb48a'], [1, '#5b45d6']];

  var PHASES = [
    [28, 'O começo: um passo de cada vez.'],
    [40, 'Construindo, com plano e leveza.'],
    [55, 'Escolhendo o próprio ritmo.'],
    [70, 'Vivendo o que foi planejado.'],
    [85, 'Colhendo histórias, e contando.']
  ];

  function render(p) {
    var t = ease(seg(p, 0.06, 0.96));
    var pt = trail.getPointAtLength(len * lerp(0.1, 0.78, t));
    duo.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + (pt.y - 2).toFixed(1) + ') scale(1.45)');

    var s = scene.style;
    s.setProperty('--hair', mix(HAIR, t));
    s.setProperty('--sky1', mix(SKY1, t));
    s.setProperty('--sky2', mix(SKY2, t));
    s.setProperty('--a-o', (1 - ease(seg(p, 0.1, 0.22))).toFixed(3));
    s.setProperty('--b-o', ease(seg(p, 0.2, 0.34)).toFixed(3));
    s.setProperty('--hint-o', (1 - seg(p, 0, 0.05)).toFixed(3));

    // o sol percorre o céu: do nascer ao pôr do sol
    var sx = lerp(110, 700, t);
    var sy = 215 - Math.sin(Math.PI * t) * 150;
    sun.setAttribute('cx', sx.toFixed(1)); sun.setAttribute('cy', sy.toFixed(1));
    halo.setAttribute('cx', sx.toFixed(1)); halo.setAttribute('cy', sy.toFixed(1));
    stars.setAttribute('opacity', seg(t, 0.8, 1).toFixed(3));

    // a vida em volta cresce: árvore, casa, flores
    tree.setAttribute('transform', 'translate(690 330) scale(' + lerp(0.15, 0.62, ease(seg(t, 0.05, 0.9))).toFixed(3) + ')');
    house.setAttribute('opacity', ease(seg(t, 0.28, 0.48)).toFixed(3));
    flowers.setAttribute('opacity', ease(seg(t, 0.45, 0.7)).toFixed(3));

    var age = Math.round(lerp(28, 85, t));
    ageEl.textContent = age;
    var idx = 0;
    for (var i = 0; i < PHASES.length; i++) if (age >= PHASES[i][0] - 6) idx = i;
    if (phaseEl.textContent !== PHASES[idx][1]) phaseEl.textContent = PHASES[idx][1];
  }

  if (reduce) {
    // sem animação: uma cena parada, no meio da trilha, e as cinco fases logo abaixo
    scene.style.setProperty('--a-o', '0');
    scene.style.setProperty('--b-o', '1');
    render(0.5);
    return;
  }

  var ticking = false;
  function update() {
    ticking = false;
    var total = scene.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp(-scene.getBoundingClientRect().top / total) : 1;
    render(p);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
