# Java 高频面试题 · DSH 插件

在 **DeepSeek Harness** 的侧边栏里练习 Java 高频面试题：按板块刷题、维护自己的收藏夹、按面试频率或难度排序、每次 10 道一键换一批，还能导入自己的题库。

![license](https://img.shields.io/badge/license-MIT-2ea44f)
![platform](https://img.shields.io/badge/platform-DSH%20Web%20UI-4a7dff)
![questions](https://img.shields.io/badge/%E5%86%85%E7%BD%AE%E9%A2%98%E5%BA%93-200%20%E9%A2%98-f0a23c)

---

## 功能

- **侧边栏入口** — 与「插件」「日程」并列的独立面板，点开即用。
- **9 个板块** — 基础、集合、并发、JVM、Spring、MySQL、Redis、消息队列、分布式。
- **收藏夹** — 每道题可一键收藏，收藏夹单独成页，随时回看。
- **每次 10 道** — 一屏 10 张卡片，「换一批」立即刷新下一组；某个板块不足 10 道时自动环绕补齐。
- **5 颗心评分** — 每道题标注「面试频率」与「难度」，各 1–5 颗心。
- **四种排序** — 随机、频率高→低、难度高→低、难度低→高；翻页时保持排序。
- **导入题库** — 粘贴 JSON 或选择 `.json` 文件，按规范校验后合并进题库。
- **本地存储** — 收藏与导入题库都存在浏览器 `localStorage`，不上传、不同步。

## 安装

> 需要已经装好 DeepSeek Harness（桌面版或 `dsh` CLI 均可）。

### 方式一：从 GitHub 安装（推荐）

```bash
dsh plugin --profile <你的 profile> add github:OWNER/dsh-java-interview
```

或在 Harness 里让 `plugin_manager` 执行：

```
action: install_bundle
target: github:OWNER/dsh-java-interview
```

> 把 `OWNER` 换成仓库所属的 GitHub 用户名。装完刷新页面，侧边栏就会出现「Java 面试」入口。

两点说明：

- 本插件是**纯 JavaScript、无构建步骤**，所以不需要 `prepare` 脚本，也**不需要 `allowBuilds` 授权** —— 不会在你机器上执行任何安装期代码。
- 想锁定版本，可以按 commit 安装：`github:OWNER/dsh-java-interview#<sha>`，之后 push 不会悄悄改变你装的东西。

> ⚠️ 如果你当前是用**本地目录（link）**安装的开发版本，这一步会把本地链接替换成 GitHub 版本，本地改动不再实时生效。想继续改代码，请用方式二。

### 方式二：本地目录安装（开发用）

```bash
dsh plugin --profile <你的 profile> add <本仓库的绝对路径>
```

或在 Harness 里用 `plugin_manager` 的 `install_bundle`，`target` 填本仓库绝对路径。之后编辑 `client.js` 保存、刷新页面即可看到效果，无需重装。

## 兼容性

在 **DSH 0.2.1-rc.5**（桌面版）上开发并验证。

`package.json` **故意不声明 `engines.dsh`**：DSH 当前发布的是 `0.2.1-rc.5` 这类预发布版本，而标准 semver 下 `>=0.2.0 <0.3.0` 并不匹配 `0.2.1-rc.5`，写上反而会让插件在所有当前版本上被拒绝安装。本插件只依赖稳定的 `sidebar.panellist` / `main` slot 与 locale 注册 API，没有 peer 依赖，因此不加版本闸门更安全。若将来上游 API 有破坏性变更，再补 `engines.dsh` 并用 `>=x.y.z-0` 形式覆盖预发布版本。

## 使用

| 操作 | 位置 |
| --- | --- |
| 切换板块 | 顶部标签，`全部` 为 200 道 |
| 收藏 / 取消收藏 | 卡片右下角星标 |
| 看答案 / 收起答案 | 卡片底部按钮 |
| 换一批 | 工具栏右侧按钮，按当前排序取下一批 10 道 |
| 排序 | 工具栏中间四选一 |
| 导入题库 | 标题右侧「导入题库」 |

## 导入题库

「导入题库」支持两种输入：直接粘贴 JSON，或点「选择文件」读取本地 `.json`（UTF-8，≤ 2 MB）。文件读进来后仍会**逐条按同样规则校验** —— 文件只是一种更省力的填写方式，不会绕过任何约束。

### 格式

顶层是数组，或 `{ "questions": [...] }`：

```json
[
  {
    "topic": "basic",
    "freq": 5,
    "diff": 2,
    "q": "Java 的基本数据类型有哪些？",
    "a": [
      "8 种：byte / short / int / long / float / double / char / boolean",
      "boolean 在 JVM 规范中没有规定具体字节数"
    ]
  }
]
```

### 字段约束

| 字段 | 必填 | 约束 |
| --- | --- | --- |
| `topic` | 是 | 只能是 `basic` `collection` `concurrent` `jvm` `spring` `mysql` `redis` `mq` `distributed` |
| `q` | 是 | 题干，非空，≤ 120 字 |
| `a` | 是 | 答案要点，字符串数组，1–5 条，每条 ≤ 300 字 |
| `freq` | 否 | 面试频率，1–5 整数；省略按 3 颗心 |
| `diff` | 否 | 难度，1–5 整数；省略按 3 颗心 |
| `id` | 否 | 省略则自动生成；与内置题或已导入题重复的 id 会被**跳过**，不会覆盖 |

整体限制：单次 1–500 道题。校验失败会逐条提示是第几道、错在哪里，例如「第 2 条 · topic 不在允许的板块列表内」。

可直接导入的示例文件：[`examples/sample-bank.json`](examples/sample-bank.json)。

## 题库概览

| 板块 | `topic` | 题数 |
| --- | --- | ---: |
| 基础 | `basic` | 26 |
| 集合 | `collection` | 22 |
| 并发 | `concurrent` | 26 |
| JVM | `jvm` | 22 |
| Spring | `spring` | 22 |
| MySQL | `mysql` | 22 |
| Redis | `redis` | 20 |
| 消息队列 | `mq` | 16 |
| 分布式 | `distributed` | 24 |
| **合计** | | **200** |

- 面试频率分布：2 颗心 8 道、3 颗心 54 道、4 颗心 81 道、5 颗心 57 道。
- 难度分布：1 颗心 14 道、2 颗心 41 道、3 颗心 75 道、4 颗心 58 道、5 颗心 12 道。

## 项目结构

```
dsh-java-interview/
├── package.json          # 清单：exports / files / dsh.bundle / dsh.client
├── cordis.patch.yml      # 往 profile 里插入插件行
├── index.js              # Host 半侧：空实现（全部逻辑在 Client）
├── client.js             # Client 半侧：题库 + 页面 + 样式
├── icon.svg              # 侧边栏图标
├── locale/
│   ├── zh.json           # 面板标题与描述（中文）
│   └── en.json           # 面板标题与描述（英文）
├── examples/
│   └── sample-bank.json  # 可直接导入的示例题库
├── scripts/
│   └── verify.mjs        # 清单与资源自检
└── .github/workflows/ci.yml
```

## 本地开发

```bash
npm run verify   # 校验清单、patch、locale、图标
npm run check    # JavaScript 语法检查
```

改 `client.js` 后刷新页面即可。插件通过 `window.__ModuleLoader__` 加载，没有打包步骤，也不需要 `npm install`。

## 常见问题

**数据存在哪？**
收藏夹在 `dsh.java-interview.favorites.v1`，导入题库在 `dsh.java-interview.imported.v1`，都是浏览器 `localStorage`。换浏览器或清缓存会丢，重要题库请留一份 JSON。

**导入后总数没变？**
多半是所有题的 id 都撞上了。成功提示会写明「跳过重复 N」。

**导入的题不显示？**
确认 `topic` 在白名单内 —— 不在白名单的题会被整条拒绝，而不是归进「全部」。

**点「换一批」会打乱排序吗？**
不会。只有「随机」模式会重新洗牌，其余三种排序翻页时保持顺序。

## 许可证

[MIT](LICENSE)
