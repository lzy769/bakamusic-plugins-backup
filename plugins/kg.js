/**
 * 酷狗音乐 插件（含听歌识曲支持）
 *
 * BakaMusic 的听歌识曲功能依赖「酷狗平台插件」存在：
 * 主进程 refreshClonedPlugins() 中专门有一条规则——
 *   若插件名匹配 /酷狗|kugou/i，则自动为它补上 recognize 能力。
 * 识曲音频（8kHz 单声道 PCM base64）会被主进程直接发往酷狗指纹服务，
 * 本插件只要 platform 命中该名字即可让识曲入口变为可用。
 *
 * 同时本插件实现完整的搜索 / 播放地址 / 歌词 / 详情 / 排行榜等能力。
 */

'use strict';

const axiosModule = require('axios');
const axios = axiosModule.default || axiosModule;

// ─────────────────────────── 常量 ───────────────────────────

const PAGE_SIZE = 20;

const SEARCH_URL = 'https://mobilecdn.kugou.com/api/v3/search/song';
const SEARCH_COMPLEX_URL = 'https://complexsearch.kugou.com/v2/search/song';
const SONG_INFO_URL = 'https://m.kugou.com/app/i/getSongInfo.php';
const SONG_INFO_V5_URL = 'https://mobiles.kugou.com/api/v5/song/info';
const LYRIC_SEARCH_URL = 'https://krcs.kugou.com/search';
const LYRIC_DOWNLOAD_URL = 'https://lyrics.kugou.com/download';
const RANK_LIST_URL = 'https://mobilecdn.kugou.com/api/v3/rank/list';
const RANK_SONG_URL = 'https://mobilecdn.kugou.com/api/v3/rank/song';
const ALBUM_INFO_URL = 'https://mobilecdn.kugou.com/api/v3/album/info';
const ALBUM_SONG_URL = 'https://mobilecdn.kugou.com/api/v3/album/song';
const SINGER_INFO_URL = 'https://mobilecdn.kugou.com/api/v3/singer/info';
const SINGER_SONG_URL = 'https://mobilecdn.kugou.com/api/v3/singer/song';
const TOPLIST_TAG_URL = 'https://mobilecdn.kugou.com/api/v3/rank/list';

// 聚合音源（第三方公益 API，用于取得可播放直链；
// 酷狗官方 playInfo 接口对未登录会话普遍返回空 url）
const URL_PROVIDER = 'https://yy.zddyr.top/lx/api/';

// 若浏览器 UA 被风控，按顺序回退
const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'KuGou/11490 (Android)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
];

const QUALITY_LABEL = {
  '128k': '128k',
  '320k': '320k',
  flac: 'flac',
  hires: 'hires',
  atmos: 'atmos',
  master: 'master',
};

// 插件声明的音质 → 聚合音源 quality 参数
const QUALITY_TO_PROVIDER = {
  '128k': '128k',
  '320k': '320k',
  flac: 'flac',
  hires: 'hires',
  atmos: '320k',
  master: 'hires',
};

// ─────────────────────────── 工具 ───────────────────────────

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

/** 酷狗封面占位符 {size} 替换 + 协议升级 */
function normalizeCover(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.trim()) continue;
    let url = candidate.trim();
    url = url.replace(/\{size\}/g, '400');
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('http://')) url = 'https://' + url.slice(7);
    url = url.replace('c1.kgimg.com', 'imge.kugou.com');
    return url;
  }
  return undefined;
}

/** 酷狗时长单位混乱（秒 / 毫秒） */
function normalizeDuration(value) {
  const num = toNumber(value);
  if (num === undefined || num <= 0) return undefined;
  return num > 1000 ? Math.round(num / 1000) : Math.round(num);
}

function headers(index = 0) {
  return {
    'User-Agent': UA_LIST[index % UA_LIST.length],
    Referer: 'https://www.kugou.com/',
    Cookie: 'kg_mid=1; kg_dfid=1',
  };
}

