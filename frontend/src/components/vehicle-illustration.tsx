// SUV compacto de perfil, com as proporções de um Creta (comprimento ≈ 2,65× a altura,
// entre-eixos ≈ 60% do comprimento). Ilustração genérica, sem marca.
const wheels = [173, 467];

export function VehicleIllustration() {
  return (
    <svg
      viewBox="0 0 640 310"
      fill="none"
      role="img"
      aria-label="Ilustração de um SUV compacto prata de perfil"
      className="vehicle-illustration"
    >
      <defs>
        <linearGradient id="car-body" x1="0" y1="96" x2="0" y2="254" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5f8f8" />
          <stop offset=".5" stopColor="#d8dfe0" />
          <stop offset="1" stopColor="#a7b4b6" />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="104" x2="0" y2="156" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3f565b" />
          <stop offset="1" stopColor="#192a2e" />
        </linearGradient>
        <radialGradient id="car-shadow" cx=".5" cy=".5" r=".5">
          <stop stopColor="#0b2a17" stopOpacity=".3" />
          <stop offset="1" stopColor="#0b2a17" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="320" cy="283" rx="275" ry="15" fill="url(#car-shadow)" />

      {/* Carroceria */}
      <path
        d="M84 254 L78 244 Q74 234 75 220 L76 178 Q77 160 84 150 L112 120 Q124 104 146 102 L330 96 Q356 95 372 104 L436 152 Q444 158 458 160 L538 168 Q558 171 563 184 L566 228 Q566 250 556 254 L521 254 L521 244 A54 54 0 0 0 413 244 L413 254 L227 254 L227 244 A54 54 0 0 0 119 244 L119 254 Z"
        fill="url(#car-body)"
        stroke="#8e9c9e"
        strokeWidth="1.5"
      />

      {/* Para-lamas, soleira e para-choques em plástico preto */}
      <path d="M229 254 L411 254 L410 238 L230 238 Z" fill="#2b3436" />
      <path d="M84 254 L119 254 L119 238 L76 236 Q76 248 84 254 Z" fill="#2b3436" />
      <path d="M521 254 L556 254 Q566 250 566 234 L521 236 Z" fill="#2b3436" />
      <path d="M112 244 A61 61 0 0 1 234 244" stroke="#2b3436" strokeWidth="12" />
      <path d="M406 244 A61 61 0 0 1 528 244" stroke="#2b3436" strokeWidth="12" />
      <path d="M78 246 L98 250" stroke="#c3cccd" strokeWidth="4" strokeLinecap="round" />
      <path d="M540 250 L560 246" stroke="#c3cccd" strokeWidth="4" strokeLinecap="round" />

      {/* Barras de teto */}
      <path d="M160 98 L326 92" stroke="#2b3436" strokeWidth="5" strokeLinecap="round" />

      {/* Vidros, coluna B preta e coluna C grossa na cor do carro */}
      <path
        d="M124 154 L134 128 Q142 113 162 111 L326 105 Q348 104 360 112 L424 154 Z"
        fill="url(#car-glass)"
      />
      <path d="M168 110 L192 109 L203 154 L174 154 Z" fill="url(#car-body)" />
      <path d="M266 107 L279 107 L279 154 L266 154 Z" fill="#2b3436" />
      <path d="M292 108 L334 106 L304 132 L292 132 Z" fill="#fff" opacity=".1" />

      {/* Linha de cintura e vincos */}
      <path d="M110 155 L432 155" stroke="#97a5a7" strokeWidth="1.5" />
      <path d="M82 188 Q320 176 562 188" stroke="#fff" strokeOpacity=".75" strokeWidth="2.5" />
      <path d="M234 222 Q320 218 406 220" stroke="#9aa8aa" strokeWidth="1.5" />

      {/* Portas e maçanetas */}
      <path d="M200 156 L204 192" stroke="#8e9c9e" strokeWidth="1.5" />
      <path d="M279 156 L279 238" stroke="#8e9c9e" strokeWidth="1.5" />
      <path d="M406 156 L408 222" stroke="#8e9c9e" strokeWidth="1.5" />
      <rect x="226" y="166" width="24" height="6" rx="3" fill="#8e9c9e" />
      <rect x="348" y="165" width="24" height="6" rx="3" fill="#8e9c9e" />

      {/* Retrovisor */}
      <path d="M418 146 Q420 134 434 136 L442 148 Q440 154 430 154 Z" fill="#2b3436" />

      {/* Frente: faixa de LED no topo, farol no para-choque e grade */}
      <path d="M536 170 Q556 172 562 182 L560 186 Q548 178 534 176 Z" fill="#f2fbfb" stroke="#6f7f82" />
      <path d="M546 198 L565 196 L565 212 L548 212 Q544 206 546 198 Z" fill="#e3ecec" stroke="#6f7f82" />
      <path d="M560 216 L566 216 L566 232 L558 232 Z" fill="#2b3436" />

      {/* Traseira: lanterna horizontal */}
      <path d="M78 160 L104 166 L104 178 L77 176 Z" fill="#c8302c" />

      {/* Rodas */}
      {wheels.map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 54} 244 A54 54 0 0 1 ${cx + 54} 244 Z`} fill="#141a1c" />
          <circle cx={cx} cy="240" r="42" fill="#1f2628" />
          <circle cx={cx} cy="240" r="29" fill="#4b5759" stroke="#8e9c9e" strokeWidth="2" />
          {[0, 72, 144, 216, 288].map((a) => (
            <path
              key={a}
              d={`M${cx - 6} 213 L${cx + 6} 213 L${cx + 3} 234 L${cx - 3} 234 Z`}
              fill="#d4dbdc"
              transform={`rotate(${a} ${cx} 240)`}
            />
          ))}
          <circle cx={cx} cy="240" r="7" fill="#2b3436" stroke="#c3cccd" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}
