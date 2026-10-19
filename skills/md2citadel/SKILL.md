---
name: md2citadel
description: >-
  将本地 Markdown 文档同步到内部文档平台（学城 / Citadel）。创建走 MCP 高保真转换，
  搜索/读取/更新走 CLI。触发词：同步到学城、上传学城、发布到学城、md2citadel、
  markdown转学城、学城同步。
argument-hint: <markdown-file-path> [--parent-id <id> | --update <contentId>]
allowed-tools: Bash(*), Read, Write, Glob, Grep
---

# md2citadel — 本地 Markdown 同步到学城

## 本机配置

内部平台地址不写进仓库。从 `~/.config/favour-config/env`（或环境变量）读取：

| 变量 | 用途 |
|---|---|
| `KM_BASE_URL` | 文档平台根地址，例如 `https://<your-doc-host>` |
| `CITADEL_CONVERT_URL` | 高保真转换服务地址 |
| `DOC_SSO_URL` | 内部 SSO 登录入口 |

加载方式：

```bash
set -a; . ~/.config/favour-config/env; set +a
```

## 架构

| 操作 | 工具 | 后端 | 说明 |
|------|------|------|------|
| **创建文档** | MCP `md2citadel_local` | `$CITADEL_CONVERT_URL`（AI 转换） | plantUML、复杂格式高保真 |
| 创建文档（字符串） | MCP `md2citadel` | 同上 | 小段内容直接用字符串 |
| 更新文档 | CLI `updateDocumentByMd` | 学城官方 API | 同步已修改的本地文件 |
| 搜索/读取 | CLI `searchContent` / `getSimpleMarkdown` | 学城官方 API | 查找文档和读取内容 |

## 前置条件

- `oa-skills` CLI 已安装并认证
- MCP server `md2citadel` 已配置在 `~/.config/opencode/opencode.json`
- 首次使用 MCP 需在浏览器中登录过 内部 SSO（`$DOC_SSO_URL`），MCP 会自动提取 Cookie
- CLI 认证失败时执行：`oa-skills citadel --clear-cache`

---

## 核心操作

### 场景 A：创建新文档（用 MCP）

**方式 1：从文件创建（推荐）**

```
skill_mcp(mcp_name="md2citadel", tool_name="md2citadel_local", arguments={"path": "/absolute/path/to/doc.md", "parentId": "可选父文档ID"})
```

**方式 2：从字符串创建**

```
skill_mcp(mcp_name="md2citadel", tool_name="md2citadel", arguments={"title": "文档标题", "content": "# Markdown 内容...", "parentId": "可选父文档ID"})
```

返回格式：`创建成功，文档链接: $KM_BASE_URL/collabpage/xxxxxxxx`

### 场景 B：更新已有文档（用 CLI）

```bash
oa-skills citadel updateDocumentByMd --contentId "文档ID" --file /path/to/doc.md [--title "新标题"]
```

### 场景 C：搜索/查找文档（用 CLI）

```bash
# 按关键词搜索
oa-skills citadel searchContent --keyword "关键词" --searchTitle

# 查看子文档结构（找 parentId）
oa-skills citadel getChildContent --contentId "父文档ID"

# 查看文档元信息
oa-skills citadel getDocumentMetaInfo --contentId "文档ID"

# 读取文档（阅读用）
oa-skills citadel getSimpleMarkdown --contentId "文档ID"
```

### 场景 D：读取学城文档内容（MCP，含图片渲染）

```
skill_mcp(mcp_name="md2citadel", tool_name="read_citadel_doc", arguments={"url": "$KM_BASE_URL/collabpage/xxxxx"})
```

---

## 完整工作流示例

### 首次发布到学城

1. 确认目标位置：`oa-skills citadel searchContent --keyword "<关键词>" --searchTitle`
2. 选中文档后获取 parentId
3. 创建：`skill_mcp(mcp_name="md2citadel", tool_name="md2citadel_local", arguments={"path": "/absolute/path/to/doc.md", "parentId": "<可选父文档ID>"})`
4. 记录返回的文档链接，后续用 CLI `updateDocumentByMd` 同步

### 同步更新

1. 本地编辑 `/absolute/path/to/doc.md` 后
2. `oa-skills citadel updateDocumentByMd --contentId "<文档ID>" --file /absolute/path/to/doc.md`

---

## 注意事项

- 本地文件路径必须是**绝对路径**
- MCP 首次使用会自动从浏览器提取 内部 SSO Cookie（需提前登录），后续缓存 2 天
- 更新操作建议先用 `getDocumentXml` 拉取备份再覆盖
- 密级由空间规则自动决定，无需手动指定