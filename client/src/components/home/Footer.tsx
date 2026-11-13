const copyrightYear = new Date().getFullYear()
export function Footer({ setModal }: { setModal: (modal: string) => void }) {
  return (
    <footer>
      <div className="footer-shell">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <img src="/logo.png" alt="" width={27} height={27} loading="lazy" />
          </span>
          EventAI
        </Link>
        <p>© {copyrightYear} EventAI Technologies Inc. All rights reserved.</p>
        <nav aria-label="Footer navigation">
          <a
            href="https://github.com/chingu-voyages/V63-tier3-team-34"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          {['Privacy', 'Terms', 'Contact', 'Security'].map((link) => (
            <button key={link} onClick={() => setModal(link)}>
              {link}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  )
}
import { Link } from 'react-router-dom'
