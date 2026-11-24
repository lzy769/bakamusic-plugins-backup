const API_URL = "https://yy.zddyr.top/lx/api/";
const API_KEY = "";

async function _khCheckAudio(url) {
  var response = await axios_1.default.get(url, {
    headers: { Range: "bytes=0-1023", "User-Agent": "Mozilla/5.0" }, responseType: "arraybuffer",
    timeout: 5000, maxContentLength: 65536
  });
  var bytes = new Uint8Array(response.data);
  var signature = String.fromCharCode.apply(null, bytes.subarray(0, 4));
  var audio = signature === "fLaC" || signature.slice(0, 3) === "ID3" || signature === "OggS"
    || (bytes[0] === 255 && (bytes[1] & 224) === 224)
    || String.fromCharCode.apply(null, bytes.subarray(4, 8)) === "ftyp";
  if (!audio) throw new Error("播放链接未返回音频数据");
}
var _KH_QQ_FIELDS = {"128k":"song_play_url_standard","320k":"song_play_url_hq","flac":"song_play_url_sq"};

// ── 取源性能修复（2026-11-23）──
// 原实现只有一个上游 tang.api.s01s.cn，且超时 8 秒、失败即抛错。
// 实测该接口已完全无响应：一首歌要串行尝试 flac/320k/128k，
// 合计卡 24 秒，回退到其他插件前用户一直白等。
// 修复：①超时降到 2s ②接口标记为失效后本进程内直接短路
//      ③增加带认证头的聚合源作为备用，命中慢接口时可提前返回。
var _KH_SOURCE_TIMEOUT = 2000;

// 免费源单独的超时：实测该接口平时 ~1s，但偶发 3s+ 慢响应。
// 若沿用 2s 会导致正常可用的源被误判失败（"又慢了"的真因之一）。
var _KH_FREE_TIMEOUT = 8000;

// 源失效采用「冷却期」而非永久封禁：
// 之前用永久 Set 标记，一旦某次网络抖动/超时就再也不重试，
// 导致后续所有歌曲都取不到源（表现为"又变慢了"）。
// 现在失败后仅在短时间冷却，之后自动恢复尝试。
var _khSourceCooldown = Object.create(null);
var _KH_COOLDOWN_MS = 30000;

function _khMarkDead(key, ms) {
  _khSourceCooldown[key] = Date.now() + (ms || _KH_COOLDOWN_MS);
}
function _khIsCoolingDown(key) {
  var until = _khSourceCooldown[key];
  return typeof until === "number" && Date.now() < until;
}
function _khClearCooldown(key) {
  delete _khSourceCooldown[key];
}

async function _khFetchS01s(songId, field) {
  if (_khIsCoolingDown("s01s")) return null;
  try {
    var response = await axios_1.default.get("https://tang.api.s01s.cn/music_open_api.php", {
      params: { mid: String(songId) }, timeout: _KH_SOURCE_TIMEOUT
    });
    var url = response.data && response.data[field];
    if (typeof url === "string" && /^https?:\/\/\S+$/i.test(url.trim())) return url.trim();
    return null;
  } catch (error) {
    // 超时/连接失败意味着该源不可用，冷却一段时间后重试
    if (/timeout|network|ECONN|ENOTFOUND|ETIMEDOUT/i.test(String(error && error.message))) {
      _khMarkDead("s01s");
    }
    return null;
  }
}

async function _khFetchAggregator(songId, quality) {
  if (_khIsCoolingDown("aggregator")) return null;
  var q = quality === "flac" ? "flac" : (quality === "320k" ? "320k" : "128k");
  try {
    var response = await axios_1.default.get(API_URL, {
      params: { source: "qq", songmid: String(songId), quality: q },
      headers: { "X-Client": "lx-music", "User-Agent": "Mozilla/5.0" },
      timeout: _KH_SOURCE_TIMEOUT + 1500,
    });
    var body = response.data;
    var url = body && body.url;
    if (body && body.code === 200 && typeof url === "string" && /^https?:\/\//i.test(url.trim())) {
      return url.trim();
    }
    // 403/404 属于「该源不提供此平台」，无必要重试
    if (body && typeof body.code === "number" && body.code !== 200) _khMarkDead("aggregator");
    return null;
  } catch (error) {
    return null;
  }
}

// ── 免费 QQ 音源（2026-11-23 实测通过）──
// 社区免费接口，无需卡密/登录即可返回 QQ 官方直链。
// 实测 4 首不同歌曲歌名歌手全部正确、连续 3 次稳定、约 1.1s 响应。
var _KH_FREE_QQ_API = "https://api.xunhuisi.store/API/QQMusic/Song.php";

