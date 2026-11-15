import { CirclePlay, Menu, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Link } from 'react-router-dom'

export function Header({
  menuOpen,
  setMenuOpen,
  setModal,
}: {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  setModal: (modal: string) => void
}) {
  const openModal = (modal: string) => {
    setMenuOpen(false)
    setModal(modal)
  }
  const navigation = (
    <>
      <Button variant="ghost" asChild>
        <Link to="/#features" onClick={() => setMenuOpen(false)}>
          Features
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/#how-it-works" onClick={() => setMenuOpen(false)}>
          How it works
        </Link>
      </Button>
      <Button variant="ghost" onClick={() => openModal('demo')}>
        Live Demo
      </Button>
      <Button variant="ghost" onClick={() => openModal('Pricing')}>
        Pricing
      </Button>
    </>
  )
  return (
    <header className="bg-background">
      <div className="mx-auto flex max-w-370 items-center gap-10.5 px-10 py-5.75 max-[1150px]:gap-6 max-[1150px]:px-7 max-[850px]:px-5.5 max-[850px]:py-4.5">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <img src="/logo.png" alt="" className="size-10 object-contain" />
          EventAI
        </Link>
        <nav className="hidden items-center gap-3 min-[851px]:flex" aria-label="Main navigation">
          {navigation}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden min-[581px]:inline-flex"
            onClick={() => openModal('signin')}
          >
            Sign In
          </Button>
          <Button className="hidden min-[581px]:inline-flex" onClick={() => openModal('demo')}>
            <CirclePlay />
            Try Demo ? Guest
          </Button>
          <Button
            size="icon"
            className="size-9 rounded-full"
            aria-label="Sign in to your account"
            onClick={() => openModal('signin')}
          >
            <UserRound />
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-[851px]:hidden"
                aria-label="Toggle navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>EventAI</SheetTitle>
                <SheetDescription>Explore events and hosting tools.</SheetDescription>
              </SheetHeader>
              <nav
                className="flex flex-col items-stretch gap-2 px-4"
                aria-label="Mobile navigation"
              >
                {navigation}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
