export function Avatars({ names = ['JD', 'KL', 'SR', '+6'] }: { names?: string[] }) {
  return (
    <div className="avatars" aria-label="Attendees">
      {names.map((name) => (
        <span key={name}>{name}</span>
      ))}
    </div>
  )
}
