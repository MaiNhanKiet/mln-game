import { Coins, Rocket, Star, Target, TrendingUp, Zap } from 'lucide-react'
import { GAME_CONFIG } from '@/config/game'
import { formatCapitalUnits } from '@/lib/number-format'

const stats = [
  {
    icon: Coins,
    label: 'Vốn tích lũy',
    description: 'Két sắt của bạn. Hết tiền = Phá sản.',
    iconClass: 'text-[#D4A373] bg-[#FFF4E6]',
  },
  {
    icon: Star,
    label: 'Uy tín',
    description: 'Niềm tin của khách hàng. Mất uy tín = Tẩy chay.',
    iconClass: 'text-[#C28B8B] bg-[#FCECEC]',
  },
  {
    icon: Zap,
    label: 'Sức lao động',
    description: 'Thể lực nhân viên. Vắt kiệt sức = Đình công.',
    iconClass: 'text-[#829377] bg-[#EEF3EA]',
  },
  {
    icon: TrendingUp,
    label: 'Quy mô',
    description: 'Độ to của doanh nghiệp. Lãi mỗi lượt cộng thêm vào vốn sau mỗi quyết định.',
    iconClass: 'text-[#B07D62] bg-[#F5EDE6]',
  },
] as const

const directGameOverItems = [
  'Release app bug 0 đồng (câu 10 — Vẫn release)',
  `Thâu tóm đối thủ khi vốn < ${formatCapitalUnits(5000)}`,
  `Mở 3 mặt bằng khi vốn < ${formatCapitalUnits(15000)}`,
  `Bán công ty ở câu cuối khi vốn < ${formatCapitalUnits(GAME_CONFIG.victoryCapital)}`,
] as const

type GameRulesContentProps = {
  showHeader?: boolean
}

function ChevronLine({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-[11px] leading-4 text-secondary/75 sm:text-sm sm:leading-5 ${className}`}>
      <span className="shrink-0 font-black text-primary">&gt;</span>
      <span className="min-w-0">{children}</span>
    </p>
  )
}

export function GameRulesContent({ showHeader = true }: GameRulesContentProps) {
  return (
    <div>
      {showHeader ? (
        <header className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs sm:tracking-[0.2em]">
            Tinder của Nhà Tư Bản
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold leading-tight text-secondary sm:mt-2 sm:text-3xl lg:text-4xl">
            Luật Chơi & Cách Chơi
          </h2>
          <p className="mt-2 text-[11px] leading-4 text-secondary/75 sm:text-sm sm:leading-5">
            Mô phỏng quyết định kinh doanh kiểu quẹt thẻ —{' '}
            <strong className="text-secondary">{GAME_CONFIG.totalRounds} câu hỏi</strong>, mỗi thiết bị
            chơi <strong className="text-secondary">một lần</strong>. Đơn vị vốn:{' '}
            <strong className="text-primary">1 = 1 triệu VNĐ</strong>.
          </p>
        </header>
      ) : null}

      <section className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-secondary/70 sm:text-sm">
          4 thanh sinh mệnh
        </h3>
        <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:mt-3 sm:grid-cols-2 sm:gap-2.5 md:gap-3">
          {stats.map(({ icon: Icon, label, description, iconClass }) => (
            <li
              key={label}
              className="flex items-start gap-2.5 rounded-xl border border-stone-100 bg-stone-50/80 p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${iconClass}`}
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-extrabold text-secondary sm:text-sm">{label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-secondary/70 sm:text-sm sm:leading-5">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 sm:mt-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-secondary/70 sm:text-sm">
          Cơ chế thao tác
        </h3>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center sm:rounded-2xl sm:p-4">
            <span className="font-display text-3xl font-black leading-none text-red-500 sm:text-4xl">&lt;</span>
            <p className="mt-1.5 text-xs font-extrabold text-red-700 sm:mt-2 sm:text-sm">Quẹt Trái</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600/80 sm:text-xs">
              Từ chối
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center sm:rounded-2xl sm:p-4">
            <span className="font-display text-3xl font-black leading-none text-emerald-600 sm:text-4xl">&gt;</span>
            <p className="mt-1.5 text-xs font-extrabold text-emerald-800 sm:mt-2 sm:text-sm">Quẹt Phải</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700/80 sm:text-xs">
              Đồng ý
            </p>
          </div>
        </div>
        <ChevronLine className="mt-2.5">
          Sau mỗi lựa chọn hiện kết quả, bấm <strong className="text-secondary">Tiếp tục</strong> mới sang câu
          tiếp theo. Phím <strong className="text-secondary">&lt; / &gt;</strong>.
        </ChevronLine>
      </section>

      <section className="mt-4 rounded-2xl border-2 border-primary/20 bg-[#FFF9F0] p-3.5 sm:mt-6 sm:p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Target className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-extrabold text-secondary sm:text-lg">
              Mục tiêu chiến thắng
            </h3>
            <p className="mt-1.5 text-[11px] leading-4 text-secondary/75 sm:text-sm sm:leading-5">
              Hoàn thành <strong className="text-primary">{GAME_CONFIG.totalRounds} câu</strong>, giữ vốn từ{' '}
              <strong className="text-primary">{formatCapitalUnits(GAME_CONFIG.victoryCapital)}</strong> trở
              lên và các chỉ số uy tín / sức lao động còn trên 0.
            </p>
            <div className="mt-2 space-y-1">
              <ChevronLine>
                <strong className="text-secondary">Vượt ải:</strong> hết 15 câu + đủ vốn → VICTORY (điểm theo vốn
                cuối).
              </ChevronLine>
              <ChevronLine>
                <strong className="text-secondary">Bán công ty</strong> ở câu cuối (≥{' '}
                {formatCapitalUnits(GAME_CONFIG.victoryCapital)}) → VICTORY với ending riêng.
              </ChevronLine>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 sm:mt-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-secondary/70 sm:text-sm">
          Điều kiện thua
        </h3>
        <div className="mt-2 space-y-1">
          <ChevronLine>Vốn ≤ 0 (phá sản)</ChevronLine>
          <ChevronLine>Uy tín hoặc sức lao động về 0</ChevronLine>
          <ChevronLine>
            Hết 15 câu mà vốn &lt; {formatCapitalUnits(GAME_CONFIG.victoryCapital)}
          </ChevronLine>
        </div>
        <p className="mt-2 text-[11px] font-extrabold text-secondary/80 sm:text-sm">
          Game over ngay (không cần chờ hết ván):
        </p>
        <div className="mt-1 space-y-1">
          {directGameOverItems.map((item) => (
            <ChevronLine key={item}>{item}</ChevronLine>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border-2 border-[#D4AF37]/30 bg-[#FFF4B8]/50 p-3.5 sm:mt-6 sm:p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#9A7B0A]">
            <Rocket className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-base font-extrabold text-secondary sm:text-lg">Bảng xếp hạng</h3>
            <ChevronLine className="mt-1.5">
              3 bảng: <strong className="text-secondary">Vốn</strong>,{' '}
              <strong className="text-secondary">Uy tín</strong>,{' '}
              <strong className="text-secondary">Sức lao động</strong>. Người{' '}
              <strong className="text-[#9A7B0A]">VICTORY</strong> luôn xếp trên{' '}
              <strong className="text-secondary">GAME OVER</strong>; trong cùng nhóm thì điểm cao hơn đứng trên.
            </ChevronLine>
          </div>
        </div>
      </section>
    </div>
  )
}
