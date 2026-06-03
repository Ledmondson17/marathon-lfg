import { Link } from 'react-router-dom'

const CLASSES = ['Recon', 'Vandal', 'Destroyer', 'Assassin', 'Thief', 'Triage', 'Sentinel']

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Find Your{' '}
          <span className="text-brand-accent">Squad</span>
          <br />
          in Marathon
        </h1>
        <p className="text-brand-muted text-lg mb-10 max-w-xl mx-auto">
          Shell Searcher helps you build your player profile, show off your
          playstyle, and connect with teammates who match your vibe. Find that
          consistent team you've been looking for and run together.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="bg-brand-accent hover:bg-brand-accentHover text-white px-8 py-3 rounded font-semibold transition-colors"
          >
            Create Profile
          </Link>
          <Link
            to="/players"
            className="bg-brand-card border border-brand-border hover:border-brand-accent text-brand-text px-8 py-3 rounded font-semibold transition-colors"
          >
            Browse Players
          </Link>
        </div>
      </section>

      {/* Classes preview */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-brand-muted text-xs font-semibold uppercase tracking-widest mb-4 text-center">
          Available Classes
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CLASSES.map((cls) => (
            <div
              key={cls}
              className="bg-brand-card border border-brand-border rounded-lg p-3 text-center"
            >
              <span className="text-brand-text text-sm font-medium">{cls}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
