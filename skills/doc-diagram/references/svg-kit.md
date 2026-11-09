# SVG 生成器骨架

复制这个文件到 `/tmp/<topic>/gen.py`，改下面的 **COORDS 区**即可。不要从零手写 SVG —— 手写会漏 marker、算错圆角、把标签压到线上。

用法：

```bash
python3 gen.py && rsvg-convert -w 1500 out.svg -o out.png   # 然后看图
```

`rsvg-convert` 在 macOS 上由 `brew install librsvg` 提供。

---

## 骨架

```python
# -*- coding: utf-8 -*-
FONT = "PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif"

RAIL    = "#c2bab2"   # 主轨道
RAIL_L  = "#b39fc4"   # 回流 / 分支轨道
BADGE   = "#9fadb2"   # 普通站点编号
BADGE_D = "#c2945e"   # 判断站点编号
INK     = "#4f4a57"   # 卡片标题
MUTED   = "#9a939f"   # 说明文字


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def arrow(d, color=RAIL, w=2.0, marker="arw"):
    """带箭头的路径。d 用 M/C/L 都行；转折一律用控制点在外侧的 C。"""
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" '
            f'stroke-linecap="round" marker-end="url(#{marker})"/>')


def station(x, y, w, h, title, num=None, decision=False, ghost=False, accent=None):
    """站点卡片。
    num      环上的站号（1..n）；环外的入口/出口传 None
    decision 判断节点（暖色底 + 琥珀编号）
    ghost    环外节点（淡紫底、无投影层次感、不参与编号）
    """
    if ghost:
        fill, stroke, tcol, r = "#f8f6fb", "#e7e1ef", "#6b5b86", 14
    elif decision:
        fill, stroke, tcol, r = "#fdf9f1", "#eee1c9", INK, 14
    else:
        fill, stroke, tcol, r = "#ffffff", "#ece6df", INK, 14

    o = [f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
         f'stroke="{stroke}" stroke-width="1" filter="url(#sh)"/>']
    tx = x + 18
    if num is not None:
        bc = accent or (BADGE_D if decision else BADGE)
        cy = y + h / 2
        o.append(f'<circle cx="{x+25}" cy="{cy}" r="9" fill="{bc}"/>')
        o.append(f'<text x="{x+25}" y="{cy+3.6}" text-anchor="middle" font-size="10.5" '
                 f'font-weight="600" fill="#ffffff">{num}</text>')
        tx = x + 43
    o.append(f'<text x="{tx}" y="{y+h/2+4.6}" font-size="13.5" font-weight="600" '
             f'fill="{tcol}">{esc(title)}</text>')
    o.append('</g>')
    return "\n".join(o)


def pill(x, y, w, h, title):
    """起止胶囊。只在真的需要"开始/结束"语义时用，多数图可以省略。"""
    return (f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="#f8f6fb" '
            f'stroke="#e7e1ef" stroke-width="1" filter="url(#sh)"/>'
            f'<text x="{x+w/2}" y="{y+h/2+4.6}" text-anchor="middle" font-size="13.5" '
            f'font-weight="600" fill="#6b5b86">{esc(title)}</text></g>')


def txt(x, y, s, size=10.5, fill=MUTED, anchor="start", weight=400, ls=None):
    a = f' letter-spacing="{ls}"' if ls else ''
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" fill="{fill}" '
            f'font-weight="{weight}"{a}>{esc(s)}</text>')


def center_label(x, y, title, hints):
    """环心标签：标题字间距拉开，下面 1-2 行约束小字。"""
    o = [f'<text x="{x}" y="{y}" text-anchor="middle" font-size="15" font-weight="600" '
         f'fill="#8d8497" letter-spacing="3">{esc(title)}</text>']
    for i, h in enumerate(hints):
        o.append(f'<text x="{x}" y="{y+24+i*17}" text-anchor="middle" font-size="10.5" '
                 f'fill="{MUTED}" letter-spacing="0.4">{esc(h)}</text>')
    return "\n".join(o)


def head(w, h):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="max-width:100%;height:auto" font-family="{FONT}">
<defs>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="1.5" stdDeviation="2.6" flood-color="#3f3830" flood-opacity="0.11"/>
  </filter>
  <marker id="arw" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
    <path d="M0,0.6 L8,4 L0,7.4 z" fill="{RAIL}"/>
  </marker>
  <marker id="arwL" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
    <path d="M0,0.6 L8,4 L0,7.4 z" fill="{RAIL_L}"/>
  </marker>
</defs>
<rect width="100%" height="100%" fill="#ffffff"/>
'''
```

## 拼装示例（环形轨道，4 站点）

```python
s = [head(920, 600)]

# 环外入口（自上而下汇入第 1 站）
s.append(pill(240, 20, 240, 42, "开始 · Bench + 初始 Skill"))
s.append(station(250, 86, 220, 50, "题集划分", ghost=True))
s.append(arrow("M360,62 L360,86"))
s.append(arrow("M360,136 L360,162"))

# 环上 4 站：左上 → 右上 → 右下 → 左下（顺时针）
s.append(station(260, 162, 200, 56, "GEPA 选候选", 1))
s.append(station(540, 162, 200, 56, "Codex 提案", 2))
s.append(station(540, 342, 200, 56, "沙箱执行 + 评分", 3))
s.append(station(260, 342, 200, 56, "有严格提升？", 4, decision=True))

# 轨道：上横、右弧、下横（反向）、左弧（回流）
s.append(arrow("M460,190 L540,190"))
s.append(arrow("M740,190 C800,205 800,355 740,370"))
s.append(arrow("M540,370 L460,370"))
s.append(arrow("M260,370 C200,355 200,205 260,190", RAIL_L, 2.0, "arwL"))

# 环心 + 分支标签
s.append(center_label(500, 274, "搜 索 循 环", ["唯一可演化面：一段 Skill 正文"]))
s.append(txt(195, 288, "否 · 退回提案", 10.5, RAIL_L, "end", 500))

# 出口
s.append(arrow("M360,398 L360,500"))
s.append(txt(372, 468, "是", 10.5, MUTED, "start", 500))
s.append(station(270, 500, 180, 54, "登记新版本", ghost=True))

s.append('</svg>')
open("/tmp/x.svg", "w").write("\n".join(s))
```

## 坐标系速查

以 920 宽画布、4 站环为例（可直接套用，只改标题文字）：

| 元素 | x | y |
|---|---|---|
| 左上站 | 260 | 162 |
| 右上站 | 540 | 162 |
| 右下站 | 540 | 342 |
| 左下站 | 260 | 342 |
| 上横线 | 460→540 | 190 |
| 右弧 | `M740,190 C800,205 800,355 740,370` | — |
| 下横线（向左） | 540→460 | 370 |
| 左弧（回流） | `M260,370 C200,355 200,205 260,190` | — |
| 环心 | 500 | 274 |

7 站环（4 上 3 下）实测可用参数：卡片 145×56，上行 x = 167 / 345 / 523 / 701，下行 x = 701 / 414 / 167，行 y = 172 / 402，轨道 y = 200 / 430，环心 (420, 300)。

## 常见错误

- `markerUnits` 忘了写 → 箭头随 `stroke-width` 缩放，看起来忽大忽小。
- 弧线控制点写在同一侧 → 变成折角。左弧控制点 x 要小于端点 x 30–70，右弧反之。
- 环心标签和回流弧的说明文字打架 → 环心整体左移 60–80px，把右侧让给"否/是"标签。
- 卡片标题超过 8 字 → 换行会破坏卡片高度，先改文案，不要缩字号。
