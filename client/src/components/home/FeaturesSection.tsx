import { Dispatch } from './Dispatch'

export function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="section-shell">
        <div className="section-heading features-heading">
          <div>
            <span className="eyebrow mint">MODERN HOST SUPERPOWERS</span>
            <h2>Built for modern community builders</h2>
          </div>
          <p>
            Everything you love about intimate social gatherings, backed by frictionless
            enterprise-grade infrastructure.
          </p>
        </div>
        <div className="features-grid">
          <article className="feature-card">
            <span className="icon-tile asset-tile">
              <img src="/icon3.png" alt="" width={52} height={52} loading="lazy" />
            </span>
            <h3>Automated Guest Comms</h3>
            <p>
              Send personalized SMS and email updates with doors opening, parking codes, or surprise
              speaker announcements without unmanageable chaotic group chats.
            </p>
            <Dispatch />
            <div className="chat-bubble">Just walked in, looks insane! 🔥</div>
            <div className="feature-tags">
              <span>99.2% Deliverability</span>
              <span>Zero Spam Filter</span>
            </div>
          </article>
          <article className="feature-card">
            <span className="icon-tile asset-tile">
              <img src="/icon2.png" alt="" width={52} height={52} loading="lazy" />
            </span>
            <h3>Effortless Check-in Telemetry</h3>
            <p>
              Scan tickets in sub-second bursts at the entrance. Track live capacity, ingress pace,
              and VIP guest arrivals in real time from any smartphone.
            </p>
            <div className="chart">
              <div>
                <strong>Live Door Ingress Rate</strong>
                <span>4.2 scans / min</span>
              </div>
              <img
                className="telemetry-chart"
                src="/chart.png"
                alt="Door entry rate rises through the evening, peaks around 8:15 PM, and eases by 9:00 PM."
                width={640}
                height={360}
                loading="lazy"
              />
            </div>
            <div className="feature-tags">
              <span className="green-tag">0.3s Scan Latency</span>
              <span>Offline Capable</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
