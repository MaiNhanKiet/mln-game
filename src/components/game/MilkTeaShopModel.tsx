export function MilkTeaShopModel() {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center sm:max-w-md">
      <div className="absolute inset-x-8 bottom-8 h-8 rounded-[50%] bg-secondary/20 blur-md" />

      <svg
        className="relative z-10 h-full w-full drop-shadow-xl"
        viewBox="0 0 360 360"
        role="img"
        aria-label="Mô hình tiệm trà sữa Tư Bản Milk Tea"
      >
        <path
          className="fill-secondary/20"
          d="M75 300c22 19 188 21 211 0 12-11-2-28-24-29H99c-23 1-36 18-24 29Z"
        />

        <g className="origin-center animate-float-soft">
          <circle className="fill-secondary" cx="78" cy="102" r="6" />
          <circle className="fill-secondary" cx="292" cy="126" r="5" />
          <circle className="fill-secondary" cx="67" cy="217" r="5" />
          <circle className="fill-primary" cx="303" cy="215" r="7" />
          <circle className="fill-accent" cx="53" cy="156" r="6" />
        </g>

        {/* Cửa hàng được đẩy lên trên để ly trà sữa đè lên (Render trước) */}
        <g>
          <path
            className="fill-secondary"
            d="M92 126c0-14 12-26 26-26h124c14 0 26 12 26 26v19H92v-19Z"
          />
          <path
            className="fill-primary"
            d="M82 136h196c12 0 21 10 20 22l-4 39H66l-4-39c-1-12 8-22 20-22Z"
          />
          <path
            className="fill-white"
            opacity="0.72"
            d="M91 145h32v52H78l4-39c1-8 4-13 9-13ZM149 145h38v52h-38v-52ZM213 145h56c5 0 9 5 10 13l4 39h-70v-52Z"
          />
          <path
            className="stroke-secondary"
            strokeLinecap="round"
            strokeWidth="6"
            d="M70 197h220"
          />

          <path
            className="fill-milk-100 stroke-secondary"
            strokeLinejoin="round"
            strokeWidth="6"
            d="M82 197h196v86c0 13-11 24-24 24H106c-13 0-24-11-24-24v-86Z"
          />

          <path
            className="fill-white stroke-secondary"
            strokeLinejoin="round"
            strokeWidth="5"
            d="M107 213h146v30H107z"
          />
          <text
            className="fill-secondary font-display text-[18px] font-bold"
            textAnchor="middle"
            x="180"
            y="233"
          >
            Tư Bản Milk Tea
          </text>

          <path
            className="fill-secondary"
            d="M104 252h152v37c0 7-6 13-13 13H117c-7 0-13-6-13-13v-37Z"
          />
          <path
            className="fill-accent/30 stroke-secondary"
            strokeLinejoin="round"
            strokeWidth="5"
            d="M142 252h76v50h-76z"
          />
          <path className="fill-white/55" d="M153 261h17v34h-17z" />
          <path className="fill-white/55" d="M190 261h17v34h-17z" />
          <path
            className="stroke-primary"
            strokeLinecap="round"
            strokeWidth="7"
            d="M124 270h25M212 270h25"
          />
        </g>

        {/* Ly trà sữa đưa xuống cuối cùng (Render sau -> Nổi lên trước). 
            Thêm translate và scale để phóng to và dời sang phải. */}
        <g
          className="origin-center animate-float-slow"
          transform="translate(190, -120) scale(1.6)"
        >
          <path
            className="fill-white stroke-secondary"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
            d="M62 246h34l-5 43H67l-5-43Z"
          />
          <path className="fill-secondary/30" d="M66 260h26l-3 20H69l-3-20Z" />
          <circle className="fill-secondary" cx="73" cy="278" r="3" />
          <circle className="fill-secondary" cx="83" cy="275" r="3" />
          <path
            className="stroke-primary"
            strokeLinecap="round"
            strokeWidth="5"
            d="M70 237h18"
          />
        </g>
      </svg>
    </div>
  );
}
