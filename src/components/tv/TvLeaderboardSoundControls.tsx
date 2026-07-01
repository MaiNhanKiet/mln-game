'use client'

import { useState } from 'react'
import { Settings2, Trophy, Type, Volume2, VolumeX } from 'lucide-react'
import {
  TV_LEADERBOARD_FONT_PRESETS,
  TV_LEADERBOARD_FONT_SCALE_MAX,
  TV_LEADERBOARD_FONT_SCALE_MIN,
  type TvLeaderboardFontPreset,
  useTvLeaderboardSettings,
} from '@/stores/use-tv-leaderboard-settings'
import { useSoundSettings } from '@/stores/use-sound-settings'

function UnitSlider({
  id,
  label,
  value,
  disabled,
  onChange,
  formatValue,
}: {
  id: string
  label: string
  value: number
  disabled?: boolean
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}) {
  const percent = Math.round(value * 100)
  const displayValue = formatValue ? formatValue(value) : `${percent}%`

  return (
    <label className="block" htmlFor={id}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-secondary/70">{label}</span>
        <span className="text-xs font-black tabular-nums text-secondary">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="volume-range h-3 w-full touch-manipulation cursor-pointer appearance-none rounded-full border-2 border-secondary bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </label>
  )
}

function FontScaleSlider({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  const percent = Math.round(value * 100)
  const minPercent = Math.round(TV_LEADERBOARD_FONT_SCALE_MIN * 100)
  const maxPercent = Math.round(TV_LEADERBOARD_FONT_SCALE_MAX * 100)
  const safePercent = Math.min(maxPercent, Math.max(minPercent, percent))

  return (
    <label className="block" htmlFor={id}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-secondary/70">{label}</span>
        <span className="text-xs font-black tabular-nums text-secondary">{safePercent}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={minPercent}
        max={maxPercent}
        step={5}
        value={safePercent}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
        className="volume-range h-3 w-full touch-manipulation cursor-pointer appearance-none rounded-full border-2 border-secondary bg-slate-100"
      />
    </label>
  )
}

const FONT_PRESET_LABELS: Record<TvLeaderboardFontPreset, string> = {
  small: 'Nhỏ',
  medium: 'Vừa',
  large: 'Lớn',
}

type TvLeaderboardSoundControlsProps = {
  onPreview: () => void
}

export function TvLeaderboardSoundControls({ onPreview }: TvLeaderboardSoundControlsProps) {
  const [open, setOpen] = useState(false)
  const leaderboardSfxEnabled = useSoundSettings((s) => s.leaderboardSfxEnabled)
  const leaderboardSfxVolume = useSoundSettings((s) => s.leaderboardSfxVolume)
  const setLeaderboardSfxEnabled = useSoundSettings((s) => s.setLeaderboardSfxEnabled)
  const setLeaderboardSfxVolume = useSoundSettings((s) => s.setLeaderboardSfxVolume)
  const toggleLeaderboardSfx = useSoundSettings((s) => s.toggleLeaderboardSfx)
  const fontScale = useTvLeaderboardSettings((s) => s.fontScale)
  const setFontScale = useTvLeaderboardSettings((s) => s.setFontScale)
  const setFontPreset = useTvLeaderboardSettings((s) => s.setFontPreset)

  const SoundIcon = leaderboardSfxEnabled ? Volume2 : VolumeX
  const activePreset = (Object.entries(TV_LEADERBOARD_FONT_PRESETS).find(
    ([, presetValue]) => Math.abs(presetValue - fontScale) < 0.001,
  )?.[0] ?? null) as TvLeaderboardFontPreset | null

  return (
    <>
      <div className="fixed right-2 top-2 z-50 flex items-center gap-2 sm:right-4 sm:top-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 hover:bg-background active:scale-95 sm:h-11 sm:w-11"
          onClick={() => setOpen((current) => !current)}
          aria-label="Cài đặt bảng xếp hạng"
          title="Cài đặt"
        >
          <Settings2 size={18} strokeWidth={2.6} />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 hover:bg-background active:scale-95 sm:h-11 sm:w-11"
          onClick={toggleLeaderboardSfx}
          aria-label={leaderboardSfxEnabled ? 'Tắt âm thanh BXH' : 'Bật âm thanh BXH'}
          title={leaderboardSfxEnabled ? 'Tắt âm thanh BXH' : 'Bật âm thanh BXH'}
        >
          <SoundIcon size={20} strokeWidth={2.8} />
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-secondary/20 backdrop-blur-[1px]"
            aria-label="Đóng cài đặt"
            onClick={() => setOpen(false)}
          />

          <aside
            className="fixed right-2 top-14 z-50 max-h-[calc(100dvh-4rem)] w-[min(100vw-1rem,20rem)] overflow-y-auto rounded-2xl border-2 border-secondary bg-white p-4 shadow-[4px_4px_0_0_#42362E] sm:right-4 sm:top-16"
            aria-label="Cài đặt bảng xếp hạng TV"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">TV Dashboard</p>
                <h2 className="font-display text-lg font-extrabold text-secondary">Cài đặt BXH</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border-2 border-secondary bg-background px-2.5 py-1 text-xs font-extrabold text-secondary"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4">
              <section className="rounded-xl border-2 border-secondary/15 bg-background p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-secondary" strokeWidth={2.4} />
                  <h3 className="text-sm font-extrabold text-secondary">Cỡ chữ</h3>
                </div>

                <FontScaleSlider
                  id="leaderboard-font-scale"
                  label="Kích thước chữ"
                  value={fontScale}
                  onChange={setFontScale}
                />

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(Object.keys(TV_LEADERBOARD_FONT_PRESETS) as TvLeaderboardFontPreset[]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFontPreset(preset)}
                      className={`rounded-full border-2 px-2 py-2 text-xs font-extrabold transition hover:-translate-y-0.5 ${
                        activePreset === preset
                          ? 'border-secondary bg-secondary text-white'
                          : 'border-secondary bg-white text-secondary'
                      }`}
                    >
                      {FONT_PRESET_LABELS[preset]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border-2 border-secondary/15 bg-background p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.4} />
                  <h3 className="text-sm font-extrabold text-secondary">Âm thanh đổi hạng</h3>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-secondary">Âm khi đổi vị trí</p>
                    <p className="mt-0.5 text-xs font-semibold text-secondary/60">
                      Phát khi người chơi lên hoặc xuống hạng
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={leaderboardSfxEnabled}
                    onClick={() => setLeaderboardSfxEnabled(!leaderboardSfxEnabled)}
                    className={`relative h-7 w-12 shrink-0 rounded-full border-2 border-secondary transition-colors ${
                      leaderboardSfxEnabled ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full border-2 border-secondary bg-white shadow-[1px_1px_0_0_#42362E] transition-transform ${
                        leaderboardSfxEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-3">
                  <UnitSlider
                    id="leaderboard-sfx-volume"
                    label="Âm lượng"
                    value={leaderboardSfxVolume}
                    disabled={!leaderboardSfxEnabled}
                    onChange={setLeaderboardSfxVolume}
                  />
                </div>

                <button
                  type="button"
                  disabled={!leaderboardSfxEnabled}
                  onClick={onPreview}
                  className="mt-3 w-full rounded-full border-2 border-secondary bg-[#FFF9E6] px-2 py-2 text-xs font-extrabold text-secondary transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Nghe thử
                </button>
              </section>
            </div>
          </aside>
        </>
      ) : null}
    </>
  )
}
