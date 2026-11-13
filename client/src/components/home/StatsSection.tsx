export function StatsSection() {
  return (
    <section className="stats-band" aria-label="EventAI in numbers">
      <div className="section-shell stats-grid">
        {[
          { image: '/icon1.png', value: '60s', label: 'Draft to Live Launch' },
          { image: '/icon2.png', value: '1-Tap', label: 'RSVP & Frictionless QR Entry' },
          { image: '/icon4.png', value: '98.4%', label: 'Verified Guest Turnout Rate' },
        ].map(({ image, value, label }) => (
          <div className="stat-card" key={value}>
            <span className="icon-tile asset-tile">
              <img src={image} alt="" width={52} height={52} loading="lazy" />
            </span>
            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
