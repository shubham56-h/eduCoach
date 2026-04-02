import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Home = () => {
  const features = [
    {
      title: 'Student Panel',
      desc: 'Register, view your batch details, class schedule, attendance records, and performance reports all in one place.',
    },
    {
      title: 'Faculty Panel',
      desc: 'Manage batch attendance, upload study materials, record test marks, and monitor student performance.',
    },
    {
      title: 'Admin Panel',
      desc: 'Manage students and faculty accounts, create batches, schedule classes, and maintain complete system records.',
    },
  ];

  const stats = [
    { label: 'Manage Batches', value: 'Batches' },
    { label: 'Track Attendance', value: 'Attendance' },
    { label: 'Monitor Results', value: 'Performance' },
    { label: 'Study Materials', value: 'Materials' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)' }}>

      {/* Navbar */}
      <nav style={{
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size={32} />
          <span style={{ fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            EduCoach
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.35rem 1rem',
          borderRadius: '99px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          letterSpacing: '0.04em',
        }}>
          Coaching Class Management System
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          lineHeight: '1.15',
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em',
        }}>
          Manage Your Coaching Class{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Digitally
          </span>
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          lineHeight: '1.7',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
        }}>
          A complete platform to manage student enrollment, batch allocation, attendance tracking,
          academic performance, and study materials — all in one place.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            padding: '0.875rem 2rem',
            borderRadius: '10px',
            background: '#6366f1',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
          }}>
            Get Started
          </Link>
          <Link to="/login" style={{
            padding: '0.875rem 2rem',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#cbd5e1',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
          }}>
            Login
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{
        maxWidth: '900px',
        margin: '3rem auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#818cf8', fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{s.value}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</p>
          </div>
        ))}
      </section>

      {/* About */}
      <section style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '0 2rem',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '2.5rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#fff' }}>
            About This System
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '1rem' }}>
            EduCoach is a Coaching Class Management System designed to digitalize the day-to-day
            operations of a coaching institute. It eliminates paperwork and manual tracking by
            providing a centralized platform for students, faculty, and administrators.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
            Students can register, view their batch and schedule, track attendance, and check
            performance reports. Faculty can manage attendance, upload study materials, and record
            test marks. Admins have full control over users, batches, schedules, and system records.
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '0 2rem',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#fff' }}>
          What Each Role Can Do
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '14px',
              padding: '1.75rem',
              transition: 'border-color 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#818cf8', marginBottom: '0.75rem' }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '900px',
        margin: '2rem auto 4rem',
        padding: '0 2rem',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Students can register directly. Faculty accounts are created by the admin.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              background: '#6366f1',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
            }}>
              Student Register
            </Link>
            <Link to="/login" style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#cbd5e1',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
            }}>
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}>
        EduCoach — Coaching Class Management System
      </footer>

    </div>
  );
};

export default Home;
