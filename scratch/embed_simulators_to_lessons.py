import json, os, re

base_dir = '/Applications/XAMPP/xamppfiles/htdocs/G2_Education_Curriculum_Exam/41249CS2027'
manifest_path = os.path.join(base_dir, 'data/course_manifest.json')
labs_path = os.path.join(base_dir, 'data/labs_database_180.json')
sims_path = os.path.join(base_dir, 'data/simulators_catalog.json')

manifest = json.load(open(manifest_path, 'r', encoding='utf-8'))
labs = json.load(open(labs_path, 'r', encoding='utf-8'))
sims = json.load(open(sims_path, 'r', encoding='utf-8'))

lab_map = {l['lab_code']: l for l in labs}
sim_map = {s['file']: s for s in sims}

def generate_section(week_data):
    w_num = week_data['week']
    sim_url = week_data.get('simulation_url', '')
    sim_file = sim_url.replace('simulations/', '')
    sim_info = sim_map.get(sim_file, {})
    sim_title = sim_info.get('title', 'แบบจำลองวิทยาศาสตร์เชิงโต้ตอบ')
    
    slide_url = week_data.get('slide_url', '')
    slide_btn = ''
    if slide_url:
        slide_btn = f'''<a href="../{slide_url}" download class="nav-back" style="margin-bottom: 0; padding: 0.45rem 0.9rem; font-size: 0.85rem; background: #f59e0b; color: #fff;"><i class="fas fa-file-powerpoint"></i> ดาวน์โหลดสไลด์ (.pptx)</a>'''
    
    extra_sims = week_data.get('extra_simulations', [])
    extra_html = ''
    if extra_sims:
        badges = []
        for es in extra_sims:
            es_file = es.replace('simulations/', '')
            es_info = sim_map.get(es_file, {})
            es_title = es_info.get('title', es_file)
            badges.append(f'''<a href="../{es}" target="_blank" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; background: #e0f2fe; color: #0284c7; border-radius: 6px; font-size: 0.82rem; font-weight: 600; text-decoration: none; border: 1px solid #bae6fd;"><i class="fas fa-play-circle"></i> {es_title}</a>''')
        extra_html = f'''<div style="margin: 0.85rem 0; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;"><span style="font-size: 0.85rem; font-weight: 600; color: #64748b;"><i class="fas fa-cubes"></i> แบบจำลองเสริมในบท:</span> {' '.join(badges)}</div>'''

    lab_codes = week_data.get('lab_codes', [])
    lab_cards = []
    for c in lab_codes:
        l = lab_map.get(c)
        if not l: continue
        q_html = ''.join([f'<li style="margin-bottom: 0.25rem;">{q}</li>' for q in l.get('questions', [])])
        theory_text = l.get('theory', '')
        theory_block = ''
        if theory_text:
            theory_block = f'''<div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 0.45rem 0.75rem; font-size: 0.85rem; margin-bottom: 0.5rem; overflow-x: auto;"><strong>สมการทฤษฎี:</strong> $${theory_text}$$</div>'''

        lab_cards.append(f'''
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.1rem; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.25rem;">
                    <span style="background: #10b981; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 4px;">LAB {l.get('lab_code')}</span>
                    <span style="font-size: 0.78rem; color: #64748b;"><i class="far fa-clock"></i> {l.get('estimated_minutes')} นาที | {l.get('bloom_level')}</span>
                </div>
                <h4 style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 0.2rem;">{l.get('title_th')}</h4>
                <p style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-bottom: 0.5rem;">{l.get('title_en')}</p>
                {theory_block}
                <div style="font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.25rem;"><i class="fas fa-question-circle" style="color: #3b82f6;"></i> คำถามท้ายการทดลอง:</div>
                <ul style="font-size: 0.82rem; color: #475569; margin-bottom: 0; padding-left: 1.25rem; line-height: 1.5;">
                    {q_html}
                </ul>
            </div>
        ''')
    
    labs_html = '\n'.join(lab_cards)
    
    html_block = f'''
        <!-- ปฏิบัติการจำลองเสมือนจริงประจำสัปดาห์ (Interactive Science Simulator & 180 Labs) -->
        <div class="card" id="sim-section" style="border: 2px solid #0284c7; box-shadow: 0 8px 24px rgba(2, 132, 199, 0.12); margin-top: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                <h2 class="card-title" style="margin-bottom: 0; color: #0284c7;">
                    <i class="fas fa-cube"></i> ปฏิบัติการจำลองเสมือนจริง: {sim_title}
                </h2>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="../{sim_url}" target="_blank" class="nav-back" style="margin-bottom: 0; padding: 0.45rem 0.9rem; font-size: 0.85rem; background: #0284c7; color: #fff;">
                        <i class="fas fa-external-link-alt"></i> เปิดแบบจำลองเต็มหน้าจอ
                    </a>
                    {slide_btn}
                </div>
            </div>

            <p style="font-size: 0.95rem; color: #334155; margin-bottom: 1rem;">
                <strong>แบบจำลองเชิงโต้ตอบสำหรับห้องเรียนวิทยาศาสตร์:</strong> ให้นักศึกษาทดลองปรับค่าพารามิเตอร์ สังเกตการณ์เปลี่ยนแปลง และวิเคราะห์ข้อมูลตามกระบวนการคิดเชิงคำนวณ (Computational Thinking):
            </p>

            <div style="margin: 1rem 0; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; height: 600px; box-shadow: var(--shadow-md);">
                <iframe src="../{sim_url}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>

            {extra_html}

            <!-- คลังใบงานปฏิบัติการที่สอดคล้องจาก 180 Labs Manual -->
            <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-flask" style="color: #10b981;"></i> ใบงานปฏิบัติการที่สอดคล้อง (จากคู่มือปฏิบัติการ ๑๘๐ การทดลอง):
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    {labs_html}
                </div>
            </div>
        </div>
'''
    return html_block

