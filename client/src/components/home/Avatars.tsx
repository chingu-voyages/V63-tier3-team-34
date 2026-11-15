import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'

export function Avatars({ names = ['JD', 'KL', 'SR', '+6'] }: { names?: string[] }) {
  return (
    <AvatarGroup className="shrink-0" aria-label="Attendees">
      {names.map((name) => (
        <Avatar key={name} size="sm">
          <AvatarFallback className="bg-[#e3ddff] font-mono text-[10px] font-semibold text-[#2d2171]">
            {name}
          </AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  )
}
