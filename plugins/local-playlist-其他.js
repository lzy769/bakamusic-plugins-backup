"use strict";
/* eslint-disable */
// 本文件由 baka-playlist-gen 自动生成，请勿手改
// 使用说明见项目 README

const axiosModule = require("axios");
const axios = axiosModule.default || axiosModule;

/** 内嵌歌曲数据（mid ↔ 歌名/歌手已严格校验） */
const SONGS = [{"mid":"002N52VX4ECxSY","title":"451","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004cShuF4TQl1n_1.jpg","album":"451"},{"mid":"002nkvp33dDC8X","title":"M3","artist":"Les Apollo","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000kvBiV3v6j86_1.jpg","album":"M3"},{"mid":"0027Th3f0850Pl","title":"1234567","artist":"方大同","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002hMaer3McPaG_5.jpg","album":"橙月"},{"mid":"000ROtgL2AqtOI","title":"17","artist":"椎名林檎 (しいな りんご)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002UgAoG0MhdFj_2.jpg","album":"罪と罰"},{"mid":"002Hb7o81mkbuh","title":"Камин (sped up) (Explicit)","artist":"Casey Neistatxixx","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000azgI81qoZzf_2.jpg","album":"Камин (sped up) [Explicit]"},{"mid":"002iYc1J2tZQ0s","title":"Под луной (Silver Ace remix)","artist":"SUNAMI","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002FhpAw3TxP1W_2.jpg","album":"Под луной（在月亮下） (Silver Ace remix)"},{"mid":"0048FAGV23qZuG","title":"Φ²","artist":"HOYO-MiX/TetraCalyx","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002sAmGe3XaRDg_2.jpg","album":"崩坏3-在海的指尖-Original Soundtrack"},{"mid":"0047Yj9K3OFTO0","title":"манго нектар","artist":"Corn Wave","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000039BpiE2BG8RY_3.jpg","album":"old releases (Explicit)"},{"mid":"002dqc4n18fQrn","title":"тамада (Сингл)","artist":"CR3Times","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004J0RRs1csdQE_2.jpg","album":"Shootout"},{"mid":"0006tA2S0AaxUd","title":"Lifestyle (Вся жизнь тусовка)","artist":"Mages","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001wvG1e3vseNG_1.jpg","album":"It's Time to Party (Explicit)"},{"mid":"000Ng0vN3IQz0Q","title":"βίος <MK+nZk Version>","artist":"小林未郁 (こばやし みか)/澤野弘之 (さわの ひろゆき)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002IFKD31vKCJo_1.jpg","album":"GUILTY CROWN THEME SONGS COLLECTION"},{"mid":"000dnB8x2ByeHX","title":"Oz.","artist":"yama","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002mz0UB48tE7h_2.jpg","album":"Oz."},{"mid":"001cQ4uG0js8Is","title":"L.I.F.E.","artist":"Remady/Manu-L","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000YptEz3GQ2Xc_1.jpg","album":"L.I.F.E."},{"mid":"002DovLI0GESEB","title":"Chernobyl 2017","artist":"Meland x Hauken/Benjamin Beats","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000vZ77p0xVJqC_2.jpg","album":"Yarirafi"},{"mid":"003gcqev02bJ47","title":"2002","artist":"Anne-Marie","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001c3trv2keQlH_2.jpg","album":"2002"},{"mid":"001pBmtE1uttMH","title":"My 22","artist":"逆时针向/兔子ST","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002cfpyw2WlUot_3.jpg","album":"My 22"},{"mid":"001hHlOc2UhENG","title":"это ли счастье?","artist":"Rauf & Faik","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000022XaPs2XAUqD_2.jpg","album":"это ли счастье?"}];

/** 播放解析（多源按序回退，见 src/player-provider.mjs 的设计） */
async function resolvePlayerSource(songMid, quality) {
  const mid = String(songMid || "");
  if (!mid) return null;
  return await _bakaResolve(mid, quality);
}

