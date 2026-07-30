# Walking Product Portfolio

一个偏意识流、手绘、切片风格的静态作品集网站。

## 本地预览

```bash
python -m http.server 4173
```

然后打开 `http://localhost:4173`。

## 部署到 Render

该项目是纯静态站点，已提供 `render.yaml`：

- Build Command: 留空
- Publish Directory: `.`
- Blueprint: 连接 GitHub 仓库后，Render 会读取 `render.yaml`

岛屿项目页通过 `assets/previews/*.pdf` 在网页内预览 PPT / Word 转换后的 PDF。

## 结构

- `index.html`: 页面结构
- `styles.css`: 视觉系统与响应式
- `app.js`: 小人进度条、岛屿地图、技能树拖拽、联系弹窗等交互
- `project.html`: 项目文档预览页
- `project-doc.js`: 根据项目 id 渲染 PDF 预览和文档目录
- `render.yaml`: Render 静态站点配置
