import { GAME_CONFIG } from '@/config/game'
import type { GameState } from '@/types/game'
import { formatCapitalUnits } from '@/lib/number-format'
import { ScoreBar } from '@/components/ui/ScoreBar'

type StatsHudProps = {
  state: GameState
}

export function StatsHud({ state }: StatsHudProps) {
  return (
    <section
      className="grid auto-rows-fr grid-cols-2 gap-1.5 px-0.5 pb-1 min-[720px]:grid-cols-4 min-[720px]:gap-2 min-[720px]:pb-1.5 lg:gap-2.5 xl:gap-3"
      aria-label="Chỉ số cửa hàng"
    >
      <ScoreBar
        delta={state.lastImpact?.capital}
        displayValue={formatCapitalUnits(state.capital)}
        helperText="1 đơn vị = 1 triệu VNĐ"
        label="Vốn tích lũy"
        maxValue={GAME_CONFIG.capitalHudMax}
        tone="capital"
        value={state.capital}
      />
      <ScoreBar
        delta={state.lastImpact?.reputation}
        displayValue={`${state.reputation}/100`}
        helperText="Khách yêu quán"
        label="Uy tín"
        maxValue={100}
        tone="reputation"
        value={state.reputation}
      />
      <ScoreBar
        delta={state.lastImpact?.staffMorale}
        displayValue={`${state.staffMorale}/100`}
        helperText="Năng lượng nhân viên"
        label="Sức lao động"
        maxValue={100}
        tone="labor"
        value={state.staffMorale}
      />
      <ScoreBar
        delta={state.lastImpact?.scale}
        displayValue={`Cấp ${state.scale}`}
        helperText={`Lãi mỗi lượt: +${formatCapitalUnits(state.profitPerTurn)}`}
        helperTone="success"
        label="Quy mô"
        maxValue={8}
        tone="scale"
        value={state.scale}
      />
    </section>
  )
}
