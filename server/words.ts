export interface WordPair {
  positive: string;
  negative: string;
  kitsuneWord: string;
}

export const WORD_PAIRS: WordPair[] = [
  { positive: 'カレー', negative: 'ハヤシライス', kitsuneWord: '福神漬け' },
  { positive: '犬', negative: '猫', kitsuneWord: '首輪' },
  { positive: '青', negative: '緑', kitsuneWord: 'エメラルド' },
  { positive: '野球', negative: 'サッカー', kitsuneWord: 'ユニフォーム' },
  { positive: '釣り', negative: '登山', kitsuneWord: 'リュック' },
  { positive: 'トマト', negative: 'ニンジン', kitsuneWord: 'スープ' },
  { positive: 'バラ', negative: 'チューリップ', kitsuneWord: '花瓶' },
  { positive: 'コーヒー', negative: '紅茶', kitsuneWord: 'ティーカップ' },
  { positive: '寿司', negative: '刺身', kitsuneWord: 'わさび' },
  { positive: '電車', negative: 'バス', kitsuneWord: '定期券' },
  { positive: '海', negative: 'プール', kitsuneWord: '浮き輪' },
  { positive: 'ピアノ', negative: 'ギター', kitsuneWord: '楽譜' },
  { positive: '雨', negative: '雪', kitsuneWord: '傘' },
  { positive: 'りんご', negative: 'みかん', kitsuneWord: '皮' },
  { positive: '映画館', negative: '劇場', kitsuneWord: 'ポップコーン' },
  { positive: 'ラーメン', negative: 'うどん', kitsuneWord: 'レンゲ' },
  { positive: 'スマホ', negative: 'パソコン', kitsuneWord: '充電器' },
  { positive: '富士山', negative: 'エベレスト', kitsuneWord: '山頂' },
  { positive: '桜', negative: '紅葉', kitsuneWord: '花見' },
  { positive: '太陽', negative: '月', kitsuneWord: '望遠鏡' },
  { positive: '時計', negative: 'カレンダー', kitsuneWord: '秒針' },
  { positive: '図書館', negative: '書店', kitsuneWord: 'しおり' },
  { positive: 'メガネ', negative: 'サングラス', kitsuneWord: 'レンズ' },
  { positive: '温泉', negative: 'サウナ', kitsuneWord: '手ぬぐい' },
  { positive: 'チョコレート', negative: 'クッキー', kitsuneWord: 'カカオ' },
  { positive: 'パン', negative: 'ご飯', kitsuneWord: 'トースター' },
  { positive: '鳥', negative: '飛行機', kitsuneWord: '翼' },
  { positive: 'マラソン', negative: '短距離走', kitsuneWord: 'ゴールテープ' },
  { positive: 'キャンプ', negative: 'ホテル', kitsuneWord: 'テント' },
  { positive: '金', negative: '銀', kitsuneWord: 'メダル' },
  { positive: 'ビール', negative: 'ワイン', kitsuneWord: '乾杯' },
  { positive: 'テニス', negative: 'バドミントン', kitsuneWord: 'ラケット' },
  { positive: '病院', negative: '薬局', kitsuneWord: '処方箋' },
  { positive: '車', negative: 'バイク', kitsuneWord: 'ハンドル' },
  { positive: '城', negative: '宮殿', kitsuneWord: '石垣' },
];

export function getRandomWordPair(): WordPair {
  const index = Math.floor(Math.random() * WORD_PAIRS.length);
  return WORD_PAIRS[index];
}
