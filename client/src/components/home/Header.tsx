import { CirclePlay, Menu, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { User } from '@/lib/auth'

export function Header({
  menuOpen,
  setMenuOpen,
  setModal,
  user,
  onLogout,
}: {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  setModal: (modal: string) => void
  /** `undefined` while the app is still finding out whether someone is signed in. */
  user: User | null | undefined
  onLogout: () => void
}) {
  // Until that is known, the sign-in controls keep their space but stay hidden, so a signed-in
  // user does not see "Sign In" flash by on every page load.
  const hiddenWhileLoading = user === undefined ? 'invisible' : ''
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : ''
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
          {user ? (
            <Button variant="ghost" className="hidden min-[581px]:inline-flex" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <Button
              variant="ghost"
              className={`hidden min-[581px]:inline-flex ${hiddenWhileLoading}`}
              onClick={() => openModal('signin')}
            >
              Sign In
            </Button>
          )}
          <Button className="hidden min-[581px]:inline-flex" onClick={() => openModal('demo')}>
            <CirclePlay />
            Try Demo ? Guest
          </Button>
          {user ? (
            <Avatar
              className="size-9"
              role="img"
              aria-label={`Signed in as ${fullName}`}
              title={`${fullName} (${user.email})`}
            >
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {(user.firstName.slice(0, 1) + user.lastName.slice(0, 1)).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button
              size="icon"
              className={`size-9 rounded-full ${hiddenWhileLoading}`}
              aria-label="Sign in to your account"
              onClick={() => openModal('signin')}
            >
              <UserRound />
            </Button>
          )}
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
                {/* The header's own Log out button is hidden on small screens. */}
                {user && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                  >
                    Log out
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