async function requestWithFallback(url, params, options = {}) {
  let lastError;
  for (let i = 0; i < UA_LIST.length; i++) {
    try {
      const response = await axios.get(url, {
        params,
        timeout: options.timeout ?? 12000,
        headers: { ...headers(i), ...(options.headers ?? {}) },
        ...(options.extra ?? {}),
      });
      return response.data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('酷狗: 请求失败');
}

/** 校验直链真的返回音频，避免把 HTML 页面当播放源 */
async function assertAudioUrl(url) {
  const response = await axios.get(url, {
    headers: { Range: 'bytes=0-1023', 'User-Agent': UA_LIST[0] },
    responseType: 'arraybuffer',
    timeout: 8000,
    maxContentLength: 65536,
  });
  const bytes = new Uint8Array(response.data);
  if (!bytes.length) throw new Error('播放链接未返回数据');
  const ascii = (from, to) => String.fromCharCode.apply(null, bytes.subarray(from, to));
  const magic4 = ascii(0, 4);
  const isAudio =
    magic4 === 'fLaC' ||
    magic4.slice(0, 3) === 'ID3' ||
    magic4 === 'OggS' ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) ||
    ascii(4, 8) === 'ftyp';
  if (!isAudio) throw new Error('播放链接未返回音频数据');
}

// ─────────────────────────── 数据映射 ───────────────────────────

/** 把酷狗搜索结果 / 详情 / 榜单条目统一转换成 BakaMusic 音乐条目 */
function mapMusicItem(raw, extra = {}) {
  const hash = pickFirst(
    extra.hash,
    raw.hash,
    raw.hash_128,
    raw.FileHash,
    raw.hash_320,
    raw.hash_flac,
  );
  const hash320 = pickFirst(extra.hash320, raw['320hash'], raw.hash_320);
  const hashFlac = pickFirst(extra.hashFlac, raw.sqhash, raw.hash_flac);
  const hashHires = pickFirst(extra.hashHires, raw.ResFileHash, raw.hash_high);
  // 酷狗以 mvhash 标识 MV；空字符串表示没有 MV
  const mvhash = pickFirst(raw.mvhash, raw.mvHash, raw.mv_vid, extra.mvhash);

  const title = pickFirst(raw.songname, raw.songName, raw.filename, raw.name) || '未知歌曲';
  const artist =
    pickFirst(
      raw.singername,
      raw.author_name,
      raw.singerName,
      raw.singer,
      raw.singername_original,
      Array.isArray(raw.authors) ? raw.authors[0]?.author_name : '',
    ) || '未知歌手';
  // album 必须是专辑「名称」，不能写入 albumid
  const album = pickFirst(raw.album_name, raw.albumName, raw.albumname)
    || (typeof raw.album === 'string' && !/^\d+$/.test(raw.album.trim()) ? raw.album : '');
  const artwork = normalizeCover(
    raw.union_cover,
    raw.trans_param?.union_cover,
    raw.album_img,
    raw.imgUrl,
    raw.cover,
    raw.sizable_cover,
  );
  const duration = normalizeDuration(
    raw.duration ?? raw.timelength ?? raw.timeLength ?? raw.duration_128,
  );

  const qualities = {};
  if (hash) {
    qualities['128k'] = { hash, size: toNumber(raw.filesize ?? raw.fileSize) };
  }
  if (hash320) {
    qualities['320k'] = { hash: hash320, size: toNumber(raw['320filesize']) };
  }
  if (hashFlac) {
    qualities.flac = { hash: hashFlac, size: toNumber(raw.sqfilesize) };
  }
  if (hashHires) {
    qualities.hires = { hash: hashHires, size: toNumber(raw.hiresfilesize) };
  }

  return {
    ...raw,
    platform: PLATFORM,
    id: pickFirst(raw.album_audio_id, raw.audio_id, raw.albumAudioId, hash),
    hash,
    '320hash': hash320 || undefined,
    sqhash: hashFlac || undefined,
    ResFileHash: hashHires || undefined,
    qualities,
    title,
    artist,
    album: album || undefined,
    artwork,
    duration,
    // MV：应用靠这些字段判断是否显示「MV」按钮
    mvhash: mvhash || undefined,
    mvVid: mvhash || undefined,
  };
}

// ─────────────────────────── 搜索 ───────────────────────────

async function searchMusic(query, page) {
  const data = await requestWithFallback(SEARCH_URL, {
    keyword: query,
    page,
    pagesize: PAGE_SIZE,
    showtype: 1,
  });

  const info = Array.isArray(data?.data?.info) ? data.data.info : [];
  const total = toNumber(data?.data?.total) ?? 0;

  return {
    isEnd: page * PAGE_SIZE >= total || info.length < PAGE_SIZE,
    data: info.map((item) => mapMusicItem(item)),
  };
}

async function searchAlbum(query, page) {
  const data = await requestWithFallback(
    'https://mobilecdn.kugou.com/api/v3/search/album',
    { keyword: query, page, pagesize: PAGE_SIZE },
  );
  const info = Array.isArray(data?.data?.info) ? data.data.info : [];
  const total = toNumber(data?.data?.total) ?? 0;
  return {
    isEnd: page * PAGE_SIZE >= total || info.length < PAGE_SIZE,
    data: info.map((item) => ({
      ...item,
      id: pickFirst(item.albumid, item.album_id),
      platform: PLATFORM,
      title: pickFirst(item.albumname, item.album_name) || '未知专辑',
      artist: pickFirst(item.singername, item.author_name) || '未知歌手',
      artwork: normalizeCover(item.imgurl, item.cover, item.album_img),
      date: pickFirst(item.publishtime, item.publish_time) || undefined,
    })),
  };
}

async function searchArtist(query, page) {
  const data = await requestWithFallback(
    'https://mobilecdn.kugou.com/api/v3/search/singer',
    { keyword: query, page, pagesize: PAGE_SIZE },
  );
  // 歌手搜索接口的 data 直接是数组（不是 data.info）
  const info = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.data?.info)
      ? data.data.info
      : [];
  return {
    isEnd: info.length < PAGE_SIZE,
    data: info.map((item) => ({
      ...item,
      id: pickFirst(item.singerid, item.id, item.author_id),
      platform: PLATFORM,
      name: pickFirst(item.singername, item.author_name) || '未知歌手',
      avatar: normalizeCover(item.imgurl, item.avatar, item.singer_img),
      worksNum: toNumber(item.songcount ?? item.song_count),
    })),
  };
}

