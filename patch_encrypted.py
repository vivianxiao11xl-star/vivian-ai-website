#!/usr/bin/env python3
"""Patch staticrypt-encrypted workshop files."""

import os

OUT_DIR = "/Users/xiaoli/Desktop/Vivian Obsidian/vivian-ai-website-deploy/workshop-0523"

patches = [
    ('background: #76B852;', 'background: #fafaf9;'),   # ALL occurrences
    ('background: #4CAF50;', 'background: #0071e3;'),   # ALL occurrences
    ('font-size: 1.5em;', 'font-size: 18px; font-weight: 700; color: #1d1d1f;'),  # ALL occurrences
    ('placeholder="Password"', 'placeholder="密码"', 1),
    ('value="DECRYPT"', 'value="进入"', 1),
    ('<title>Protected Page</title>', '<title>一号位 AI 工作坊 · Cohort 02</title>', 1),
    ('<p class="staticrypt-title">Protected Page</p>', '<p class="staticrypt-title">一号位 AI 工作坊<br>Cohort 02 · 学员专享</p>', 1),
]

files = [
    'index.html',
    'day1-morning.html',
    'day1-afternoon.html',
    'day1-evening.html',
    'day2-morning.html',
    'day2-afternoon.html',
]

print("=== Patching encrypted files ===")
for fn in files:
    path = os.path.join(OUT_DIR, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for patch in patches:
        if len(patch) == 2:
            # Replace all
            old, new = patch
            content = content.replace(old, new)
        else:
            # Replace with count
            old, new, count = patch
            content = content.replace(old, new, count)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    size = os.path.getsize(path)
    print(f"  Patched: {fn} ({size:,} bytes)")

print("=== Done ===")
