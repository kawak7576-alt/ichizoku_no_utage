import { CharacterId, CharacterInfo, Role, RoleInfo } from '../types/game.ts';

export const CHARACTERS: CharacterInfo[] = [
  {
    id: 'eldest_son',
    relation: '長男',
    location: '書斎',
    title: '書斎の長男',
    description: '重厚な本棚に囲まれた書斎を預かる。一族の家系と歴史に詳しい。',
    avatarIcon: 'BookOpen',
  },
  {
    id: 'eldest_daughter',
    relation: '長女',
    location: 'ギャラリー',
    title: 'ギャラリーの長女',
    description: '屋敷の絵画や調度品を管理する。審美眼に長けている。',
    avatarIcon: 'Palette',
  },
  {
    id: 'second_son',
    relation: '次男',
    location: 'エントランス',
    title: 'エントランスの次男',
    description: '屋敷の出入り口を見張る。来訪者の顔と時間を記憶している。',
    avatarIcon: 'DoorOpen',
  },
  {
    id: 'second_daughter',
    relation: '次女',
    location: '庭園',
    title: '庭園の次女',
    description: '広大な薔薇の温室と庭園を好む。風の噂や屋外の異変に敏感。',
    avatarIcon: 'Trees',
  },
  {
    id: 'third_son',
    relation: '三男',
    location: '食堂',
    title: '食堂の三男',
    description: '晩餐会の準備と給仕を仕切る。宴の進行と料理の配膳を把握。',
    avatarIcon: 'UtensilsCrossed',
  },
  {
    id: 'third_daughter',
    relation: '三女',
    location: '遊戯室',
    title: '遊戯室の三女',
    description: 'チェス盤やビリヤード台のあるサロンにいる。観察力と機転が武器。',
    avatarIcon: 'Dice5',
  },
];

export const ROLE_INFO: Record<Role, RoleInfo> = {
  student: {
    role: 'student',
    name: '学生',
    camp: '一族側',
    description: '一族の若き一員。特殊能力はないが、一族の正義を守る。正または誤のワードを受け取る。',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
  },
  prodigy: {
    role: 'prodigy',
    name: '秀才',
    camp: '一族側',
    description: '知性溢れる一族の切り札。必ず【正のワード】を受け取り、真実を見抜く。',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700',
  },
  phantom_thief: {
    role: 'phantom_thief',
    name: '怪盗',
    camp: '怪盗側',
    description: '一族の誰かに変装して家宝を盗み出した張本人。必ず【誤のワード】を受け取る。指名されたら救済の回答ができる。',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
  },
  kitsune: {
    role: 'kitsune',
    name: '妖狐',
    camp: '妖狐側',
    description: '混乱に乗じてお宝を狙う妖かし。必ず【正のワード】を受け取る。会話中に指定ワードを発言し、怪しまれずに逃げ切れば単独勝利！',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
  },
};
