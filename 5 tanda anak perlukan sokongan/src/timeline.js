(function () {
  // Semua masa datang daripada window.CFG (dijana oleh build.mjs).
  const C = window.CFG;
  const T = C.T;
  const W = C.WIN;
  const END = C.VIDEO.duration;
  const TAU = Math.PI * 2;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const els = (s) => (typeof s === "string" ? $$(s) : [].concat(s).flatMap((x) => (typeof x === "string" ? $$(x) : [x])));

  // ------------------------------------------------------------ helpers
  // Gelung ambien terhingga (yoyo) yang tidak melepasi `end`.
  function loop(target, start, end, vars, cycle) {
    const n = Math.floor((end - start) / cycle);
    if (n < 1) return;
    tl.to(target, Object.assign({ duration: cycle / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1 }, vars), start);
  }
  function slam(el, t, from, dur) {
    tl.fromTo(el, { scale: from || 2.2, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: dur || 0.34, ease: "power4.out" }, t);
  }
  function pop(el, t, o) {
    o = o || {};
    tl.fromTo(
      el,
      { scale: o.from || 0, opacity: 0, rotation: o.rot || 0, y: o.y || 0 },
      { scale: 1, opacity: 1, rotation: 0, y: 0, duration: o.dur || 0.45, ease: o.ease || "back.out(2.2)" },
      t,
    );
  }
  function shake(el, t, amp, dur) {
    amp = amp || 14;
    tl.to(el, { keyframes: { x: [0, -amp, amp * 0.8, -amp * 0.55, amp * 0.3, 0] }, duration: dur || 0.3, ease: "none" }, t);
  }
  function prepDraw(sel) {
    els(sel).forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L + " " + L;
      p.style.strokeDashoffset = L;
    });
  }
  function draw(sel, t, dur, ease) {
    tl.to(els(sel), { strokeDashoffset: 0, duration: dur, ease: ease || "power2.out" }, t);
  }
  function origin(sel, o) {
    els(sel).forEach((e) => (e.style.transformOrigin = o));
  }

  // ------------------------------------------------------------ static origins
  origin(".cam", "510px 900px");
  origin("#hook-cam", "510px 1180px");
  const zoomTr = C.TRANSITIONS.find((t) => t.type === "zoom");
  origin("#" + zoomTr.from + "-tx", zoomTr.origin[0] + "px " + zoomTr.origin[1] + "px");
  origin("#hope-cam", "510px 1050px");
  origin("#cta-cam", "510px 700px");

  // ------------------------------------------------------------ BACKGROUND
  loop("#glow-sky", 0, END, { scale: 1.14, opacity: 0.72 }, 4.2);
  loop("#glow-yel", 0, END, { scale: 1.22, x: -70 }, 5.6);
  tl.fromTo("#dotgrid", { y: 0 }, { y: -92, duration: END, ease: "none" }, 0);
  loop("#g1", 0, END, { y: -50, rotation: -5 }, 7.2);
  loop("#g2", 0, END, { y: 60, rotation: 7 }, 6.4);
  loop("#g3", 0, END, { x: -50, rotation: -6 }, 8.0);
  loop("#g4", 0, END, { y: -70, rotation: 6 }, 5.4);
  loop("#g5", 0, END, { y: 40, rotation: 9 }, 6.8);

  // ------------------------------------------------------------ TRANSITIONS
  const whipNode = $("#whipblur-n");
  const pushNode = $("#pushblur-n");
  const wb = { v: 0 };
  const pb = { v: 0 };
  const setWB = () => whipNode.setAttribute("stdDeviation", wb.v.toFixed(2) + " 0");
  const setPB = () => pushNode.setAttribute("stdDeviation", "0 " + pb.v.toFixed(2));

  C.TRANSITIONS.forEach((tr) => {
    const a = tr.at - tr.dur / 2;
    const d = tr.dur;
    const out = "#" + tr.from + "-tx";
    const inn = "#" + tr.to + "-tx";
    if (tr.type === "whip") {
      // Satu "strip": keluar & masuk guna ease & tempoh sama → halaju sepadan.
      tl.set([out, inn], { filter: "url(#whipblur)" }, a);
      tl.fromTo(out, { x: 0 }, { x: -1180, duration: d, ease: "power3.inOut", immediateRender: false }, a);
      tl.fromTo(inn, { x: 1180 }, { x: 0, duration: d, ease: "power3.inOut" }, a);
      tl.to(wb, { v: 16, duration: d / 2, ease: "power2.in", onUpdate: setWB }, a);
      tl.to(wb, { v: 0, duration: d / 2, ease: "power2.out", onUpdate: setWB }, a + d / 2);
      tl.set([out, inn], { filter: "none" }, a + d);
    } else if (tr.type === "zoom") {
      tl.to(out, { scale: 48, duration: d, ease: "power4.in" }, a);
      // Titik "?" memenuhi skrin (flash kuning), kemudian babak baharu didedahkan.
      tl.to(out, { opacity: 0, duration: 0.14, ease: "power1.in" }, a + d);
      tl.fromTo(inn, { scale: 0.55, opacity: 0 }, { scale: 1, opacity: 1, duration: d * 0.8, ease: "power3.out" }, a + d * 0.9);
    } else if (tr.type === "iris") {
      const ox = tr.origin[0];
      const oy = tr.origin[1];
      const R = 1950;
      const rim = tr.to === "reassure" ? "#rim-reassure" : "#rim-cta";
      tl.fromTo(inn, { clipPath: "circle(0px at " + ox + "px " + oy + "px)" }, { clipPath: "circle(" + R + "px at " + ox + "px " + oy + "px)", duration: d, ease: "power3.inOut" }, a);
      tl.set(inn, { clipPath: "none" }, a + d + 0.02);
      tl.set(rim, { attr: { cx: ox, cy: oy } }, a);
      tl.fromTo(rim, { attr: { r: 0 }, opacity: 1 }, { attr: { r: R }, duration: d, ease: "power3.inOut", immediateRender: false }, a);
      tl.to(rim, { opacity: 0, duration: 0.18, ease: "none" }, a + d - 0.18);
      tl.fromTo("#" + tr.to + "-cam", { scale: 1.14 }, { scale: 1, duration: d + 0.35, ease: "power3.out" }, a);
    } else if (tr.type === "push") {
      tl.set([out, inn], { filter: "url(#pushblur)" }, a);
      tl.fromTo(out, { y: 0 }, { y: -1920, duration: d, ease: "power3.inOut", immediateRender: false }, a);
      tl.fromTo(inn, { y: 1920 }, { y: 0, duration: d, ease: "power3.inOut" }, a);
      tl.to(pb, { v: 18, duration: d / 2, ease: "power2.in", onUpdate: setPB }, a);
      tl.to(pb, { v: 0, duration: d / 2, ease: "power2.out", onUpdate: setPB }, a + d / 2);
      tl.set([out, inn], { filter: "none" }, a + d);
    }
  });

  // Kamera push-in perlahan untuk babak tanda.
  ["t1", "t2", "t3", "t4", "t5"].forEach((id) => {
    tl.fromTo("#" + id + "-cam", { scale: 1 }, { scale: 1.04, duration: W[id].dur, ease: "none" }, W[id].start);
  });

  // ------------------------------------------------------------ TOPBAR
  tl.fromTo("#logo-sticker", { scale: 0, rotation: -25, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.8)" }, 0.12);
  loop("#logo-sticker", 0.9, W.cta.start, { y: -7, rotation: 2 }, 3.2);
  tl.to("#logo-sticker", { scale: 0, opacity: 0, duration: 0.25, ease: "back.in(2)" }, W.cta.start + 0.05);

  tl.fromTo("#tracker", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }, 7.6);
  [T.n1, T.n2, T.n3, T.n4, T.n5].forEach((t, i) => {
    tl.fromTo("#p" + i + " .fill", { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power2.out" }, t);
    tl.to("#p" + i + " .num", { color: "#0A1B44", duration: 0.1 }, t + 0.08);
    tl.to("#p" + i, { borderColor: "#FFFFFF", duration: 0.1 }, t);
    tl.to("#p" + i, { keyframes: { scale: [1, 1.24, 1] }, duration: 0.4, ease: "none" }, t);
  });
  tl.to("#tracker", { y: -40, opacity: 0, duration: 0.3, ease: "power2.in" }, 27.05);

  // ------------------------------------------------------------ 1. HOOK
  tl.fromTo("#hook-cam", { scale: 1 }, { scale: 1.03, duration: T.membaca, ease: "none" }, 0);
  slam("#h-anak", T.anak, 2.5, 0.3);
  shake("#hook-cam", T.anak + 0.12, 10, 0.25);
  tl.fromTo("#h-ruler", { scaleY: 0, opacity: 0, transformOrigin: "50% 100%" }, { scaleY: 1, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, T.dah - 0.05);
  tl.fromTo("#h-dah", { y: -180, opacity: 0, rotation: -12 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "bounce.out" }, T.dah);
  tl.fromTo("#h-besar", { scaleY: 0.15, scaleX: 1.35, opacity: 0, transformOrigin: "50% 100%" }, { scaleY: 1, scaleX: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, T.besar);
  tl.fromTo("#h-arrow", { y: 0 }, { y: -262, duration: 0.55, ease: "back.out(1.4)" }, T.besar - 0.05);
  tl.fromTo("#h-book", { y: 420, opacity: 0, rotation: 10 }, { y: 0, opacity: 1, rotation: 0, duration: 0.6, ease: "back.out(1.5)" }, 1.15);
  tl.to("#h-bookin", { rotation: -4, duration: 0.2, ease: "sine.out" }, 1.75);
  loop("#h-bookin", 1.95, 4.4, { rotation: 4 }, 0.9);
  tl.fromTo("#h-q", { scale: 0, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(2.5)" }, 1.5);
  loop("#h-q", 2.0, 4.1, { y: -34 }, 0.6);
  tl.fromTo("#h-w1", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.tapi);
  tl.fromTo("#h-w2", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.masih);
  tl.fromTo("#h-w3", { scale: 0.3, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.35, ease: "back.out(2.5)" }, T.susah);
  tl.fromTo("#h-w4", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.nak);
  slam("#h-membaca", T.membaca, 2.6, 0.32);
  tl.to("#hook-cam", { scale: 1.08, duration: 0.2, ease: "power4.out" }, T.membaca);
  shake("#h-membaca", T.membaca + 0.3, 12, 0.3);
  prepDraw("#h-under");
  draw("#h-under", T.membaca + 0.14, 0.38, "power3.out");

  // ------------------------------------------------------------ 2. TAJUK
  tl.fromTo("#t-five", { scale: 0, rotation: -25, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.95, ease: "elastic.out(1, 0.45)" }, T.lima - 0.06);
  shake("#title-cam", T.lima + 0.04, 16, 0.3);
  loop("#t-five", T.lima + 1.0, 7.65, { y: -12, rotation: 3 }, 1.2);
  tl.fromTo("#t-tanda", { x: 320, opacity: 0, skewX: -20 }, { x: 0, opacity: 1, skewX: 0, duration: 0.4, ease: "expo.out" }, T.tanda);
  tl.fromTo("#t-perlu", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, T.dia);
  tl.fromTo("#t-banner", { clipPath: "inset(0% 100% 0% 0%)", y: 30 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.45, ease: "power3.inOut" }, T.sokongan - 0.05);
  $$(".tdot").forEach((d, i) => {
    pop(d, 6.85 + i * 0.1, { ease: "back.out(3)", dur: 0.3 });
    const dx = 453 + 112 * i - (270 + 120 * i);
    const dy = 265 - 1154;
    tl.to(d, { x: dx, y: dy, scale: 0.7, duration: 0.3, ease: "power3.in" }, 7.34 + i * 0.025);
    tl.to(d, { opacity: 0, duration: 0.06, ease: "none" }, 7.34 + i * 0.025 + 0.27);
  });

  // ------------------------------------------------------------ 3. TANDA 1 — lari bila nampak buku
  slam("#b1", T.n1, 2.6, 0.3);
  shake("#t1-cam", T.n1 + 0.1, 12, 0.25);
  tl.fromTo("#t1-book", { y: 320, opacity: 0, rotation: -12 }, { y: 0, opacity: 1, rotation: 0, duration: 0.55, ease: "back.out(1.6)" }, T.n1 + 0.3);
  tl.to("#t1-bookin", { keyframes: { rotation: [0, -7, 7, -6, 6, -3, 3, 0] }, duration: 0.6, ease: "none" }, 9.05);
  tl.fromTo("#t1-shoe", { x: -360, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, T.lari - 0.05);
  loop("#t1-shoe", T.lari + 0.4, W.t1.end - 0.2, { y: -26, rotation: -7 }, 0.36);
  tl.fromTo("#t1-lines .sl", { scaleX: 0, opacity: 0, transformOrigin: "100% 50%" }, { scaleX: 1, opacity: 1, duration: 0.25, stagger: 0.05, ease: "power3.out" }, T.lari);
  loop("#t1-lines", T.lari + 0.4, W.t1.end - 0.2, { x: -16, opacity: 0.55 }, 0.3);
  $$("#t1-dust .dust").forEach((p, i) => {
    tl.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(2)" }, T.lari + i * 0.06);
    tl.to(p, { x: -80 - i * 20, scale: 1.6, opacity: 0, duration: 0.6, ease: "power2.out" }, T.lari + 0.2 + i * 0.06);
  });
  tl.fromTo("#t1-bubble", { scale: 0, rotation: 14, opacity: 0, transformOrigin: "22% 100%" }, { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: "back.out(2.6)" }, T.bila);
  loop("#t1-bubble", T.bila + 0.5, W.t1.end - 0.1, { rotation: -3, y: -8 }, 0.8);
  const xp = $$("#t1-x path");
  prepDraw(xp);
  draw([xp[0], xp[2]], T.buku, 0.13, "power3.out");
  draw([xp[1], xp[3]], T.buku + 0.11, 0.13, "power3.out");
  tl.fromTo("#t1-x", { scale: 1.5, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.32, ease: "power4.out" }, T.buku);
  shake("#t1-cam", T.buku + 0.05, 12, 0.3);

  // ------------------------------------------------------------ 4. TANDA 2 — meneka perkataan
  tl.fromTo("#b2", { y: -260, rotationX: 90, opacity: 0, transformPerspective: 800 }, { y: 0, rotationX: 0, opacity: 1, duration: 0.55, ease: "bounce.out" }, T.n2 - 0.08);
  tl.fromTo("#t2-car", { x: 520, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, T.n2 + 0.3);
  loop("#t2-car", T.n2 + 0.95, W.t2.end - 0.2, { y: -7 }, 0.5);
  $$("#t2-tiles .tile").forEach((el, i) => {
    tl.fromTo(el, { y: 130, opacity: 0, rotation: i % 2 ? 12 : -12 }, { y: 0, opacity: 1, rotation: 0, duration: 0.4, ease: "back.out(2)" }, T.meneka + i * 0.08);
  });
  tl.to(["#tl0", "#tl1"], { keyframes: { scale: [1, 1.14, 1] }, duration: 0.35, ease: "none" }, 12.85);
  [2, 3, 4, 5].forEach((k, j) => {
    tl.fromTo("#tl" + k + " .flipper", { rotationY: 0 }, { rotationY: 180, duration: 0.38, ease: "back.out(1.6)" }, 12.95 + j * 0.15);
  });
  $$("#t2-think > .abs:not(#t2-bubble)").forEach((d, i) => pop(d, 13.36 + i * 0.07, { dur: 0.25 }));
  pop("#t2-bubble", 13.5, { ease: "back.out(2.4)", rot: -6 });
  prepDraw("#t2-strike");
  draw("#t2-strike", T.bukan2, 0.22, "power3.out");
  shake("#t2-bubble", T.bukan2 + 0.12, 12, 0.3);
  tl.to("#t2-tiles", { keyframes: { y: [0, -20, 0] }, duration: 0.35, ease: "none" }, T.membaca2);

  // ------------------------------------------------------------ 5. TANDA 3 — keliru huruf & bunyi
  tl.fromTo("#b3", { scale: 0, rotation: -360, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, T.n3 - 0.1);
  $$(".ltile").forEach((el, i) => {
    tl.fromTo(el, { scale: 0, opacity: 0, rotation: i % 2 ? 25 : -25 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.42, ease: "back.out(2.2)" }, T.n3 + 0.3 + i * 0.09);
  });
  tl.to("#lt0 .lglyph", { scaleX: -1, duration: 0.3, ease: "back.out(2)" }, T.keliru);
  tl.to("#lt1 .lglyph", { rotation: 180, duration: 0.35, ease: "back.out(1.8)" }, T.keliru + 0.08);
  tl.to("#lt2", { keyframes: [{ x: 104, y: -90, duration: 0.17, ease: "power2.out" }, { x: 208, y: 0, duration: 0.17, ease: "power2.in" }] }, T.keliru + 0.1);
  tl.to("#lt3", { keyframes: [{ x: -104, y: 90, duration: 0.17, ease: "power2.out" }, { x: -208, y: 0, duration: 0.17, ease: "power2.in" }] }, T.keliru + 0.1);
  tl.to("#lt0", { keyframes: [{ x: 104, y: -90, duration: 0.15, ease: "power2.out" }, { x: 208, y: 0, duration: 0.15, ease: "power2.in" }] }, T.keliru + 0.3);
  tl.to("#lt1", { keyframes: [{ x: -104, y: 90, duration: 0.15, ease: "power2.out" }, { x: -208, y: 0, duration: 0.15, ease: "power2.in" }] }, T.keliru + 0.3);
  tl.to(["#lt0", "#lt1"], { backgroundColor: "#FFD23F", duration: 0.15 }, T.huruf - 0.04);
  tl.to(".ltile", { keyframes: { rotation: [0, -9, 9, -4, 0] }, duration: 0.42, stagger: 0.05, ease: "none" }, T.huruf);
  tl.fromTo("#t3-speaker", { scale: 0, rotation: -20, opacity: 0, transformOrigin: "30% 50%" }, { scale: 1, rotation: 0, opacity: 1, duration: 0.42, ease: "back.out(2.2)" }, T.bunyi - 0.04);
  ["#t3-w1", "#t3-w2", "#t3-w3"].forEach((w, i) => {
    tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "power1.out" }, T.bunyi + 0.12 + i * 0.1);
    loop(w, T.bunyi + 0.45 + i * 0.1, W.t3.end - 0.2, { opacity: 0.2 }, 0.5);
  });
  pop("#t3-s1", T.bunyi + 0.12, { rot: -16 });
  pop("#t3-s2", T.bunyi + 0.3, { rot: 16 });
  loop("#t3-s1", T.bunyi + 0.6, W.t3.end - 0.2, { y: -10 }, 0.7);
  loop("#t3-s2", T.bunyi + 0.75, W.t3.end - 0.2, { y: 10 }, 0.7);

  // ------------------------------------------------------------ 6. TANDA 4 — baca sikit, dah penat
  tl.fromTo("#b4", { x: -520, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, T.n4 - 0.08);
  tl.fromTo("#b4", { scaleX: 1.4, scaleY: 0.75, transformOrigin: "0% 100%" }, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" }, T.n4 + 0.1);
  tl.fromTo("#t4-label", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.n4 + 0.3);
  tl.fromTo("#t4-bat", { scale: 0.6, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, T.n4 + 0.35);
  tl.fromTo(".segfill", { scaleY: 0 }, { scaleY: 1, duration: 0.2, stagger: 0.06, ease: "power2.out" }, T.n4 + 0.55);
  tl.fromTo("#t4-pct", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.bacaSikit);
  const pct = { v: 100 };
  const pctEl = $("#t4-pct");
  const setPct = () => (pctEl.textContent = Math.round(pct.v) + "%");
  [[4, 20.25, 80], [3, 20.6, 60], [2, 20.95, 40], [1, 21.3, 20]].forEach(([k, t, v]) => {
    tl.to("#sg" + k, { scaleY: 0, duration: 0.25, ease: "power2.in" }, t);
    tl.to(pct, { v: v, duration: 0.25, ease: "none", onUpdate: setPct }, t);
  });
  tl.to("#sg0", { backgroundColor: "#EE1C2A", duration: 0.2 }, 21.38);
  tl.to(pct, { v: 5, duration: 0.3, ease: "none", onUpdate: setPct }, T.penat - 0.1);
  tl.to("#t4-pct", { color: "#FF5A64", duration: 0.15 }, T.penat);
  loop("#sg0", T.penat, W.t4.end - 0.25, { opacity: 0.2 }, 0.36);
  shake("#t4-bat", T.penat, 10, 0.35);
  ["#t4-z1", "#t4-z2", "#t4-z3"].forEach((z, i) => {
    tl.fromTo(z, { y: 50, opacity: 0, scale: 0.4 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 21.9 + i * 0.18);
    tl.to(z, { y: -24, rotation: 12, duration: 0.7, ease: "sine.inOut" }, 22.3 + i * 0.18);
  });

  // ------------------------------------------------------------ 7. TANDA 5 — tak yakin depan orang
  tl.fromTo("#b5", { scale: 5, opacity: 0, filter: "blur(16px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.38, ease: "power4.out" }, T.n5 - 0.05);
  shake("#t5-cam", T.n5 + 0.2, 10, 0.25);
  tl.fromTo("#t5-label", { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, T.n5 + 0.4);
  tl.fromTo("#t5-meter .bar", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.35, stagger: 0.06, ease: "back.out(1.8)" }, T.n5 + 0.5);
  tl.fromTo("#t5-b0", { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "back.out(2)" }, T.yakin5);
  tl.fromTo("#t5-frac", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power4.out" }, T.yakin5 + 0.1);
  tl.to("#t5-meter .bar:not(:first-child)", { keyframes: { y: [0, 10, -5, 0] }, duration: 0.3, stagger: 0.04, ease: "none" }, T.yakin5 + 0.15);
  pop("#t5-bubble", T.baca5 - 0.06, { ease: "back.out(2)" });
  tl.to("#t5-bubble", { scale: 0.6, duration: 0.9, ease: "power2.inOut" }, T.depanOrang + 0.1);
  const look = [[14, 4], [-14, 2], [-14, 14]];
  ["#t5-e1", "#t5-e2", "#t5-e3"].forEach((e, i) => {
    const t = T.depanOrang + i * 0.16;
    pop(e, t, { rot: i % 2 ? 18 : -18, ease: "back.out(2.6)", dur: 0.38 });
    tl.fromTo(e + " .pupil", { x: 0, y: 0 }, { x: look[i][0], y: look[i][1], duration: 0.25, ease: "power2.out" }, t + 0.25);
  });
  tl.to(".eye", { keyframes: { scaleY: [1, 0.08, 1] }, duration: 0.22, ease: "none" }, 26.95);

  // ------------------------------------------------------------ 8. REASSURANCE
  tl.fromTo("#re-dots", { y: 0 }, { y: -104, duration: W.reassure.dur, ease: "none" }, W.reassure.start);
  loop("#re-r1", W.reassure.start, W.reassure.end, { scale: 1.12 }, 2.0);
  loop("#re-r2", W.reassure.start, W.reassure.end, { scale: 0.9 }, 2.4);
  tl.to("#reassure-cam", { scale: 1.03, duration: 3.2, ease: "none" }, 28.0);
  tl.fromTo("#re-pill", { y: -80, opacity: 0, rotation: -6 }, { y: 0, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(2)" }, T.makAyah - 0.04);
  tl.fromTo("#re-l1a", { x: -220, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "expo.out" }, T.ini2);
  slam("#re-l1b", T.bukan, 1.8, 0.3);
  tl.fromTo("#re-l2", { y: 80, opacity: 0, rotationX: -80, transformPerspective: 600 }, { y: 0, opacity: 1, rotationX: 0, duration: 0.45, ease: "power3.out" }, T.bermakna);
  pop("#re-l3", T.anakAwak, { rot: -8 });
  tl.fromTo("#re-l4", { scale: 0.4, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.8)" }, T.lemah);
  prepDraw(["#re-strike-w", "#re-strike"]);
  draw(["#re-strike-w", "#re-strike"], T.lemah + 0.16, 0.28, "power3.inOut");
  shake("#re-l4", T.lemah + 0.4, 10, 0.25);
  tl.fromTo("#re-heart", { scale: 0, rotation: -30, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" }, 31.08);

  // ------------------------------------------------------------ 9. HARAPAN — rentak sendiri → yakin
  tl.fromTo("#hope-cam", { scale: 1 }, { scale: 1.03, duration: T.yakin - W.hope.start, ease: "none" }, W.hope.start);
  tl.fromTo(".lane", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 31.5);
  tl.fromTo("#ha-star", { scale: 0, rotation: -90, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(1.8)" }, 31.62);
  loop("#ha-star", 32.2, 34.1, { rotation: 10 }, 1.0);
  ["#ha-d0", "#ha-d1", "#ha-d2"].forEach((d, i) => pop(d, 31.58 + i * 0.06, { dur: 0.3 }));
  // Laju berbeza, semua sampai ke bintang.
  tl.to("#ha-d0", { x: 600, duration: 0.72, ease: "power2.in" }, 31.75);
  tl.to("#ha-d0", { x: 710, y: 130, scale: 0.2, opacity: 0, duration: 0.16, ease: "power2.in" }, 32.47);
  tl.to("#ha-d1", { x: 600, duration: 1.12, ease: "sine.inOut" }, 31.85);
  tl.to("#ha-d1", { x: 710, y: -20, scale: 0.2, opacity: 0, duration: 0.16, ease: "power2.in" }, 32.97);
  tl.to(
    "#ha-d2",
    {
      keyframes: [
        { x: 150, duration: 0.34, ease: "power2.out" }, { x: 150, duration: 0.12 },
        { x: 300, duration: 0.34, ease: "power2.out" }, { x: 300, duration: 0.12 },
        { x: 450, duration: 0.32, ease: "power2.out" }, { x: 450, duration: 0.1 },
        { x: 600, duration: 0.3, ease: "power2.out" },
      ],
    },
    31.92,
  );
  tl.to("#ha-d2", { x: 710, y: -170, scale: 0.2, opacity: 0, duration: 0.16, ease: "power2.in" }, 33.48);
  [32.6, 33.12, 33.62].forEach((t) => tl.to("#ha-star svg", { keyframes: { scale: [1, 1.28, 1] }, duration: 0.32, ease: "none" }, t));
  tl.fromTo("#ha-title", { y: 60, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(2)" }, T.rentak - 0.06);
  tl.to("#ha-a", { y: -280, opacity: 0, scale: 0.9, duration: 0.35, ease: "power3.in" }, 34.02);
  tl.fromTo("#hb-chip", { y: -60, opacity: 0, scale: 0.6 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, T.sokongan2 - 0.18);
  tl.fromTo("#hb-check", { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2.5)" }, T.betul - 0.06);
  prepDraw("#hb-tick");
  draw("#hb-tick", T.betul + 0.05, 0.25);
  tl.fromTo("#hb-label", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, 34.55);
  tl.fromTo("#hb-meter .bar", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.35, stagger: 0.05, ease: "back.out(1.8)" }, 34.62);
  $$(".hbf").forEach((f, i) => {
    tl.fromTo(f, { scaleY: 0 }, { scaleY: 1, duration: 0.28, ease: "back.out(2)" }, 35.3 + i * 0.35);
  });
  $$(".plus").forEach((p, i) => {
    tl.fromTo(p, { y: 24, opacity: 0, scale: 0.5 }, { y: -8, opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, 35.3 + i * 0.35);
    tl.to(p, { y: -52, opacity: 0, duration: 0.35, ease: "power1.in" }, 35.62 + i * 0.35);
  });
  tl.to("#hb-meter", { keyframes: { scale: [1, 1.06, 1] }, duration: 0.35, ease: "none" }, 36.8);
  slam("#hb-yakin", T.yakin, 2.5, 0.38);
  tl.to("#hope-cam", { scale: 1.07, duration: 0.3, ease: "power4.out" }, T.yakin);
  shake("#hope-cam", T.yakin + 0.06, 10, 0.28);
  $$("#hb-spark .spk").forEach((s, i) => {
    const a = (i / 8) * TAU + 0.2;
    tl.fromTo(s, { x: 0, y: 0, scale: 0, rotation: 0 }, { x: Math.cos(a) * 470, y: Math.sin(a) * 175, scale: 1.5, rotation: 200, duration: 0.6, ease: "power3.out" }, T.yakin + 0.05);
    tl.to(s, { opacity: 0, duration: 0.2, ease: "none" }, T.yakin + 0.42);
  });

  // ------------------------------------------------------------ 10. CTA
  tl.fromTo("#cta-rays", { rotation: 0 }, { rotation: 40, duration: W.cta.dur, ease: "none" }, W.cta.start);
  tl.fromTo("#cta-logo", { scale: 0.2, rotation: -25, opacity: 0, y: 200 }, { scale: 1, rotation: 0, opacity: 1, y: 0, duration: 0.75, ease: "elastic.out(1, 0.55)" }, 37.8);
  loop("#cta-logo", 38.6, END, { y: -12, rotation: 1.5 }, 1.6);
  tl.fromTo("#cta-q1", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }, T.nakTips);
  tl.fromTo("#cta-q2", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.2)" }, T.parenting - 0.12);
  pop("#cta-like", 38.55, { rot: -10 });
  pop("#cta-komen", 38.95, { rot: 10 });
  tl.fromTo("#cta-follow", { y: 220, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, T.follow - 0.06);
  tl.to("#cta-follow", { keyframes: { scale: [1, 0.92, 1.06, 1] }, duration: 0.45, ease: "none" }, T.minda);
  tl.fromTo("#cta-ring", { scale: 0.3, opacity: 1 }, { scale: 3.8, opacity: 0, duration: 0.75, ease: "power2.out", immediateRender: false }, T.minda + 0.05);
  tl.to("#cta-plus", { scale: 0, rotation: 90, svgOrigin: "40 40", duration: 0.2, ease: "back.in(2)" }, T.optima - 0.06);
  prepDraw("#cta-tick");
  draw("#cta-tick", T.optima + 0.06, 0.25);

  // ------------------------------------------------------------ SUBTITLES
  C.SUBS.forEach((s, i) => {
    const el = $("#sub-" + i);
    tl.fromTo(el, { opacity: 0, y: 26, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "back.out(2)" }, s.start - 0.04);
    tl.to(el, { opacity: 0, y: -8, duration: 0.12, ease: "power1.in" }, s.end);
    el.querySelectorAll(".kw").forEach((k) => {
      const t = +k.dataset.t;
      tl.to(k, { color: "#FFD23F", duration: 0.08, ease: "none" }, t);
      tl.to(k, { keyframes: { scale: [1, 1.12, 1] }, duration: 0.3, ease: "none" }, t);
    });
  });

  window.__timelines["main"] = tl;
})();
