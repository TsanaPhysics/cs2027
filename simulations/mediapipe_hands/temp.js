
    
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    

    let isTriggered = false;
        let isFinished = false;
        let treeProgress = 0;
        let rotation = 0;

    // ===== Digital AI Background Init =====
    let bgTick = 0;

    // Neural network nodes
    const neuralNodes = [];
    for (let i = 0; i < 80; i++) {
      neuralNodes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00025,
        vy: (Math.random() - 0.5) * 0.00025,
        r: Math.random() * 2.5 + 1.2,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() < 0.55 ? 0 : 1  // 0=purple 1=cyan
      });
    }

    // Binary rain columns
    const COLS = 48;
    const rainCols = [];
    for (let i = 0; i < COLS; i++) {
      rainCols.push({
        x: (i / COLS),
        y: Math.random(),
        speed: 0.0008 + Math.random() * 0.0018,
        chars: Array.from({ length: 18 }, () => Math.random() < 0.5 ? '1' : '0'),
        opacity: 0.06 + Math.random() * 0.11
      });
    }

    // Floating keyword labels
    const floatLabels = [
      'AI', 'ML', 'IoT', 'Big Data', 'Genomics', 'Sustainability',
      'Neural Net', 'Deep Learning', 'Green Tech', 'Quantum',
      'Robotics', 'BioTech', 'Smart City', 'CleanEnergy'
    ].map((t, i) => ({
      text: t,
      x: 0.08 + Math.random() * 0.84,
      y: 0.06 + Math.random() * 0.88,
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      alpha: 0.12 + Math.random() * 0.22,
      size: 11 + Math.random() * 9
    }));

    // DNA helix
    const DNA_STEPS = 60;
    let dnaPhase = 0;


    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      bgCanvas.width = window.innerWidth * dpr;
      bgCanvas.height = window.innerHeight * dpr;
      bgCanvas.style.width = window.innerWidth + 'px';
      bgCanvas.style.height = window.innerHeight + 'px';
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
        
        function triggerBloom(mode) {
            isTriggered = true;
            isFinished = true;
            document.getElementById('mainText').innerHTML = 'สั่งการเปิดงานสำเร็จแล้ว! 🚀<br><span style="font-size:0.6em;color:#4ade80">ระบบบนจอหลักกำลังแสดงผล...</span>';
            document.getElementById('subText').innerHTML = '<span style="color: #f472b6;">SciRBRU 2026 AI Robot</span>';
            
            const badge = document.getElementById('gestureBadge');
            if(badge) badge.style.display = 'none';
            
            const hint = document.getElementById('gestureHint');
            if(hint) hint.innerHTML = '';
            
            // iPad show Robot Image instead of video
            let imgElem = document.getElementById('sciweekImgEnd');
            if (!imgElem) {
                imgElem = document.createElement('img');
                imgElem.id = 'sciweekImgEnd';
                imgElem.src = 'scirbru_robot.jpg?t=' + new Date().getTime(); imgElem.alt = 'AI Robot';
                imgElem.style.maxWidth = '35vw';
                imgElem.style.margin = '20px auto';
                imgElem.style.display = 'block';
                imgElem.style.opacity = '1';
                imgElem.style.borderRadius = '20px';
                imgElem.style.boxShadow = '0 0 40px rgba(56,189,248,0.8)';
                document.getElementById('centerStage').insertBefore(imgElem, document.getElementById('gestureHint'));
            } else {
                imgElem.src = 'scirbru_robot.jpg?t=' + new Date().getTime(); imgElem.alt = 'AI Robot';
                imgElem.style.display = 'block';
                imgElem.style.opacity = '1';
                imgElem.style.maxWidth = '35vw';
                imgElem.style.borderRadius = '20px';
                imgElem.style.boxShadow = '0 0 40px rgba(56,189,248,0.8)';
            }
        }

            function drawBackground() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      bgTick++;

      // ===== ฉากหลัง Digital AI =====
      // เคลือบพื้นหลังด้วย trail fade ให้เกิด motion blur
      bgCtx.fillStyle = 'rgba(4,5,14,0.18)';
      bgCtx.fillRect(0, 0, w, h);

      if (!isTriggered || isFinished) {
        // ---------- 1. Binary Rain (matrix columns) ----------
        bgCtx.font = '13px monospace';
        rainCols.forEach(col => {
          col.y += col.speed;
          if (col.y > 1.05) { col.y = -0.1; }
          const cx = col.x * w;
          col.chars.forEach((ch, i) => {
            const cy = (col.y + i * 0.032) * h;
            if (cy < 0 || cy > h) return;
            const fade = 1 - i / col.chars.length;
            bgCtx.fillStyle = `rgba(34,197,94,${col.opacity * fade * (i === 0 ? 1 : 0.55)})`;
            // randomly flip chars
            if (Math.random() < 0.012) col.chars[i] = Math.random() < 0.5 ? '1' : '0';
            bgCtx.fillText(ch, cx, cy);
          });
        });

        // ---------- 2. Neural Network (nodes + edges) ----------
        // Move nodes
        neuralNodes.forEach(n => {
          n.x += n.vx; n.y += n.vy;
          n.pulse += 0.04;
          if (n.x < 0 || n.x > 1) n.vx *= -1;
          if (n.y < 0 || n.y > 1) n.vy *= -1;
        });

        // Draw edges between nearby nodes
        for (let i = 0; i < neuralNodes.length; i++) {
          for (let j = i + 1; j < neuralNodes.length; j++) {
            const a = neuralNodes[i], b = neuralNodes[j];
            const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
              const alpha = (1 - dist / 180) * 0.22;
              bgCtx.beginPath();
              bgCtx.moveTo(a.x * w, a.y * h);
              bgCtx.lineTo(b.x * w, b.y * h);
              bgCtx.strokeStyle = a.color === 0
                ? `rgba(184,105,255,${alpha})`
                : `rgba(56,189,248,${alpha})`;
              bgCtx.lineWidth = 0.8;
              bgCtx.stroke();
            }
          }
        }

        // Draw nodes
        neuralNodes.forEach(n => {
          const px = n.x * w, py = n.y * h;
          const glow = (Math.sin(n.pulse) + 1) * 0.5;
          const r = n.r * (1 + glow * 0.8);
          const col = n.color === 0
            ? `rgba(184,105,255,${0.55 + glow * 0.45})`
            : `rgba(56,189,248,${0.5 + glow * 0.5})`;
          // glow halo
          const grad = bgCtx.createRadialGradient(px, py, 0, px, py, r * 5);
          grad.addColorStop(0, n.color === 0 ? 'rgba(184,105,255,0.25)' : 'rgba(56,189,248,0.2)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          bgCtx.beginPath(); bgCtx.arc(px, py, r * 5, 0, Math.PI * 2);
          bgCtx.fillStyle = grad; bgCtx.fill();
          // core dot
          bgCtx.beginPath(); bgCtx.arc(px, py, r, 0, Math.PI * 2);
          bgCtx.fillStyle = col; bgCtx.fill();
        });

        // ---------- 3. DNA Helix (right side) ----------
        dnaPhase += 0.025;
        const dnaX = w * 0.88, dnaW = 40;
        for (let i = 0; i < DNA_STEPS; i++) {
          const t = i / DNA_STEPS;
          const y = t * h;
          const wave = Math.sin(t * Math.PI * 6 + dnaPhase);
          const x1 = dnaX + wave * dnaW;
          const x2 = dnaX - wave * dnaW;
          const alpha = 0.25 + Math.abs(wave) * 0.3;
          bgCtx.beginPath(); bgCtx.arc(x1, y, 2.5, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(184,105,255,${alpha})`; bgCtx.fill();
          bgCtx.beginPath(); bgCtx.arc(x2, y, 2.5, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(56,189,248,${alpha})`; bgCtx.fill();
          // rungs every 5
          if (i % 5 === 0) {
            bgCtx.beginPath(); bgCtx.moveTo(x1, y); bgCtx.lineTo(x2, y);
            bgCtx.strokeStyle = `rgba(255,196,114,${alpha * 0.5})`;
            bgCtx.lineWidth = 1; bgCtx.stroke();
          }
        }


        // ---------- 3.5 Floating Atoms and Custom Symbols ----------
        bgCtx.lineWidth = 1.5;
        if (typeof floatingAtoms !== 'undefined') {
            floatingAtoms.forEach(a => {
                a.x += a.vx; a.y += a.vy;
                if(a.x < 0 || a.x > 1) a.vx *= -1;
                if(a.y < 0 || a.y > 1) a.vy *= -1;
                
                const cx = a.x * w;
                const cy = a.y * h;
                
                bgCtx.save();
                bgCtx.translate(cx, cy);
                bgCtx.rotate(bgTick * a.rotSpeed);
                
                // Nucleus
                bgCtx.beginPath();
                bgCtx.arc(0, 0, a.radius * 0.25, 0, Math.PI*2);
                bgCtx.fillStyle = 'rgba(255, 196, 114, 0.8)';
                bgCtx.shadowColor = '#FFC472';
                bgCtx.shadowBlur = 10;
                bgCtx.fill();
                bgCtx.shadowBlur = 0;

                // Orbits
                for(let i=0; i<3; i++) {
                    bgCtx.rotate(Math.PI / 3);
                    bgCtx.beginPath();
                    bgCtx.ellipse(0, 0, a.radius, a.radius * 0.35, 0, 0, Math.PI*2);
                    bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
                    bgCtx.stroke();
                    
                    // Electron
                    const angle = bgTick * a.eSpeed + (i * Math.PI * 2 / 3);
                    const ex = Math.cos(angle) * a.radius;
                    const ey = Math.sin(angle) * a.radius * 0.35;
                    bgCtx.beginPath();
                    bgCtx.arc(ex, ey, a.radius * 0.12, 0, Math.PI*2);
                    bgCtx.fillStyle = '#fff';
                    bgCtx.shadowColor = '#fff';
                    bgCtx.shadowBlur = 5;
                    bgCtx.fill();
                    bgCtx.shadowBlur = 0;
                }
                bgCtx.restore();
            });
        }

        if (typeof customSymbols !== 'undefined') {
            bgCtx.save();
            bgCtx.textAlign = 'center';
            bgCtx.textBaseline = 'middle';
            customSymbols.forEach(sym => {
                sym.x += sym.vx; sym.y += sym.vy;
                if (sym.x < 0 || sym.x > 1) sym.vx *= -1;
                if (sym.y < 0 || sym.y > 1) sym.vy *= -1;
                
                if (sym.text === 'DURIAN') {
                    // Draw a custom tech-durian using Canvas paths
                    bgCtx.save();
                    bgCtx.translate(sym.x * w, sym.y * h);
                    const bounceY = Math.sin(bgTick * 0.02 + sym.x) * 10;
                    bgCtx.translate(0, bounceY);
                    bgCtx.rotate(bgTick * 0.005);
                    
                    // Draw spikes (Outer shape)
                    bgCtx.beginPath();
                    const spikes = 14;
                    for (let i = 0; i < spikes * 2; i++) {
                        const angle = (i * Math.PI) / spikes;
                        const rad = (i % 2 === 0) ? sym.size : sym.size * 0.6;
                        // slightly oval shape
                        const dx = Math.cos(angle) * rad * 0.9;
                        const dy = Math.sin(angle) * rad * 1.3;
                        if (i === 0) bgCtx.moveTo(dx, dy);
                        else bgCtx.lineTo(dx, dy);
                    }
                    bgCtx.closePath();
                    bgCtx.fillStyle = 'rgba(74, 222, 128, 0.2)';
                    bgCtx.fill();
                    bgCtx.strokeStyle = 'rgba(74, 222, 128, 0.9)'; // Green
                    bgCtx.shadowColor = '#4ade80';
                    bgCtx.shadowBlur = 10;
                    bgCtx.lineWidth = 2;
                    bgCtx.stroke();
                    bgCtx.shadowBlur = 0;
                    
                    // Inner fleshy part
                    bgCtx.beginPath();
                    bgCtx.ellipse(0, 0, sym.size * 0.4, sym.size * 0.6, 0, 0, Math.PI * 2);
                    bgCtx.fillStyle = 'rgba(255, 196, 114, 0.5)'; // Yellow
                    bgCtx.fill();
                    bgCtx.strokeStyle = 'rgba(255, 196, 114, 0.9)';
                    bgCtx.stroke();
                    
                    bgCtx.restore();
                } else if (sym.isText) {
                    bgCtx.font = `bold ${sym.size}px 'Kanit', sans-serif`;
                    bgCtx.fillStyle = 'rgba(56, 189, 248, 0.8)';
                    bgCtx.shadowColor = '#38bdf8';
                    bgCtx.shadowBlur = 10;
                    bgCtx.fillText(sym.text, sym.x * w, sym.y * h);
                    bgCtx.shadowBlur = 0;
                } else {
                    bgCtx.font = `${sym.size}px sans-serif`;
                    const bounceY = Math.sin(bgTick * 0.02 + sym.x) * 10;
                    bgCtx.globalAlpha = 0.6;
                    bgCtx.fillText(sym.text, sym.x * w, sym.y * h + bounceY);
                    bgCtx.globalAlpha = 1.0;
                }
            });
            bgCtx.restore();
        }

        // ---------- 4. Floating Keyword Labels ----------
        floatLabels.forEach(lbl => {
          lbl.x += lbl.vx; lbl.y += lbl.vy;
          if (lbl.x < 0.04 || lbl.x > 0.96) lbl.vx *= -1;
          if (lbl.y < 0.04 || lbl.y > 0.96) lbl.vy *= -1;
          bgCtx.font = `${lbl.size}px 'Space Grotesk', sans-serif`;
          bgCtx.fillStyle = `rgba(56,189,248,${lbl.alpha})`;
          bgCtx.fillText(lbl.text, lbl.x * w, lbl.y * h);
        });

        // ---------- 5. Center tagline glow ----------
        const tagAlpha = 0.11 + Math.sin(bgTick * 0.015) * 0.06;
        bgCtx.save();
        bgCtx.textAlign = 'center';
        bgCtx.font = "bold 17px 'Space Grotesk', sans-serif";
        bgCtx.fillStyle = `rgba(255,196,114,${tagAlpha * 2.2})`;
        bgCtx.fillText('Intelligence Science for Sustainable Future', w / 2, h - 38);
        bgCtx.font = "12px 'Kanit', sans-serif";
        bgCtx.fillStyle = `rgba(184,105,255,${tagAlpha * 1.8})`;
        bgCtx.fillText(`RBRU SciWeek 2026  ·  Digital AI  ·  ${new Date().toLocaleTimeString()}`, w / 2, h - 18);
        bgCtx.textAlign = 'left';
        bgCtx.restore();

      } else {
        // bloom tree (ตอน trigger — คงเดิม)
        treeProgress += 0.009;
        const cx = w / 2, cy = h * 0.8;
        bgCtx.save();
        bgCtx.translate(cx, cy);
        const trunkH = Math.min(treeProgress * 460, 400);
        bgCtx.strokeStyle = '#B869FF';
        bgCtx.lineWidth = 10;
        bgCtx.lineCap = 'round';
        bgCtx.beginPath(); bgCtx.moveTo(0, 0); bgCtx.lineTo(0, -trunkH); bgCtx.stroke();
        if (treeProgress > 0.28) {
          const branches = Math.floor((treeProgress - 0.28) * 18);
          for (let i = 0; i < branches; i++) {
            const angle = (i / branches) * Math.PI - Math.PI / 2 + Math.sin(treeProgress * 2 + i) * 0.28;
            const len = 65 + Math.sin(i * 1.9) * 50 + treeProgress * 20;
            const bx = Math.cos(angle) * len;
            const by = -trunkH * 0.72 + Math.sin(angle) * len;
            bgCtx.beginPath();
            bgCtx.moveTo(0, -trunkH * 0.68);
            bgCtx.lineTo(bx, by);
            bgCtx.strokeStyle = `hsl(${268 + i * 7}, 85%, ${62 + i % 2 * 6}%)`;
            bgCtx.lineWidth = 3.2;
            bgCtx.stroke();
            if (treeProgress > 0.58) {
              bgCtx.font = '28px serif';
              const icons = ['☀️', '🍃', '💧', '🧠', '🌱'];
              bgCtx.fillText(icons[i % 5], bx - 14, by + 8);
            }
          }
        }
        bgCtx.restore();
        // confetti
        for (let i = 0; i < 120; i++) {
          const x = (Math.sin(i * 1.27 + treeProgress * 4.5) * w * 0.5 + w / 2);
          const y = (treeProgress * 280 + i * 14) % (h + 200) - 100 + Math.sin(i * 0.7) * 50;
          bgCtx.fillStyle = i % 3 === 0 ? '#B869FF' : i % 3 === 1 ? '#FFC472' : '#22c55e';
          bgCtx.fillRect(x, y, 5, 10);
        }
      }
    }


        function renderLoop() {
            drawBackground();
            requestAnimationFrame(renderLoop);
        }

        async function pollApi() {
            try {
                const res = await fetch('api.php');
                const data = await res.json();
                
                if (data.triggered && !isTriggered && !isFinished) {
                    // Trigger from iPad
                    const mode = 'AUTO';
                    triggerBloom(mode);
                } else if (!data.triggered && isTriggered) {
                    // Reset from iPad
                    resetState();
                }
            } catch (e) {
                // Ignore silent network errors when polling
            }
        }

        function resetState() {
            isTriggered = false;
            isFinished = false;
            treeProgress = 0;
            if (window.alternateInterval) {
                clearInterval(window.alternateInterval);
                window.alternateInterval = null;
            }
            const imgElem = document.getElementById('sciweekImgEnd');
            if (imgElem) {
                imgElem.style.display = 'none';
                imgElem.style.opacity = '0';
            }
            const textElems = [document.getElementById('mainText'), document.getElementById('subText')];
            textElems.forEach(e => { e.style.display = 'block'; e.style.opacity = '1'; });

            document.getElementById('mainText').innerHTML = 'งานสัปดาห์วิทยาศาสตร์แห่งชาติ ส่วนภูมิภาค <span style="color:#38bdf8">ประจำปี 2569</span><br><span style="font-size:0.85em;color:#FFC472">มหาวิทยาลัยราชภัฏรำไพพรรณี</span>';
            document.getElementById('mainText').style.color = '#fff';
            document.getElementById('subText').innerHTML = '<span style="color: #f472b6; text-shadow: 0 0 15px rgba(244, 114, 182, 0.6);">วิทยาศาสตร์อัจฉริยะ</span><span style="color: #4ade80; text-shadow: 0 0 15px rgba(74, 222, 128, 0.6);">เพื่ออนาคตที่ยั่งยืน</span>';
            const hint = document.getElementById('gestureHint');
            if (hint) hint.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin: 0 auto 10px; filter: drop-shadow(0 0 10px #38bdf8);">
            <path d="M10 13l2-2"/>
            <path d="M12 11l2 2"/>
            <path d="M14 9a2 2 0 1 1 2.8 2.8l-7 7a4 4 0 0 1-5.6-5.6l5.4-5.4a2.8 2.8 0 1 1 4 4z"/>
        </svg>
        <span style="font-size: 1.2em; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5);">🤏 จีบนิ้วค้างไว้ (Pinch) เพื่อสั่งการเปิดงาน</span>`;
            document.getElementById('gestureBadge').className = 'gesture-badge';
            closeVideoOverlay();
        }

        function closeVideoOverlay(exitFs = false) {
            const overlay = document.getElementById('video-overlay');
            const vid = document.getElementById('overlay-video');
            overlay.classList.remove('active');
            vid.pause();
            vid.currentTime = 0;
            if (exitFs && document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        }

        document.getElementById('close-overlay').onclick = () => {
            closeVideoOverlay(false);
            // แจ้ง API ว่าถูกปิด (reset status)
            fetch('api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' })
            }).catch(e => console.error(e));
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') document.getElementById('close-overlay').click();
            if (e.key.toLowerCase() === 'f') {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
            if (e.code === 'Space') {
                e.preventDefault();
                // บังคับเปลี่ยนสถานะ API ทันที
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'trigger' })
                });
            }
            if (e.key.toLowerCase() === 'r') {
                fetch('api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset' })
                });
            }
        });

        // Start loops
        requestAnimationFrame(renderLoop);
        setInterval(pollApi, 500);
    