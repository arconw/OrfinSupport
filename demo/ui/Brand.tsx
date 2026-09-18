export function OrfinLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M8 9C12 4 24 3 30 8c5 4 7 12 4 18-2 5-7 8-13 8h-4l-6 3 1-6C5 28 3 16 8 9Z"
        fill="currentColor"
      />
      <ellipse cx="16" cy="19" rx="1.7" ry="2.5" fill="var(--orfin-eye, white)" />
      <ellipse cx="25" cy="18.5" rx="1.7" ry="2.5" fill="var(--orfin-eye, white)" />
    </svg>
  );
}

export function NorthstarLogo() {
  return (
    <svg width="27" height="27" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="m14 1 3.3 9.7L27 14l-9.7 3.3L14 27l-3.3-9.7L1 14l9.7-3.3L14 1Z"
        fill="currentColor"
      />
      <path d="m5 5 9 5 9-5-5 9 5 9-9-5-9 5 5-9-5-9Z" fill="currentColor" opacity=".4" />
    </svg>
  );
}

export function WelcomeArt() {
  return (
    <svg className="welcome-art" viewBox="0 0 330 230" fill="none" aria-hidden="true">
      <ellipse
        cx="204"
        cy="127"
        rx="108"
        ry="70"
        transform="rotate(-30 204 127)"
        stroke="#bdceff"
        strokeOpacity=".45"
      />
      <ellipse
        cx="204"
        cy="127"
        rx="135"
        ry="92"
        transform="rotate(-30 204 127)"
        stroke="#bdceff"
        strokeOpacity=".2"
      />
      <ellipse
        cx="204"
        cy="127"
        rx="74"
        ry="44"
        transform="rotate(-30 204 127)"
        stroke="#bdceff"
        strokeOpacity=".3"
      />
      <rect
        x="129"
        y="74"
        width="97"
        height="107"
        rx="22"
        transform="rotate(-12 129 74)"
        fill="#6687f6"
      />
      <rect
        x="137"
        y="66"
        width="97"
        height="107"
        rx="22"
        transform="rotate(8 137 66)"
        fill="#eef2ff"
      />
      <g transform="translate(154 85) scale(1.3)" color="#4361ee">
        <OrfinLogo size={40} />
      </g>
      <rect
        x="153"
        y="143"
        width="50"
        height="5"
        rx="2.5"
        transform="rotate(8 153 143)"
        fill="#cbd6fa"
      />
      <circle cx="105" cy="171" r="18" fill="#dce7ff" />
      <path d="m98 171 5 5 9-10" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" />
      <circle cx="286" cy="77" r="7" fill="#b4c8ff" />
      <circle cx="107" cy="56" r="4" fill="#e0e7ff" />
      <path d="m270 153 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" fill="#b9cdff" />
    </svg>
  );
}

export function ProjectArt({ kind }: { kind: string }) {
  return (
    <svg className="project-art" viewBox="0 0 400 150" fill="none" aria-hidden="true">
      {kind === 'peach' ? (
        <>
          <circle cx="301" cy="83" r="107" stroke="#ce8b70" strokeOpacity=".22" />
          <circle cx="301" cy="83" r="83" stroke="#ce8b70" strokeOpacity=".25" />
          <path d="M130 39h48c27 0 44 15 44 36s-17 36-44 36h-48V39Z" fill="#cb7356" />
          <path d="M173 39h48c27 0 44 15 44 36s-17 36-44 36h-48V39Z" fill="#efae94" />
          <path d="M211 39h30v72h-30z" fill="#fff2e9" />
          <circle cx="115" cy="109" r="7" fill="#fff2e9" />
        </>
      ) : kind === 'lavender' ? (
        <>
          <rect
            x="117"
            y="29"
            width="165"
            height="107"
            rx="10"
            transform="rotate(-7 117 29)"
            fill="#a9a2d9"
          />
          <rect
            x="139"
            y="16"
            width="165"
            height="107"
            rx="10"
            transform="rotate(6 139 16)"
            fill="#faf8ff"
          />
          <path d="m137 39 163 17" stroke="#ddd8f0" />
          <circle cx="149" cy="30" r="3" fill="#a9a2d9" />
          <circle cx="159" cy="31" r="3" fill="#d3ccee" />
          <rect
            x="149"
            y="51"
            width="61"
            height="55"
            rx="5"
            transform="rotate(6 149 51)"
            fill="#bdb3e5"
          />
          <path
            d="m224 66 47 5m-49 9 32 3m-34 10 42 4"
            stroke="#d3ccee"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="242" cy="80" r="88" fill="#c5dfc8" />
          <rect
            x="173"
            y="11"
            width="64"
            height="130"
            rx="14"
            transform="rotate(13 173 11)"
            fill="#589478"
          />
          <rect
            x="176"
            y="17"
            width="55"
            height="115"
            rx="10"
            transform="rotate(13 176 17)"
            fill="#f0faf1"
          />
          <rect
            x="181"
            y="46"
            width="35"
            height="36"
            rx="7"
            transform="rotate(13 181 46)"
            fill="#9bc7a6"
          />
          <path
            d="m176 93 25 6m-28 4 33 8"
            stroke="#b8d9c0"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
