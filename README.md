# BakaMusic 插件备份（本机实际使用的插件）

本仓库是本机 BakaMusic 实际安装、使用的插件备份，整理于 2026-11-24。仅作个人备份用途，仓库设为私有。

## 内容

`plugins/` 下的 10 个插件，按来源分两类：

**音源插件（6 个）**：`qq.js`、`wy.js`、`kg.js`、`kw.js`、`mg.js`、`bilibili.js`
这些插件用于搜索、解析对应平台的曲目信息，接口主要收集自公开网络，有部分本地修改（例如 `qq.js` 的免费 QQ 音源适配、`kg.js` 的外语歌翻译轨处理）。插件内 `API_KEY`、`_XH_TOKEN` 等均为空占位；`API_KEY = "e82ckenh8dichen8"` 是网易云公开的 eapi 常量，不是用户密钥。

**歌单插件（4 个）**：`local-playlist-中文.js`、`local-playlist-其他.js`、`local-playlist-日文.js`、`local-playlist-英文.js`
由 `baka-playlist-gen` 工具根据本地歌曲列表自动生成，文件头注明“自动生成，请勿手改”。内嵌的是歌曲元数据（MID、歌名、歌手、封面 URL），不含个人身份信息；播放时通过第三方公开接口拉取真实播放地址与歌词。

## 已剔除的文件

从原插件目录复制时，未包含以下本地临时文件：

- `*.js.integrity.json`（完整性校验缓存）
- `*.perf-backup-*`、`*.backup-*`（修改前备份）
- `__probe_native.tmp`（临时探测文件）

## 使用方式

将 `plugins/` 下的 `.js` 文件复制到 BakaMusic 的插件目录（`%APPDATA%\BakaMusic\bakamusic-plugins\`）即可。歌单插件依赖 `baka-playlist-gen` 生成的歌单数据，本仓库只备份成品插件，不包含原始数据表格。

## 法律声明

插件使用的播放接口及其他 API 来自公开网络，本仓库仅作整理与备份，不提供或运营自有音源。音乐内容的权利归各自权利人所有。使用者应遵守所在地区法律及来源平台服务条款，尊重版权、支持正版。请勿利用本仓库内容绕过付费、身份认证或版权保护措施。
