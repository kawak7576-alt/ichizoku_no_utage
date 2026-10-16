import { X, ShieldAlert, Award, Users, BookOpen, Sparkles } from 'lucide-react';
import { ROLE_INFO, CHARACTERS } from '../data/characters.ts';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-stone-900 border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-200 tracking-wide">
              ゲームの掟と世界観
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {/* Story */}
          <section className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
            <h3 className="font-serif font-bold text-amber-300 text-base mb-2 flex items-center gap-1.5">
              <span>🏰</span> 世界観
            </h3>
            <p className="text-stone-300">
              裕福な一族の屋敷。祖父の誕生日会の最中、大切な家宝が盗まれた。
              怪盗は「ボクは誰かに変装している、探し出してみなヨ」と一族を挑発。
              一族の宴に紛れ込んだ怪盗、そして妖異【妖狐】の化かし合いを見破れ！
            </p>
          </section>

          {/* Characters and Sickroom */}
          <section>
            <h3 className="font-serif font-bold text-amber-300 text-base mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" /> 続柄と担当場所（全6種・5人参加＋1人療養室）
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHARACTERS.map((char) => (
                <div
                  key={char.id}
                  className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800"
                >
                  <div className="font-bold text-stone-200">{char.relation}</div>
                  <div className="text-xs text-amber-400/90 font-medium">
                    📍 {char.location}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                    {char.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2.5 bg-amber-950/30 border border-amber-900/40 rounded-lg text-xs text-amber-200/90">
              ※選ばれなかった1人は「療養室で寝込んでいる人物」となります。役職カードが1枚置かれますが、会話には参加しません。投票対象には指定可能です。
            </div>
          </section>

          {/* Roles */}
          <section>
            <h3 className="font-serif font-bold text-amber-300 text-base mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> 役職（計6枚）
            </h3>
            <div className="space-y-2.5">
              {Object.values(ROLE_INFO).map((info) => (
                <div
                  key={info.role}
                  className="p-3 bg-stone-950/50 rounded-xl border border-stone-800"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-100">{info.name}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${info.badgeColor}`}
                    >
                      {info.camp}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{info.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Word Wolf Mechanics */}
          <section className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80 space-y-2">
            <h3 className="font-serif font-bold text-amber-300 text-base flex items-center gap-1.5">
              <span>🐺</span> ワードウルフ（正3人・誤2人）
            </h3>
            <p className="text-stone-300 text-xs">
              参加者5人には必ず<strong>正のワード3人、誤のワード2人</strong>が配られます（療養室は除外）。
            </p>
            <ul className="list-disc list-inside text-xs text-stone-400 space-y-1">
              <li><strong className="text-blue-300">秀才</strong>：必ず正のワード</li>
              <li><strong className="text-amber-300">妖狐</strong>：必ず正のワード＋「指定ワード」を会話に自然に入れる</li>
              <li><strong className="text-purple-300">怪盗</strong>：必ず誤のワード</li>
              <li><strong className="text-emerald-300">学生</strong>：全体の3対2の比率に合わせて正または誤が配られる</li>
            </ul>
          </section>

          {/* Victory Priorities */}
          <section className="bg-stone-950/60 p-4 rounded-xl border border-stone-800/80">
            <h3 className="font-serif font-bold text-amber-300 text-base mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> 勝敗の優先順位
            </h3>
            <ol className="list-decimal list-inside text-xs space-y-2 text-stone-300">
              <li>
                <strong className="text-amber-300">第1優先：妖狐の勝利</strong>
                <p className="pl-4 text-stone-400">
                  指定ワードを発言し、投票で最多得票（指名）されなければ単独勝利！（※療養室に妖狐がいる場合は、療養室が妖狐指名されなければ妖狐勝利）
                </p>
              </li>
              <li>
                <strong className="text-purple-300">第2優先：怪盗の救済成功（引き分け）</strong>
                <p className="pl-4 text-stone-400">
                  怪盗が指名された場合、正のワード（一族のワード）を言い当てれば救済成功で引き分け。
                </p>
              </li>
              <li>
                <strong className="text-emerald-300">第3優先：一族側の通常勝利</strong>
                <p className="pl-4 text-stone-400">
                  怪盗の場所と妖狐の場所を<strong>両方正しく指名</strong>した場合のみ完全勝利！
                </p>
              </li>
              <li>
                <strong className="text-stone-300">第4優先：怪盗側の通常勝利</strong>
                <p className="pl-4 text-stone-400">
                  怪盗が最多得票で指名されなかった場合、怪盗側が勝利。
                </p>
              </li>
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-950/80 border-t border-stone-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-bold rounded-lg text-sm transition shadow-lg"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
