export function BrandLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 rounded-lg`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path
        d="M8 23V9h3.2l4.8 8.4L20.8 9H24v14h-2.8v-8.2L17.6 22h-3.2l-3.6-7.2V23H8z"
        fill="white"
      />
    </svg>
  );
}
