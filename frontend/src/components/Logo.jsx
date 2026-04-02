// Graduation cap SVG logo used across all layouts and login
const Logo = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="32" height="32" rx="8" fill="#6366f1" />
    <path
      d="M16 8L6 13l10 5 10-5-10-5z"
      fill="white"
    />
    <path
      d="M10 15.5v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5l-6 3-6-3z"
      fill="white"
      opacity="0.85"
    />
    <line x1="26" y1="13" x2="26" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="26" cy="20" r="1.2" fill="white" />
  </svg>
);

export default Logo;
