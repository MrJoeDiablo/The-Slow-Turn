import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '60px', fontFamily: 'sans-serif' }}>
      <h1>The Slow Turn</h1>
      <p>Team command center — Safe to port.</p>
      <Link to="/chat" style={{ 
        display: 'inline-block', 
        padding: '12px 24px', 
        backgroundColor: '#0066cc', 
        color: 'white', 
        textDecoration: 'none',
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        Enter Command Center
      </Link>
    </div>
  );
}
