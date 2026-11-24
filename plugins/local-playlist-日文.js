"use strict";
/* eslint-disable */
// 本文件由 baka-playlist-gen 自动生成，请勿手改
// 使用说明见项目 README

const axiosModule = require("axios");
const axios = axiosModule.default || axiosModule;

/** 内嵌歌曲数据（mid ↔ 歌名/歌手已严格校验） */
const SONGS = [{"mid":"002GYCUm0ib7no","title":"ちっちゃな私 (小小的我) (小小的我)","artist":"重音テト (かさねてと)/マサラダ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002gjUSi3KPCd8_2.jpg","album":"ちっちゃな私"},{"mid":"002K50eu1K4z3W","title":"暗叫","artist":"きくお (Kikuo)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001VMXPu1DYKyl_4.jpg","album":"KIKUOWORLD"},{"mid":"001TdbS53SvQNa","title":"もんたじぇむ てと (feat. 重音テト)","artist":"ほうきぼし/重音テト (かさねてと)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000003pdpZ2bKAbD_1.jpg","album":"もんたじぇむ てと (feat. 重音テト)"},{"mid":"003XKRl03XAsqN","title":"再生","artist":"ナナツカゼ/PIKASONIC/nakotanmaru","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004Hn8po0kI2JC_2.jpg","album":"再生"},{"mid":"002gvCb53hAsMq","title":"新宝島","artist":"sakanaction (サカナクション)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002rhXab0N8HRW_3.jpg","album":"新宝島"},{"mid":"002ZylLs3DIGMQ","title":"空耳","artist":"ナナツカゼ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001qKrr40vkHnG_1.jpg","album":"空耳"},{"mid":"003009lw2uUqGW","title":"愛を解く (解开爱)","artist":"yama","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003CkTxU4PIeZh_3.jpg","album":"色彩"},{"mid":"004P5lh00qw9eZ","title":"藍空、ミラー","artist":"Guiano","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004fr2kk2qyX4M_1.jpg","album":"Hold Me Tight (yourself)"},{"mid":"000TRXiQ0nAhP6","title":"運命の人","artist":"『ユイカ』","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000DQK2X4OReNZ_1.jpg","album":"運命の人"},{"mid":"000GkWCt42vr16","title":"ひともどき","artist":"まふまふ (mafumafu)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000022uEXg3rJKqT_1.jpg","album":"ひともどき"},{"mid":"001LJwoT1sQdRQ","title":"暮れに茜、芥と花束 (夕暮赤霞、尘芥与花束)","artist":"月詠み","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000036h2cB1bTPuD_3.jpg","album":"月が満ちる"},{"mid":"001EjBKB4NbNKE","title":"花も騒めく (The flowers are also noisy)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001xF6BW0806HZ_2.jpg","album":"二人称"},{"mid":"001pdnnI0aqCVY","title":"踊り子 (舞女)","artist":"Vaundy","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002vI3qx4I4nHZ_2.jpg","album":"踊り子"},{"mid":"004IPgAY0Wfo2M","title":"スピカ (室女座)","artist":"ロクデナシ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002wjKZr4HLFtB_3.jpg","album":"スピカ"},{"mid":"004eTakG3tvcVF","title":"極夜 (极夜)","artist":"あたらよ (Atarayo)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000JXeFZ1s0V4U_2.jpg","album":"極夜において月は語らず"},{"mid":"002ZLJEs35Yzos","title":"猫日","artist":"suis from ヨルシカ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004C2bbQ3oswFw_2.jpg","album":"猫日"},{"mid":"000hcvJM1NhwOU","title":"かくれんぼ","artist":"ハナユイ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000031Z54i0653aT_1.jpg","album":"かくれんぼ"},{"mid":"0042zYbU4ddy6L","title":"青春は見えない","artist":"『ユイカ』","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000tkoeG0qXaIv_2.jpg","album":"青春は見えない"},{"mid":"001usbz93VH5V4","title":"隙","artist":"ゆーり(Yuri)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002ceCff0awyTO_2.jpg","album":"隙"},{"mid":"002lI5fI0ZZHhG","title":"Still Shining (feat. 重音テト)","artist":"Mayonazy/重音テト","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000004G65o4AVNpX_1.jpg","album":"Still Shining (feat. 重音テト)"},{"mid":"001kBUZh3wh2Qw","title":"下一站 Beyond This Station","artist":"小林未郁 (こばやし みか)/HOYO-MiX","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003jTob903Cf6i_1.jpg","album":"崩坏星穹铁道-神说要有笑（中篇） Let There Be Laughter (Part 2)"},{"mid":"002y6Kdy2ZZoZi","title":"圧倒的なアイラブユー","artist":"カササギ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001lqbMS1mOyAT_2.jpg","album":"圧倒的なアイラブユー"},{"mid":"003eu7jc0cuUHg","title":"バカみたいに","artist":"カササギ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003kOH6A1EcTp4_2.jpg","album":"バカみたいに"},{"mid":"001rIrJh1Gn7Sa","title":"少女A","artist":"椎名もた (ぽわぽわP)/镜音铃 (鏡音リン)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001Yh2Y54Ur9Jq_2.jpg","album":"生きる"},{"mid":"003ylsKe3umcL8","title":"猛独が襲う (Deathly Loneliness Attacks) (COVER版)","artist":"MyGO!!!!!","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001TLGzl1fkZXL_2.jpg","album":"バンドリ！ カバーコレクション Extra Volume"},{"mid":"003TNpUV31nWyh","title":"光と闇 (光与暗) (弾き語りver.)","artist":"さユり (Sayuri)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000030i5Sm1NKdsR_1.jpg","album":"それは小さな光のような(初回生産限定盤A)"},{"mid":"001x2bt54S5Kg7","title":"消えてしまいそうです (就要消失了)","artist":"ずっと真夜中でいいのに。 (永远是深夜有多好｡)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004NwpoX16Ql5c_2.jpg","album":"消えてしまいそうです"},{"mid":"002GbJr331rGNH","title":"ひそかな願い。 (悄悄的愿望)","artist":"『ユイカ』","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001E21m407xbSO_3.jpg","album":"紺色に憧れて"},{"mid":"001C3c4R0eIJVx","title":"櫂 (Paddle)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001xF6BW0806HZ_2.jpg","album":"二人称"},{"mid":"0047XEH53VIT3I","title":"アポリア (困惑)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004AKWrm2fxTPU_3.jpg","album":"アポリア"},{"mid":"0047wzR819aS9D","title":"修羅","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000FGXvt2p6RWA_2.jpg","album":"修羅"},{"mid":"003LPpqt4Qc7WS","title":"雲と幽霊 (云与幽灵)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003wNMso4LuKcU_7.jpg","album":"夏草が邪魔をする"},{"mid":"0032snhy2lko1L","title":"五月は花緑青の窓辺から (五月始于花绿青的窗边)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"004RiQSW2XEMGP","title":"花人局","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qWpBi0Hds7o_2.jpg","album":"盗作"},{"mid":"000JqaNz1DXHb5","title":"第一夜","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001vKgno16nLvG_2.jpg","album":"幻燈"},{"mid":"002pJo3r0u4Yh2","title":"盗作","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qWpBi0Hds7o_2.jpg","album":"盗作"},{"mid":"002pC4G73QcLP1","title":"八月、某、月明かり (八月、某日、月光皎洁)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"000Ztqa5246LGp","title":"へび","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004FY9ia3CChoU_2.jpg","album":"へび"},{"mid":"001vj5Ax0sMYM1","title":"太陽","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000a9nDq1Ur9oI_2.jpg","album":"太陽"},{"mid":"003PtqUi1f59aA","title":"思想犯","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000000U2wv21UtWY_2.jpg","album":"思想犯"},{"mid":"000lQ0Ne2KGS5T","title":"アルジャーノン (阿尔吉侬)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000Ua5GV4TpMgE_2.jpg","album":"アルジャーノン"},{"mid":"002khQke3D5YTV","title":"ヒッチコック (希区柯克)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"000kT3pK23BJaP","title":"忘れてください (还请忘却)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003zhSFC4H2v4V_3.jpg","album":"忘れてください"},{"mid":"004CKq1z3jCB1G","title":"斜陽 (斜阳)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003RdRvl30IAhQ_1.jpg","album":"斜陽"},{"mid":"002xrmMl1Juwco","title":"パレード (盛装游行)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"003fiyiC2Yf997","title":"都落ち","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001vKgno16nLvG_2.jpg","album":"幻燈"},{"mid":"000HVNPt0k7pO7","title":"ただ君に晴れ (只为你拨云放晴)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"004PvUYk100sR8","title":"夜行","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000abk7h1xgj6A_2.jpg","album":"夜行"},{"mid":"002vSIsZ0Rk1Bb","title":"又三郎","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000018pRoq3rpQ5F_2.jpg","album":"又三郎"},{"mid":"002evzVJ1OQeYU","title":"風を食む (蚕食清风)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001IwBY442yprr_2.jpg","album":"風を食む"},{"mid":"003TQ3mA06OqmM","title":"春泥棒 (Spring Thief)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004PFlYg4f3PSv_2.jpg","album":"春泥棒"},{"mid":"000VlKzg06Wkiu","title":"言って。 (说吧。)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003wNMso4LuKcU_7.jpg","album":"夏草が邪魔をする"},{"mid":"003pa1RY0AKN5W","title":"花に亡霊 (花上的亡灵)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000ZcIIX2j25CC_2.jpg","album":"花に亡霊"},{"mid":"001YD7382RBzjI","title":"晴る (放晴)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004Iu6as1UNdJy_2.jpg","album":"晴る"},{"mid":"000GFGA02Syvxk","title":"だから僕は音楽を辞めた (所以我放弃了音乐)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"003WkhSf2FOUwq","title":"嘘月","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000CCyIy2SjrUq_2.jpg","album":"創作"},{"mid":"002Ywd1y2uHFkM","title":"老人と海 (老人与海)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001klRIp3ztjIO_2.jpg","album":"老人と海"},{"mid":"001SVP5f1izhFh","title":"前世","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"0037daE31NuRp7","title":"夏、バス停、君を待つ","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"0011mMzJ1mkWeL","title":"準透明少年","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"002jWLZX24OxAb","title":"強盗と花束 (强盗与花束)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000CCyIy2SjrUq_2.jpg","album":"創作"},{"mid":"004Nlu3u45UinW","title":"テレパス (心电感应)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003ymnPG4DzhWI_1.jpg","album":"テレパス"},{"mid":"002b9Z2k2NPP93","title":"心に穴が空いた (心里的缺口)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002f9QhX2FzUaR_2.jpg","album":"心に穴が空いた"},{"mid":"002Z2PMw3hfXNR","title":"歩く (漫步)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"002RKbF03OMfDy","title":"神様のダンス (神之舞)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"001HLhyJ2NNs2g","title":"夜纷い","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"000cy7Vl4E4Iub","title":"ルバート","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000yRSga4VJlwK_2.jpg","album":"ルバート"},{"mid":"0030G5Eh3BuJKp","title":"夕凪、某、花惑い (傍晚风平浪静、某处、烟火)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"003onUSr2LRgyl","title":"カトレア (Cattleya)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003wNMso4LuKcU_7.jpg","album":"夏草が邪魔をする"},{"mid":"001SiBgA30EgSE","title":"負け犬にアンコールはいらない (败犬不需要安可)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"000exdsm4cQHxT","title":"逃亡","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qWpBi0Hds7o_2.jpg","album":"盗作"},{"mid":"002leX252euIed","title":"月光浴","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000Pcrmb0dhFHW_2.jpg","album":"月光浴"},{"mid":"000e0jSO211kFh","title":"诗书きとコーヒー (作诗和饮咖啡)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"004WMeKL0zX0Yv","title":"春ひさぎ (卖春)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002Stt8V2WzcJW_1.jpg","album":"春ひさぎ"},{"mid":"001nwesZ0LBp75","title":"爆弾魔","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"001OlUny1Li7qq","title":"踊ろうぜ (来一起跳舞吧)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"000VpWFn4g7xcX","title":"憂一乗","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"001JR3Va2dpYGi","title":"声","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"0019O7Y02WlTmX","title":"六月は雨上がりの街を書く (六月写下雨后的街道)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"003sokUn0jI3IP","title":"チノカテ (人间食粮)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000h4UsR0qKnnk_2.jpg","album":"チノカテ"},{"mid":"000kzMHc2ckRaj","title":"レプリカント (复制人)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qWpBi0Hds7o_2.jpg","album":"盗作"},{"mid":"001PShgT0syBd5","title":"エイミー (Eimy)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"0037aTFR0WrQjI","title":"冬眠","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001fdEkL1OKvLK_2.jpg","album":"負け犬にアンコールはいらない"},{"mid":"004DvFCE4SEYgH","title":"昼鳶","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qWpBi0Hds7o_2.jpg","album":"盗作"},{"mid":"001LXFjr2pkKKB","title":"憂、燦々","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001KpBUK3IhxdE_3.jpg","album":"憂、燦々"},{"mid":"004RHcZa1ZZO99","title":"ノーチラス (鹦鹉螺)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"004eOzwW4A1iMK","title":"靴の花火 (靴之花火)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001vKgno16nLvG_2.jpg","album":"幻燈"},{"mid":"000uAuLr0Bcbrw","title":"あの夏に咲け (在那个夏天绽放)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003wNMso4LuKcU_7.jpg","album":"夏草が邪魔をする"},{"mid":"001o9Dwe35tBS2","title":"エルマ (Elma)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003aEvJc0JxiAV_2.jpg","album":"だから僕は音楽を辞めた"},{"mid":"002Qmu6V3rWyMX","title":"雨とカプチーノ (雨和卡布奇诺)","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jEFpR3afxDp_3.jpg","album":"エルマ"},{"mid":"002kwetJ2HZ1nQ","title":"どーでもいいよ","artist":"まふまふ (mafumafu)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001RT90Q1SrunI_2.jpg","album":"どーでもいいよ"},{"mid":"000zQDMl0tpGBD","title":"茜","artist":"ヨルシカ (Yorushika)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000D9PqB07USrv_1.jpg","album":"Girls in Stereo: Asia - Spring"},{"mid":"002hXGqD2y2lt4","title":"言っちゃいけないことばっか浮かぶよな","artist":"Guiano/理芽","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000041dSLb1wfk79_2.jpg","album":"imagine"},{"mid":"0024qlps3uHyk7","title":"快啖ノススメ","artist":"東京真中/はしメロ/9Lana","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000023d6RF2uVn2F_2.jpg","album":"快啖ノススメ"},{"mid":"003W8Yjz2Gg3Ii","title":"ドゥーマー (末日论者)","artist":"東京真中","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003vKNET1sDH43_2.jpg","album":"ドゥーマー"},{"mid":"002PNbvM3Iqbmx","title":"センチメンタル☆ラッキーガール","artist":"shallm","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003BbFbx2yJ6LN_1.jpg","album":"センチメンタル☆ラッキーガール"},{"mid":"003iQOlN1uiKVI","title":"Mr.'Broken Heart' (心碎先生)","artist":"松下優也 (まつした ゆうや)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003zdKRo017d8x_2.jpg","album":"U ~BEST of BEST~"},{"mid":"001p9Lg62tsPo0","title":"回夏","artist":"cadode","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000011RC4541H1FY_4.jpg","album":"浮遊バグ"},{"mid":"003Z7hLc3Qx7X8","title":"クリームソーダとシャンデリア (feat.ねんね)","artist":"神野メイ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000030lak94GN5Ad_0.jpg"},{"mid":"001esW7e1oryk5","title":"風のたより","artist":"tayori","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000iRGCz4QBfom_2.jpg","album":"風のたより"},{"mid":"004Pghh23xbIUH","title":"花がら (枯花)","artist":"tayori","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001JxVch2kuPtE_2.jpg","album":"花がら"},{"mid":"0004VrRu1jqbfu","title":"死別","artist":"シャノン","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000vpEZf4eAeeG_2.jpg","album":"第一象徴体系"},{"mid":"0046hGrt1GEttU","title":"尘间星旅 Star Odyssey","artist":"铃木爱理 (すずき あいり)/HOYO-MiX","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002itPL04LRG4h_1.jpg","album":"原神-尘间星旅 Star Odyssey"},{"mid":"000XtT9d0yah4T","title":"バケモノの唄 (怪物之歌) (怪物之歌)","artist":"shino/初音未来 (初音ミク)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002eoPkD2OgQxD_4.jpg","album":"バケモノの唄 (怪物之歌)"},{"mid":"0025taaD2uLfbu","title":"不乱不破","artist":"HOYO-MiX/Reol (れをる)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003Z92WN2ly3a5_1.jpg","album":"崩坏星穹铁道-不乱不破 No Dazzle, No Break"},{"mid":"0037Y4I93yKU9p","title":"かかってこいよ (放马过来)","artist":"NakamuraEmi","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004GGQEo0AJkY7_2.jpg","album":"NIPPONNO ONNAWO UTAU Vol.5"},{"mid":"000jpsVp0nqcSw","title":"いきのこり●ぼくら (Ikinokori Bokura)","artist":"青葉市子 (あおばいちこ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003spUIG3GD84I_1.jpg","album":"0"},{"mid":"002AzL8G1mEceh","title":"忘れじの言の葉","artist":"Dazbee (ダズビー)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007j0iL2h5J20_2.jpg","album":"Remindful.Two"},{"mid":"000evWqu0iY8pO","title":"Departures 〜あなたにおくるアイの歌〜 (离别 ~赠予你的爱之歌~)","artist":"EGOIST (エゴイスト)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003SBbxp1KTWKh_3.jpg","album":"Departures 〜あなたにおくるアイの歌〜"},{"mid":"004ZRlOG2n9jRR","title":"青春コンプレックス (青春症候群)","artist":"結束バンド (纽带乐队)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000011oG6M1EZ3K0_2.jpg","album":"青春コンプレックス"},{"mid":"003DH02l1If2Iz","title":"星と僕らと (星星与我们) (tofubeats Remix)","artist":"目黒将司/tofubeats (河合佑亮)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000022eQnx32IPus_1.jpg","album":"『P3D』＆『P5D』フルサウンドトラック"},{"mid":"004Drt082CV5gf","title":"Cry For Me (feat. Ami) (为我哭泣)","artist":"Michita (ミチタ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004Tm0RJ36QLOF_4.jpg","album":"Pureness"},{"mid":"000xuNPd4YLiYp","title":"はいよろこんで (乐意效劳)","artist":"こっちのけんと (菅生健人)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003uugSO2oiIb1_2.jpg","album":"はいよろこんで"},{"mid":"002aHh3Z2bofvM","title":"未行之路 The Road Not Taken","artist":"HOYO-MiX/Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000kxnIS1i4Col_2.jpg","album":"原神-「未行之路 The Road Not Taken」游戏原声EP专辑"},{"mid":"002DuMJE0E9YSa","title":"インドア系ならトラックメイカー (内向都是作曲家)","artist":"Yunomi (ゆのみ)/nicamoq (にかもきゅ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003HEBmm0bDmpx_3.jpg","album":"インドア系ならトラックメイカー"},{"mid":"002GrJ0G2NqKEn","title":"残響散歌","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000021Tchw2yJoVH_1.jpg","album":"残響散歌 / 朝が来る"},{"mid":"003PLbio2kiBA7","title":"あいつら全員同窓会 (那些家伙们的校友会)","artist":"ずっと真夜中でいいのに。 (永远是深夜有多好｡)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003iI1Bn4eQNTR_2.jpg","album":"あいつら全員同窓会"},{"mid":"0003nHmF1prMEQ","title":"Brave Shine (勇气之光)","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003ZQMNF40Wc8H_2.jpg","album":"Brave Shine (期間生産限定アニメ盤)"},{"mid":"000Jh5sH1cswnW","title":"crossing field (交叉领域)","artist":"LiSA (织部里沙)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002U1a1A15HIyr_3.jpg","album":"Crossing field"},{"mid":"001UnSHi3ELswe","title":"ギターと孤独と蒼い惑星 (吉他与孤独与蓝色星球)","artist":"結束バンド (纽带乐队)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002tO8s92lBMwp_2.jpg","album":"ギターと孤独と蒼い惑星"},{"mid":"001ippri1ihGgm","title":"花 feat. 花譜","artist":"Guiano/花譜 (かふ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001dMB0O33bcMw_2.jpg","album":"花鳥風月"},{"mid":"001N8FgQ0aepZB","title":"第六感","artist":"Reol (れをる)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000DA0kG4ehcvr_4.jpg","album":"第六感"},{"mid":"000M8wRp3w3rvM","title":"パステルレイン (Pastel Rain)","artist":"三月のパンタシア (三月的幻想)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000TGwee0X9fwU_3.jpg","album":"ガールズブルー・ハッピーサッド"},{"mid":"0005oq153WzDpF","title":"沫雪","artist":"yama","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003DAKWW0DybnS_2.jpg","album":"沫雪"},{"mid":"001Hk1ej25IWf8","title":"神のまにまに (神的随波逐流) (随神之侧、神的随波逐流)","artist":"Sou/いすぼくろ/ウォルピスカーター (Wolpis Carter)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002tEKXQ4AaoKE_2.jpg","album":"Sunflower"},{"mid":"004SlTZQ3NWbAO","title":"アイロニ (反语) (カバー)","artist":"majiko (まじ娘)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002FzKSY0FcypL_2.jpg","album":"Contrast"},{"mid":"0046zv6d1RsuET","title":"真夜中のドア/Stay With Me (深夜之门) (シングルver.)","artist":"松原みき (まつばら みき)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003JfxzY1wpDaF_1.jpg","album":"Light Mellow 松原みき"},{"mid":"004Wh6lD430es4","title":"我愛你-上海蟹-","artist":"カニ研究会","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002R7xaa07jhLv_2.jpg","album":"我愛你-上海蟹-"},{"mid":"004XiKv82HcAGt","title":"野火 Wildfire","artist":"HOYO-MiX/Jonathan Steingard","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001voROc0OBvD6_1.jpg","album":"崩坏星穹铁道-雪融于烬 Of Snow and Ember"},{"mid":"001dSEuA3YfUKs","title":"また夏を追う (再次追逐夏天)","artist":"あたらよ (Atarayo)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003EshpH4Le3jj_2.jpg","album":"また夏を追う"},{"mid":"004NcTb938H05K","title":"カタオモイ (单相思)","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002wS9tA16g5iu_4.jpg","album":"デイドリーム"},{"mid":"003LVSBV0cRZUR","title":"カワキヲアメク (声嘶力竭)","artist":"美波 (みなみ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001X3mEo3nH1eN_2.jpg","album":"カワキヲアメク"},{"mid":"0026MOXP35P8ou","title":"ハイパーベンチレイション (过呼吸)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000039wcud1IQevn_2.jpg","album":"携帯电话"},{"mid":"0043rsU84Eyniq","title":"フィナーレ。 (终曲。)","artist":"eill (エイル)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001H4VpY2Mm4mi_1.jpg","album":"プレロマンス / フィナーレ。"},{"mid":"002bEuRN47GejJ","title":"可愛くてごめん (feat. かぴ) (这么可爱真是抱歉)","artist":"HoneyWorks/かぴ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002UvtRD05eHL8_4.jpg","album":"告白実行委員会 -FLYING SONGS- 恋してる"},{"mid":"002zvnuF22whu5","title":"カタコト (カタコト)","artist":"sloppy dim","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004V3QZg2X7X4N_4.jpg","album":"カタコト"},{"mid":"000UjKB938xb9P","title":"怪物","artist":"YOASOBI (ヨアソビ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001ciE6Q1Ck4Ly_1.jpg","album":"怪物"},{"mid":"002MBqAO4ZZoHW","title":"カイコ (蚕)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000gpxV72D0vDH_2.jpg","album":"2+0+2+1+3+1+1= 10 years 10 songs"},{"mid":"004WsINI1KbUMK","title":"舞い落ちる花びら (舞落的花瓣)","artist":"SEVENTEEN (세븐틴)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003C2xgR17ZsLq_1.jpg","album":"舞い落ちる花びら (Fallin' Flower)"},{"mid":"000HHwBt3KESHr","title":"三葉のテーマ (三叶的主题音乐)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007oL0R1hDyxV_2.jpg","album":"君の名は。"},{"mid":"004a8pzf0b202W","title":"スパークル (火花) (Movie ver.)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007oL0R1hDyxV_2.jpg","album":"君の名は。"},{"mid":"003WFDEl1Q4L1b","title":"夢灯籠","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007oL0R1hDyxV_2.jpg","album":"君の名は。"},{"mid":"004MieHI2TSntP","title":"東京上空 (东京上空)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000Ed45G4FgbB1_4.jpg","album":"すずめの戸締まり"},{"mid":"001wBpFI2tkMzy","title":"Lost Game (ロストゲーム)","artist":"Nulbarich","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003F1DKR0NTP8p_1.jpg","album":"2ND GALAXY"},{"mid":"001kf01D3tqoUD","title":"すずめ feat.十明 (铃芽)","artist":"RADWIMPS (ラッドウィンプス)/十明","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000jnQdQ1R3Rp8_1.jpg","album":"すずめ feat.十明"},{"mid":"001qUugG3SES5f","title":"バトンロード (Baton Road)","artist":"KANA-BOON (カナブーン)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003hWx2z4fQOpN_3.jpg","album":"バトンロード"},{"mid":"003OgRgQ2PMWzk","title":"Cornfield Chase (原野追逐) (Piano-Cello Version)","artist":"Michael Forster/Hans Zimmer/Alex Gibson/Anna Stevens/Ryan Rubin","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001WaYI40r2osB_1.jpg","album":"Cornfield Chase (Piano-Cello Version)"},{"mid":"000I42sc1Lrn0d","title":"群青","artist":"YOASOBI (ヨアソビ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000Dy9HS1TLM8S_1.jpg","album":"群青"},{"mid":"001Cb9eG2OjRZD","title":"君 がいた 夏","artist":"ALisa/五月的钢琴","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000ckv2V4M8Xyd_1.jpg","album":"君 がいた 夏 （有你的夏天）"},{"mid":"001yazcV2i7bc0","title":"なにやってもうまくいかない (什么事都做不好)","artist":"meiyo","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001U9bFF1UCurE_2.jpg","album":"なにやってもうまくいかない"},{"mid":"000akynZ2Rbro5","title":"Lemon (柠檬)","artist":"米津玄師 (よねづ けんし)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002OR8wD3Lo3E5_4.jpg","album":"レモン"},{"mid":"00256shB4BZSui","title":"心做し (心理作用)","artist":"双笙 (陈元汐)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001TxaCH02ZxJm_3.jpg","album":"心做し"},{"mid":"003Rxsvb1Vwl5U","title":"One Last Kiss (最后一吻)","artist":"宇多田光 (宇多田ヒカル)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002qKyaL4cvjNe_4.jpg","album":"One Last Kiss"},{"mid":"002VBc693SIvHO","title":"全都会好起来的","artist":"忧郁王子/张奶奶/READON","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000oT2qg1POv3k_2.jpg","album":"全都会好起来的"},{"mid":"003L6IxG3ZkCqs","title":"花の塔 (花之塔)","artist":"さユり (Sayuri)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003MQARj1nwc4y_2.jpg","album":"花の塔"},{"mid":"000Vve8r25PvIu","title":"季節は次々死んでいく (季节接连死去)","artist":"amazarashi (アマザラシ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001j67xV4cQOet_4.jpg","album":"季節は次々死んでいく"},{"mid":"0028uRIA1kA28y","title":"忠犬ハチ (忠犬八公)","artist":"ツユ (TUYU)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004Xnqbl1GOEjT_2.jpg","album":"忠犬ハチ"},{"mid":"000FpY59005250","title":"ふるさとの匂い (故乡的味道)","artist":"吉森信 (よしもり まこと)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002Fe1NW4YdEGg_2.jpg","album":"続 夏目友人帳  音楽集  いとうるわしきもの【Selected Edition】"},{"mid":"001KE5G10ejbuC","title":"ぴこぴこ東京 (Pico Pico Tokyo)","artist":"中田康贵 (中田ヤスタカ)/眞白桃々 (ましろもも)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002ZcIFJ4g16rA_1.jpg","album":"ぴこぴこ東京 (feat. 眞白桃々)"},{"mid":"002NNwu63lJDmD","title":"カラノココロ (空虚的心)","artist":"Anly (アンリ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000008W1xg1TOZo1_2.jpg","album":"カラノココロ"},{"mid":"003f53Vo1f5GBw","title":"ブラッドサーキュレーター (Blood Circulator)","artist":"ASIAN KUNG-FU GENERATION (亚细亚功夫世代)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001rIR6k2WTnfL_1.jpg","album":"ベストヒットエーケージーツーニセンジュウニニセンジュウハチ"},{"mid":"000RLtiO25mXmj","title":"星が泳ぐ (游星)","artist":"マカロニえんぴつ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003Szqnx4EdNjG_2.jpg","album":"星が泳ぐ"},{"mid":"004LVwks0nzg0B","title":"好きだから。 (因为我喜欢你。)","artist":"『ユイカ』/れん (Ren)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001MF3De3s2eUS_2.jpg","album":"好きだから。"},{"mid":"002cn4sX1hWeYm","title":"ただ声一つ (只想说一声)","artist":"ロクデナシ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001Zo6GL0cLDgH_2.jpg","album":"ただ声一つ"},{"mid":"003mH7Lh0sJGq9","title":"たぶん (大概)","artist":"YOASOBI (ヨアソビ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000V2GzJ4fugbR_1.jpg","album":"たぶん"},{"mid":"001WVOj53cqE4h","title":"呼吸","artist":"mol-74 (モルカル)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000000W4Iv1qVPbv_2.jpg","album":"越冬のマーチ"},{"mid":"000JN76z0a1in4","title":"茜さす (夕晖)","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003Ucpph2N6243_3.jpg","album":"茜さす/everlasting snow"},{"mid":"004DHsQO3K3uQK","title":"ミチノチモシーキミノキモチ (路上的猫尾草 你的心情)","artist":"森永千才 (もりなが ちとせ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000TE3ae3Eo7Iy_1.jpg","album":"TVアニメ「あんハピ♪」キャラクターソングシリーズ2"},{"mid":"00429XC82CccSh","title":"グレースノート (Grace note)","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004NsHsX1X5ouA_1.jpg","album":"グレースノート"},{"mid":"002dUhCB4T6kGi","title":"海 で待っています","artist":"ALisa/五月的钢琴","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000l5jAH3R4d5c_1.jpg","album":"海 で待っています(我在海边等你）"},{"mid":"001RK9x72Cws4Q","title":"ミスターフィクサー (Mr. Fixer)","artist":"Sou","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004WJSNB2WDUo6_2.jpg","album":"ミスターフィクサー"},{"mid":"003oPdH34T8zDj","title":"悲しみはオーロラに (拥抱悲伤的极光)","artist":"Aimer (エメ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004MUpvv2JPZld_4.jpg","album":"六等星の夜 / 悲しみはオーロラに / TWINKLE TWINKLE LITTLE STAR"},{"mid":"000kU0vu3lagdl","title":"アイロニ (反语)","artist":"4円 (ヨエン)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000047LW8x0F2iRp_1.jpg","album":"For"},{"mid":"002nVbWN2vLkjT","title":"シルエット (剪影)","artist":"KANA-BOON (カナブーン)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000oI2eV2Wj1dV_2.jpg","album":"シルエット"},{"mid":"001tf5OD4JSyue","title":"summertime (夏日时光)","artist":"cinnamons/evening cinema","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000002wARF51xGlwD_2.jpg","album":"summertime"},{"mid":"003Z8DdI2ox1fd","title":"五等分のカタチ (五等分的形态)","artist":"中野家の五つ子","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001zpEEF39Qucw_1.jpg","album":"五等分のカタチ/はつこい (スペシャルエディション)"},{"mid":"002uTXlV4KtrBj","title":"かたわれ時 (黄昏之时)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007oL0R1hDyxV_2.jpg","album":"君の名は。"},{"mid":"002L22XE38EEvn","title":"なんでもないや (没什么大不了) (Movie ver.)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000007oL0R1hDyxV_2.jpg","album":"君の名は。"},{"mid":"002XKOFt1ZayiY","title":"海の幽霊 (海之幽灵)","artist":"米津玄師 (よねづ けんし)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001LC99w1g9eVG_4.jpg","album":"海の幽霊"},{"mid":"002CvUpU4fNPH8","title":"ツギハギスタッカート (拼凑的断音)","artist":"96猫 (クロネコ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001OxPbA1v1hzK_1.jpg","album":"O2O"},{"mid":"001KmDTq1Sn87l","title":"Nyan Cat (彩虹猫)","artist":"桃音モモ","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000036oJnI2Hf5fQ_1.jpg","album":"Nyan Cat"},{"mid":"001p3V4c0PQdmd","title":"打上花火","artist":"Daoko (ダヲコ)/米津玄師 (よねづ けんし)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000bXwur3SISKP_1.jpg","album":"打上花火 (通常盤)"},{"mid":"0021T8ln3sE9XB","title":"春を告げる (宣告春天)","artist":"yama","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003gylcp0h3h3i_3.jpg","album":"春を告げる"},{"mid":"001PpjMq2b9bUr","title":"カトラリー (餐具)","artist":"Sawako碎花","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003XsbOq2RVgbL_1.jpg","album":"カトラリー"},{"mid":"000SGJjz4FBni7","title":"しろつめくさ (白诘草)","artist":"Humbert Humbert (ハンバート ハンバート)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000001xZqv3FeKD6_2.jpg","album":"for hundreds of children"},{"mid":"001PwR8n1PkXnv","title":"祝祭 (Movie edit)","artist":"三浦透子 (みうら とうこ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000c5dpc0rwWfe_1.jpg","album":"天気の子"},{"mid":"000B6iHX3Hk5rE","title":"グランドエスケープ (逃离地面) (Movie edit)","artist":"三浦透子 (みうら とうこ)/RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000c5dpc0rwWfe_1.jpg","album":"天気の子"},{"mid":"000nx2j10fjfc9","title":"前前前世 (Movie ver.)","artist":"RADWIMPS (ラッドウィンプス)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000AUWRC4XjF5s_2.jpg","album":"君の名は。（黑胶版）"},{"mid":"001z4Xl03a3xsl","title":"デート2","artist":"1n","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004MoY3M3enXHK_1.jpg","album":"Piano collection 1"},{"mid":"003SjRTc2ctLcG","title":"恋愛サーキュレーション (恋爱循环)","artist":"花澤香菜 (はなざわ かな)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000001Gwxvg35Qg3k_2.jpg","album":"动漫精选"},{"mid":"003qpd4b4KJlMj","title":"ダイヤモンドは砕けない～メインテーマ～ (不灭钻石~印象主题曲~)","artist":"菅野祐悟 (かんの ゆうご)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000000sE57j3fPm4R_2.jpg","album":"ジョジョの奇妙な冒険 ダイヤモンドは砕けない O.S.T Vol.1～Good Morning Morioh Cho～"},{"mid":"004ASEXT45rdBc","title":"紅蓮の弓矢 (红莲之弓矢)","artist":"Linked Horizon","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M00000235IIZ313AOu_1.jpg","album":"進撃の記憶"},{"mid":"001PiNkc3WJLEB","title":"スターダストクルセイダース (星尘斗士)","artist":"菅野祐悟 (かんの ゆうご)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000003OLhsS1qBloo_2.jpg","album":"ジョジョの奇妙な冒険 スターダストクルセイダース O.S.T. [Departure]"},{"mid":"001Wv67a3aHx1w","title":"FAIRY TAIL メインテーマ　2014 (妖精的尾巴主题曲 2014)","artist":"高梨康治 (たかなし やすはる)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M000004bTTIj3HfJAm_2.jpg","album":"「FAIRY TAIL」 ORIGINAL SOUND COLLECTION"},{"mid":"000RdK153pEoyS","title":"いつも何度でも (永远同在)","artist":"久石让/木村弓 (きむら ゆみ)","artwork":"https://y.gtimg.cn/music/photo_new/T002R300x300M0000038JOTF1Nh9Du_5.jpg","album":"千と千尋の神隠し サウンドトラック"}];

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
    platform: "日文歌单",
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
  platform: "日文歌单",
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
    return { pinned: [{ title: "日文歌单195首", id: "local-日文" }], data: [] };
  },
  async getRecommendSheetsByTag(tag, page) {
    if (!tag || !String(tag.id || "").includes("local-日文")) return { isEnd: true, data: [] };
    const sheet = buildSheet();
    return { isEnd: true, data: [{ ...sheet, musicList: sheet.musicList }] };
  },
  async getMusicSheetInfo(sheetItem, page) {
    if (sheetItem && String(sheetItem.id || "").includes("local-日文")) {
      const sheet = buildSheet();
      return { isEnd: true, sheetItem: { id: "local-日文", title: sheet.title, artist: sheet.artist, worksNum: sheet.musicList.length }, musicList: sheet.musicList };
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
    const base = { ...musicBase, platform: "日文歌单" };
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
    id: "local-日文",
    platform: "日文歌单",
    title: "日文歌单195首",
    artist: "本地导入",
    description: "日文歌曲，共 195 首",
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