async function searchSheet(query, page) {
  const data = await requestWithFallback(
    'https://mobilecdn.kugou.com/api/v3/search/special',
    { keyword: query, page, pagesize: PAGE_SIZE },
  );
  const info = Array.isArray(data?.data?.info) ? data.data.info : [];
  const total = toNumber(data?.data?.total) ?? 0;
  return {
    isEnd: page * PAGE_SIZE >= total || info.length < PAGE_SIZE,
    data: info.map((item) => ({
      ...item,
      id: pickFirst(item.specialid, item.id),
      platform: PLATFORM,
      title: pickFirst(item.specialname, item.title) || '未知歌单',
      artist: pickFirst(item.nickname, item.username) || '未知创建者',
      artwork: normalizeCover(item.imgurl, item.cover),
      worksNum: toNumber(item.songcount),
    })),
  };
}

// ─────────────────────────── 音乐信息 / 歌词 ───────────────────────────

async function getMusicInfo(musicItem) {
  const hash = pickFirst(musicItem.hash, musicItem['320hash'], musicItem.sqhash);
  if (!hash) return musicItem;

  const albumAudioId = pickFirst(
    musicItem.album_audio_id,
    musicItem.audio_id,
    /^\d+$/.test(String(musicItem.id ?? '')) ? musicItem.id : '',
  );

  // 识曲结果往往只有 hash + 标题，需要补齐时长、专辑、封面等信息。
  // v5/song/info 在未登录状态下也能返回 duration，因此优先用它。
  let v5 = null;
  try {
    const params = { hash };
    if (albumAudioId) params.album_audio_id = albumAudioId;
    const data = await requestWithFallback(SONG_INFO_V5_URL, params);
    if (data?.status === 1 && data?.data && typeof data.data === 'object') {
      v5 = data.data;
    }
  } catch {
    /* 退回 playInfo */
  }

  let playInfo = null;
  try {
    playInfo = await requestWithFallback(SONG_INFO_URL, { cmd: 'playInfo', hash });
    if (playInfo?.errcode) playInfo = null;
  } catch {
    /* 忽略 */
  }

  if (!v5 && !playInfo) return musicItem;

  // 酷狗多数接口只带 album_id 不带专辑名，需要额外查一次专辑信息
  const albumId = pickFirst(
    playInfo?.albumid,
    playInfo?.album_id,
    musicItem.album_id,
    Array.isArray(v5?.album) ? v5.album[0]?.album_id ?? v5.album[0]?.albumid : '',
  );

  let albumName = pickFirst(
    playInfo?.album_name,
    musicItem.album_name,
    typeof musicItem.album === 'string' && !/^\d+$/.test(musicItem.album.trim())
      ? musicItem.album
      : '',
  );

  if (!albumName && albumId) {
    try {
      const albumData = await requestWithFallback(ALBUM_INFO_URL, { albumid: albumId });
      albumName = pickFirst(albumData?.data?.albumname, albumData?.data?.album_name);
    } catch {
      /* 忽略，专辑名非关键字段 */
    }
  }

  const merged = {
    ...musicItem,
    ...(v5 ?? {}),
    ...(playInfo ?? {}),
    // playInfo 的 timeLength 常为 0，v5 的 duration 更可靠
    duration:
      toNumber(v5?.duration) ??
      toNumber(playInfo?.timeLength) ??
      toNumber(playInfo?.timeLength_128) ??
      musicItem.duration,
    album_name: albumName || undefined,
    album_id: albumId || undefined,
  };

  return mapMusicItem(merged, {
    hash,
    hash320: pickFirst(playInfo?.['320hash'], musicItem['320hash']),
    hashFlac: pickFirst(playInfo?.sqhash, musicItem.sqhash),
    hashHires: pickFirst(playInfo?.hash_high, musicItem.ResFileHash),
  });
}

