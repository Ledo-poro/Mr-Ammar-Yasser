document.addEventListener('DOMContentLoaded', function(){
    var toggleButton = document.querySelector('.menu-toggle');
    var navList = document.getElementById('primary-nav');
    if(toggleButton && navList){
        toggleButton.addEventListener('click', function(){
            var isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            toggleButton.setAttribute('aria-expanded', String(!isExpanded));
            navList.classList.toggle('show');
        });

        navList.addEventListener('click', function(e){
            var target = e.target;
            if(target && target.tagName === 'A'){
                navList.classList.remove('show');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===== Hero animated background (connected lines) =====
    setupConnectedLines('hero-bg', { maxDist: 140, density: 0.00008, pointRadius: 1.6 });

    // ===== About starfield =====
    setupStarfield('about-bg');

    // ===== Services floating equations =====
    setupEquations('services-bg');

    // ===== Dates planets background =====
    setupPlanets('dates-bg', { min: 5, max: 10 });

    // ===== Contact floating icons background =====
    setupContactIcons('contact-bg');

    // ---------- Utilities ----------
    function setupConnectedLines(id, opts){
        var canvas = document.getElementById(id);
        if(!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        var points = [];
        var maxDist = opts.maxDist || 120;
        var density = opts.density || 0.00008;
        var pointRadius = opts.pointRadius || 1.4;
        var animationId, ro;

        function resize(){
            var rect = canvas.getBoundingClientRect();
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var area = rect.width * rect.height;
            var count = Math.max(24, Math.min(100, Math.floor(area * density)));
            points = [];
            for(var i=0;i<count;i++){
                points.push({
                    x: Math.random()*rect.width,
                    y: Math.random()*rect.height,
                    vx: (Math.random()-0.5)*0.6,
                    vy: (Math.random()-0.5)*0.6
                });
            }
        }

        function step(){
            var rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);
            for(var i=0;i<points.length;i++){
                var p=points[i];
                p.x+=p.vx; p.y+=p.vy;
                if(p.x<0||p.x>rect.width) p.vx*=-1;
                if(p.y<0||p.y>rect.height) p.vy*=-1;
            }
            ctx.lineWidth=1;
            for(var a=0;a<points.length;a++){
                for(var b=a+1;b<points.length;b++){
                    var dx=points[a].x-points[b].x, dy=points[a].y-points[b].y;
                    var dist=Math.hypot(dx,dy);
                    if(dist<maxDist){
                        var alpha=1-dist/maxDist;
                        ctx.strokeStyle='rgba(147,151,205,'+(alpha*0.6)+')';
                        ctx.beginPath();
                        ctx.moveTo(points[a].x, points[a].y);
                        ctx.lineTo(points[b].x, points[b].y);
                        ctx.stroke();
                    }
                }
            }
            for(var k=0;k<points.length;k++){
                var q=points[k];
                ctx.fillStyle='rgba(255,255,255,0.7)';
                ctx.beginPath();
                ctx.arc(q.x,q.y,pointRadius,0,Math.PI*2);
                ctx.fill();
            }
            animationId=requestAnimationFrame(step);
        }
        function start(){
            cancelAnimationFrame(animationId);
            resize();
            step();
            if(!ro){ ro=new ResizeObserver(resize); ro.observe(canvas); }
        }
        start();
    }

    function setupStarfield(id){
        var canvas=document.getElementById(id);
        if(!canvas) return;
        var ctx=canvas.getContext('2d');
        var dpr=Math.max(1, Math.min(2, window.devicePixelRatio||1));
        var stars=[], ro, animationId;
        function resize(){
            var rect=canvas.getBoundingClientRect();
            canvas.width=Math.floor(rect.width*dpr);
            canvas.height=Math.floor(rect.height*dpr);
            ctx.setTransform(dpr,0,0,dpr,0,0);
            var count=Math.max(60, Math.floor(rect.width*rect.height*0.00012));
            stars=[];
            for(var i=0;i<count;i++){
                stars.push({
                    x: Math.random()*rect.width,
                    y: Math.random()*rect.height,
                    r: Math.random()*1.5+0.4,
                    tw: Math.random()*0.6+0.2,
                    phase: Math.random()*Math.PI*2,
                    vy: Math.random()*0.2+0.05
                });
            }
        }
        function step(ts){
            var rect=canvas.getBoundingClientRect();
            ctx.clearRect(0,0,rect.width,rect.height);
            for(var i=0;i<stars.length;i++){
                var s=stars[i];
                s.y += s.vy;
                if(s.y>rect.height) s.y= -5;
                var alpha = 0.6 + Math.sin((s.phase += s.tw*0.03))*0.4;
                ctx.fillStyle='rgba(255,255,255,'+alpha+')';
                ctx.beginPath();
                ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
                ctx.fill();
            }
            animationId=requestAnimationFrame(step);
        }
        function start(){
            cancelAnimationFrame(animationId);
            resize();
            step();
            if(!ro){ ro=new ResizeObserver(resize); ro.observe(canvas); }
        }
        start();
    }

    function setupEquations(id){
        var canvas=document.getElementById(id);
        if(!canvas) return;
        var ctx=canvas.getContext('2d');
        var dpr=Math.max(1, Math.min(2, window.devicePixelRatio||1));
        var items=[], ro, animationId;
        var equations = [
            'E=mc^2',
            'a^2+b^2=c^2',
            'sin(x)',
            'cos(x)',
            '∫ x dx',
            'π ≈ 3.14159',
            'f(x)=mx+b',
            'Δy/Δx',
            'lim x→0 (sin x)/x',
            '∑_{i=1}^n i = n(n+1)/2',
            'σ = √Var(x)',
            'log(x)',
            'ln(x)',
            'tan(θ)',
            '∫ e^x dx = e^x + C',
            'd/dx x^n = n x^{n-1}',
            '∇·E = ρ/ε₀',
            'F=ma',
            'A=πr^2',
            'C=2πr'
        ];
        function resize(){
            var rect=canvas.getBoundingClientRect();
            canvas.width=Math.floor(rect.width*dpr);
            canvas.height=Math.floor(rect.height*dpr);
            ctx.setTransform(dpr,0,0,dpr,0,0);
            var count=Math.max(18, Math.floor(rect.width*rect.height*0.00004));
            items=[];
            for(var i=0;i<count;i++){
                items.push({
                    text: equations[Math.floor(Math.random()*equations.length)],
                    x: Math.random()*rect.width,
                    y: Math.random()*rect.height,
                    vx: (Math.random()-0.5)*0.35,
                    vy: (Math.random()-0.5)*0.35,
                    size: Math.floor(Math.random()*10)+16,
                    rot: (Math.random()-0.5)*0.03
                });
            }
        }
        function step(){
            var rect=canvas.getBoundingClientRect();
            ctx.clearRect(0,0,rect.width,rect.height);
            ctx.textBaseline='middle';
            ctx.textAlign='center';
            for(var i=0;i<items.length;i++){
                var it=items[i];
                it.x+=it.vx; it.y+=it.vy;
                if(it.x< -60) it.x=rect.width+60; if(it.x>rect.width+60) it.x=-60;
                if(it.y< -35) it.y=rect.height+35; if(it.y>rect.height+35) it.y=-35;
                ctx.save();
                ctx.translate(it.x,it.y);
                ctx.rotate(it.rot);
                ctx.font=''+it.size+'px Cairo, sans-serif';
                ctx.fillStyle='rgba(214,218,255,0.7)';
                ctx.fillText(it.text, 0, 0);
                ctx.restore();
            }
            animationId=requestAnimationFrame(step);
        }
        function start(){
            cancelAnimationFrame(animationId);
            resize();
            step();
            if(!ro){ ro=new ResizeObserver(resize); ro.observe(canvas); }
        }
        start();
    }

    function setupPlanets(id, config){
        var canvas = document.getElementById(id);
        if(!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
        var planets = [], ro, animationId;
        function hexToRgb(hex){
            var c = hex.replace('#','');
            if(c.length===3){ c = c.split('').map(function(ch){return ch+ch;}).join(''); }
            var num = parseInt(c,16);
            return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
        }
        function init(){
            var rect=canvas.getBoundingClientRect();
            canvas.width=Math.floor(rect.width*dpr);
            canvas.height=Math.floor(rect.height*dpr);
            ctx.setTransform(dpr,0,0,dpr,0,0);
            var count = Math.max(config.min||5, Math.min(config.max||10, Math.floor(rect.width*rect.height*0.000004)));
            var palette = ['#5b8cff','#ff7ab2','#ffd166','#7cf2c2','#a78bfa','#f472b6'];
            planets=[];
            for(var i=0;i<count;i++){
                var r = Math.random()*32 + 28;
                var color = palette[i % palette.length];
                planets.push({
                    x: Math.random()*rect.width,
                    y: Math.random()*rect.height,
                    r: r,
                    vx: (Math.random()-0.5)*0.12,
                    vy: (Math.random()-0.5)*0.12,
                    base: color
                });
            }
        }
        function step(){
            var rect=canvas.getBoundingClientRect();
            ctx.clearRect(0,0,rect.width,rect.height);
            ctx.save();
            ctx.globalCompositeOperation='lighter';
            for(var i=0;i<planets.length;i++){
                var p=planets[i];
                p.x+=p.vx; p.y+=p.vy;
                if(p.x < -p.r) p.x = rect.width + p.r;
                if(p.x > rect.width + p.r) p.x = -p.r;
                if(p.y < -p.r) p.y = rect.height + p.r;
                if(p.y > rect.height + p.r) p.y = -p.r;
                var rgb=hexToRgb(p.base);
                var g = ctx.createRadialGradient(p.x, p.y, p.r*0.2, p.x, p.y, p.r*2.6);
                g.addColorStop(0, 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.55)');
                g.addColorStop(1, 'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0)');
                ctx.fillStyle=g;
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r*2.6,0,Math.PI*2);
                ctx.fill();
                ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.95)';
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fill();
                ctx.strokeStyle='rgba(255,255,255,0.35)';
                ctx.lineWidth=1;
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r*1.35,0,Math.PI*2);
                ctx.stroke();
            }
            ctx.restore();
            animationId=requestAnimationFrame(step);
        }
        function start(){
            cancelAnimationFrame(animationId);
            init();
            step();
            if(!ro){ ro=new ResizeObserver(init); ro.observe(canvas); }
        }
        start();
    }

    function setupContactIcons(id){
        var canvas=document.getElementById(id);
        if(!canvas) return;
        var ctx=canvas.getContext('2d');
        var dpr=Math.max(1, Math.min(2, window.devicePixelRatio||1));
        var items=[], ro, animationId;
        var icons=['✉','☎','💬','📍','📨','📱','🌐'];
        function resize(){
            var rect=canvas.getBoundingClientRect();
            canvas.width=Math.floor(rect.width*dpr);
            canvas.height=Math.floor(rect.height*dpr);
            ctx.setTransform(dpr,0,0,dpr,0,0);
            var count=Math.max(10, Math.floor(rect.width*rect.height*0.00003));
            items=[];
            for(var i=0;i<count;i++){
                items.push({
                    text: icons[Math.floor(Math.random()*icons.length)],
                    x: Math.random()*rect.width,
                    y: Math.random()*rect.height,
                    vx: (Math.random()-0.5)*0.25,
                    vy: (Math.random()-0.5)*0.25,
                    size: Math.floor(Math.random()*14)+20,
                    rot: (Math.random()-0.5)*0.02
                });
            }
        }
        function step(){
            var rect=canvas.getBoundingClientRect();
            ctx.clearRect(0,0,rect.width,rect.height);
            ctx.textBaseline='middle';
            ctx.textAlign='center';
            for(var i=0;i<items.length;i++){
                var it=items[i];
                it.x+=it.vx; it.y+=it.vy;
                if(it.x< -80) it.x=rect.width+80; if(it.x>rect.width+80) it.x=-80;
                if(it.y< -50) it.y=rect.height+50; if(it.y>rect.height+50) it.y=-50;
                ctx.save();
                ctx.translate(it.x,it.y);
                ctx.rotate(it.rot);
                ctx.font=''+it.size+'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif';
                ctx.fillStyle='rgba(222,226,255,0.35)';
                ctx.fillText(it.text, 0, 0);
                ctx.restore();
            }
            animationId=requestAnimationFrame(step);
        }
        function start(){
            cancelAnimationFrame(animationId);
            resize();
            step();
            if(!ro){ ro=new ResizeObserver(resize); ro.observe(canvas); }
        }
        start();
    }
});
