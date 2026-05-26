#!/usr/bin/env python3
"""Transform workshop-0523 HTML files: white theme + navigation strips."""

import os

SRC_DIR = "/Users/xiaoli/Desktop/Vivian Obsidian/vivian-ai-website-deploy/vivian-deploy/workshop-0523"

# Theme color replacements
theme_replacements = [
    ('--bg-0:#050a13', '--bg-0:#fafaf9'),
    ('--bg-card:rgba(255,255,255,0.055)', '--bg-card:#ffffff'),
    ('--bg-card: rgba(255,255,255,0.055)', '--bg-card: #ffffff'),
    ('--bg-card:#0f1e38', '--bg-card:#ffffff'),
    ('--bg-card-hover:rgba(255,255,255,0.08)', '--bg-card-hover:#f5f5f7'),
    ('--bg-card-warm:rgba(255,200,87,0.04)', '--bg-card-warm:rgba(255,200,87,0.06)'),
    ('--text-primary:#fff', '--text-primary:#1d1d1f'),
    ('--text-primary:#eef2ff', '--text-primary:#1d1d1f'),
    ('--text-muted:rgba(255,255,255,0.82)', '--text-muted:#4a4a4f'),
    ('--text-muted:#6b7a99', '--text-muted:#4a4a4f'),
    ('--text-subtle:rgba(255,255,255,0.58)', '--text-subtle:#6e6e73'),
    ('--text-subtle:#aab4cc', '--text-subtle:#6e6e73'),
    ('--text-dim:rgba(255,255,255,0.35)', '--text-dim:#86868b'),
    ('--text-dim:#8a9abc', '--text-dim:#86868b'),
    ('--border:rgba(255,255,255,0.10)', '--border:rgba(0,0,0,0.10)'),
    ('--border:rgba(255,255,255,.08)', '--border:rgba(0,0,0,.08)'),
    ('--border-soft:rgba(255,255,255,0.06)', '--border-soft:rgba(0,0,0,0.06)'),
    ('--border-soft:rgba(255,255,255,.06)', '--border-soft:rgba(0,0,0,0.06)'),
    ('--border-soft:rgba(255,255,255,.05)', '--border-soft:rgba(0,0,0,0.05)'),
    ('background:rgba(5,10,19,0.88)', 'background:rgba(250,250,249,0.92)'),
    ('background: rgba(5,10,19,0.88)', 'background: rgba(250,250,249,0.92)'),
    ('rgba(41,151,255,0.2)', 'rgba(0,113,227,0.05)'),
    ('rgba(167,139,250,0.18)', 'rgba(0,113,227,0.05)'),
    ('rgba(255,200,87,0.07)', 'rgba(255,200,87,0.04)'),
    ('--bg-1:#0a1628', '--bg-1:#f0f2f5'),
]

# CSS to insert before </style>
css_nav_strip = """\
  /* ── Session strip nav ── */
  .session-nav-strip{position:sticky;top:58px;z-index:90;display:flex;align-items:center;justify-content:space-between;background:rgba(250,250,249,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(0,0,0,0.06);padding:10px 36px;font-size:12px;}
  .snav-prev,.snav-next{color:#0071e3;text-decoration:none;font-weight:600;letter-spacing:.5px;padding:4px 12px;border-radius:8px;transition:background .2s;}
  .snav-prev:hover,.snav-next:hover{background:rgba(0,113,227,0.08);}
  .snav-center{font-size:11px;font-weight:700;letter-spacing:3px;color:#86868b;text-transform:uppercase;}
"""

css_footer_nav = """\
  /* ── Footer nav ── */
  .session-footer-nav{display:flex;align-items:center;justify-content:space-between;padding:32px 36px 48px;border-top:1px solid rgba(0,0,0,0.06);max-width:820px;margin:0 auto;}
  .sfn-btn{color:#0071e3;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border:1px solid rgba(0,113,227,0.3);border-radius:10px;transition:all .2s;}
  .sfn-btn:hover{background:rgba(0,113,227,0.06);}
  .sfn-center{font-size:13px;color:#6e6e73;text-decoration:none;font-weight:500;}
  .sfn-center:hover{color:#0071e3;}
"""

