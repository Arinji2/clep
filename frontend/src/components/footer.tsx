export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-300 flex-col items-center justify-between border-outline-variant border-t px-6 py-8 md:flex-row md:px-8">
      <div className="mb-4 text-center font-bold text-primary text-sm md:mb-0">
        © {new Date().getFullYear()} CLEP. Networked Clipboard Sharing.
      </div>
      <div className="flex gap-6 font-medium text-on-surface-variant text-xs">
        <a
          href="https://arinji.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-primary"
        >
          Made By Arinji
        </a>
        <a
          href="https://github.com/Arinji2/clep"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-primary"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