async function getMediaSource(musicItem, quality) {
  const chosen = QUALITY_LABEL[quality] ? quality : '128k';

  // 依可用音质回退：请求 flac 但只有 320k 时自动降级
  const order = ['flac', 'hires', '320k', '128k'];
  const hashOf = (q) => {
    if (q === '128k') return pickFirst(musicItem.hash, musicItem.qualities?.['128k']?.hash);
    if (q === '320k') return pickFirst(musicItem['320hash'], musicItem.qualities?.['320k']?.hash);
    if (q === 'flac') return pickFirst(musicItem.sqhash, musicItem.qualities?.flac?.hash);
    if (q === 'hires') {
      return pickFirst(musicItem.ResFileHash, musicItem.qualities?.hires?.hash);
    }
    return '';
  };

  const startIndex = Math.max(0, order.indexOf(chosen));
  const attempts = order.slice(startIndex);

  const errors = [];
  for (const attempt of attempts) {
    const hash = hashOf(attempt);
    if (!hash) continue;
    const providerQuality = QUALITY_TO_PROVIDER[attempt] ?? '128k';
    try {
      const data = await axios.get(URL_PROVIDER, {
        params: { source: 'kg', songmid: hash, quality: providerQuality },
        timeout: 12000,
        headers: { 'User-Agent': UA_LIST[0], 'X-Client': 'BakaMusicKugouPlugin/1.0' },
      });
      const body = data.data;
      const url = typeof body?.url === 'string' ? body.url.trim() : '';
      if (body?.code !== 200 || !/^https?:\/\//i.test(url)) {
        throw new Error(body?.msg || '接口未返回有效播放链接');
      }
      await assertAudioUrl(url);
      return { url };
    } catch (error) {
      errors.push(`${attempt}: ${error.message}`);
    }
  }

  throw new Error(`酷狗: 获取播放链接失败 (${errors.join('; ') || '无可用音质'})`);
}

