---
name: xuecheng
description: 搜索内部文档平台（学城 / Citadel）文档。优先使用 citadel CLI；CLI 不可用时询问用户是否用 agent-browser。
allowed-tools: Bash(oa-skills:*, agent-browser:*)
---

# 学城搜索

## 本机配置

内部平台地址不写进仓库。从 `~/.config/favour-config/env`（或环境变量）读取：

| 变量 | 用途 |
|---|---|
| `KM_BASE_URL` | 文档平台根地址，例如 `https://<your-doc-host>` |
| `OA_SKILLS_NPM_REGISTRY` | `oa-skills` CLI 的 npm registry |

加载方式：

```bash
set -a; . ~/.config/favour-config/env; set +a
```

## 前置：确保 CLI 可用

```bash
: "${OA_SKILLS_NPM_REGISTRY:?set OA_SKILLS_NPM_REGISTRY in ~/.config/favour-config/env}"
node -e "const cp=require('child_process'); const probe=process.platform==='win32'?'where oa-skills':'command -v oa-skills'; try{cp.execSync(probe,{stdio:'ignore',shell:true})}catch{cp.execSync('npm install -g @it/oa-skills --registry=${OA_SKILLS_NPM_REGISTRY}',{stdio:'inherit',shell:true})}"
```

## 搜索

```bash
oa-skills citadel searchContent --keyword <关键词>

# 仅搜标题
oa-skills citadel searchContent --keyword <关键词> --searchTitle

# 限定空间
: "${KM_BASE_URL:?set KM_BASE_URL in ~/.config/favour-config/env}"
oa-skills citadel searchContent --keyword <关键词> --space-url "${KM_BASE_URL}/space/<spaceKey>"
```

## 读取文档内容

```bash
oa-skills citadel getSimpleMarkdown --contentId <id>
```

## 认证

优先 SSO 无感登录，token 自动缓存。认证失败时：

```bash
oa-skills citadel --clear-cache
```

## 如果 CLI 不可用

询问用户："oa-skills CLI 无法使用，是否改用 agent-browser 浏览器方案？"

若用户同意，执行 [browser-fallback.md](browser-fallback.md) 里的步骤。