function toMediaItem(song) {
  const mid = String(song.mid || song.songmid || song.id || "");
  const item = {
    id: mid, mid: mid, songmid: mid,
    platform: "其他歌单",
    title: song.title || "", artist: song.artist || "",
    album: song.album || "", duration: 0, qualities: {},
  };
  // 预取过封面时直接带上，列表无需点击即可显示专辑图
  if (song.artwork) item.artwork = song.artwork;
  return item;
}


// ── 取源优化（2026-11-23）──
// 原实现只依赖 tang.api.s01s.cn（已失效）且超时 10 秒、无回退，
// 导致每点一首歌都要干等超时，表现为"加载特别慢甚至加载不出来"。
const _bakaFreeQQApi = "https://api.xunhuisi.store/API/QQMusic/Song.php";
const _bakaAggApi = "https://yy.zddyr.top/lx/api/";
const _bakaCooldown = Object.create(null);
function _bakaCooling(key) {
  const until = _bakaCooldown[key];
  return typeof until === "number" && Date.now() < until;
}
function _bakaMarkDead(key, ms) {
  _bakaCooldown[key] = Date.now() + (ms || 60000);
}

// 免费 QQ 源（实测可用，直接返回 QQ 官方直链）
async function _bakaFetchFree(mid, quality) {
  if (_bakaCooling("free")) return null;
  const type = quality === "flac" ? "flac" : (quality === "320k" ? "320" : "128");
  try {
    const res = await axios.get(_bakaFreeQQApi, {
      params: { id: String(mid), type: type },
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const body = res.data;
    if (!body || body.code !== 200) return null;
    const url = body.music_url || body.url;
    if (typeof url !== "string" || !/^https?:\/\//i.test(url.trim())) return null;
    // 空标题说明返回的是无效 mid 的占位音轨
    if (typeof body.title === "string" && body.title.trim() === "") return null;
    delete _bakaCooldown.free;
    return { url: url.trim() };
  } catch (e) {
    const msg = String(e && e.message);
    if (/ECONNREFUSED|ENOTFOUND|ECONNRESET|socket hang up/i.test(msg)) _bakaMarkDead("free", 60000);
    return null;
  }
}

// 聚合源备用
async function _bakaFetchAgg(mid, quality) {
  if (_bakaCooling("agg")) return null;
  const q = quality === "flac" ? "flac" : (quality === "320k" ? "320k" : "128k");
  try {
    const res = await axios.get(_bakaAggApi, {
      params: { source: "qq", songmid: String(mid), quality: q },
      headers: { "User-Agent": "Mozilla/5.0", "X-Client": "lx-music" },
      timeout: 5000,
    });
    const body = res.data;
    if (body && body.code === 200 && typeof body.url === "string" && /^https?:\/\//i.test(body.url)) {
      return { url: body.url.trim() };
    }
    return null;
  } catch (e) {
    return null;
  }
}

// 原上游（已失效），仅作最后兜底，超时压到 2 秒
async function _bakaFetchLegacy(mid, quality) {
  if (_bakaCooling("legacy")) return null;
  const FIELDS = { "128k": "song_play_url_standard", "320k": "song_play_url_hq", "flac": "song_play_url_sq" };
  const field = FIELDS[quality] || FIELDS["128k"];
  try {
    const res = await axios.get("https://tang.api.s01s.cn/music_open_api.php", {
      params: { mid: mid }, timeout: 2000,
    });
    const json = res.data;
    let u = json && json[field];
    if (typeof u !== "string" || !/^https?:\/\//i.test(u.trim())) return null;
    return { url: u.trim() };
  } catch (e) {
    if (/timeout|ECONN|ENOTFOUND|ETIMEDOUT/i.test(String(e && e.message))) _bakaMarkDead("legacy", 300000);
    return null;
  }
}

// 三源并发竞速：谁先返回有效地址就用谁
async function _bakaResolve(mid, quality) {
  return await new Promise(function (resolve) {
    let settled = false;
    const fns = [_bakaFetchFree, _bakaFetchAgg, _bakaFetchLegacy];
    let pending = fns.length;
    function done(v) {
      if (settled) return;
      if (v && v.url) { settled = true; resolve(v); return; }
      if (--pending === 0) { settled = true; resolve(null); }
    }
    fns.forEach(function (fn) { fn(mid, quality).then(done, function () { done(null); }); });
  });
}

module.exports = {
  platform: "其他歌单",
  author: "baka-playlist-gen",
  version: "1.0.0",
  appVersion: ">0.1.0-alpha.0",
  srcUrl: "",
  primaryKey: ["id"],
  supportedQualities: ["128k", "320k", "flac"],
  supportedSearchType: ["music"],
  defaultSearchType: "music",

  async importMusicSheet(urlLike) {
    const s = String(urlLike || "").trim().toLowerCase();
    if (["local://import", "local://all", "localall"].includes(s)) {
      return buildSheet();
    }
    return null;
  },

  async getRecommendSheetTags() {
    return { pinned: [{ title: "其他歌单17首", id: "local-其他" }], data: [] };
  },
  async getRecommendSheetsByTag(tag, page) {
    if (!tag || !String(tag.id || "").includes("local-其他")) return { isEnd: true, data: [] };
    const sheet = buildSheet();
    return { isEnd: true, data: [{ ...sheet, musicList: sheet.musicList }] };
  },
  async getMusicSheetInfo(sheetItem, page) {
    if (sheetItem && String(sheetItem.id || "").includes("local-其他")) {
      const sheet = buildSheet();
      return { isEnd: true, sheetItem: { id: "local-其他", title: sheet.title, artist: sheet.artist, worksNum: sheet.musicList.length }, musicList: sheet.musicList };
    }
    return { isEnd: true, musicList: [] };
  },

  async getMediaSource(musicItem, quality) {
    const mid = musicItem.mid || musicItem.songmid || musicItem.id;
    if (!mid) throw new Error("缺少歌曲 ID");
    const res = await resolvePlayerSource(mid, quality || "128k");
    if (res && res.url) { const r = { url: res.url }; if (res.quality) r.quality = res.quality; return r; }
    return null;
  },

  // 播放时按 mid 从 QQ 拉取真实信息（歌名/歌手/专辑/封面 artwork）
  async getMusicInfo(musicBase) {
    const base = { ...musicBase, platform: "其他歌单" };
    const mid = musicBase.mid || musicBase.songmid || musicBase.id;
    // 已有封面就直接返回
    if (!mid || (base.artwork && base.title)) return base;
    const track = await fetchTrackByMid(mid);
    if (!track) return base;
    return {
      ...base,
      id: mid, mid, songmid: mid,
      title: track.name || base.title,
      artist: track.singer ? (Array.isArray(track.singer) ? track.singer.map((s) => s.name).join(", ") : track.singer) : base.artist,
      album: track.album || base.album,
      artwork: track.artwork || base.artwork,
      duration: track.duration || base.duration,
    };
  },

  // 播放时按 mid 从 QQ 拉取歌词（新接口优先，带翻译；失败回退 legacy 接口）
  async getLyric(musicItem) {
    // 新接口字段可能是 base64（crypt=0），也可能是明文
    const decodeField = (field) => {
      if (!field || typeof field !== "string") return "";
      const value = field.trim();
      if (!value) return "";
      const compact = value.replace(/\s/g, "");
      if (/^[A-Za-z0-9+/=]+$/.test(compact) && compact.length % 4 === 0) {
        try {
          const decoded = Buffer.from(compact, "base64").toString("utf-8");
          if (decoded && /\[(ti|ar|al|by|offset|\d{1,2}:\d{2})/.test(decoded)) return decoded;
        } catch (_) {}
      }
      return field;
    };
    const fetchRich = async (songmid) => {
      const payload = {
        comm: { ct: "19", cv: "1859", uin: "0" },
        req: {
          method: "GetPlayLyricInfo",
          module: "music.musichallSong.PlayLyricInfo",
          param: {
            format: "json", crypt: 0, qrc: 0, qrc_t: 0, roma: 0, roma_t: 0,
            trans: 1, trans_t: 0, songmid: String(songmid), type: -1,
          },
        },
      };
      const res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", payload, {
        headers: {
          "Content-Type": "application/json",
          referer: "https://y.qq.com",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        },
        timeout: 10000,
      });
      const data = res && res.data && res.data.req && res.data.req.data;
      if (!data) return null;
      const rawLrc = decodeField(data.lyric);
      if (!rawLrc) return null;
      // 去掉翻译流里的元信息（如 [kana:...]），未翻译的 "//" 行保留时间轴、清空文本
      const translation = decodeField(data.trans)
        .split(/\r?\n/)
        .filter((line) => !/^\s*\[(kana|ti|ar|al|by|offset):/i.test(line))
        .map((line) => line.replace(/^(\[\d{1,2}:\d{2}(?:\.\d{1,3})?\])\s*\/\/\s*$/, "$1"))
        .join("\n")
        .trim();
      return { rawLrc, translation };
    };
    try {
      const mid = musicItem.mid || musicItem.songmid || musicItem.id;
      if (!mid) return null;
      // 1) 新接口：同时返回原文与翻译
      try {
        const rich = await fetchRich(mid);
        if (rich && rich.rawLrc) {
          const result = { rawLrc: rich.rawLrc };
          if (rich.translation) result.translation = rich.translation;
          return result;
        }
      } catch (_) { /* 新接口失败，继续回退 */ }
      // 2) 回退 legacy 接口（仅原文）
      const url = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${mid}&pcachetime=${Date.now()}`;
      const res = await axios.get(url, { headers: { Referer: "https://y.qq.com", "user-agent": "Mozilla/5.0" } });
      const text = String(res.data || "");
      // 去掉 JSONP 包裹（如 MusicJsonCallback(...) / jsonCallback(...)）
      const inner = text.replace(/^[^(]*\(/, "").replace(/\)\s*$/, "").trim();
      const json = JSON.parse(inner);
      const b64 = json && json.lyric;
      if (!b64) return null;
      const rawLrc = Buffer.from(b64, "base64").toString("utf-8");
      if (!rawLrc) return null;
      return { rawLrc };
    } catch (_) { return null; }
  },
};

function buildSheet() {
  const musicList = SONGS.map(toMediaItem);
  return {
    id: "local-其他",
    platform: "其他歌单",
    title: "其他歌单17首",
    artist: "本地导入",
    description: "其他歌曲，共 17 首",
    worksNum: musicList.length,
    isImported: true,
    musicList,
  };
}

// 用 QQ mid 反查歌曲真实信息（songID / 歌名 / 歌手 / 封面）。
async function fetchTrackByMid(mid) {
  try {
    const data = {
      comm: { ct: "19", cv: "1859", uin: "0" },
      req: { module: "music.trackInfo.UniformRuleCtrl", method: "CgiGetTrackInfo",
        param: { types: [1], ids: [], mids: [mid], ctx: 0 } },
    };
    const res = await axios.get("https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=" + encodeURIComponent(JSON.stringify(data)), {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://y.qq.com" },
    });
    const t = res.data?.req?.data?.tracks?.[0];
    if (!t) return null;
    const album = t.album || {};
    const singers = (t.singer || []).map((s) => ({ name: s.name, mid: s.mid }));
    const artwork = album.pmid
      ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${album.pmid}.jpg`
      : (album.mid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${album.mid}.jpg` : "");
    return { songid: t.id, name: t.name, singer: singers, album: album.name, artwork, duration: t.interval };
  } catch (_) { return null; }
}
