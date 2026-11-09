(function(){
  "use strict";
  var doc=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G=window.gsap, ST=window.ScrollTrigger;
  if(G&&ST) G.registerPlugin(ST);
  var $=function(s,c){return (c||document).querySelector(s);};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s));};

  /* ---------- Défilement fluide ---------- */
  var lenis=null;
  if(!reduce&&window.Lenis){
    try{
      lenis=new window.Lenis({lerp:.11,smoothWheel:true});
      if(G&&ST){lenis.on('scroll',ST.update);G.ticker.add(function(t){lenis.raf(t*1000);});G.ticker.lagSmoothing(0);}
      else{var raf=function(t){lenis.raf(t);requestAnimationFrame(raf);};requestAnimationFrame(raf);}
    }catch(e){lenis=null;}
  }
  function goTo(target){
    if(lenis) lenis.scrollTo(target,{offset:-20,duration:1.4});
    else target.scrollIntoView({behavior:reduce?'auto':'smooth'});
  }

  /* ---------- Menu ---------- */
  var burger=$('#burger'), menu=$('#menu');
  function setMenu(open){
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open);
    burger.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    menu.setAttribute('aria-hidden',!open);
    if(lenis){open?lenis.stop():lenis.start();}
  }
  burger.addEventListener('click',function(){setMenu(!document.body.classList.contains('menu-open'));});
  document.addEventListener('keydown',function(e){if(e.key==='Escape') setMenu(false);});

  /* Liens d'ancre + précochage du formulaire */
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(id.length<2) return;
      var t=document.querySelector(id); if(!t) return;
      e.preventDefault(); setMenu(false);
      if(a.dataset.need){$$('input[name="besoin"]').forEach(function(i){if(i.value===a.dataset.need) i.checked=true;});}
      goTo(t);
    });
  });

  /* ---------- Horloge ---------- */
  var clock=$('#clock');
  function tick(){
    try{clock.textContent=new Intl.DateTimeFormat('fr-FR',{timeZone:'Africa/Douala',hour:'2-digit',minute:'2-digit'}).format(new Date())+' (UTC+1)';}catch(e){}
  }
  tick(); setInterval(tick,15000);

  /* ---------- Champ de modules (hero) ---------- */
  (function field(){
    var cv=$('#field'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d');
    var COLORS=['#FD6552','#17BDBB','#0A7F7D','#FFB81C','#2747E6','#17BDBB','#0A7F7D'];
    var w=0,h=0,size=44,cols=0,rows=0,cells=[],dpr=1;
    var px=-9999,py=-9999,running=false,visible=true,last=0,sweep=null;
    function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
    function resize(){
      var r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2);
      w=r.width; h=r.height; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      size=w<600?36:(w<1100?44:52);
      cols=Math.ceil(w/size)+1; rows=Math.ceil(h/size)+1; cells=[];
      for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){var i=y*cols+x;cells.push({x:x,y:y,s:Math.floor(rnd(i)*4),r:Math.floor(rnd(i+9)*4),c:COLORS[Math.floor(rnd(i+3)*COLORS.length)],h:0,k:rnd(i+17)});}
      if(!running) draw(performance.now());
    }
    function shape(cx,cy,s,kind,rot,col,a){
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot*Math.PI/2); ctx.globalAlpha=a; ctx.fillStyle=col;
      var hs=s/2; ctx.beginPath();
      if(kind===0){var rr=s*.12;ctx.moveTo(-hs+rr,-hs);ctx.arcTo(hs,-hs,hs,hs,rr);ctx.arcTo(hs,hs,-hs,hs,rr);ctx.arcTo(-hs,hs,-hs,-hs,rr);ctx.arcTo(-hs,-hs,hs,-hs,rr);}
      else if(kind===1){ctx.moveTo(-hs,hs);ctx.arc(-hs,hs,s,-Math.PI/2,0);ctx.closePath();}
      else if(kind===2){ctx.arc(0,0,hs,0,Math.PI*2);}
      else{ctx.moveTo(-hs,hs);ctx.arc(0,hs,hs,Math.PI,0);ctx.closePath();}
      ctx.fill(); ctx.restore();
    }
    function draw(t){
      ctx.clearRect(0,0,w,h);
      var R=size*3.4, gap=size*.14, inner=size-gap*2;
      ctx.strokeStyle='rgba(22,36,44,0.06)'; ctx.lineWidth=1;
      for(var i=0;i<cells.length;i++){
        var c=cells[i], cx=c.x*size+size/2, cy=c.y*size+size/2;
        var d=Math.hypot(cx-px,cy-py), target=d<R?Math.pow(1-d/R,1.4):0;
        c.h+=(target-c.h)*.14;
        ctx.strokeRect(c.x*size+.5,c.y*size+.5,size,size);
        var amb=c.k<.11?(.5+.5*Math.sin(t*.0008+c.k*60)):0;
        if(c.h>.015){shape(cx,cy,inner*(.35+.65*c.h),c.s,c.r+(c.h>.5?1:0),c.c,Math.min(1,c.h*1.3));}
        else if(amb>.02){shape(cx,cy,inner*.6,c.s,c.r,c.k<.025?c.c:'#16242C',c.k<.025?amb*.55:amb*.11);}
      }
    }
    function loop(t){
      if(!running) return;
      if(sweep){var p=Math.min(1,(t-sweep.t0)/sweep.d), e=1-Math.pow(1-p,3);px=sweep.x0+(sweep.x1-sweep.x0)*e;py=sweep.y0+(sweep.y1-sweep.y0)*e+Math.sin(p*Math.PI*2)*h*.08;if(p>=1){sweep=null;px=-9999;py=-9999;}}
      draw(t); requestAnimationFrame(loop);
    }
    function start(){if(running||reduce) return; running=true; requestAnimationFrame(loop);}
    function stop(){running=false;}
    resize();
    window.addEventListener('resize',function(){clearTimeout(resize._t);resize._t=setTimeout(resize,120);});
    var hero=cv.parentElement;
    hero.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();px=e.clientX-r.left;py=e.clientY-r.top;sweep=null;});
    hero.addEventListener('pointerleave',function(){px=-9999;py=-9999;});
    if('IntersectionObserver' in window){new IntersectionObserver(function(en){visible=en[0].isIntersecting;visible?start():stop();}).observe(hero);}
    if(reduce){
      cells.forEach(function(c){c.h=c.k<.08?.8:0;}); draw(0);
    }else{
      sweep={t0:performance.now()+250,d:2600,x0:-80,y0:h*.75,x1:w+80,y1:h*.2};
      start();
    }
  })();

  /* ---------- Largeur réelle de la fenêtre (sans barre de défilement) ---------- */
  function setVw(){doc.style.setProperty('--vw',doc.clientWidth+'px');}
  setVw(); window.addEventListener('resize',setVw);

  /* ---------- Animations GSAP ---------- */
  if(G&&ST&&!reduce){
    doc.classList.add('gsap-on');
    var loading=doc.classList.contains('is-loading');
    var tl=G.timeline({defaults:{ease:'expo.out'},paused:loading,onComplete:function(){ST.refresh();}});
    tl.from('#heroTitle .w>span',{yPercent:115,duration:1.3,stagger:.055})
      .fromTo('#heroTitle',{'--w':66},{'--w':112,duration:1.8,ease:'power3.out'},0)
      .from('.hero-fade',{y:24,opacity:0,duration:1,stagger:.1},.55)
      .from('.hero-label .pill',{y:16,opacity:0,duration:.8,stagger:.08},.1);
    if(window.getComputedStyle($('.hero-logo')).display!=='none'){
      tl.fromTo('#heroMark .hm-draw',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.4,ease:'power3.inOut',stagger:{each:.18}},.2)
        .from('#heroMark .hm-dot',{y:-60,opacity:0,duration:1.1,ease:'bounce.out',stagger:.15},.9);
      if(canHover){
        var d1x=G.quickTo('#hmDot1','x',{duration:.6,ease:'power3'}),d1y=G.quickTo('#hmDot1','y',{duration:.6,ease:'power3'}),
            d2x=G.quickTo('#hmDot2','x',{duration:.8,ease:'power3'}),d2y=G.quickTo('#hmDot2','y',{duration:.8,ease:'power3'});
        $('.hero').addEventListener('pointermove',function(e){
          var r=$('#heroMark').getBoundingClientRect(),nx=(e.clientX-(r.left+r.width/2))/window.innerWidth,ny=(e.clientY-(r.top+r.height/2))/window.innerHeight;
          d1x(nx*14);d1y(ny*10);d2x(nx*20);d2y(ny*14);
        });
      }
    }

    /* Manifeste : mots qui s'allument au défilement */
    var mf=$('#manifesto');
    (function splitWords(el){
      var out=[];
      [].slice.call(el.childNodes).forEach(function(n){
        if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(function(p){if(!p) return; if(/^\s+$/.test(p)){out.push(document.createTextNode(p));}else{var s=document.createElement('span');s.className='mw';s.textContent=p;out.push(s);}});}
        else out.push(n);
      });
      el.textContent=''; out.forEach(function(n){el.appendChild(n);});
    })(mf);
    var words=$$('.mw',mf);
    ST.create({trigger:mf,start:'top 80%',end:'bottom 45%',scrub:true,onUpdate:function(s){var n=Math.round(s.progress*words.length);words.forEach(function(w,i){w.classList.toggle('on',i<n);});}});

    /* Expertises : défilement horizontal sur grand écran */
    var mm=G.matchMedia();
    ST.config({ignoreMobileResize:true});
    mm.add('all',function(){
      var hx=$('#hx'), track=$('#hxTrack'), bars=$$('.hx-progress .bar i');
      hx.classList.add('hx-on');
      var dist=function(){return track.scrollWidth-doc.clientWidth;};
      var tw=G.to(track,{x:function(){return -dist();},ease:'none',scrollTrigger:{trigger:hx,pin:true,scrub:.8,start:'top top',end:function(){return '+='+dist();},invalidateOnRefresh:true,anticipatePin:1,
        onUpdate:function(s){var p=s.progress*(bars.length-1);bars.forEach(function(b,i){var v=Math.max(0,Math.min(1,p-i+1));if(i===0)v=1;b.style.setProperty('--p',v);});}}});
      bars.forEach(function(b,i){b.style.setProperty('--p',i===0?1:0);});
      /* parallaxe des visuels et légère inclinaison selon la vitesse */
      $$('.panel',track).forEach(function(pn){
        var v=$('.pn-visual',pn), h=$('h3',pn);
        G.fromTo(v,{xPercent:14},{xPercent:-14,ease:'none',scrollTrigger:{trigger:pn,containerAnimation:tw,start:'left right',end:'right left',scrub:true}});
        G.fromTo(h,{'--w':84},{'--w':112,ease:'none',scrollTrigger:{trigger:pn,containerAnimation:tw,start:'left 85%',end:'left 20%',scrub:true}});
      });
      var skewTo=G.quickTo($$('.panel h3',track),'skewX',{duration:.5,ease:'power3'});
      var hint=$('#hxHint');
      ST.create({trigger:hx,start:'top top',end:function(){return '+='+dist();},onToggle:function(s){doc.classList.toggle('in-hx',s.isActive);},onUpdate:function(s){skewTo(G.utils.clamp(-6,6,s.getVelocity()/-300));if(s.progress>.04)hint.classList.add('gone');},onLeave:function(){skewTo(0);},onLeaveBack:function(){skewTo(0);}});
      /* les liens vers un module précis défilent à la bonne position */
      $$('a[href^="#exp-"]').forEach(function(a){a.onclick=function(e){e.preventDefault();e.stopImmediatePropagation();var idx=['exp-com','exp-brand','exp-web','exp-auto','exp-nfc'].indexOf(a.getAttribute('href').slice(1));var st=tw.scrollTrigger;var y=st.start+(st.end-st.start)*(idx/4);if(lenis)lenis.scrollTo(y,{duration:1.4});else window.scrollTo({top:y,behavior:'smooth'});};});
      return function(){hx.classList.remove('hx-on');G.set(track,{clearProps:'transform'});$$('a[href^="#exp-"]').forEach(function(a){a.onclick=null;});};
    });

    /* Titre de contact : la largeur de la police suit le défilement */
    mm.add('(min-width: 821px)',function(){G.fromTo('#contactTitle',{'--w':70},{'--w':125,ease:'none',scrollTrigger:{trigger:'#contact',start:'top 85%',end:'top 15%',scrub:true}});});
    /* titres de section : la police s'élargit en entrant dans l'écran */
    $$('.step h3.xl').forEach(function(h){G.fromTo(h,{'--w':86},{'--w':112,ease:'none',scrollTrigger:{trigger:h,start:'top 96%',end:'top 50%',scrub:true}});});

    /* écran d'ouverture */
    if(loading){
      if(lenis) lenis.stop();
      var lt=G.timeline({defaults:{ease:'power3.inOut'},onComplete:function(){
        doc.classList.remove('is-loading');
        try{sessionStorage.setItem('modulis-intro','1');}catch(e){}
        if(lenis) lenis.start();
        ST.refresh(); tl.play();
      }});
      lt.fromTo('#loader .ld-draw',{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1,stagger:.12})
        .from('#loader .ld-dot',{y:-50,opacity:0,duration:.8,ease:'bounce.out',stagger:.12},.55)
        .from('#loader .loader-word',{letterSpacing:'1.2em',opacity:0,duration:1,ease:'expo.out'},.45)
        .from('#loader .loader-sign',{y:10,opacity:0,duration:.6},.9)
        .to('#loader .loader-in',{y:-30,opacity:0,duration:.5,ease:'power2.in'},1.75)
        .to('#loader',{clipPath:'inset(0 0 100% 0)',duration:.8,ease:'expo.inOut'},1.95);
    }
    window.addEventListener('load',function(){ST.refresh();});
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ST.refresh();});
  }

  if(!(G&&ST&&!reduce)) doc.classList.remove('is-loading');

  /* ---------- Barre de progression, bouton retour en haut ---------- */
  (function progress(){
    var bar=$('#progress'), top=$('#totop'), ticking=false;
    function upd(){
      ticking=false;
      var max=doc.scrollHeight-window.innerHeight, p=max>0?Math.min(1,window.scrollY/max):0;
      bar.style.setProperty('--sp',p.toFixed(4)); top.style.setProperty('--sp',p.toFixed(4));
      top.classList.toggle('show',window.scrollY>window.innerHeight*.8);
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd);}},{passive:true});
    upd();
    top.addEventListener('click',function(){if(lenis)lenis.scrollTo(0,{duration:1.6});else window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});
  })();

  /* ---------- Bandeau défilant, sensible à la vitesse de défilement ---------- */
  (function band(){
    var rows=$$('.band-row'); if(!rows.length) return;
    var data=rows.map(function(r){return {el:$('.band-track',r),dir:+r.dataset.dir,x:0,w:0};});
    function measure(){data.forEach(function(d){d.w=d.el.scrollWidth/2;});}
    measure(); window.addEventListener('resize',measure);
    if(reduce) return;
    var lastY=window.scrollY, vel=0, sign=1, visible=true;
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){visible=e[0].isIntersecting;}).observe($('.band'));}
    (function loop(){
      var y=window.scrollY, dy=y-lastY; lastY=y;
      if(dy!==0) sign=dy>0?1:-1;
      vel+=(Math.min(40,Math.abs(dy))-vel)*.1;
      if(visible){data.forEach(function(d){d.x-=(0.6+vel*.35)*d.dir*sign; if(d.w){d.x=((d.x%d.w)-d.w)%d.w;} d.el.style.transform='translate3d('+d.x.toFixed(2)+'px,0,0)';});}
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- Curseur ---------- */
  (function cursor(){
    if(!canHover||reduce) return;
    var c=$('#cursor'), lab=$('#cursorLabel'), x=-100,y=-100,cx=-100,cy=-100;
    doc.classList.add('has-cursor');
    function state(t){
      if(!t||!t.closest) return;
      var zone=t.closest('[data-cursor]'), link=t.closest('a,button,input,select,textarea,label,summary');
      c.classList.toggle('is-link',!!link); c.classList.toggle('is-label',!!zone&&!link);
      if(zone&&!link) lab.textContent=zone.dataset.cursor;
    }
    window.addEventListener('pointermove',function(e){x=e.clientX;y=e.clientY;c.classList.remove('is-hidden');state(e.target);},{passive:true});
    window.addEventListener('scroll',function(){if(x>0)state(document.elementFromPoint(x,y));},{passive:true});
    document.addEventListener('pointerleave',function(){c.classList.add('is-hidden');});
    (function loop(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';requestAnimationFrame(loop);})();
  })();

  /* ---------- Halo qui suit la souris sur les cartes ---------- */
  $$('.demo').forEach(function(d){d.addEventListener('pointermove',function(e){var r=d.getBoundingClientRect();d.style.setProperty('--sx',(e.clientX-r.left)+'px');d.style.setProperty('--sy',(e.clientY-r.top)+'px');});});

  /* ---------- Titre de l'onglet quand le visiteur s'absente ---------- */
  (function(){var t=document.title;document.addEventListener('visibilitychange',function(){document.title=document.hidden?'Revenez construire avec nous · MODULIS':t;});})();

  /* ---------- Méthode : étape active ---------- */
  (function method(){
    var steps=$$('.step'), bigN=$('#bigN'), cells=$$('#weeks i'), now=$('#weeksNow');
    function activate(s){
      steps.forEach(function(x){x.classList.toggle('on',x===s);});
      bigN.textContent=s.dataset.n;
      var a=+s.dataset.from,b=+s.dataset.to;
      cells.forEach(function(c,i){var on=i+1>=a&&i+1<=b;c.classList.toggle('on',on);c.style.setProperty('--c',s.dataset.c);});
      now.textContent=s.querySelector('.step-when').textContent.trim();
    }
    activate(steps[0]);
    var cur=steps[0], ticking=false;
    function check(){
      ticking=false; var mid=window.innerHeight*.55, pick=steps[0];
      steps.forEach(function(s){if(s.getBoundingClientRect().top<mid) pick=s;});
      if(pick!==cur){cur=pick;activate(pick);}
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(check);}},{passive:true});
    check();
  })();

  /* ---------- Boutons magnétiques ---------- */
  if(canHover&&!reduce){
    $$('.magnetic').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();var x=(e.clientX-r.left-r.width/2)*.22,y=(e.clientY-r.top-r.height/2)*.32;b.style.transform='translate('+x+'px,'+y+'px)';});
      b.addEventListener('pointerleave',function(){b.style.transform='';});
    });
  }

  /* ---------- Laboratoire : carte NFC ---------- */
  (function card(){
    var stage=$('#stage'), card=$('#ncard');
    var bind=function(inp,out,fallback,cb){inp.addEventListener('input',function(){var v=inp.value.trim();out.textContent=v||fallback;if(cb)cb(v);});};
    bind($('#inName'),$('#ncName'),'Votre nom');
    bind($('#inRole'),$('#ncRole'),'Votre fonction');
    bind($('#inCo'),$('#ncCo'),'Votre entreprise',function(v){$('#ncLogo').textContent=(v||'V').charAt(0).toUpperCase();});
    $$('.swatches button').forEach(function(b){b.addEventListener('click',function(){$$('.swatches button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});card.style.setProperty('--acc',b.dataset.c);});});
    $$('[data-mat]').forEach(function(b){b.addEventListener('click',function(){$$('[data-mat]').forEach(function(x){x.setAttribute('aria-pressed',x===b);});card.className='ncard'+(b.dataset.mat==='pvc'?'':' '+b.dataset.mat);});});
    if(reduce) return;
    function tilt(e){
      var r=stage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform='rotateY('+(x*26)+'deg) rotateX('+(-y*20)+'deg) translateZ(0)';
      card.style.setProperty('--mx',(x+.5)*100+'%'); card.style.setProperty('--my',(y+.5)*100+'%');
    }
    stage.addEventListener('pointermove',tilt);
    stage.addEventListener('pointerleave',function(){card.style.transform='rotateY(-14deg) rotateX(8deg)';});
    card.style.transform='rotateY(-14deg) rotateX(8deg)';
  })();

  /* ---------- Laboratoire : calculateur ---------- */
  (function calc(){
    var rT=$('#rTeam'), rH=$('#rHours'), share=.5, shown=1656;
    var fmt=new Intl.NumberFormat('fr-FR'), fmt1=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1,minimumFractionDigits:1});
    function fill(r){r.style.setProperty('--fill',((r.value-r.min)/(r.max-r.min)*100)+'%');}
    function run(){
      fill(rT); fill(rH);
      $('#oTeam').textContent=rT.value; $('#oHours').textContent=rH.value+' h';
      var hours=Math.round(rT.value*rH.value*share*46), fte=hours/(40*46);
      $('#oFte').textContent='récupérées par an, soit environ '+fmt1.format(fte)+(fte>=2?' postes':' poste')+' à temps plein';
      var from=shown, to=hours, t0=performance.now(), el=$('#oYear');
      if(reduce){el.textContent=fmt.format(to)+' h';shown=to;return;}
      (function step(t){var p=Math.min(1,(t-t0)/450),v=Math.round(from+(to-from)*(1-Math.pow(1-p,3)));el.textContent=fmt.format(v)+' h';if(p<1)requestAnimationFrame(step);else shown=to;})(t0);
    }
    rT.addEventListener('input',run); rH.addEventListener('input',run);
    $$('#shareSeg button').forEach(function(b){b.addEventListener('click',function(){$$('#shareSeg button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});share=+b.dataset.p;run();});});
    run();
  })();

  /* ---------- Logo géant du pied de page ---------- */
  (function wordmark(){
    var wm=$('#wordmark'); if(!wm||!canHover||reduce) return;
    var letters=$$('span',wm);
    wm.addEventListener('pointermove',function(e){
      letters.forEach(function(l){var r=l.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2)),k=Math.max(0,1-d/(window.innerWidth*.22));l.style.setProperty('--w',(84+41*k).toFixed(1));l.style.setProperty('--g',Math.round(300+560*k));});
    });
    wm.addEventListener('pointerleave',function(){letters.forEach(function(l){l.style.removeProperty('--w');l.style.removeProperty('--g');});});
  })();

  /* ---------- Copier ---------- */
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      function done(t){b.textContent=t;setTimeout(function(){b.textContent='Copier';},1800);}
      function fallback(){var el=document.getElementById(b.dataset.target),r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);done('Sélectionné');}
      try{navigator.clipboard.writeText(b.dataset.copy).then(function(){done('Copié');},fallback);}catch(e){fallback();}
    });
  });

  /* ---------- Formulaire ----------
     Renseignez FORM_ENDPOINT (Formspree, Getform, ou votre API) pour activer l'envoi. */
  var FORM_ENDPOINT='';
  var form=$('#contactForm'), status=$('#formStatus');
  function say(state,msg){status.hidden=false;status.dataset.state=state;status.textContent=msg;}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var missing=$$('[required]',form).filter(function(f){return f.type==='checkbox'?!f.checked:!f.value.trim();});
    if(missing.length){say('error','Complétez les champs obligatoires : nom, e-mail, description du projet et consentement.');missing[0].focus();return;}
    var email=$('#f-email');
    if(!email.checkValidity()){say('error',"L'adresse e-mail semble incomplète. Vérifiez-la, par exemple nom@entreprise.com.");email.focus();return;}
    var fd=new FormData(form),data={};
    fd.forEach(function(v,k){if(k==='besoin'){(data.besoin=data.besoin||[]).push(v);}else data[k]=v;});
    if(!FORM_ENDPOINT){say('info',"L'envoi en ligne n'est pas encore activé. Écrivez-nous à hello@modulis.tech ou appelez le +237 6 78 23 96 36.");return;}
    var btn=form.querySelector('button[type="submit"]');btn.disabled=true;
    fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){if(!r.ok)throw new Error(r.status);form.reset();say('ok','Merci '+String(data.nom||'').split(' ')[0]+'. Votre demande est envoyée, nous vous répondons sous 24 h ouvrées.');})
      .catch(function(){say('error',"L'envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous à hello@modulis.tech.");})
      .then(function(){btn.disabled=false;});
  });

  $('#year').textContent=new Date().getFullYear();
  $('#toTop').addEventListener('click',function(){if(lenis)lenis.scrollTo(0,{duration:1.4});else window.scrollTo({top:0,behavior:reduce?"auto":"smooth"});});
  if(reduce){$$('animateMotion').forEach(function(a){a.parentNode.removeChild(a);});}
})();
