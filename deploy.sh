#!/bin/bash
# Vivian's Signal 一键部署脚本
# 用法：在任意目录运行 bash ~/Desktop/Vivian\ Obsidian/01-一号位AI进化论/03-产品设计/output/vivian-website/deploy.sh

SITE_ID="07ea734d-e32d-49e1-91af-d11db23ba791"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 开始部署 vivianai.cn ..."
echo ""

# 1. 检查 npm 缓存权限
if [ -d "$HOME/.npm" ] && [ "$(stat -f '%u' "$HOME/.npm" 2>/dev/null)" = "0" ]; then
  echo "⚠️  检测到 ~/.npm 权限问题，正在修复..."
  sudo chown -R "$(whoami)" "$HOME/.npm"
  echo "✅ npm 权限已修复"
fi

# 2. 检查 netlify 登录态
echo "📡 检查 Netlify 登录状态..."
npx netlify-cli status > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "🔑 需要登录 Netlify（浏览器会自动打开）..."
  npx netlify-cli login
fi

# 3. Link 项目
echo "🔗 链接项目..."
cd "$SCRIPT_DIR"
npx netlify-cli link --id "$SITE_ID" 2>/dev/null

# 4. 部署
echo "📦 正在部署到生产环境..."
npx netlify-cli deploy --prod --dir="$SCRIPT_DIR"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 部署成功！"
  echo "🌐 https://vivianai.cn"
  echo "📡 https://vivianai.cn/signal"
else
  echo ""
  echo "❌ 部署失败，请检查上面的错误信息"
fi
