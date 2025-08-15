# GitHub上传指南 - PNG投资指南2025

## 📋 手动上传步骤

### 1. 在GitHub创建仓库
访问：https://github.com/new

**仓库设置：**
- **Repository name**: `png-investment-guide-2025`
- **Description**: "2025年巴布亚新几内亚投资指南 - 基于8月最新政策的完整投资网站"
- **Visibility**: Public
- **Initialize repository**: 不勾选README（我们已有本地文件）

### 2. 推送代码到GitHub

在终端/命令行执行以下命令：

```bash
cd "D:\investPNG"
git remote add origin https://github.com/cloudwindcc/png-investment-guide-2025.git
git branch -M main
git push -u origin main
```

### 3. 验证上传

上传完成后，访问：https://github.com/cloudwindcc/png-investment-guide-2025

## 📁 项目结构

```
png-investment-guide-2025/
├── index.html                    # 主网站（终极版投资指南）
├── _redirects                   # Cloudflare Pages路由配置
├── images/
│   ├── tele.jpg                 # Telegram联系图片
│   ├── wapp.jpg                 # WhatsApp联系图片
│   └── wechat.jpg               # 微信联系图片
├── additional-projects-optimized.html
├── additional-projects.html
├── beautiful-version.html
├── seo-optimized.html
├── DEPLOYMENT.md                # Cloudflare部署指南
├── GITHUB_UPLOAD.md            # 本上传指南
├── .gitignore                   # Git忽略文件配置
└── readme.md                    # 项目说明
```

## 🚀 Cloudflare Pages部署

仓库创建完成后，可以直接通过GitHub连接部署到Cloudflare Pages：

1. 登录：https://pages.cloudflare.com
2. 选择"连接到Git"
3. 选择 `cloudwindcc/png-investment-guide-2025` 仓库
4. 设置：
   - 构建命令：`echo "No build required"`
   - 构建输出目录：`/`
   - 根目录：`/`

## 🔗 访问链接

- **GitHub仓库**：https://github.com/cloudwindcc/png-investment-guide-2025
- **Cloudflare Pages**：待部署完成后生成

## 📞 技术支持

如果遇到问题，请联系：
- 项目邮箱：info@cloudwindai.com
- 官网支持：pngsezsummit2025.com