'use client'

import { useState } from 'react'
import { Music2, Settings2, Volume2, VolumeX, Zap } from 'lucide-react'
import { useSoundSettings } from '@/stores/use-sound-settings'

type SoundSettingsPanelProps = {
  open: boolean
  onClose: () => void
  onPreviewSuccess: () => void
  onPreviewFail: () => void
}

function VolumeSlider({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const percent = Math.round(value * 100)

  const handleVolumeInput = (event: React.FormEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value) / 100)
  }

  return (
    <label className="block" htmlFor={id}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-secondary/70">{label}</span>
        <span className="text-xs font-black tabular-nums text-secondary">{percent}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        disabled={disabled}
        onInput={handleVolumeInput}
        onChange={handleVolumeInput}
        className="volume-range h-3 w-full touch-manipulation cursor-pointer appearance-none rounded-full border-2 border-secondary bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </label>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-secondary">{label}</p>
        <p className="mt-0.5 text-xs font-semibold text-secondary/60">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-2 border-secondary transition-colors ${
          checked ? 'bg-primary' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full border-2 border-secondary bg-white shadow-[1px_1px_0_0_#42362E] transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function SoundSettingsPanel({
  open,
  onClose,
  onPreviewSuccess,
  onPreviewFail,
}: SoundSettingsPanelProps) {
  const musicEnabled = useSoundSettings((s) => s.musicEnabled)
  const musicVolume = useSoundSettings((s) => s.musicVolume)
  const sfxEnabled = useSoundSettings((s) => s.sfxEnabled)
  const sfxVolume = useSoundSettings((s) => s.sfxVolume)
  const setMusicEnabled = useSoundSettings((s) => s.setMusicEnabled)
  const setMusicVolume = useSoundSettings((s) => s.setMusicVolume)
  const setSfxEnabled = useSoundSettings((s) => s.setSfxEnabled)
  const setSfxVolume = useSoundSettings((s) => s.setSfxVolume)

  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-secondary/20 backdrop-blur-[1px]"
        aria-label="Đóng cài đặt âm thanh"
        onClick={onClose}
      />

      <aside
        className="fixed right-2 top-14 z-50 w-[min(100vw-1rem,20rem)] rounded-2xl border-2 border-secondary bg-white p-4 shadow-[4px_4px_0_0_#42362E] sm:right-4 sm:top-16 lg:right-6 lg:top-[4.5rem] lg:w-80 lg:p-5"
        aria-label="Cài đặt âm thanh"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Cài đặt</p>
            <h2 className="font-display text-lg font-extrabold text-secondary">Âm thanh</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-secondary bg-background px-2.5 py-1 text-xs font-extrabold text-secondary"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border-2 border-secondary/15 bg-background p-3">
            <div className="mb-3 flex items-center gap-2">
              <Music2 className="h-4 w-4 text-primary" strokeWidth={2.4} />
              <h3 className="text-sm font-extrabold text-secondary">Nhạc nền</h3>
            </div>

            <ToggleRow
              label="Bật nhạc nền"
              description="Phát khi vào game và chơi"
              checked={musicEnabled}
              onChange={setMusicEnabled}
            />

            <div className="mt-3">
              <VolumeSlider
                id="music-volume"
                label="Âm lượng nhạc"
                value={musicVolume}
                disabled={!musicEnabled}
                onChange={setMusicVolume}
              />
            </div>
          </section>

          <section className="rounded-xl border-2 border-secondary/15 bg-background p-3">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" strokeWidth={2.4} />
              <h3 className="text-sm font-extrabold text-secondary">Hiệu ứng</h3>
            </div>

            <ToggleRow
              label="Âm success / fail"
              description="Khi quyết định tăng hoặc giảm vốn"
              checked={sfxEnabled}
              onChange={setSfxEnabled}
            />

            <div className="mt-3">
              <VolumeSlider
                id="sfx-volume"
                label="Âm lượng hiệu ứng"
                value={sfxVolume}
                disabled={!sfxEnabled}
                onChange={setSfxVolume}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!sfxEnabled}
                onClick={onPreviewSuccess}
                className="rounded-full border-2 border-secondary bg-emerald-50 px-2 py-2 text-xs font-extrabold text-emerald-800 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Nghe Success
              </button>
              <button
                type="button"
                disabled={!sfxEnabled}
                onClick={onPreviewFail}
                className="rounded-full border-2 border-secondary bg-red-50 px-2 py-2 text-xs font-extrabold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Nghe Fail
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  )
}

type GameSoundControlsProps = {
  onPreviewSuccess: () => void
  onPreviewFail: () => void
}

export function GameSoundControls({ onPreviewSuccess, onPreviewFail }: GameSoundControlsProps) {
  const [open, setOpen] = useState(false)
  const musicEnabled = useSoundSettings((s) => s.musicEnabled)
  const sfxEnabled = useSoundSettings((s) => s.sfxEnabled)
  const setMusicEnabled = useSoundSettings((s) => s.setMusicEnabled)
  const setSfxEnabled = useSoundSettings((s) => s.setSfxEnabled)

  const isAnySoundOn = musicEnabled || sfxEnabled
  const SoundIcon = isAnySoundOn ? Volume2 : VolumeX

  const handleQuickMute = () => {
    if (isAnySoundOn) {
      setMusicEnabled(false)
      setSfxEnabled(false)
      return
    }

    setMusicEnabled(true)
    setSfxEnabled(true)
  }

  return (
    <>
      <div className="fixed right-2 top-2 z-50 flex items-center gap-2 sm:right-4 sm:top-4 lg:right-6 lg:top-6">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 hover:bg-background active:scale-95 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
          onClick={() => setOpen((current) => !current)}
          aria-label="Cài đặt âm thanh"
          title="Cài đặt âm thanh"
        >
          <Settings2 size={18} strokeWidth={2.6} />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-secondary bg-white text-secondary shadow-[3px_3px_0_0_#42362E] transition hover:-translate-y-0.5 hover:bg-background active:scale-95 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
          onClick={handleQuickMute}
          aria-label={isAnySoundOn ? 'Tắt tất cả âm thanh' : 'Bật âm thanh'}
          title={isAnySoundOn ? 'Tắt tất cả âm thanh' : 'Bật âm thanh'}
        >
          <SoundIcon size={20} strokeWidth={2.8} />
        </button>
      </div>

      <SoundSettingsPanel
        open={open}
        onClose={() => setOpen(false)}
        onPreviewSuccess={onPreviewSuccess}
        onPreviewFail={onPreviewFail}
      />
    </>
  )
}
