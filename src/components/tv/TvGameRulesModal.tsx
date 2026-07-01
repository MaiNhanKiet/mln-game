'use client'

import { useEffect } from 'react'
import {
  BookOpen,
  Coins,
  HeartHandshake,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { GAME_CONFIG } from '@/config/game'
import { formatCapitalUnits } from '@/lib/number-format'
import { tvFs } from '@/lib/tv-leaderboard-typography'

type TvGameRulesModalProps = {
  open: boolean
  onClose: () => void
}

const stats = [
  {
    icon: Coins,
    label: 'Vốn tích lũy',
    hint: 'Hết tiền = Phá sản',
    surface: 'bg-[#FFF6EE]',
    accent: 'text-capital',
    iconBg: 'bg-capital/20 text-capital',
  },
  {
    icon: HeartHandshake,
    label: 'Uy tín',
    hint: 'Mất uy tín = Tẩy chay',
    surface: 'bg-[#FDF3F3]',
    accent: 'text-reputation',
    iconBg: 'bg-reputation/20 text-reputation',
  },
  {
    icon: Users,
    label: 'Sức lao động',
    hint: 'Vắt kiệt = Đình công',
    surface: 'bg-[#F3F7F0]',
    accent: 'text-labor',
    iconBg: 'bg-labor/20 text-labor',
  },
  {
    icon: TrendingUp,
    label: 'Quy mô',
    hint: 'Lãi/lượt cộng vào vốn',
    surface: 'bg-[#F7F0EA]',
    accent: 'text-primary',
    iconBg: 'bg-primary/15 text-primary',
  },
] as const

function RuleLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 leading-snug" style={tvFs(15)}>
      <span className="shrink-0 font-black text-primary/80">&gt;</span>
      <span className="font-semibold text-secondary/90">{children}</span>
    </p>
  )
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof BookOpen
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border-2 border-secondary/15 bg-background">
      <div className="flex items-center gap-2 border-b border-secondary/10 px-3 py-2">
        <Icon className="h-4 w-4 text-secondary/70" strokeWidth={2.4} />
        <h3 className="font-extrabold text-secondary" style={tvFs(16)}>
          {title}
        </h3>
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function SubBlock({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p
        className="mb-1 font-extrabold uppercase tracking-wide text-secondary/50"
        style={tvFs(11)}
      >
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function TvGameRulesPanel() {
  const victory = formatCapitalUnits(GAME_CONFIG.victoryCapital)

  return (
    <div className="flex flex-col gap-2.5">
      <section className="rounded-xl border-2 border-secondary/15 bg-background p-3">
        <div className="mb-2 flex items-center gap-2">
          <Coins className="h-4 w-4 text-capital" strokeWidth={2.4} />
          <h3 className="font-extrabold text-secondary" style={tvFs(16)}>
            4 thanh sinh mệnh
          </h3>
        </div>
        <ul className="grid grid-cols-4 gap-2">
          {stats.map(({ icon: Icon, label, hint, surface, accent, iconBg }) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-lg border border-secondary/10 px-2.5 py-2 ${surface}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
              >
                <Icon size={16} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 text-left">
                <p className={`font-extrabold leading-tight ${accent}`} style={tvFs(14)}>
                  {label}
                </p>
                <p className="leading-tight text-secondary/60" style={tvFs(12)}>
                  {hint}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <Panel title="Cách chơi" icon={Zap}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-200 bg-red-50/80 px-2 py-2.5 text-center">
              <span className="font-display font-black leading-none text-red-500" style={tvFs(36)}>
                &lt;
              </span>
              <p className="mt-1 font-extrabold text-red-700" style={tvFs(14)}>
                Quẹt trái
              </p>
              <p className="font-bold uppercase tracking-wide text-red-600/70" style={tvFs(11)}>
                Từ chối
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-2 py-2.5 text-center">
              <span className="font-display font-black leading-none text-emerald-600" style={tvFs(36)}>
                &gt;
              </span>
              <p className="mt-1 font-extrabold text-emerald-800" style={tvFs(14)}>
                Quẹt phải
              </p>
              <p className="font-bold uppercase tracking-wide text-emerald-700/70" style={tvFs(11)}>
                Đồng ý
              </p>
            </div>
          </div>

          <p className="mt-2 text-center text-secondary/55" style={tvFs(13)}>
            Bấm <strong className="text-secondary">Tiếp tục</strong> sau mỗi lựa chọn · phím{' '}
            <strong className="text-secondary">&lt; / &gt;</strong>
          </p>

          <div className="mt-2.5 border-t border-secondary/10 pt-2.5">
            <SubBlock title="Gợi ý nhanh">
              <RuleLine>
                Quan sát <strong>4 thanh</strong> trước mỗi quyết định
              </RuleLine>
              <RuleLine>
                Giữ vốn từ <strong>{victory}</strong> trở lên để có cơ hội thắng
              </RuleLine>
              <RuleLine>Cân bằng lợi nhuận và uy tín, tránh sụt chỉ số về 0</RuleLine>
            </SubBlock>
          </div>
        </Panel>

        <Panel title="Kết quả ván" icon={Target}>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#D4AF37]/40 bg-[#FFFBF0] px-3 py-2">
            <p className="font-extrabold uppercase tracking-wide text-[#9A7B0A]/80" style={tvFs(12)}>
              Mục tiêu chiến thắng
            </p>
            <p className="font-display font-extrabold text-secondary" style={tvFs(20)}>
              Vốn ≥ <span className="text-primary">{victory}</span>
            </p>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <SubBlock title="Chiến thắng">
              <RuleLine>
                Hết {GAME_CONFIG.totalRounds} câu, đủ vốn, uy tín &amp; sức lao động &gt; 0
              </RuleLine>
              <RuleLine>
                <strong>Vượt ải</strong> — VICTORY, xếp hạng theo vốn cuối
              </RuleLine>
            </SubBlock>

            <SubBlock title="Thua cuộc">
              <RuleLine>Vốn ≤ 0 — phá sản</RuleLine>
              <RuleLine>Uy tín hoặc sức lao động về 0</RuleLine>
              <RuleLine>Hết ván mà vốn &lt; {victory}</RuleLine>
              <RuleLine>Một số trường hợp dẫn đến phá sản</RuleLine>
            </SubBlock>
          </div>

          <div className="mt-2.5 border-t border-secondary/10 pt-2.5">
            <SubBlock title="Bảng xếp hạng">
              <RuleLine>
                3 bảng: <span className="text-capital">Vốn</span> ·{' '}
                <span className="text-reputation">Uy tín</span> ·{' '}
                <span className="text-labor">Sức lao động</span> —{' '}
                <strong className="text-[#9A7B0A]">VICTORY</strong> luôn trên{' '}
                <strong>GAME OVER</strong>
              </RuleLine>
            </SubBlock>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function TvGameRulesModal({ open, onClose }: TvGameRulesModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-secondary/20 backdrop-blur-[1px]"
        aria-label="Đóng luật chơi"
        onClick={onClose}
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="tv-rules-title"
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,76rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-secondary bg-white p-4 shadow-[4px_4px_0_0_#42362E] sm:p-5"
      >
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold uppercase tracking-wide text-primary" style={tvFs(11)}>
              TV Dashboard
            </p>
            <h2
              id="tv-rules-title"
              className="font-display font-extrabold leading-tight text-secondary"
              style={tvFs(24)}
            >
              Luật chơi &amp; Hướng dẫn
            </h2>
            <p className="mt-0.5 font-medium text-secondary/55" style={tvFs(14)}>
              {GAME_CONFIG.totalRounds} câu · mỗi thiết bị chơi 1 lần ·{' '}
              <span className="font-semibold text-primary">1 đơn vị = 1 triệu VNĐ</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-secondary bg-background px-3 py-1.5 font-extrabold text-secondary"
            style={tvFs(13)}
          >
            Đóng
          </button>
        </div>

        <TvGameRulesPanel />
      </motion.aside>
    </>
  )
}

export function TvGameRulesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 hover:bg-[#FFF9F0] active:scale-95 sm:h-11 sm:w-11"
      aria-label="Xem luật chơi"
      title="Luật chơi"
    >
      <BookOpen size={18} strokeWidth={2.6} className="text-primary" />
    </button>
  )
}
