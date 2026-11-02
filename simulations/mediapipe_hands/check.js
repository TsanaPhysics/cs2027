        
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

        // Floating Atoms (Various sizes, no text)
        const floatingAtoms = Array.from({ length: 5 }).map(() => ({
            x: 0.1 + Math.random() * 0.8,
            y: 0.1 + Math.random() * 0.8,
            vx: (Math.random() - 0.5) * 0.00045,
            vy: (Math.random() - 0.5) * 0.00045,
            radius: 15 + Math.random() * 65, // Random radius 15-80
            rotSpeed: (Math.random() < 0.5 ? 1 : -1) * (0.0015 + Math.random() * 0.002),
            eSpeed: 0.03 + Math.random() * 0.04
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

        async 
        
        function triggerBloom(mode) {
            isTriggered = true;
            document.getElementById('mainText').innerHTML = 'งานสัปดาห์วิทยาศาสตร์แห่งชาติ<br><span style="font-size:0.85em;color:#FFC472">มหาวิทยาลัยราชภัฏรำไพพรรณี</span>';
            document.getElementById('subText').textContent = 'วิทยาศาสตร์อัจฉริยะเพื่ออนาคตที่ยั่งยืน';
            
            const badge = document.getElementById('gestureBadge');
            if(badge) badge.style.display = 'none';
            
            const hint = document.getElementById('gestureHint');
            if(hint) hint.innerHTML = '';
            
            // Show video
            const overlay = document.getElementById('video-overlay');
            const vid = document.getElementById('overlay-video');
            if(overlay && vid) {
                overlay.classList.add('active');
                vid.currentTime = 0;
                vid.play().catch(e => console.error(e));
                
                // When video ends, mark as finished
                vid.onended = () => {
                    isFinished = true;
                };
            }
        }

        function drawBackground() {
            bgCtx.fillStyle = 'rgba(10, 5, 20, 0.3)';
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgTick++;

            const w = bgCanvas.width;
            const h = bgCanvas.height;

            // 1. Binary Rain
            bgCtx.font = '14px monospace';
            rainCols.forEach(col => {
                col.y += col.speed;
                if (col.y > 1) col.y = 0;
                for (let i = 0; i < col.chars.length; i++) {
                    const cy = (col.y * h) - (i * 20);
                    if (cy > 0 && cy < h) {
                        bgCtx.fillStyle = `rgba(0, 255, 255, ${col.opacity * (1 - i/col.chars.length)})`;
                        bgCtx.fillText(col.chars[i], col.x * w, cy);
                    }
                }
                if (bgTick % 10 === 0) {
                    col.chars[Math.floor(Math.random() * col.chars.length)] = Math.random() < 0.5 ? '1' : '0';
                }
            });

            // 2. Neural Nodes & Edges
            for (let i = 0; i < neuralNodes.length; i++) {
                const n = neuralNodes[i];
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > 1) n.vx *= -1;
                if (n.y < 0 || n.y > 1) n.vy *= -1;
                n.pulse += 0.05;

                for (let j = i + 1; j < neuralNodes.length; j++) {
                    const n2 = neuralNodes[j];
                    const dx = (n.x - n2.x) * w;
                    const dy = (n.y - n2.y) * h;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        bgCtx.beginPath();
                        bgCtx.moveTo(n.x * w, n.y * h);
                        bgCtx.lineTo(n2.x * w, n2.y * h);
                        bgCtx.strokeStyle = `rgba(184, 105, 255, ${(1 - dist/150) * 0.2})`;
                        bgCtx.stroke();
                    }
                }
                bgCtx.beginPath();
                bgCtx.arc(n.x * w, n.y * h, n.r + Math.sin(n.pulse)*0.5, 0, Math.PI*2);
                bgCtx.fillStyle = n.color === 0 ? '#B869FF' : '#00FFFF';
                bgCtx.fill();
            }

            // 3. Floating Labels
            bgCtx.font = 'bold 16px Kanit';
            bgCtx.textAlign = 'center';
            floatLabels.forEach(lbl => {
                lbl.x += lbl.vx; lbl.y += lbl.vy;
                if (lbl.x < 0 || lbl.x > 1) lbl.vx *= -1;
                if (lbl.y < 0 || lbl.y > 1) lbl.vy *= -1;
                bgCtx.fillStyle = `rgba(255, 255, 255, ${lbl.alpha})`;
                bgCtx.fillText(lbl.text, lbl.x * w, lbl.y * h);
            });

            // 4. Floating Atoms
            bgCtx.lineWidth = 1.5;
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
                bgCtx.arc(0, 0, a.radius * 0.2, 0, Math.PI*2);
                bgCtx.fillStyle = '#00FFFF';
                bgCtx.shadowColor = '#00FFFF';
                bgCtx.shadowBlur = 15;
                bgCtx.fill();
                bgCtx.shadowBlur = 0;

                // Orbits
                for(let i=0; i<3; i++) {
                    bgCtx.rotate(Math.PI / 3);
                    bgCtx.beginPath();
                    bgCtx.ellipse(0, 0, a.radius, a.radius * 0.3, 0, 0, Math.PI*2);
                    bgCtx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
                    bgCtx.stroke();
                    
                    // Electron
                    const angle = bgTick * a.eSpeed + (i * Math.PI * 2 / 3);
                    const ex = Math.cos(angle) * a.radius;
                    const ey = Math.sin(angle) * a.radius * 0.3;
                    bgCtx.beginPath();
                    bgCtx.arc(ex, ey, a.radius * 0.08, 0, Math.PI*2);
                    bgCtx.fillStyle = '#fff';
                    bgCtx.fill();
                }
                bgCtx.restore();
            });
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
            document.getElementById('mainText').innerHTML = 'งานสัปดาห์วิทยาศาสตร์แห่งชาติ<br><span style="font-size:0.85em;color:#FFC472">มหาวิทยาลัยราชภัฏรำไพพรรณี</span>';
            document.getElementById('mainText').style.color = '#fff';
            document.getElementById('subText').textContent = 'วิทยาศาสตร์อัจฉริยะเพื่ออนาคตที่ยั่งยืน';
            const hint = document.getElementById('gestureHint');
            if (hint) hint.innerHTML = '';
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
        document.getElementById('init-overlay').addEventListener('click', function() {
            const vid = document.getElementById('overlay-video');
            vid.play().then(() => {
                vid.pause();
                vid.currentTime = 0;
            }).catch(e => console.log("Unlock failed:", e));
            this.style.display = 'none';
            
            requestAnimationFrame(renderLoop);
            setInterval(pollApi, 500);
        });

