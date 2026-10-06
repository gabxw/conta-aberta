export function VehicleIllustration() {
  return (
    <svg
      viewBox="0 0 640 310"
      fill="none"
      role="img"
      aria-label="Ilustracao de um SUV prata"
      className="vehicle-illustration"
    >
      <defs>
        <linearGradient
          id="car-body"
          x1="190"
          y1="90"
          x2="410"
          y2="258"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f6f8f8" />
          <stop offset=".38" stopColor="#c7d1d3" />
          <stop offset=".65" stopColor="#899c9f" />
          <stop offset="1" stopColor="#e1e8e8" />
        </linearGradient>
        <linearGradient id="car-glass" x1="268" y1="100" x2="400" y2="159">
          <stop stopColor="#567579" />
          <stop offset="1" stopColor="#112f35" />
        </linearGradient>
        <radialGradient id="car-wheel">
          <stop stopColor="#8c9da0" />
          <stop offset=".6" stopColor="#253d42" />
          <stop offset=".68" stopColor="#718084" />
          <stop offset=".74" stopColor="#0d2126" />
          <stop offset="1" stopColor="#11282c" />
        </radialGradient>
        <filter id="car-shadow">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <ellipse
        cx="336"
        cy="259"
        rx="227"
        ry="17"
        fill="#011c20"
        opacity=".55"
        filter="url(#car-shadow)"
      />
      <path
        d="M101 187L140 150L210 124L251 80Q284 61 354 70L413 85L476 137L546 167Q566 178 572 205L562 233L441 254L159 238L103 217Z"
        fill="url(#car-body)"
        stroke="#d5dfdf"
        strokeWidth="1.4"
      />
      <path
        d="M260 85L300 79L284 132L218 148Z"
        fill="url(#car-glass)"
        stroke="#728d92"
        strokeWidth="3"
      />
      <path
        d="M310 80Q360 79 408 94L455 136L300 133Z"
        fill="url(#car-glass)"
        stroke="#c8d5d6"
        strokeWidth="4"
      />
      <path
        d="M307 82L301 130M357 84L355 133"
        stroke="#203d44"
        strokeWidth="5"
      />
      <path d="M214 153L291 140L469 143L548 172L328 185Z" fill="#dce5e5" />
      <path
        d="M328 187L549 174L569 197L550 239L337 251L316 231Z"
        fill="#9aadb0"
      />
      <path
        d="M361 197L551 185L554 218L542 232L355 242L340 220Z"
        fill="#102a31"
      />
      <path
        d="M356 202L546 189M350 211L549 199M351 221L546 210M357 231L540 222"
        stroke="#476065"
        strokeWidth="2"
      />
      <path
        d="M389 195L395 234M420 192L424 233M452 190L454 230M482 189L485 229M512 187L515 225"
        stroke="#557177"
        opacity=".45"
      />
      <path d="M329 185L372 182L381 190L339 196Z" fill="#e8feff" />
      <path d="M505 173L549 174L556 181L512 183Z" fill="#e8feff" />
      <path d="M331 204L348 202L347 224L332 225Z" fill="#d4f4f3" />
      <path d="M550 195L560 194L555 215L548 217Z" fill="#d4f4f3" />
      <path d="M361 243L531 234L522 243L374 252Z" fill="#e1e8e9" />
      <path
        d="M227 150L211 219M296 146L279 226"
        stroke="#6a858a"
        strokeWidth="1.5"
      />
      <path
        d="M170 176L182 173M246 166L260 164"
        stroke="#edf6f6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M296 132L284 146L306 152L324 145L314 133Z"
        fill="#bbcdd0"
        stroke="#698489"
      />
      <path d="M122 188L132 181L134 207L121 211Z" fill="#b63d43" />
      <path
        d="M132 233Q120 196 147 185Q179 174 191 210L185 239Z"
        fill="#1e363a"
      />
      <path
        d="M269 246Q257 202 290 191Q326 183 342 222L335 251Z"
        fill="#183237"
      />
      <ellipse
        cx="155"
        cy="221"
        rx="27"
        ry="36"
        transform="rotate(-13 155 221)"
        fill="url(#car-wheel)"
      />
      <ellipse
        cx="300"
        cy="232"
        rx="30"
        ry="39"
        transform="rotate(-12 300 232)"
        fill="url(#car-wheel)"
      />
      {[
        { x: 155, y: 221, r: 20 },
        { x: 300, y: 232, r: 22 },
      ].map((w) => (
        <g key={w.x}>
          <ellipse cx={w.x} cy={w.y} rx={w.r * 0.72} ry={w.r} fill="#a7b9bc" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path
              key={a}
              d={`M${w.x - 3} ${w.y - 4}L${w.x - 8} ${w.y - w.r + 3}L${w.x + 3} ${w.y - w.r + 1}L${w.x + 3} ${w.y - 4}Z`}
              fill="#304c54"
              transform={`rotate(${a} ${w.x} ${w.y})`}
            />
          ))}
          <ellipse cx={w.x} cy={w.y} rx="5" ry="7" fill="#dbe7e8" />
        </g>
      ))}
      <path d="M189 239L259 247L268 237L191 230Z" fill="#253f45" />
      <path
        d="M212 76Q296 51 375 71"
        stroke="#819a9e"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="419"
        y="218"
        width="71"
        height="13"
        rx="2"
        transform="rotate(-4 419 218)"
        fill="#e1eeee"
      />
      <text
        x="427"
        y="227"
        fill="#28434a"
        fontSize="7"
        fontFamily="sans-serif"
        transform="rotate(-4 427 227)"
      >
        DRIVEPULSE
      </text>
    </svg>
  );
}
