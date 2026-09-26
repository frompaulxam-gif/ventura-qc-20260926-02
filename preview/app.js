(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const animate = (el, frames, options) => {
    if (reduce.matches) return null;
    const a = el.animate(frames,options); animations.add(a);
    a.finished.then(()=>animations.delete(a),()=>animations.delete(a)); return a;
  };
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { animate(e.target,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.2,.75,.2,1)'}); observer.unobserve(e.target); }
  }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const motionObserver = new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('offscreen',!e.isIntersecting)));
  document.querySelectorAll('.service-card,.hero-demo,.audit-orb').forEach(el=>motionObserver.observe(el));
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));
  document.querySelectorAll('.detail-toggle').forEach(button=>{
    const panel=document.getElementById(button.getAttribute('aria-controls')); let current;
    button.addEventListener('click',()=>{
      const opening=button.getAttribute('aria-expanded')!=='true';
      const from=panel.hidden?0:panel.getBoundingClientRect().height;
      if(current) current.cancel();
      button.setAttribute('aria-expanded',String(opening)); panel.hidden=false;
      const to=opening?panel.scrollHeight:0;
      current=animate(panel,[{height:from+'px',opacity:opening?.2:1},{height:to+'px',opacity:opening?1:0}],{duration:360,easing:'cubic-bezier(.2,.75,.2,1)'});
      if(current) current.onfinish=()=>{panel.hidden=!opening;current=null}; else panel.hidden=!opening;
    });
  });
  const stage=document.querySelector('.hero-demo'), orb=document.querySelector('.orb-inner');
  let x=0,y=0,tx=0,ty=0,raf=0,last=0;
  function frame(now){const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;const f=1-Math.exp(-dt*7);x+=(tx-x)*f;y+=(ty-y)*f;orb.style.transform=`translate(${x}px,${y}px)`;if(Math.abs(tx-x)+Math.abs(ty-y)>.05)raf=requestAnimationFrame(frame);else{raf=0;last=0}}
  function start(){if(!raf&&!reduce.matches)raf=requestAnimationFrame(frame)}
  stage.addEventListener('pointermove',e=>{if(reduce.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*56;ty=((e.clientY-r.top)/r.height-.5)*56;start()},{passive:true});
  stage.addEventListener('pointerleave',()=>{tx=ty=0;start()});
  reduce.addEventListener('change',()=>{if(reduce.matches){animations.forEach(a=>a.finish());cancelAnimationFrame(raf);raf=0;orb.style.transform='none';x=y=tx=ty=0;}});
  document.querySelectorAll('[data-interest]').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('[name=service]').forEach(input=>{if(input.value===a.dataset.interest)input.checked=true})}));
  document.querySelector('#audit-form').addEventListener('submit',e=>{
    e.preventDefault(); const data=new FormData(e.currentTarget);
    const body=`Hello Ventura AI,\n\nI’d like to book a free audit.\n\nName: ${data.get('name')}\nBusiness: ${data.get('business')}\nEmail: ${data.get('email')}\nInterested in: ${data.getAll('service').join(', ')||'Help me choose'}\n\nThanks!`;
    location.href=`mailto:hello@venturasolutions.co.uk?subject=${encodeURIComponent('Free audit enquiry')}&body=${encodeURIComponent(body)}`;
    document.querySelector('#form-note').textContent='Your email app should open with a draft. Check it and send it to request your audit.';
  });
})();
