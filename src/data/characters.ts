import { CharacterId, CharacterInfo, Role, RoleInfo } from '../types/game.ts';

export const HEAD_CHARACTER: CharacterInfo = {
  id: 'head',
  relation: '当主',
  location: '大広間',
  title: '大広間の当主',
  description: '担当場所：大広間',
  avatarIcon: 'Crown',
};

export const SIBLING_CHARACTERS: CharacterInfo[] = [
  {
    id: 'eldest_son',
    relation: '長男',
    location: '書斎',
    title: '書斎の長男',
    description: '担当場所：書斎',
    avatarIcon: 'BookOpen',
  },
  {
    id: 'eldest_daughter',
    relation: '長女',
    location: 'アトリエ',
    title: 'アトリエの長女',
    description: '担当場所：アトリエ',
    avatarIcon: 'Palette',
  },
  {
    id: 'second_son',
    relation: '次男',
    location: 'エントランス',
    title: 'エントランスの次男',
    description: '担当場所：エントランス',
    avatarIcon: 'DoorOpen',
  },
  {
    id: 'second_daughter',
    relation: '次女',
    location: '温室',
    title: '温室の次女',
    description: '担当場所：温室',
    avatarIcon: 'Trees',
  },
  {
    id: 'third_son',
    relation: '三男',
    location: '食堂',
    title: '食堂の三男',
    description: '担当場所：食堂',
    avatarIcon: 'Utensils',
  },
  {
    id: 'third_daughter',
    relation: '三女',
    location: '遊戯室',
    title: '遊戯室の三女',
    description: '担当場所：遊戯室',
    avatarIcon: 'Dice5',
  },
];

export const CHARACTERS: CharacterInfo[] = [
  HEAD_CHARACTER,
  ...SIBLING_CHARACTERS,
];

export const ALL_NINE_CHARACTERS: CharacterInfo[] = [
  ...CHARACTERS,
  {
    id: 'phantom_thief',
    relation: '怪盗',
    location: '',
    title: '怪盗',
    description: '一族の誰かに変装した怪盗。',
    avatarIcon: 'Mask',
  },
  {
    id: 'kitsune',
    relation: '妖狐',
    location: '',
    title: '妖狐',
    description: '一族に紛れ込んだ妖異。',
    avatarIcon: 'Flame',
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
