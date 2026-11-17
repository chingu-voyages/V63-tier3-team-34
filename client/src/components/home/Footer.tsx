import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
const copyrightYear = new Date().getFullYear()
export function Footer({ setModal }: { setModal: (modal: string) => void }) {
  return (
    <footer className="bg-muted">
      <div className="mx-auto flex max-w-370 flex-wrap items-center justify-between gap-4.5 px-10 py-11 text-[13px] max-[580px]:px-5.5 max-[580px]:py-7.5 [&_nav]:flex [&_nav]:flex-wrap [&_nav]:items-center [&_nav]:gap-1">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <span className="inline-flex size-8 shrink-0 [&_img]:size-full [&_img]:object-contain">
            <img src="/logo.png" alt="" width={27} height={27} loading="lazy" />
          </span>
          EventAI
        </Link>
        <p>© {copyrightYear} EventAI Technologies Inc. All rights reserved.</p>
        <nav aria-label="Footer navigation">
          <Button variant="link" size="sm" asChild>
            <a
              href="https://github.com/chingu-voyages/V63-tier3-team-34"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub repository
            </a>
          </Button>
          {['Privacy', 'Terms', 'Contact', 'Security'].map((link) => (
            <Button variant="ghost" size="sm" key={link} onClick={() => setModal(link)}>
              {link}
            </Button>
          ))}
        </nav>
      </div>
    </footer>
  )
}