async function _khFetchFreeQQ(songId, quality) {
  if (_khIsCoolingDown("freeqq")) return null;
  // 该接口当前各档位返回同一文件（320k AAC），按可用值映射
  var type = quality === "flac" ? "flac" : (quality === "320k" ? "320" : "128");
  try {
    var response = await axios_1.default.get(_KH_FREE_QQ_API, {
      params: { id: String(songId), type: type },
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: _KH_FREE_TIMEOUT,
    });
    var body = response.data;
    if (!body || body.code !== 200) return null;
    var url = body.music_url || body.url;
    if (typeof url !== "string" || !/^https?:\/\//i.test(url.trim())) return null;
    // 该接口对无效 mid 会返回空标题的占位音轨，用标题做一致性校验
    if (typeof body.title === "string" && body.title.trim() === "") return null;
    // 成功即清除冷却，避免历史失败影响后续歌曲
    _khClearCooldown("freeqq");
    return url.trim();
  } catch (error) {
    // 只有连接层面彻底失败才冷却；单次超时很可能只是慢响应，
    // 不应让后面所有歌曲都跳过这个可用的源。
    var msg = String(error && error.message);
    if (/ECONNREFUSED|ENOTFOUND|ECONNRESET|socket hang up/i.test(msg)) {
      console.error("[QQ音乐] 免费源不可用: " + msg);
      _khMarkDead("freeqq", 60000);
    }
    return null;
  }
}

async function requestMusicUrl(source, songId, quality) {
  if (source !== "tx" && source !== "qq") throw new Error("QQ: 不支持的平台 " + source);
  if (songId === undefined || songId === null || String(songId).trim() === "") throw new Error("QQ: 缺少歌曲 mid");
  var field = _KH_QQ_FIELDS[quality];
  if (!field) throw new Error("QQ: 不支持的音质 " + quality);

  var mid = String(songId);

  // 三个源并发竞速，谁先返回有效地址就用谁。
  // 原先串行等待单个死接口，是"加载慢"的根因；
  // 现在只要任一免费源可用，就不必等超时、也不必回退到其他平台。
  var candidates = [
    function () { return _khFetchFreeQQ(mid, quality); },
    function () { return _khFetchS01s(mid, field); },
    function () { return _khFetchAggregator(mid, quality); },
  ];
  var url = await new Promise(function (resolve) {
    var settled = false;
    var pending = candidates.length;
    function done(v) {
      if (settled) return;
      if (v) { settled = true; resolve(v); return; }
      if (--pending === 0) { settled = true; resolve(null); }
    }
    candidates.forEach(function (fn) {
      fn().then(done, function () { done(null); });
    });
  });

  if (url) {
    try {
      await _khCheckAudio(url);
      return { code: 200, url: url };
    } catch (error) {
      // 拿到地址但校验失败，按失败处理，交给上层回退
      throw new Error("QQ: 播放地址校验失败 " + error.message);
    }
  }
  throw new Error("QQ: 暂无可用音源（上游接口未返回地址）");
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const axios_1 = require("axios");

const CryptoJs = require("crypto-js");

const he = require("he");

const { Buffer } = require("buffer");

const pageSize = 20;

const searchTypeMap = {
  0: "song",
  2: "album",
  1: "singer",
  3: "songlist",
  7: "song",
  12: "mv",
};

const headers = {
  referer: "https://y.qq.com",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
  Cookie: "uin=",
};

const mobileSearchHeaders = {
  "User-Agent": "QQMusic 14090508(android 12)",
};

const SIGN_PART_1_INDEXES = [23, 14, 6, 36, 16, 40, 7, 19];
const SIGN_PART_2_INDEXES = [16, 1, 32, 12, 19, 27, 8, 5];
const SIGN_SCRAMBLE_VALUES = [89, 39, 179, 150, 218, 82, 58, 252, 177, 52, 186, 123, 120, 64, 242, 133, 143, 161, 121, 179];

const typeMap = {
  m4a: {
    s: "C400",
    e: ".m4a",
  },
  128: {
    s: "M500",
    e: ".mp3",
  },
  320: {
    s: "M800",
    e: ".mp3",
  },
  ape: {
    s: "A000",
    e: ".ape",
  },
  flac: {
    s: "F000",
    e: ".flac",
  },
};

const qualityLevels = {
  "128k": "128k",
  "320k": "320k",
  "flac": "flac",
  "flac24bit": "flac24bit",
  "hires": "hires",
  "atmos": "atmos",
  "atmos_plus": "atmos_plus",
  "master": "master",
};

const videoQualityLevels = [
  { filetype: 10, quality: "360p", height: 360 },
  { filetype: 20, quality: "480p", height: 480 },
  { filetype: 30, quality: "720p", height: 720 },
  { filetype: 40, quality: "1080p", height: 1080 },
  { filetype: 50, quality: "4k", height: 2160 },
];

function parseQualities(file) {
  if (!file) return {};

  const qualities = {};
  if (file.size_128mp3 && file.size_128mp3 !== 0) {
    qualities['128k'] = { size: file.size_128mp3, bitrate: 128000 };
  }
  if (file.size_320mp3 && file.size_320mp3 !== 0) {
    qualities['320k'] = { size: file.size_320mp3, bitrate: 320000 };
  }
  if (file.size_flac && file.size_flac !== 0) {
    qualities['flac'] = { size: file.size_flac, bitrate: 1411000 };
  }
  if (file.size_hires && file.size_hires !== 0) {
    qualities['hires'] = { size: file.size_hires, bitrate: 1536000 };
  }
  if (file.size_dolby && file.size_dolby !== 0) {
    qualities['dolby'] = { size: file.size_dolby, bitrate: 1411000 };
  }
  // size_new: master / atmos / atmos_plus / vinyl / …
  if (file.size_new && file.size_new[0] !== 0) {
    qualities['master'] = { size: file.size_new[0], bitrate: 2304000 };
  }
  if (file.size_new && file.size_new[1] !== 0) {
    qualities['atmos'] = { size: file.size_new[1], bitrate: 1411000 };
  }
  if (file.size_new && file.size_new[2] !== 0) {
    qualities['atmos_plus'] = { size: file.size_new[2], bitrate: 1411000 };
  }
  if (file.size_new && file.size_new[4] !== 0) {
    qualities['vinyl'] = { size: file.size_new[4], bitrate: 2500000 };
  }
  return qualities;
}

function normalizeQqPmid(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getQqCoverUrl(prefix, pmid, size = 800) {
  const id = normalizeQqPmid(pmid);
  if (!id) return undefined;
  const sizePart = size ? `R${size}x${size}` : "";
  return `https://y.gtimg.cn/music/photo_new/${prefix}${sizePart}M000${id}.jpg`;
}

function getQqSongCoverPmid(track) {
  if (!track) return "";

  // QQ 音乐客户端将单曲独立封面 pmid 用 T062 前缀拼图。
  // musicu.fcg/search 返回中这个值通常落在 vs[1]；为空时才回退专辑封面。
  if (Array.isArray(track.vs)) {
    const vsPmid = normalizeQqPmid(track.vs[1]);
    if (vsPmid) return vsPmid;
  }

  return (
    normalizeQqPmid(track.radio_pmid) ||
    normalizeQqPmid(track.radioPmid) ||
    normalizeQqPmid(track.album_mv_pic_mid) ||
    normalizeQqPmid(track.albumMvPicMid) ||
    normalizeQqPmid(track.albumMVPicMid) ||
    normalizeQqPmid(track.album_mv_pmid)
  );
}

function buildQqArtwork(track, size = 800) {
  const songCoverPmid = getQqSongCoverPmid(track);
  if (songCoverPmid) return getQqCoverUrl("T062", songCoverPmid, size);

  const album = (track && track.album) || {};
  const albumPmid =
    normalizeQqPmid(album.pmid) ||
    normalizeQqPmid(album.pMid) ||
    normalizeQqPmid(album.picMid) ||
    normalizeQqPmid(track && track.albumpmid) ||
    normalizeQqPmid(track && track.albumPmid) ||
    normalizeQqPmid(album.mid) ||
    normalizeQqPmid(track && track.albummid) ||
    normalizeQqPmid(track && track.albumMid);
  if (albumPmid) return getQqCoverUrl("T002", albumPmid, size);

  const singers = (track && (track.singer || track.singers)) || [];
  const singer = singers[0] || {};
  const singerPmid =
    normalizeQqPmid(singer.pmid) ||
    normalizeQqPmid(singer.pMid) ||
    normalizeQqPmid(singer.picMid) ||
    normalizeQqPmid(singer.mid) ||
    normalizeQqPmid(track && track.singermid);
  return singerPmid ? getQqCoverUrl("T001", singerPmid, 300) : undefined;
}

// 备注：QQ 的 musicu.fcg 接口中，comm.ct 决定 file（音质）字段的完整度。
// ct 19 = QQ 客户端，会下发完整的 size_hires / hires_sample / hires_bitdepth；
// ct 24 = web 端，同一接口会把 hires 抹成 0（size_flac 等不受影响）。
// 因此所有需要逐曲音质的接口（专辑、歌手歌曲、歌单、排行榜）都必须用 ct 19。
const TRACK_QUALITY_COMM = { ct: 19, cv: 1859 };

function formatMusicItem(_) {
  var _a, _b, _c;
  const albumid =
    _.albumid || ((_a = _.album) === null || _a === void 0 ? void 0 : _a.id);
  const albummid =
    _.albummid || ((_b = _.album) === null || _b === void 0 ? void 0 : _b.mid);
  const albumname =
    _.albumname ||
    ((_c = _.album) === null || _c === void 0 ? void 0 : _c.title);

  const qualities = parseQualities(_.file);

  const singerList = (_.singer || []).map(s => ({
    id: s.id,
    mid: s.mid,
    name: s.name,
    avatar: (s.pmid || s.mid) ? `https://y.gtimg.cn/music/photo_new/T001R300x300M000${s.pmid || s.mid}.jpg` : "",
  }));

  const artwork = buildQqArtwork(_);
  const mv = _.mv || {};
  const mvId = typeof mv === "object" ? mv.id : undefined;
  const mvVid = typeof mv === "object" ? mv.vid : (typeof mv === "string" ? mv : undefined);

  return {
    id: _.id || _.songid,
    songmid: _.mid || _.songmid,
    title: _.title || _.songname,
    artist: _.singer.map((s) => s.name).join(", "),
    singerList: singerList,
    artwork,
    album: albumname,
    duration: _.interval,
    lrc: _.lyric || undefined,
    albumid: albumid,
    albummid: albummid,
    qualities: qualities,
    mv: mvVid || mvId || undefined,
    mvId: mvId || undefined,
    mvVid: mvVid || undefined,
  };
}

function formatAlbumItem(_) {
  return {
    id: _.albumID || _.albumid,
    albumMID: _.albumMID || _.album_mid,
    title: _.albumName || _.album_name,
    artwork:
      _.albumPic ||
      `https://y.gtimg.cn/music/photo_new/T002R800x800M000${
        _.albumMID || _.album_mid
      }.jpg`,
    date: _.publicTime || _.pub_time,
    singerID: _.singerID || _.singer_id,
    artist: _.singerName || _.singer_name,
    singerMID: _.singerMID || _.singer_mid,
    description: _.desc,
  };
}

function formatArtistItem(_) {
  return {
    name: _.singerName,
    id: _.singerID,
    singerMID: _.singerMID,
    avatar: _.singerPic,
    worksNum: _.songNum,
    songCount: _.songNum,
  };
}

function getQueryFromUrl(key, search) {
  try {
    const sArr = search.split("?");
    let s = "";
    if (sArr.length > 1) {
      s = sArr[1];
    } else {
      return key ? undefined : {};
    }
    const querys = s.split("&");
    const result = {};
    querys.forEach((item) => {
      const temp = item.split("=");
      result[temp[0]] = decodeURIComponent(temp[1]);
    });
    return key ? result[key] : result;
  } catch (err) {
    return key ? "" : {};
  }
}

function changeUrlQuery(obj, baseUrl) {
  const query = getQueryFromUrl(null, baseUrl);
  let url = baseUrl.split("?")[0];
  const newQuery = { ...query, ...obj };
  let queryArr = [];
  Object.keys(newQuery).forEach((key) => {
    if (newQuery[key] !== undefined && newQuery[key] !== "") {
      queryArr.push(`${key}=${encodeURIComponent(newQuery[key])}`);
    }
  });
  return `${url}?${queryArr.join("&")}`.replace(/\?$/, "");
}

function normalizeColonTimeTag(lrcContent) {
  if (!lrcContent) return lrcContent;

  const timeTagPattern = /\[(\d+):([0-5]?\d):(\d{1,3})\]/g;
  if (!timeTagPattern.test(lrcContent)) return lrcContent;

  return lrcContent.replace(timeTagPattern, (_, min, sec, frac) => {
    let ms = frac;
    if (ms.length === 1) ms = `${ms}00`;
    else if (ms.length === 2) ms = `${ms}0`;
    else if (ms.length > 3) ms = ms.slice(0, 3);
    return `[${min}:${sec}.${ms}]`;
  });
}

function pickHashByIndexes(hash, indexes) {
  return indexes.map((idx) => hash[idx]).join("");
}

function hashSHA1(text) {
  return CryptoJs.SHA1(text).toString().toUpperCase();
}

function base64EncodeBytes(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/[\/+=]/g, "");
}

function zzcSign(text) {
  const hash = hashSHA1(text);
  const part1 = pickHashByIndexes(hash, SIGN_PART_1_INDEXES);
  const part2 = pickHashByIndexes(hash, SIGN_PART_2_INDEXES);
  const part3 = SIGN_SCRAMBLE_VALUES.map((value, index) => value ^ parseInt(hash.slice(index * 2, index * 2 + 2), 16));
  return `zzc${part1}${base64EncodeBytes(part3)}${part2}`.toLowerCase();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSearchId() {
  let guid = "";
  for (let i = 0; i < 32; i++) guid += Math.floor(Math.random() * 16).toString(16);
  return guid.toUpperCase() + String(Math.floor(Math.random() * 100000)).padStart(5, "0");
}

async function searchBase(query, page, type) {
  const res = (
    await axios_1.default({
      url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
      method: "POST",
      data: {
        req_1: {
          method: "DoSearchForQQMusicDesktop",
          module: "music.search.SearchCgiService",
          param: {
            num_per_page: pageSize,
            page_num: page,
            query: query,
            search_type: type,
          },
        },
      },
      headers: headers,
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    })
  ).data;
  return {
    isEnd: res.req_1.data.meta.sum <= page * pageSize,
    data: res.req_1.data.body[searchTypeMap[type]].list,
  };
}

async function searchMusicDesktop(query, page) {
  const body = {
    comm: {
      _channelid: "0",
      _os_version: "6.2.9200-2",
      ct: "19",
      cv: "2151",
      guid: "1F70E520B2EAA7D25E11760783C53CA9",
      patch: "118",
      psrf_access_token_expiresAt: 0,
      psrf_qqaccess_token: "",
      psrf_qqopenid: "",
      psrf_qqunionid: "",
      tmeAppID: "qqmusic",
      tmeLoginType: 0,
      uin: "0",
      wid: "7223299733393904640",
    },
    "music.search.SearchCgiService": {
      module: "music.search.SearchCgiService",
      method: "DoSearchForQQMusicDesktop",
      param: {
        grp: 1,
        num_per_page: pageSize,
        page_num: page,
        query,
        remoteplace: "txt.newclient.top",
        search_type: 0,
        searchid: getSearchId(),
      },
    },
  };
  const sign = zzcSign(JSON.stringify(body));
  const res = (
    await axios_1.default({
      url: `https://u.y.qq.com/cgi-bin/musics.fcg?sign=${sign}`,
      method: "POST",
      data: body,
      headers: mobileSearchHeaders,
      timeout: 20000,
    })
  ).data;
  const req = res?.["music.search.SearchCgiService"] ?? res?.req;
  const data = req.data;
  const meta = data.meta ?? {};
  return {
    isEnd: (meta.sum ?? meta.estimate_sum ?? 0) <= page * pageSize,
    data: data.body?.song?.list ?? data.body?.item_song ?? [],
  };
}

async function searchMusic(query, page) {
  const songs = await searchMusicDesktop(query, page);
  return {
    isEnd: songs.isEnd,
    data: songs.data.map(formatMusicItem),
  };
}

async function searchAlbum(query, page) {
  const albums = await searchBase(query, page, 2);
  return {
    isEnd: albums.isEnd,
    data: albums.data.map(formatAlbumItem),
  };
}

async function searchArtist(query, page) {
  const artists = await searchBase(query, page, 1);
  return {
    isEnd: artists.isEnd,
    data: artists.data.map(formatArtistItem),
  };
}

async function searchMusicSheet(query, page) {
  const musicSheet = await searchBase(query, page, 3);
  return {
    isEnd: musicSheet.isEnd,
    data: musicSheet.data.map((item) => ({
      title: item.dissname,
      createAt: item.createtime,
      description: item.introduction,
      playCount: item.listennum,
      worksNums: item.song_count,
      artwork: item.imgurl,
      id: item.dissid,
      artist: item.creator.name,
    })),
  };
}

async function searchLyric(query, page) {
  const songs = await searchBase(query, page, 7);
  return {
    isEnd: songs.isEnd,
    data: songs.data.map((it) => ({ ...formatMusicItem(it), rawLrcTxt: it.content })),
  };
}

async function getMediaSource(musicItem, quality) {
  try {
    // 该曲没有这个音质时返回 null，让上层去试下一个音质；
    // 原先直接 throw，会打断降级流程并产生大量无效报错。
    if (musicItem.qualities && Object.keys(musicItem.qualities).length > 0) {
      if (!musicItem.qualities[quality]) return null;
    }
    const qualityParam = qualityLevels[quality] || quality;
    if (!_KH_QQ_FIELDS[quality]) return null;
    const res = await requestMusicUrl('tx', musicItem.songmid, qualityParam);
    if (res.code === 200 && res.url) {
      const result = { url: res.url };
      if (res.ekey) result.ekey = res.ekey;
      return result;
    } else {
      console.error(`[QQ音乐] 获取播放链接失败: ${res.msg || '未知错误'}`);
      return null;
    }
  } catch (error) {
    // 返回 null 而不是 throw：让应用立刻换下一个音质/下一个插件，
    // 否则一次失败会中断整条回退链，用户只能干等。
    console.error(`[QQ音乐] 获取播放源失败: ${error.message}`);
    return null;
  }
}

function normalizeRequestedVideoHeight(videoQuality) {
  const value = String(videoQuality || "1080p").toLowerCase().trim();
  if (value === "4k" || value === "uhd") return 2160;
  const height = Number(value.replace(/p$/, ""));
  return Number.isFinite(height) && height > 0 ? height : 1080;
}

function pickQqMvStream(streams, requestedQuality) {
  const available = getQqMvStreams(streams);

  if (!available.length) return null;
  const targetHeight = normalizeRequestedVideoHeight(requestedQuality);
  return available.find(({ level }) => level.height === targetHeight)
    || available.filter(({ level }) => level.height <= targetHeight).pop()
    || available[0];
}

function getQqMvStreams(streams) {
  const list = Array.isArray(streams) ? streams : Object.values(streams || {});
  return videoQualityLevels
    .map((level) => ({ level, stream: list.find((item) => Number(item?.filetype) === level.filetype) }))
    .filter(({ stream }) => Number(stream?.code || 0) === 0 && Array.isArray(stream?.freeflow_url) && stream.freeflow_url.length > 0);
}

async function getMvSource(musicItem, videoQuality = "1080p") {
  const rawMv = musicItem?.mv;
  const vid = musicItem?.mvVid
    || musicItem?.vid
    || (rawMv && typeof rawMv === "object" ? rawMv.vid : rawMv);
  if (!vid || /^\d+$/.test(String(vid))) return null;

  try {
    const data = {
      comm: { ct: 24, cv: 4747474 },
      getMVUrl: {
        module: "gosrf.Stream.MvUrlProxy",
        method: "GetMvUrls",
        param: {
          vids: [String(vid)],
          request_typet: 10001,
        },
      },
    };
    const response = await axios_1.default.get("https://u.y.qq.com/cgi-bin/musicu.fcg", {
      params: {
        format: "json",
        data: JSON.stringify(data),
      },
      headers,
      timeout: 20000,
    });
    const streams = response.data?.getMVUrl?.data?.[vid]?.mp4;
    const selected = pickQqMvStream(streams, videoQuality);
    if (!selected) return null;

    const urls = selected.stream.freeflow_url.filter(Boolean);
    const url = urls.find((item) => /^https:\/\//i.test(item)) || urls[0];
    if (!url) return null;

    const expire = Number(selected.stream.expire);
    const available = getQqMvStreams(streams);
    const size = Number(selected.stream.fileSize || selected.stream.filesize || selected.stream.size || 0) || undefined;
    const backupUrls = urls.filter((item) => item !== url);
    return {
      url: /^http:\/\//i.test(url) ? url.replace(/^http:/i, "https:") : url,
      headers: {
        Referer: "https://y.qq.com/",
        "User-Agent": headers["user-agent"],
      },
      userAgent: headers["user-agent"],
      videoQuality: selected.level.quality,
      mimeType: "video/mp4",
      size,
      width: Number(selected.stream.width) || undefined,
      height: Number(selected.stream.height) || selected.level.height,
      bitrate: Number(selected.stream.bitrate) || undefined,
      availableVideoQualities: available.map(({ level, stream }) => ({
        key: level.quality,
        label: level.quality,
        width: Number(stream.width) || undefined,
        height: Number(stream.height) || level.height,
        bitrate: Number(stream.bitrate) || undefined,
        size: Number(stream.fileSize || stream.filesize || stream.size || 0) || undefined,
        codec: stream.codec || stream.codecs || undefined,
        mimeType: "video/mp4",
      })),
      backupUrls,
      expiresAt: Number.isFinite(expire) && expire > 0 ? Date.now() + expire * 1000 : undefined,
    };
  } catch (error) {
    console.error(`[QQ音乐] 获取 MV 播放源错误: ${error.message}`);
    return null;
  }
}

async function getMusicInfoForComment(musicItem) {
  try {
    if (musicItem.id && typeof musicItem.id === 'number') {
      return musicItem.id;
    }
    const res = await axios_1.default.post(
      'https://u.y.qq.com/cgi-bin/musicu.fcg',
      {
        comm: {
          ct: '19',
          cv: '1859',
          uin: '0',
        },
        req: {
          module: 'music.trackInfo.UniformRuleCtrl',
          method: 'CgiGetTrackInfo',
          param: {
            types: [1],
            ids: [musicItem.id || 0],
            mids: [musicItem.songmid],
            ctx: 0,
          },
        },
      },
      {
        headers: {
          referer: 'https://y.qq.com',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
          Cookie: 'uin=',
        },
      }
    );

    if (res.data && res.data.req && res.data.req.data && res.data.req.data.tracks && res.data.req.data.tracks[0]) {
      return res.data.req.data.tracks[0].id;
    }

    return typeof musicItem.id === 'number' ? musicItem.id : null;
  } catch (error) {
    console.error('[QQ音乐] 获取歌曲信息失败:', error);
    return typeof musicItem.id === 'number' ? musicItem.id : null;
  }
}

// 通过ID/songmid获取歌曲详细信息

async function getMusicInfo(musicBase) {
  if (typeof musicBase.artwork === 'string' && musicBase.artwork && musicBase.qualities && Object.keys(musicBase.qualities).length > 0) {
    return {
      id: musicBase.id,
      songid: musicBase.songid || musicBase.id,
      songmid: musicBase.songmid || musicBase.mid,
      mid: musicBase.mid || musicBase.songmid,
      title: musicBase.title,
      artist: musicBase.artist,
      album: musicBase.album,
      albumid: musicBase.albumid,
      albummid: musicBase.albummid,
      artwork: musicBase.artwork,
      qualities: musicBase.qualities,
      mv: musicBase.mv,
      mvId: musicBase.mvId,
      mvVid: musicBase.mvVid,
      platform: 'QQ音乐',
    };
  }

  try {
    // 智能识别：纯数字是 songid，包含字母是 songmid
    let songmid = null;
    let songid = null;

    // 优先检查 songmid 字段（如果包含字母，则是有效的 songmid）
    const midCandidate = musicBase.songmid || musicBase.mid;
    if (midCandidate && /[a-zA-Z]/.test(String(midCandidate))) {
      songmid = String(midCandidate);
    }

    // 检查 id/songid 字段（纯数字）
    const idCandidate = musicBase.id || musicBase.songid;
    if (idCandidate && /^\d+$/.test(String(idCandidate))) {
      songid = Number(idCandidate);
    }

    // 如果 songmid 字段是纯数字，说明是误传的 songid
    if (!songid && midCandidate && /^\d+$/.test(String(midCandidate))) {
      songid = Number(midCandidate);
    }

    if (!songmid && !songid) {
      console.error('[QQ音乐] getMusicInfo: 缺少有效的歌曲标识');
      return null;
    }

    const res = await axios_1.default.post(
      'https://u.y.qq.com/cgi-bin/musicu.fcg',
      {
        comm: {
          ct: '19',
          cv: '1859',
          uin: '0',
        },
        req: {
          module: 'music.trackInfo.UniformRuleCtrl',
          method: 'CgiGetTrackInfo',
          param: {
            types: [1],
            ids: songid ? [songid] : [0],
            mids: songmid ? [songmid] : [],
            ctx: 0,
          },
        },
      },
      {
        headers: {
          referer: 'https://y.qq.com',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
          Cookie: 'uin=',
        },
      }
    );

    if (res.data && res.data.req && res.data.req.data && res.data.req.data.tracks && res.data.req.data.tracks[0]) {
      const track = res.data.req.data.tracks[0];
      const album = track.album || {};
      const singers = track.singer || [];

      const singerList = singers.map(s => ({
        id: s.id,
        mid: s.mid,
        name: s.name,
      }));

      return {
        id: track.id,
        songid: track.id,
        songmid: track.mid,
        mid: track.mid,
        title: track.title || track.name,
        artist: singers.map(s => s.name).join(', '),
        singerList: singerList,
        album: album.title || album.name,
        albumid: album.id,
        albummid: album.mid,
        artwork: buildQqArtwork(track),
        duration: track.interval,
        qualities: parseQualities(track.file),
        mv: track.mv?.vid || track.mv?.id || undefined,
        mvId: track.mv?.id || undefined,
        mvVid: track.mv?.vid || undefined,
        platform: 'QQ音乐',
      };
    }

    console.error('[QQ音乐] getMusicInfo: 未找到歌曲信息');
    return null;
  } catch (error) {
    console.error('[QQ音乐] getMusicInfo 错误:', error.message);
    return null;
  }
}

// QQ 歌词接口返回的是 base64 编码文本，必须解码后才能用。
// 原实现直接把未解码内容交给应用，导致歌词/翻译显示异常或缺失。
function _khDecodeLyricText(value) {
  if (typeof value !== "string" || !value) return undefined;
  var text = value.trim();
  if (!text) return undefined;
  // 已经是明文 LRC 就不动它
  if (/\[\d{2}:\d{2}/.test(text)) return text;
  try {
    var decoded = Buffer.from(text, "base64").toString("utf8");
    // 解码后必须像正常文本（含 LRC 时间轴）才采用
    if (/\[\d{2}:\d{2}/.test(decoded)) return decoded;
  } catch (error) {
    /* 保留原值 */
  }
  return text;
}

async function getLyric(musicItem) {
  try {
    const res = await axios_1.default({
      url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
      method: "POST",
      data: {
        comm: {
          ct: "19",
          cv: "1859",
          uin: "0",
        },
        req: {
          method: "GetPlayLyricInfo",
          module: "music.musichallSong.PlayLyricInfo",
          param: {
            format: "json",
            // crypt:1 会让服务端返回加密的 hex 串（无法直接显示），
            // 实测 crypt:0 返回 base64 明文，解码后即标准 LRC。
            crypt: 0,
            qrc: 0,
            qrc_t: 0,
            roma: 1,
            roma_t: 0,
            trans: 1,
            trans_t: 0,
            songID: musicItem.id || musicItem.songid,
            type: -1,
          },
        },
      },
      headers: {
        referer: "https://y.qq.com",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      },
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    });

    if (res.data?.code === 0 && res.data?.req?.code === 0) {
      const data = res.data.req.data;
      const lyricResult = {
        rawLrc: _khDecodeLyricText(data.lyric),
        translation: _khDecodeLyricText(data.trans),
        romanization: _khDecodeLyricText(data.roma),
      };

      if (!lyricResult.rawLrc && !lyricResult.translation && !lyricResult.romanization) {
        return getLyricLegacy(musicItem);
      }

      return lyricResult;
    }

    throw new Error("新 API 返回错误");
  } catch (error) {
    return getLyricLegacy(musicItem);
  }
}

async function getLyricLegacy(musicItem) {
  const result = (
    await axios_1.default({
      url: `http://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${
        musicItem.songmid
      }&pcachetime=${new Date().getTime()}&g_tk=5381&loginUin=0&hostUin=0&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
      headers: { Referer: "https://y.qq.com", Cookie: "uin=" },
      method: "get",
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    })
  ).data;
  const res = JSON.parse(
    result.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, "")
  );
  let translation;
  if (res.trans) {
    translation = he.decode(
      CryptoJs.enc.Base64.parse(res.trans).toString(CryptoJs.enc.Utf8)
    );
  }
  return {
    rawLrc: normalizeColonTimeTag(he.decode(
      CryptoJs.enc.Base64.parse(res.lyric).toString(CryptoJs.enc.Utf8)
    )),
    translation: normalizeColonTimeTag(translation),
  };
}

// 上游单次最多稳定返回 999 首，专辑需要按 begin 继续取全
const ALBUM_PAGE_SIZE = 999;
// 异常保护：超过该数量视为上游返回异常，报错而不是交付被截断的专辑
const ALBUM_MAX_SONGS = 100000;

async function getAlbumSongPage(albumItem, begin, num) {
  const url = changeUrlQuery(
    {
      data: JSON.stringify({
        comm: { ...TRACK_QUALITY_COMM },
        albumSonglist: {
          method: "GetAlbumSongList",
          param: {
            albumMid: albumItem.albumMID,
            albumID: 0,
            begin: begin,
            num: num,
            order: 2,
          },
          module: "music.musichallAlbum.AlbumSongList",
        },
      }),
    },
    "https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8"
  );
  const res = (
    await axios_1.default({
      url: url,
      headers: headers,
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    })
  ).data;

  const data = res?.albumSonglist?.data;
  const code = res?.albumSonglist?.code;
  if (!data || !Array.isArray(data.songList) || (code != null && code !== 0)) {
    throw new Error("[QQ音乐] 获取专辑歌曲失败，请稍后重试");
  }
  return data;
}

async function getAlbumInfo(albumItem) {
  const songList = [];
  const pageSignatures = new Set();
  let total = null;

  for (let begin = 0; ; begin += ALBUM_PAGE_SIZE) {
    if (begin >= ALBUM_MAX_SONGS) {
      throw new Error("[QQ音乐] 专辑分页超出合理范围，请重试");
    }
    const page = await getAlbumSongPage(albumItem, begin, ALBUM_PAGE_SIZE);
    const reported = Number(page.totalNum ?? page.songNum);
    if (Number.isFinite(reported) && reported > 0) {
      total = Math.max(total || 0, reported);
    }
    const entries = page.songList;
    const signature = JSON.stringify(entries.map((item) => item?.songInfo?.id ?? item?.songInfo?.mid));
    if (entries.length && pageSignatures.has(signature)) {
      throw new Error("[QQ音乐] 专辑接口重复返回同一页，请重试");
    }
    pageSignatures.add(signature);
    // 总数已知时，空页意味着上游提前结束，不能当作完整专辑交付
    if (!entries.length && total !== null && begin < total) {
      throw new Error("[QQ音乐] 专辑分页提前结束，请重试");
    }
    for (const entry of entries) {
      const song = entry?.songInfo;
      if (!song || song.id == null) continue;
      if (!Array.isArray(song.singer)) song.singer = [];
      songList.push(song);
    }
    // 上限固定、顺序固定的专辑列表：按总数判断结束，短页不代表取完
    if (total !== null ? begin + ALBUM_PAGE_SIZE >= total : entries.length < ALBUM_PAGE_SIZE) break;
  }

  // ct 19 的专辑接口已直接下发完整 file（128k/320k/flac/hires/master/atmos…），
  // 与 CgiGetTrackInfo 逐字段一致，因此无需再额外请求批量音质。
  return {
    musicList: songList.map((song) => formatMusicItem(song)),
  };
}

// Song and album totals have separate meanings; never reuse a generic worksNum.
function artistWorksItem(artist, type, ...totals) {
  const item = { ...artist };
  delete item.songCount;
  delete item.albumCount;
  const songs = playlistSheetItem({}, artist?.songCount, artist?.musicSize,
    artist?.trackCount, artist?.musicCount, artist?.song_count, artist?.worksNums).worksNum;
  const albums = playlistSheetItem({}, artist?.albumCount, artist?.albumSize,
    artist?.albumNum, artist?.album_count).worksNum;
  if (songs != null) item.songCount = songs;
  if (albums != null) item.albumCount = albums;
  const key = type === "album" ? "albumCount" : "songCount";
  const total = playlistSheetItem({}, ...totals, item[key]).worksNum;
  if (total != null) item[key] = total;
  return item;
}

async function getArtistSongs(artistItem, page) {
  // 改用 musichall.song_list_server/GetSingerSongList：
  // 旧接口 music.web_singer_info_svr/get_singer_detail_info 即使 ct:19 也不下发
  // size_new（master/atmos/atmos_plus/vinyl），file 只到 flac/hires；
  // GetSingerSongList 在 ct:19 下返回完整 file（size_new + size_hires），与批量接口一致。
  const url = changeUrlQuery(
    {
      data: JSON.stringify({
        comm: { ...TRACK_QUALITY_COMM },
        singerSongList: {
          method: "GetSingerSongList",
          param: {
            order: 1,
            singerMid: artistItem.singerMID,
            begin: (page - 1) * pageSize,
            num: pageSize,
          },
          module: "musichall.song_list_server",
        },
      }),
    },
    "http://u.y.qq.com/cgi-bin/musicu.fcg"
  );
  const res = (
    await axios_1.default({
      url: url,
      method: "get",
      headers: headers,
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    })
  ).data;

  const songList = (res.singerSongList.data.songList || []).map(item => item.songInfo);

  return {
    isEnd: res.singerSongList.data.totalNum <= page * pageSize,
    artistItem: artistWorksItem(artistItem, "music", res.singerSongList.data.totalNum),
    data: songList.map((song) => formatMusicItem(song)),
  };
}

async function getArtistAlbums(artistItem, page) {
  const url = changeUrlQuery(
    {
      data: JSON.stringify({
        comm: {
          ct: 24,
          cv: 0,
        },
        singerAlbum: {
          method: "get_singer_album",
          param: {
            singermid: artistItem.singerMID,
            order: "time",
            begin: (page - 1) * pageSize,
            num: pageSize / 1,
            exstatus: 1,
          },
          module: "music.web_singer_info_svr",
        },
      }),
    },
    "http://u.y.qq.com/cgi-bin/musicu.fcg"
  );
  const res = (
    await axios_1.default({
      url,
      method: "get",
      headers: headers,
      xsrfCookieName: "XSRF-TOKEN",
      withCredentials: true,
    })
  ).data;
  return {
    isEnd: res.singerAlbum.data.total <= page * pageSize,
    artistItem: artistWorksItem(artistItem, "album", res.singerAlbum.data.total),
    data: res.singerAlbum.data.list.map(formatAlbumItem),
  };
}

async function getArtistWorks(artistItem, page, type) {
  if (type === "music") {
    return getArtistSongs(artistItem, page);
  }
  if (type === "album") {
    return getArtistAlbums(artistItem, page);
  }
}
// 非标准时间戳格式修正 [mm:ss:cc] -> [mm:ss.ccc]

async function importMusicSheet(urlLike) {
  let id;

  // 匹配 i.y.qq.com/n2/m/share/details/taoge.html?...id=数字
  if (!id) {
    id = (urlLike.match(
      /https?:\/\/i\.y\.qq\.com\/n2\/m\/share\/details\/taoge\.html\?.*id=([0-9]+)/
    ) || [])[1];
  }

  // 匹配 i2.y.qq.com/n3/other/pages/details/playlist.html?...&id=数字
  if (!id) {
    id = (urlLike.match(
      /https?:\/\/i\d*\.y\.qq\.com\/n\d+\/.*\/playlist\.html\?.*[?&]id=([0-9]+)/
    ) || [])[1];
  }

  // 匹配 y.qq.com/n/ryqq/playlist/数字
  if (!id) {
    id = (urlLike.match(/https?:\/\/y\.qq\.com\/n\/ryqq\/playlist\/([0-9]+)/) ||
      [])[1];
  }

  // 匹配纯数字
  if (!id) {
    id = (urlLike.match(/^(\d+)$/) || [])[1];
  }

  if (!id) {
    console.error('[QQ音乐] 无法从 URL 中提取歌单 ID:', urlLike);
    return;
  }

  const pageSize = 500;
  const musicList = [];
  const seen = new Set();
  const pageSignatures = new Set();
  let sheetData = null;
  let total = null;
  for (let begin = 0; ; begin += pageSize) {
    // A runaway/changing provider must fail rather than report a partial import.
    if (begin >= 1000000) throw new Error('[QQ音乐] 歌单分页超出合理范围，请重试');
    const page = await getQQPlaylistPage(id, begin, pageSize);
    sheetData = sheetData || page.dirinfo;
    const reported = Number(page.dirinfo.songnum ?? page.dirinfo.song_num);
    if (Number.isFinite(reported) && reported > 0) total = Math.max(total || 0, reported);
    const songs = page.songlist;
    const signature = JSON.stringify(songs.map(song => song.id ?? song.mid));
    if (songs.length && pageSignatures.has(signature)) {
      throw new Error('[QQ音乐] 歌单接口重复返回同一页，请重试');
    }
    pageSignatures.add(signature);
    if (!songs.length && total !== null && begin < total) {
      throw new Error('[QQ音乐] 歌单分页提前结束，请重试');
    }
    for (const song of songs) {
      const item = formatMusicItem(song);
      if (item.id == null || seen.has(String(item.id))) continue;
      seen.add(String(item.id));
      musicList.push(item);
    }
    // QQ offsets count source slots, including entries omitted by the API.
    // A short page is NOT the end while dirinfo still advertises more slots.
    if (total !== null ? begin + pageSize >= total : songs.length < pageSize) break;
  }
  return buildQQImportedSheet(id, sheetData, musicList, total);
}

async function getQQPlaylistPage(id, begin, count) {
  const result = (await axios_1.default({
    url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
    method: "POST",
    data: {
      loginUin: 0,
      comm: { ...TRACK_QUALITY_COMM, uin: 0 },
      req: {
        module: "music.srfDissInfo.aiDissInfo",
        method: "uniform_get_Dissinfo",
        param: {
          disstid: Number(id), userinfo: 1, tag: 1, orderlist: 1,
          song_begin: begin, song_num: count, onlysonglist: 0, enc_host_uin: "",
        },
      },
    },
    headers: {
      Referer: "https://y.qq.com/", Origin: "https://y.qq.com",
      "User-Agent": headers["user-agent"],
      "Content-Type": "application/json;charset=UTF-8",
    },
    timeout: 20000,
  })).data;
  const page = result?.req?.data;
  if (result?.code !== 0 || result?.req?.code !== 0 || page?.code !== 0 ||
      !page.dirinfo || !Array.isArray(page.songlist)) {
    throw new Error('[QQ音乐] 获取歌单分页失败，请检查链接或稍后重试');
  }
  return page;
}

function buildQQImportedSheet(id, sheetData, musicList, total) {
  return {
    id: String(sheetData.disstid || sheetData.id || id),
    title: he.decode(sheetData.dissname || sheetData.dirname || sheetData.title || ""),
    artwork: sheetData.logo || sheetData.logo1 || sheetData.picurl || sheetData.picurl2,
    artist: sheetData.nickname || sheetData.nick || sheetData.host_nick || sheetData.creator?.nick || "",
    description: he.decode(sheetData.desc || sheetData.desc2 || ""),
    worksNum: total ?? (Number(sheetData.songnum || sheetData.song_num) || musicList.length),
    playCount: Number(sheetData.visitnum || sheetData.listennum) || 0,
    createAt: Number(sheetData.ctime) > 0 ? Number(sheetData.ctime) * 1000 : undefined,
    musicList,
  };
}

// Playlist metadata is independent of the number of tracks loaded on this page.
// Ignore absent/invalid counts; zero is a valid total for an empty playlist.
function playlistSheetItem(sheet, ...totals) {
  const item = { ...sheet };
  delete item.worksNum;
  for (const value of [...totals, sheet?.worksNum, sheet?.trackCount, sheet?.musicCount]) {
    if (typeof value !== "number" && typeof value !== "string") continue;
    if (String(value).trim() === "") continue;
    const count = Number(value);
    if (Number.isSafeInteger(count) && count >= 0) {
      item.worksNum = count;
      break;
    }
  }
  return item;
}

// ─────────────────── 每日推荐 / 每日歌单（免登录） ───────────────────
//
// BakaMusic 的主进程方法白名单里没有 getDailyRecommendations，
// 应用也没有独立的「每日推荐」页面，因此每日内容统一接入
// 「推荐歌单」页（getRecommendSheetTags / getRecommendSheetsByTag）。
//
// 个人化每日推荐（"每日 30 首"）必须携带用户登录态，
// 本插件无登录能力，故改为接入 QQ 官方「每日更新」的榜单：
// 这些榜单每天凌晨更新，内容真实、免登录即可取到，卡片直接可播。

const DAILY_TAG_ID = "__daily__";

// 每日更新榜（period 为当天日期），按"最像每日歌单"的顺序排列
const DAILY_CHARTS = [
  { topId: 26, title: "每日推荐 · 热歌榜", desc: "每天更新的全站热度最高的歌，最接近「每日推荐」。" },
  { topId: 27, title: "每日推荐 · 新歌榜", desc: "每天更新的新歌首发，适合发现今天的新声音。" },
  { topId: 62, title: "每日推荐 · 飙升榜", desc: "每天更新的播放涨幅榜，抓最近在火起来的歌。" },
  { topId: 4, title: "每日推荐 · 流行指数榜", desc: "每天更新的流行度综合指数榜。" },
  { topId: 67, title: "每日推荐 · 听歌识曲榜", desc: "每天更新，大家最近都在搜什么歌。" },
];

const DAILY_SHEET_PREFIX = "qq-daily-toplist:";

function isDailySheetId(id) {
  return typeof id === "string" && id.startsWith(DAILY_SHEET_PREFIX);
}

function dailySheetIdOf(topId) {
  return `${DAILY_SHEET_PREFIX}${topId}`;
}

/** 取榜单详情（免登录，含完整音质字段） */
async function getQqToplistSongs(topId, offset, num) {
  const res = (
    await axios_1.default({
      url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
      method: "POST",
      data: {
        comm: { ...TRACK_QUALITY_COMM, uin: 0, format: "json" },
        detail: {
          module: "musicToplist.ToplistInfoServer",
          method: "GetDetail",
          param: { topId: Number(topId), offset, num, period: "" },
        },
      },
      headers: {
        Referer: "https://y.qq.com/",
        Origin: "https://y.qq.com",
        "User-Agent": headers["user-agent"],
        "Content-Type": "application/json;charset=UTF-8",
      },
      timeout: 20000,
    })
  ).data;

  const data = res?.detail?.data;
  if (res?.code !== 0 || res?.detail?.code !== 0 || !Array.isArray(data?.songInfoList)) {
    throw new Error("[QQ音乐] 每日榜单加载失败，请稍后重试");
  }
  const meta = data?.data ?? {};
  return {
    songs: data.songInfoList,
    total: Number(meta.totalNum ?? meta.total_song_num ?? meta.song) || 0,
    updateDate: meta.updateTime || meta.period || "",
    title: meta.title || "",
  };
}

/** 把榜单详情包装成歌单条目，供「推荐歌单」页点击进入 */
async function buildDailyChartItem(chart) {
  try {
    const { songs, total, updateDate, title } = await getQqToplistSongs(chart.topId, 0, 3);
    if (!songs.length) return null;
    const first = songs[0];
    return {
      id: dailySheetIdOf(chart.topId),
      platform: "QQ音乐",
      title: updateDate ? `${chart.title} · ${updateDate}` : chart.title,
      artwork: first ? buildQqArtwork(first) : undefined,
      description: chart.desc,
      artist: title ? `${title} · 每日更新` : "QQ音乐 · 每日更新",
      worksNum: total || undefined,
      musicList: songs.map(formatMusicItem),
      isDaily: true,
    };
  } catch (error) {
    // 单个榜单失败不应影响其他卡片，但要留下原因便于排查
    console.error(`[QQ音乐] 每日榜单 ${chart.topId} 加载失败: ${error && error.message}`);
    return null;
  }
}

async function getMusicSheetInfo(sheet, page = 1) {
  const size = 100;
  const begin = (Math.max(1, Number(page) || 1) - 1) * size;

  // 每日榜单卡片：走榜单详情接口，而不是普通歌单接口
  if (isDailySheetId(String(sheet?.id ?? ""))) {
    const topId = String(sheet.id).slice(DAILY_SHEET_PREFIX.length);
    const { songs, total, updateDate } = await getQqToplistSongs(topId, begin, size);
    const musicList = songs.map(formatMusicItem);
    const knownTotal = total > 0;
    return {
      isEnd: knownTotal ? begin + size >= total : musicList.length < size,
      sheetItem: playlistSheetItem({
        ...sheet,
        id: sheet.id,
        platform: "QQ音乐",
        title: updateDate ? `${String(sheet.title || "每日推荐").replace(/ · \d{4}-\d{2}-\d{2}$/, "")} · ${updateDate}` : sheet.title,
        worksNum: knownTotal ? total : sheet.worksNum,
      }, knownTotal ? total : undefined),
      musicList,
    };
  }

  const result = await getQQPlaylistPage(sheet.id, begin, size);
  const musicList = result.songlist.map(song => formatMusicItem(song));
  const total = playlistSheetItem({}, result.dirinfo.songnum, result.dirinfo.song_num).worksNum;
  const knownTotal = total != null;
  return {
    isEnd: knownTotal ? begin + size >= total : musicList.length < size,
    sheetItem: playlistSheetItem({
      ...sheet,
      ...buildQQImportedSheet(sheet.id, result.dirinfo, [], knownTotal ? total : null),
      // An omitted upstream total must not become zero from an empty metadata list.
      worksNum: knownTotal ? total : sheet.worksNum,
    }, knownTotal ? total : undefined),
    musicList,
  };
}

async function getRecommendSheetTags() {
  const res = (
    await axios_1.default.get(
      "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg?format=json&inCharset=utf8&outCharset=utf-8",
      {
        headers: {
          referer: "https://y.qq.com/",
        },
      }
    )
  ).data.data.categories;
  const data = res.slice(1).map((_) => ({
    title: _.categoryGroupName,
    data: _.items.map((tag) => ({
      id: tag.categoryId,
      title: tag.categoryName,
    })),
  }));
  const pinned = [];
  for (let d of data) {
    if (d.data.length) {
      pinned.push(d.data[0]);
    }
  }
  // 「每日推荐」作为第一个标签置顶，落在推荐歌单页最显眼的位置
  const dailyGroup = {
    title: "每日推荐",
    data: [{ id: DAILY_TAG_ID, title: "每日推荐" }],
  };
  return {
    pinned: [dailyGroup.data[0], ...pinned],
    data: [dailyGroup, ...data],
  };
}

async function getRecommendSheetsByTag(tag, page) {
  const pageSize = 20;

  // 「每日推荐」标签：返回每天更新的榜单卡片，点开即可播放
  if (tag?.id === DAILY_TAG_ID) {
    if (page > 1) return { isEnd: true, data: [] };
    const built = await Promise.all(DAILY_CHARTS.map(buildDailyChartItem));
    const data = built.filter(Boolean);
    return { isEnd: true, data };
  }

  const rawRes = (
    await axios_1.default.get(
      "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg",
      {
        headers: {
          referer: "https://y.qq.com/",
        },
        params: {
          inCharset: "utf8",
          outCharset: "utf-8",
          sortId: 5,
          categoryId:
            (tag === null || tag === void 0 ? void 0 : tag.id) || "10000000",
          sin: pageSize * (page - 1),
          ein: page * pageSize - 1,
        },
      }
    )
  ).data;
  const res = JSON.parse(
    rawRes.replace(/callback\(|MusicJsonCallback\(|jsonCallback\(|\)$/g, "")
  ).data;
  const isEnd = res.sum <= page * pageSize;
  const data = res.list.map((item) => {
    var _a, _b;
    return {
      id: item.dissid,
      createTime: item.createTime,
      title: item.dissname,
      artwork: item.imgurl,
      description: item.introduction,
      playCount: item.listennum,
      artist:
        (_b =
          (_a = item.creator) === null || _a === void 0 ? void 0 : _a.name) !==
          null && _b !== void 0
          ? _b
          : "",
    };
  });
  return {
    isEnd,
    data,
  };
}

async function getTopLists() {
  const list = await axios_1.default({
    url: "https://u.y.qq.com/cgi-bin/musicu.fcg?_=1577086820633&data=%7B%22comm%22%3A%7B%22g_tk%22%3A5381%2C%22uin%22%3A123456%2C%22format%22%3A%22json%22%2C%22inCharset%22%3A%22utf-8%22%2C%22outCharset%22%3A%22utf-8%22%2C%22notice%22%3A0%2C%22platform%22%3A%22h5%22%2C%22needNewCode%22%3A1%2C%22ct%22%3A23%2C%22cv%22%3A0%7D%2C%22topList%22%3A%7B%22module%22%3A%22musicToplist.ToplistInfoServer%22%2C%22method%22%3A%22GetAll%22%2C%22param%22%3A%7B%7D%7D%7D",
    method: "get",
    headers: {
      Cookie: "uin=",
    },
    xsrfCookieName: "XSRF-TOKEN",
    withCredentials: true,
  });
  return list.data.topList.data.group.map((e) => ({
    title: e.groupName,
    data: e.toplist.map((_) => ({
      id: _.topId,
      description: _.intro,
      title: _.title,
      period: _.period,
      coverImg: _.headPicUrl || _.frontPicUrl,
    })),
  }));
}

async function getTopListDetail(topListItem) {
  var _a;
  const res = await axios_1.default({
    url: `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&data=%7B%22detail%22%3A%7B%22module%22%3A%22musicToplist.ToplistInfoServer%22%2C%22method%22%3A%22GetDetail%22%2C%22param%22%3A%7B%22topId%22%3A${
      topListItem.id
    }%2C%22offset%22%3A0%2C%22num%22%3A100%2C%22period%22%3A%22${
      (_a = topListItem.period) !== null && _a !== void 0 ? _a : ""
    }%22%7D%7D%2C%22comm%22%3A%7B%22ct%22%3A19%2C%22cv%22%3A1859%7D%7D`,
    method: "get",
    headers: {
      Cookie: "uin=",
    },
    xsrfCookieName: "XSRF-TOKEN",
    withCredentials: true,
  });

  const songList = res.data.detail.data.songInfoList;

  return { ...topListItem, musicList: songList.map(song => formatMusicItem(song)) };
}

async function getMusicComments(musicItem, page = 1) {
  const pageSize = 20;

  try {
    const songId = await getMusicInfoForComment(musicItem);

    if (!songId || typeof songId !== 'number') {
      return { isEnd: true, data: [] };
    }

    const res = await axios_1.default.post(
      'https://u.y.qq.com/cgi-bin/musicu.fcg',
      {
        comm: {
          cv: 4747474,
          ct: 24,
          format: 'json',
          inCharset: 'utf-8',
          outCharset: 'utf-8',
          notice: 0,
          platform: 'yqq.json',
          needNewCode: 1,
          uin: 0
        },
        req: {
          module: 'music.globalComment.CommentRead',
          method: 'GetHotCommentList',
          param: {
            BizType: 1,
            BizId: String(songId),
            LastCommentSeqNo: '',
            PageSize: pageSize,
            PageNum: page - 1,
            HotType: 1,
            WithAirborne: 0,
            PicEnable: 1
          }
        }
      },
      {
        headers: {
          accept: 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
          referer: 'https://y.qq.com/',
          origin: 'https://y.qq.com',
          'content-type': 'application/json; charset=utf-8'
        }
      }
    );

    if (res.data.code !== 0 || !res.data.req || res.data.req.code !== 0) {
      return { isEnd: true, data: [] };
    }

    const commentList = res.data.req.data?.CommentList?.Comments || [];
    const comments = commentList.map((item) => {
      const comment = {
        id: item.CmId,
        nickName: item.Nick || '',
        avatar: item.Avatar,
        comment: item.Content || '',
        like: item.PraiseNum || 0,
        createAt: item.PubTime ? parseInt(item.PubTime + '000') : null,
        replies: []
      };

      if (item.SubComments && Array.isArray(item.SubComments)) {
        comment.replies = item.SubComments.map((c) => ({
          id: c.CmId,
          nickName: c.Nick || '',
          avatar: c.Avatar || '',
          comment: c.Content || '',
          like: c.PraiseNum || 0,
          createAt: c.PubTime ? parseInt(c.PubTime + '000') : null,
        }));
      }

      return comment;
    });

    return {
      isEnd: commentList.length < pageSize,
      data: comments,
    };
  } catch (error) {
    console.error('[QQ音乐] 获取热评论失败:', error);
    return { isEnd: true, data: [] };
  }
}

function getMusicDetailPageUrl(musicItem) {
  const songmid = musicItem.songmid || musicItem.mid;
  return songmid ? `https://y.qq.com/n/yqq/song/${songmid}.html` : "";
}

async function getHotSearch() {
  const response = await axios_1.default.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
    comm: { ct: "19", cv: "1803", uin: "0", guid: "0", patch: "118", tmeAppID: "qqmusic", tmeLoginType: 0 },
    hotkey: {
      module: "tencent_musicsoso_hotkey.HotkeyService",
      method: "GetHotkeyForQQMusicPC",
      param: { search_id: "", uin: 0 },
    },
  }, { headers: { Referer: "https://y.qq.com/portal/player.html" }, timeout: 10000 });
  const body = response.data;
  const list = body?.hotkey?.data?.vec_hotkey;
  if (body?.code !== 0 || (body.hotkey?.code != null && body.hotkey.code !== 0) || !Array.isArray(list)) {
    throw new Error("QQ音乐热搜加载失败，请稍后重试");
  }
  return [...new Set(list.map(item => item?.query)
    .filter(word => typeof word === "string" && word.trim())
    .map(word => word.trim()))].slice(0, 30);
}

// BakaMusic 主进程的方法白名单不含 getDailyRecommendations，此方法不会被调用。
// 保留导出仅为了兼容外部调用方，改为走真实可用的免登录每日榜单，
// 不再依赖已失效的 mc.vsaa.cn 代理。
async function getDailyRecommendations() {
  const built = await Promise.all(DAILY_CHARTS.map(buildDailyChartItem));
  const data = built.filter(Boolean);
  const primary = data[0];
  return {
    title: "每日推荐",
    accountName: "QQ 音乐",
    state: primary ? "ready" : "error",
    date: new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10),
    sheetItem: primary,
    list: data,
  };
}

module.exports = {
  getDailyRecommendations,
  getHotSearch,
  platform: "QQ音乐",
  author: "Toskysun",
  version: "1.3.2",
  // 本插件已定制（接入每日推荐）。清空 srcUrl 以退出「更新全部插件」，
  // 否则上游覆盖会丢失本地改动。上游也有新版时请手动合并后再安装。
  srcUrl: "",
  cacheControl: "no-cache",
  primaryKey: ["id", "songmid"],
  supportedQualities: ["128k","320k","flac"],
  supportedVideoQualities: ["360p", "480p", "720p", "1080p", "4k"],
  hints: {
    importMusicSheet: [
      "QQ音乐APP：自建歌单-分享-分享到微信好友/QQ好友；然后点开并复制链接，直接粘贴即可",
      "H5：复制URL并粘贴，或者直接输入纯数字歌单ID即可",
      "导入时间和歌单大小有关，请耐心等待",
    ],
  },
  supportedSearchType: ["music", "album", "sheet", "artist", "lyric"],
  async search(query, page, type) {
    if (type === "music") {
      return await searchMusic(query, page);
    }
    if (type === "album") {
      return await searchAlbum(query, page);
    }
    if (type === "artist") {
      return await searchArtist(query, page);
    }
    if (type === "sheet") {
      return await searchMusicSheet(query, page);
    }
    if (type === "lyric") {
      return await searchLyric(query, page);
    }
  },
  getMediaSource,
  getMvSource,
  getMusicInfo,
  getMusicDetailPageUrl,
  getLyric,
  getAlbumInfo,
  getArtistWorks,
  importMusicSheet,
  getMusicSheetInfo,
  getRecommendSheetTags,
  getRecommendSheetsByTag,
  getTopLists,
  getTopListDetail,
  getMusicComments,
};