css_white_overrides = """\
  /* ── White theme overrides ── */
  .core-quote{background:linear-gradient(135deg,rgba(0,113,227,0.06),rgba(255,200,87,0.04));border-color:rgba(255,200,87,.25);}
  .highlight-box{background:linear-gradient(135deg,rgba(255,200,87,0.07),rgba(255,200,87,0.03));}
  blockquote{border-left-color:rgba(255,200,87,.5);background:rgba(255,200,87,0.04);}
  .student-card,.case-item,.fw-card,.layer-card,.heartlaw-item,.skill-row{background:#ffffff;border-color:rgba(0,0,0,0.08);}
  .data-table th{background:rgba(0,0,0,0.04);color:#4a4a4f;}
  .data-table td{border-color:rgba(0,0,0,0.06);}
  .data-table tr:hover{background:rgba(0,0,0,0.02);}
  pre{background:#f5f5f7;border-color:rgba(0,0,0,0.08);}
  .role-table th{background:rgba(0,0,0,0.04);}
  .role-table td,.role-table th{border-color:rgba(0,0,0,0.08);}
  .pitfalls li{background:#ffffff;border-color:rgba(0,0,0,0.08);}
  .student-vivian{background:rgba(0,113,227,0.04);border-color:rgba(0,113,227,0.15);}
  .section-badge,.session-badge{border-color:rgba(255,200,87,.35);}
  .insight-list li,.quote-item{background:#ffffff;border-color:rgba(0,0,0,0.08);}
  .book-card{background:#ffffff;border-color:rgba(0,0,0,0.08);}
  .siqv-card,.fourd-card{background:#ffffff;border-color:rgba(0,0,0,0.08);}
  .aha-card,.student-voice,.case-list .case-item{background:#ffffff;}
  .compare-table td,.compare-table th{border-color:rgba(0,0,0,0.08);}
  .meta-tag{background:rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.08);}
  .intel-row,.intel-platform{color:#4a4a4f;}
  .intel-divider{border-color:rgba(0,0,0,0.08);}
  nav{border-bottom-color:rgba(0,0,0,0.08);}
"""

# Per-file navigation config
# (filename, current_label, prev_href, prev_label, next_href, next_label)
file_nav_config = {
    'day1-morning.html': {
        'label': 'DAY 1 · 上午',
        'prev': None,
        'next': ('day1-afternoon.html', 'D1 下午'),
    },
    'day1-afternoon.html': {
        'label': 'DAY 1 · 下午',
        'prev': ('day1-morning.html', 'D1 上午'),
        'next': ('day1-evening.html', 'D1 晚上'),
    },
    'day1-evening.html': {
        'label': 'DAY 1 · 晚上',
        'prev': ('day1-afternoon.html', 'D1 下午'),
        'next': ('day2-morning.html', 'D2 上午'),
    },
    'day2-morning.html': {
        'label': 'DAY 2 · 上午',
        'prev': ('day1-evening.html', 'D1 晚上'),
        'next': ('day2-afternoon.html', 'D2 下午'),
    },
    'day2-afternoon.html': {
        'label': 'DAY 2 · 下午',
        'prev': ('day2-morning.html', 'D2 上午'),
        'next': None,
    },
}


def make_strip_nav(cfg):
    label = cfg['label']
    prev = cfg['prev']
    next_ = cfg['next']

    if prev:
        prev_html = f'<a href="{prev[0]}" class="snav-prev">← {prev[1]}</a>'
    else:
        prev_html = '<span class="snav-prev" style="visibility:hidden;">←</span>'

    if next_:
        next_html = f'<a href="{next_[0]}" class="snav-next">{next_[1]} →</a>'
    else:
        next_html = '<span class="snav-next" style="visibility:hidden;">→</span>'

    return f'''\n<div class="session-nav-strip">
  {prev_html}
  <span class="snav-center">{label}</span>
  {next_html}
</div>'''


def make_footer_nav(cfg):
    prev = cfg['prev']
    next_ = cfg['next']

    prev_html = f'<a href="{prev[0]}" class="sfn-btn">← {prev[1]}</a>' if prev else '<span style="visibility:hidden;" class="sfn-btn">←</span>'
    next_html = f'<a href="{next_[0]}" class="sfn-btn">{next_[1]} →</a>' if next_ else '<span style="visibility:hidden;" class="sfn-btn">→</span>'

    return f'''\n<div class="session-footer-nav">
  {prev_html}
  <a href="index.html" class="sfn-center">返回目录</a>
  {next_html}
</div>'''


def transform_file(filename):
    src_path = os.path.join(SRC_DIR, filename)
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Theme color replacements
    for old, new in theme_replacements:
        content = content.replace(old, new)

    # Step 2: Insert CSS before </style> (first occurrence)
    css_insert = css_nav_strip + css_footer_nav + css_white_overrides
    content = content.replace('</style>', css_insert + '</style>', 1)

    # Step 3: Insert strip nav after </nav>
    cfg = file_nav_config[filename]
    strip_nav_html = make_strip_nav(cfg)
    content = content.replace('</nav>', '</nav>' + strip_nav_html, 1)

    # Step 4: Insert footer nav before </body>
    footer_nav_html = make_footer_nav(cfg)
    # Insert before last </body>
    last_body_idx = content.rfind('</body>')
    content = content[:last_body_idx] + footer_nav_html + '\n' + content[last_body_idx:]

    with open(src_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Transformed: {filename} ({len(content)} bytes)")


if __name__ == '__main__':
    files = [
        'day1-morning.html',
        'day1-afternoon.html',
        'day1-evening.html',
        'day2-morning.html',
        'day2-afternoon.html',
    ]
    print("=== Transforming workshop-0523 files ===")
    for fn in files:
        transform_file(fn)
    print("=== Done ===")