updated_count = 0
for w in manifest.get('weeks', []):
    w_num = w.get('week')
    f_rel = w.get('file', '')
    if not f_rel: continue
    
    file_path = os.path.join(base_dir, f_rel)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # If already has sim-section, skip
    if 'id="sim-section"' in content:
        print(f"Week {w_num} already has sim-section. Skipping insertion.")
        continue
    
    # In week 2, voxel lab is already in section 2.5, but we can append the slide download and lab cards
    if w_num == 2:
        print(f"Week 2 has voxel lab already. Adding slide and labs.")
        # We can append slide and labs into the existing 2.5 card
        slide_url = w.get('slide_url', '')
        slide_btn = f'''<a href="../{slide_url}" download class="nav-back" style="margin-bottom: 0; padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #f59e0b; color: #fff;"><i class="fas fa-file-powerpoint"></i> ดาวน์โหลดสไลด์ (.pptx)</a>'''
        content = content.replace('<a href="../simulations/voxel_lab.html" target="_blank" class="nav-back"', f'{slide_btn}\n                <a href="../simulations/voxel_lab.html" target="_blank" class="nav-back"')
        
        # Add lab cards after the voxel instruction box
        lab_codes = w.get('lab_codes', [])
        lab_cards = []
        for c in lab_codes:
            l = lab_map.get(c)
            if not l: continue
            q_html = ''.join([f'<li style="margin-bottom: 0.25rem;">{q}</li>' for q in l.get('questions', [])])
            theory_text = l.get('theory', '')
            theory_block = ''
            if theory_text:
                theory_block = f'''<div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 0.45rem 0.75rem; font-size: 0.85rem; margin-bottom: 0.5rem; overflow-x: auto;"><strong>สมการทฤษฎี:</strong> $${theory_text}$$</div>'''
            lab_cards.append(f'''
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.1rem; border-left: 4px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.25rem;">
                        <span style="background: #10b981; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 4px;">LAB {l.get('lab_code')}</span>
                        <span style="font-size: 0.78rem; color: #64748b;"><i class="far fa-clock"></i> {l.get('estimated_minutes')} นาที | {l.get('bloom_level')}</span>
                    </div>
                    <h4 style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-bottom: 0.2rem;">{l.get('title_th')}</h4>
                    <p style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-bottom: 0.5rem;">{l.get('title_en')}</p>
                    {theory_block}
                    <div style="font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.25rem;"><i class="fas fa-question-circle" style="color: #3b82f6;"></i> คำถามท้ายการทดลอง:</div>
                    <ul style="font-size: 0.82rem; color: #475569; margin-bottom: 0; padding-left: 1.25rem; line-height: 1.5;">
                        {q_html}
                    </ul>
                </div>
            ''')
        labs_html = f'''
            <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0;">
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-flask" style="color: #10b981;"></i> ใบงานปฏิบัติการที่สอดคล้อง (จากคู่มือปฏิบัติการ ๑๘๐ การทดลอง):
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    {chr(10).join(lab_cards)}
                </div>
            </div>
        '''
        # insert before the closing of section 2.5
        target = '</ul>\n            </div>\n        </div>'
        if target in content:
            content = content.replace(target, '</ul>\n            </div>' + labs_html + '\n        </div>', 1)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        continue

    # For other weeks:
    # Find insertion point before <div id="tab3"
    target_pattern = r'(<div id="tab3"[^>]*>)'
    m = re.search(target_pattern, content)
    if m:
        sim_section_code = generate_section(w)
        # We need to insert before the target tab3, but inside tab2 (which ends right before tab3)
        # Typically the tab2 ends with </div> right before <!-- แท็บที่ 3 หรือ <div id="tab3"
        # Let's insert sim_section_code right before the last </div> before <div id="tab3"
        idx = m.start()
        # look back for the closing </div> of tab2
        last_div_idx = content.rfind('</div>', 0, idx)
        if last_div_idx != -1:
            # Insert before this closing </div> so it is inside tab2
            new_content = content[:last_div_idx] + sim_section_code + '\n    ' + content[last_div_idx:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            updated_count += 1
            print(f"Successfully embedded into Week {w_num} ({f_rel})")
        else:
            print(f"Could not find closing div for tab2 in Week {w_num}")
    else:
        print(f"Could not find tab3 in Week {w_num}")

print(f"Finished updating {updated_count} lesson files.")