// 酷狗官方歌词接口不提供独立的翻译轨（候选里 transuid 恒为 0），
// 因此当曲目是外语歌时，尝试用 QQ 音乐的同名曲取翻译轨。
// 为避免错配：必须歌名一致 + 歌手有交集 + 时长差 <= 3 秒。
var _KH_QQ_SEARCH = "https://u.y.qq.com/cgi-bin/musicu.fcg";

function _khNormText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\([^)]*\)|（[^）]*）|\[[^\]]*\]|【[^】]*】/g, "")
    .replace(/[\s\-_/]/g, "")
    .replace(/[（(].*$/, "");
}

function _khDecodeB64Lrc(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    var d = Buffer.from(value, "base64").toString("utf8");
    return /\[\d{2}:\d{2}/.test(d) ? d : null;
  } catch (e) {
    return null;
  }
}

async function _khFetchQqTranslation(title, artist, durationSec) {
  try {
    var query = [title, artist].filter(Boolean).join(" ").trim();
    if (!query) return null;
    var res = await axios.post(
      _KH_QQ_SEARCH,
      {
        comm: { ct: 19, cv: 1859, uin: 0, format: "json" },
        req: {
          module: "music.search.SearchCgiService",
          method: "DoSearchForQQMusicDesktop",
          param: { num_per_page: 8, page_num: 1, query: query, search_type: 0 },
        },
      },
      {
        timeout: 6000,
        headers: {
          "User-Agent": UA_LIST[0],
          Referer: "https://y.qq.com/",
          "Content-Type": "application/json",
        },
      },
    );
    var list = res?.data?.req?.data?.body?.song?.list;
    if (!Array.isArray(list) || !list.length) return null;

    var wantTitle = _khNormText(title);
    var wantArtist = _khNormText(artist);

    var best = null;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (_khNormText(item.name) !== wantTitle) continue;
      var singers = (item.singer || []).map(function (x) { return _khNormText(x.name); }).join(" ");
      var artistOk = !wantArtist || singers.indexOf(wantArtist) >= 0 ||
        wantArtist.split("/").some(function (a) { return a && singers.indexOf(a) >= 0; });
      if (!artistOk) continue;
      if (durationSec && item.interval && Math.abs(Number(item.interval) - Number(durationSec)) > 3) continue;
      best = item;
      break;
    }
    if (!best) return null;

    var lr = await axios.post(
      _KH_QQ_SEARCH,
      {
        comm: { ct: 19, cv: 1859, uin: 0 },
        req: {
          method: "GetPlayLyricInfo",
          module: "music.musichallSong.PlayLyricInfo",
          param: { format: "json", crypt: 0, qrc: 0, qrc_t: 0, roma: 0, roma_t: 0, trans: 1, trans_t: 0, songID: best.id, type: -1 },
        },
      },
      {
        timeout: 6000,
        headers: {
          "User-Agent": UA_LIST[0],
          Referer: "https://y.qq.com/",
          "Content-Type": "application/json",
        },
      },
    );
    var data = lr?.data?.req?.data;
    if (!data) return null;
    return _khDecodeB64Lrc(data.trans);
  } catch (e) {
    return null;
  }
}

