// SUV compacto de perfil, em vetor plano. Ilustração genérica, sem marca.
const wheels = [165, 475];

export function VehicleIllustration() {
  return (
    <svg
      viewBox="0 0 640 310"
      fill="none"
      role="img"
      aria-label="Ilustração de um SUV prata de perfil"
      className="vehicle-illustration"
    >
      <defs>
        <linearGradient id="car-body" x1="0" y1="100" x2="0" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f4f7f7" />
          <stop offset=".45" stopColor="#d9e0e1" />
          <stop offset="1" stopColor="#a9b6b8" />
        </linearGradient>
        <linearGradient id="car-glass" x1="0" y1="118" x2="0" y2="162" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3d5459" />
          <stop offset="1" stopColor="#1b2b2f" />
        </linearGradient>
        <radialGradient id="car-shadow" cx=".5" cy=".5" r=".5">
          <stop stopColor="#0b2a17" stopOpacity=".28" />
          <stop offset="1" stopColor="#0b2a17" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="322" cy="279" rx="300" ry="16" fill="url(#car-shadow)" />

      {/* Carroceria */}
      <path
        d="M78 238 L70 204 Q66 180 76 168 L98 130 Q106 114 126 112 L370 107 Q392 106 408 117 L462 156 Q470 161 486 163 L548 171 Q574 175 582 192 L587 222 Q588 237 574 238 L532 238 A54 54 0 0 0 424 238 L222 238 A54 54 0 0 0 114 238 Z"
        fill="url(#car-body)"
        stroke="#8e9c9e"
        strokeWidth="1.5"
      />

      {/* Revestimento plástico inferior e para-lamas */}
      <path d="M222 238 L424 238 L420 224 L226 224 Z" fill="#2b3436" />
      <path d="M78 238 L114 238 L112 226 L76 226 Z" fill="#2b3436" />
      <path d="M532 238 L574 238 Q586 236 587 226 L534 226 Z" fill="#2b3436" />
      <path d="M106 238 A60 60 0 0 1 226 238" stroke="#2b3436" strokeWidth="11" />
      <path d="M416 238 A60 60 0 0 1 536 238" stroke="#2b3436" strokeWidth="11" />

      {/* Barras de teto */}
      <path d="M146 107 L352 103" stroke="#2b3436" strokeWidth="5" strokeLinecap="round" />

      {/* Vidros */}
      <path
        d="M110 160 L118 138 Q124 124 140 123 L366 119 Q382 119 394 128 L438 160 Z"
        fill="url(#car-glass)"
      />
      <path d="M150 123 L172 123 L184 160 L164 160 Z" fill="#2b3436" />
      <path d="M270 121 L284 121 L284 160 L270 160 Z" fill="#2b3436" />
      <path d="M296 124 L360 122 L322 144 L296 145 Z" fill="#fff" opacity=".08" />

      {/* Linha de cintura e vincos */}
      <path d="M100 162 L452 162" stroke="#9aa8aa" strokeWidth="1.5" />
      <path d="M90 196 Q330 190 582 200" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />

      {/* Portas e maçanetas */}
      <path d="M186 162 L186 184" stroke="#8e9c9e" strokeWidth="1.5" />
      <path d="M284 162 L284 224" stroke="#8e9c9e" strokeWidth="1.5" />
      <path d="M414 162 L414 210" stroke="#8e9c9e" strokeWidth="1.5" />
      <rect x="240" y="172" width="26" height="6" rx="3" fill="#8e9c9e" />
      <rect x="370" y="172" width="26" height="6" rx="3" fill="#8e9c9e" />

      {/* Retrovisor */}
      <path d="M424 150 Q426 138 440 140 L448 152 Q446 158 436 158 Z" fill="#2b3436" />

      {/* Faróis, grade e lanterna */}
      <path d="M546 174 Q570 177 580 190 L556 190 Q546 186 546 174 Z" fill="#e9f3f3" stroke="#6f7f82" />
      <path d="M576 198 L586 198 L587 218 L578 218 Z" fill="#2b3436" />
      <path d="M72 172 L86 168 L86 186 L68 190 Z" fill="#c8302c" />

      {/* Rodas */}
      {wheels.map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 54} 238 A54 54 0 0 1 ${cx + 54} 238 Z`} fill="#141a1c" />
          <circle cx={cx} cy="236" r="44" fill="#1f2628" />
          <circle cx={cx} cy="236" r="29" fill="#c3cccd" stroke="#8e9c9e" strokeWidth="2" />
          {[0, 72, 144, 216, 288].map((a) => (
            <rect
              key={a}
              x={cx - 3.5}
              y="210"
              width="7"
              height="22"
              rx="3"
              fill="#7c8a8c"
              transform={`rotate(${a} ${cx} 236)`}
            />
          ))}
          <circle cx={cx} cy="236" r="8" fill="#5d6a6c" />
        </g>
      ))}
    </svg>
  );
}
