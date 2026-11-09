---
name: whathappens
description: Query and analyze local macOS app-focus time tracking through the `wh` CLI. Use when the user asks what they did today, where their time went, how long they spent in a given app, what they were doing at a specific time, or asks for focus / context-switch analysis (e.g. "今天时间花哪了", "下午在干什么", "我用了多久 Chrome", "分析一下今天的专注情况", "统计应用使用时间"). Also use for raw activity segments and exports.
argument-hint: "[today|timeline|apps|analyze|status|export|category]"
allowed-tools: Bash(*), Read
---

# whathappens — 本机应用聚焦时间统计

本机已安装 `wh`（`~/.local/bin/wh`），由 LaunchAgent 常驻采集前台应用，
数据只保存在本机 SQLite。回答“时间花在哪 / 某时刻在干什么 / 专注情况”这类问题时，
**必须先实际运行 `wh` 查询，不要凭印象编造数字**。

## 第一步：确认数据可用

```bash
wh status --no-color
```

- `Daemon: running` 且 `Current` 不是 `(stale, ...)`，说明正在正常记录。
- `Today: no data yet` 或 `Database ... not found`：说明还没安装或刚开始记录。
  如实告诉用户，不要猜测。
- 需要安装/启动时（在项目目录 `~/code/whathappens` 下）：

```bash
bash scripts/install.sh     # 编译 + 安装 + 注册 LaunchAgent
wh daemon install           # 二进制已安装时只注册自启
wh daemon status
```

## 命令选择

| 用户问什么 | 用什么 |
|---|---|
| 今天 / 某天时间花在哪、应用排行 | `wh today [--date YYYY-MM-DD]` |
| 某个时刻 / 时段在干什么 | `wh timeline [--date ...] [--resolution 5\|10\|15]` |
| 多天内某个应用用了多久 | `wh apps --from D --to D [--limit N]` |
| 专注情况、切换频率、碎片化、和前几天对比 | `wh analyze [--date ...] [--days N]` |
| 当前状态、daemon 是否正常 | `wh status` |
| 原始时间段，交给脚本处理 | `wh export [--from D --to D] [--format csv\|json\|jsonl]` |
| 分类不对 / 查看分类来源 | `wh category list` / `wh category set <app> <category>` |

完整参数：`wh help`。日期一律是本地时区的 `YYYY-MM-DD`。

## 输出与解析

- 给用户看时用默认彩色输出即可；自己解析时加 `--no-color`。
- 程序化处理用 `wh today --json`。字段（毫秒）：
  `date, activeMs, idleMs, lockedMs, asleepMs, offMs, unknownMs, untrackedMs,
  apps[{appName, bundleId, category, durationMs, sessions, longestMs, switchCount}],
  categories{}, switchCount, switchRatePerHour, focusBlocks[], longestFocusMs,
  medianFocusMs, deepWorkMs, fragmentedActiveMs, firstActiveMs, lastActiveMs,
  hourly[{hour, activeMs}], blocks[]`
- `--json` 用 camelCase；`export` 的 JSON/JSONL 用 snake_case，并带 `schema_version`。

常用 jq：

```bash
wh today --json | jq -r '.apps[] | [.appName, (.durationMs/60000|floor), .category] | @tsv'
wh today --json | jq '.categories'
wh today --json | jq '{active: (.activeMs/3600000), switches: .switchCount, longest: (.longestFocusMs/60000)}'
```

## 口径（解释结果时不要弄错）

- **Active**：有输入且前台应用明确的时长。连续无输入超过阈值（默认 120 秒）转为 Idle，
  并把当前应用段的结束时间回填到最后一次输入时刻。
- **Idle / Away**：Idle 是无输入；Away 是锁屏 + 睡眠，单独记账。
- **Untracked / Off**：daemon 未运行、或当天还没开始记录的时段。**不要解释成“摸鱼”**。
- 应用百分比的分母是 **Active**，不是 24 小时。
- **切换次数**只统计相邻两次 active 应用之间的切换；中间隔了 Idle 或锁屏不算。
- **Focus block** 是“连续 Active（任意应用）”，不是单一应用连续专注；
  一个很长的块里可能包含多次应用切换。`deepWorkMs` 是 ≥25 分钟连续 Active 的总量，
  不是生产力评分，不要用“效率高/低”下结论。
- `wh timeline` 的格子按该时间段内占比最大的状态着色；下方 `Blocks >= 5m` 才是明细。
  没有数据的小段会留空。
- 「会话数 / sessions」= 同一应用被 Idle、锁屏或其他应用打断后的连续使用段数。

## 分析配方

**“今天时间花在哪”**：运行 `wh today --no-color`，汇报 Active 总时长、Top 应用、
分类占比、切换次数；必要时补一句最长专注块和碎片化。

**“下午 3 点在干什么”**：运行 `wh timeline --no-color`，在 `Blocks >= 5m` 里找
覆盖 15:00 的块；如果该时刻不足 5 分钟，看时间栅格对应格子，并结合相邻块说明。

**“这周怎么样 / 每天用了多久”**：

```bash
for offset in 6 5 4 3 2 1 0; do
  day=$(date -v-${offset}d +%F)
  wh today --date "$day" --json \
    | jq -r '[.date, ((.activeMs/3600000*10|round)/10), .switchCount] | @tsv'
done
```

**“我用了多久 Chrome”**：

```bash
wh apps --from 2026-10-13 --to 2026-10-19 --no-color
# 或单日精确值
wh today --json | jq -r '.apps[] | select(.appName|test("Chrome";"i")) | "\(.appName) \(.durationMs/60000|floor)m"'
```

**对比专注情况**：`wh analyze --no-color --days 7`（输出包含与过去几天日均的对比）。

## 分类

分类优先级：

1. `~/.config/whathappens/config.json` 中的规则（bundle id 或应用名，支持 `*` 通配）
2. 应用 bundle 的 `LSApplicationCategoryType`（自动读取）
3. `other`

```bash
wh category list                                  # 应用、分类、来源（config / auto / default）
wh category set WeChat communication              # 写入配置，历史数据立即按新分类统计
wh category set com.example.tool coding
```

只有在用户明确要求修正分类时才运行 `wh category set`，它会修改用户配置。
不要为了“看起来整洁”主动改配置。

## 数据与隐私

| 内容 | 路径 |
|---|---|
| 数据库 | `~/Library/Application Support/whathappens/events.db` |
| 配置 | `~/.config/whathappens/config.json` |
| 日志 | `~/Library/Logs/whathappens/daemon.log` |

数据只在本机。除非用户明确要求，不要把数据库或导出内容发送到外部服务。

## 排障

```bash
wh daemon status
launchctl print gui/$(id -u)/com.alarik.whathappens
tail -50 ~/Library/Logs/whathappens/daemon.log
```

- daemon 没跑：`wh daemon start`；plist 缺失：`wh daemon install`。
- 数据异常（大段 Untracked、Current stale）：先看日志，可能被杀掉或未登录 GUI session。
- `wh daemon uninstall --purge` 会删数据，**没有用户明确要求不要执行**。
- 排查/演示时可以换库：`wh today --db /tmp/wh-test.db`；
  用 `wh daemon run --replay Tests/fixtures/day1.jsonl --db /tmp/wh-test.db` 回放合成数据。