async function getLyric(musicItem) {
  const hash = pickFirst(musicItem.hash, musicItem['320hash'], musicItem.sqhash);
  const duration = musicItem.duration ? Math.round(musicItem.duration * 1000) : '';
  if (!hash) return { rawLrc: '' };

  const search = await requestWithFallback(
    LYRIC_SEARCH_URL,
    { ver: 1, man: 'yes', client: 'mobi', keyword: '', duration, hash },
    { timeout: 10000 },
  );

  const candidate = Array.isArray(search?.candidates) ? search.candidates[0] : null;
  if (!candidate?.id || !candidate?.accesskey) return { rawLrc: '' };

  const download = await requestWithFallback(
    LYRIC_DOWNLOAD_URL,
    {
      ver: 1,
      client: 'pc',
      id: candidate.id,
      accesskey: candidate.accesskey,
      fmt: 'lrc',
      charset: 'utf8',
    },
    { timeout: 10000 },
  );

  if (typeof download?.content !== 'string' || !download.content.trim()) {
    return { rawLrc: '' };
  }
  // 酷狗返回 base64 编码的歌词
  let rawLrc = download.content;
  try {
    const decoded = Buffer.from(download.content, 'base64').toString('utf8');
    if (decoded.includes('[') && /\[\d{2}:\d{2}/.test(decoded)) rawLrc = decoded;
  } catch {
    /* 保留原文 */
  }

  // 只有原文里有明显的非中文内容时才去补翻译，避免无谓请求
  let translation = null;
  const hasForeign = /[\u3040-\u30ff\uac00-\ud7af]/.test(rawLrc);
  if (hasForeign && musicItem.title && musicItem.artist) {
    translation = await _khFetchQqTranslation(
      musicItem.title,
      musicItem.artist,
      musicItem.duration,
    );
  }

  return translation ? { rawLrc, translation } : { rawLrc };
}

// ─────────────────────────── 专辑 / 歌手 / 榜单 ───────────────────────────

async function getAlbumInfo(albumItem) {
  const albumId = pickFirst(albumItem.id, albumItem.albumid);
  if (!albumId) return { ...albumItem, musicList: [], isEnd: true };

  try {
    const info = await requestWithFallback(ALBUM_INFO_URL, { albumid: albumId });
    const detail = info?.data ?? {};
    const songs = await requestWithFallback(ALBUM_SONG_URL, {
      albumid: albumId,
      page: 1,
      pagesize: 100,
      showtype: 1,
    });
    const list = Array.isArray(songs?.data?.info) ? songs.data.info : [];
    return {
      ...albumItem,
      id: albumId,
      platform: PLATFORM,
      title: pickFirst(detail.albumname, albumItem.title) || '未知专辑',
      artist: pickFirst(detail.singername, albumItem.artist) || '未知歌手',
      artwork: normalizeCover(detail.imgurl, albumItem.artwork),
      worksNum: toNumber(detail.songcount),
      musicList: list.map((item) => mapMusicItem(item)),
      isEnd: true,
    };
  } catch {
    return { ...albumItem, musicList: [], isEnd: true };
  }
}

async function getArtistWorks(artistItem, page, type) {
  const singerId = pickFirst(artistItem.id, artistItem.singerid);
  if (!singerId) return { isEnd: true, data: [] };

  if (type === 'album') {
    const data = await requestWithFallback(
      'https://mobilecdn.kugou.com/api/v3/singer/album',
      { singerid: singerId, page, pagesize: PAGE_SIZE },
    );
    const info = Array.isArray(data?.data?.info) ? data.data.info : [];
    return {
      isEnd: info.length < PAGE_SIZE,
      data: info.map((item) => ({
        ...item,
        id: pickFirst(item.albumid, item.album_id),
        platform: PLATFORM,
        title: pickFirst(item.albumname, item.album_name) || '未知专辑',
        artist: pickFirst(artistItem.name, artistItem.artist) || '未知歌手',
        artwork: normalizeCover(item.imgurl, item.cover),
      })),
    };
  }

  const data = await requestWithFallback(SINGER_SONG_URL, {
    singerid: singerId,
    page,
    pagesize: PAGE_SIZE,
    sort: 1,
    showtype: 1,
  });
  const info = Array.isArray(data?.data?.info) ? data.data.info : [];
  return { isEnd: info.length < PAGE_SIZE, data: info.map((item) => mapMusicItem(item)) };
}

async function getArtistInfo(artistItem) {
  const singerId = pickFirst(artistItem.id, artistItem.singerid);
  if (!singerId) return artistItem;
  try {
    const data = await requestWithFallback(SINGER_INFO_URL, { singerid: singerId });
    const detail = data?.data ?? {};
    return {
      ...artistItem,
      id: singerId,
      platform: PLATFORM,
      name: pickFirst(detail.singername, artistItem.name) || '未知歌手',
      avatar: normalizeCover(detail.imgurl, artistItem.avatar),
      worksNum: toNumber(detail.songcount),
      description: pickFirst(detail.intro) || undefined,
    };
  } catch {
    return artistItem;
  }
}

async function getTopLists() {
  const data = await requestWithFallback(RANK_LIST_URL, {
    version: 9108,
    plat: 0,
    showtype: 2,
    parentid: 0,
    apiver: 5,
  });
  const ranks = Array.isArray(data?.data?.info) ? data.data.info : [];

  // 接口返回的是扁平的榜单数组（classify 区分类型），在此按 classify 分组
  const groupTitles = {
    1: '热门排行榜',
    2: '分类排行榜',
    3: '特色排行榜',
    4: '地区排行榜',
    5: '其他排行榜',
  };

  const grouped = new Map();
  for (const item of ranks) {
    const id = pickFirst(item.rankid, item.id);
    const title = pickFirst(item.rankname, item.name);
    if (!id || !title) continue;
    const key = toNumber(item.classify) ?? 0;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({
      id,
      platform: PLATFORM,
      title,
      description: pickFirst(item.intro) || undefined,
      artwork: normalizeCover(item.img_9, item.banner_9, item.album_img_9),
      period: pickFirst(item.update_frequency) || undefined,
    });
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([key, list]) => ({ title: groupTitles[key] ?? '排行榜', data: list }))
    .filter((group) => group.data.length > 0);
}

async function getTopListDetail(topListItem, page = 1) {
  const rankId = pickFirst(topListItem.id, topListItem.rankid);
  if (!rankId) return { ...topListItem, musicList: [], isEnd: true };

  const data = await requestWithFallback(RANK_SONG_URL, {
    rankid: rankId,
    page,
    pagesize: 100,
    plat: 0,
    apiver: 5,
  });
  const info = Array.isArray(data?.data?.info) ? data.data.info : [];
  const total = toNumber(data?.data?.total) ?? 0;

  return {
    ...topListItem,
    musicList: info.map((item) => mapMusicItem(item)),
    isEnd: page * 100 >= total || info.length < 100,
  };
}

// ─────────────────────────── MV ───────────────────────────
//
// 酷狗的 MV 有两个坑，都实测过：
//  1. 默认接口返回的是 .mkv（Matroska），而应用 MV 播放器基于 Chromium
//     <video>，不支持 MKV，接上去点了也播不了。
//  2. 加上 ext=mp4 参数后会返回真 MP4（Content-Type: video/mp4，支持 Range）。
// 因此固定用 ext=mp4，并只接受实际是 MP4 的档位。
//
// 实测档位（ext=mp4）：
//   le ≈ 20MB / 537kbps，sq ≈ 81MB / 2.1Mbps，rq ≈ 156MB / 4.1Mbps
var MV_QUALITY_ORDER = ['rq', 'sq', 'le'];
var MV_QUALITY_HEIGHT = { rq: 1080, sq: 720, le: 480 };
var MV_QUALITY_LABEL = { rq: '1080p', sq: '720p', le: '480p' };
var MV_EXT = '.mp4';

function pickKugouMv(data, wantedHeight) {
  var best = null;
  for (var i = 0; i < MV_QUALITY_ORDER.length; i++) {
    var key = MV_QUALITY_ORDER[i];
    var v = data && data[key];
    if (!v || !v.backupdownurl || !v.backupdownurl.length) continue;
    var url = v.backupdownurl.find(function (u) {
      return typeof u === 'string' && /^https?:\/\//i.test(u) && /\.mp4($|\?)/i.test(u);
    });
    if (!url) continue;
    var cand = { key: key, url: url, stream: v, height: MV_QUALITY_HEIGHT[key] || 0 };
    if (cand.height <= wantedHeight) return cand;
    if (!best) best = cand;
  }
  return best;
}

async function getMvSource(musicItem, videoQuality) {
  var mvhash = pickFirst(musicItem.mvhash, musicItem.mvVid, musicItem.mvHash);
  if (!mvhash) return null;

  var want = String(videoQuality || '1080p').toLowerCase().replace(/p$/, '');
  var wantedHeight = Number(want);
  if (!Number.isFinite(wantedHeight) || wantedHeight <= 0) wantedHeight = 1080;

  var url = 'https://m.kugou.com/app/i/mv.php';
  var payload = await requestWithFallback(
    url,
    { cmd: 100, hash: mvhash, ext: 'mp4' },
    { timeout: 12000 },
  );

  var data = payload && payload.mvdata;
  if (!data) return null;

  var picked = pickKugouMv(data, wantedHeight);
  if (!picked) return null;

  var available = MV_QUALITY_ORDER.filter(function (k) {
    var v = data[k];
    return v && v.backupdownurl && v.backupdownurl.some(function (u) {
      return typeof u === 'string' && /\.mp4($|\?)/i.test(u);
    });
  }).map(function (k) {
    var v = data[k];
    return {
      key: MV_QUALITY_LABEL[k] || k,
      label: MV_QUALITY_LABEL[k] || k,
      height: MV_QUALITY_HEIGHT[k],
      size: toNumber(v.filesize),
      bitrate: toNumber(v.bitrate),
    };
  });

  var finalUrl = picked.url;
  // 优先 https，避免混合内容被拦
  if (/^http:\/\//i.test(finalUrl)) {
    var httpsUrl = finalUrl.replace(/^http:/i, 'https:');
    finalUrl = httpsUrl;
  }

  return {
    url: finalUrl,
    headers: { Referer: 'https://www.kugou.com/', 'User-Agent': UA_LIST[0] },
    userAgent: UA_LIST[0],
    videoQuality: MV_QUALITY_LABEL[picked.key] || picked.key,
    mimeType: 'video/mp4',
    size: toNumber(picked.stream.filesize),
    height: picked.height || undefined,
    bitrate: toNumber(picked.stream.bitrate),
    availableVideoQualities: available,
  };
}

// ─────────────────────────── 插件导出 ───────────────────────────

const PLATFORM = '酷狗音乐';

module.exports = {
  platform: PLATFORM,
  author: 'BakaMusic',
  version: '1.0.0',
  srcUrl: '',
  cacheControl: 'no-cache',
  supportedSearchType: ['music', 'album', 'artist', 'sheet'],
  supportedQualities: ['128k', '320k', 'flac', 'hires'],
  hints: {
    recognize: ['点击麦克风采集系统声音，酷狗指纹服务会自动匹配歌曲'],
  },

  async search(query, page, type) {
    if (type === 'album') return searchAlbum(query, page);
    if (type === 'artist') return searchArtist(query, page);
    if (type === 'sheet') return searchSheet(query, page);
    return searchMusic(query, page);
  },

  getMusicInfo,
  getMediaSource,
  getMvSource,
  getLyric,
  getAlbumInfo,
  getArtistWorks,
  getArtistInfo,
  getTopLists,
  getTopListDetail,
};
