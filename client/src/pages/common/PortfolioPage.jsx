import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Star, Folder, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { portfolioAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const PortfolioPage = () => {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [portfolio, setPortfolio] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const { data } = await portfolioAPI.get(userId)
                setPortfolio(data.portfolio)
            } catch {
                toast.error('Failed to load portfolio')
            } finally {
                setLoading(false)
            }
        }
        fetchPortfolio()
    }, [userId])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    if (loading) {
        return (
            <DashboardLayout onLogout={handleLogout}>
                <main className="page-content">
                    <p style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading portfolio...</p>
                </main>
            </DashboardLayout>
        )
    }

    if (!portfolio) {
        return (
            <DashboardLayout onLogout={handleLogout}>
                <main className="page-content">
                    <p style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Portfolio not found.</p>
                </main>
            </DashboardLayout>
        )
    }

    const { user, projects, stats } = portfolio

    return (
        <DashboardLayout onLogout={handleLogout}>
            <main className="page-content">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
                        Back
                    </Button>

                    {/* Profile Header */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
                            {(user.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ margin: '0 0 4px' }}>{user.username}</h1>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 8px' }}>
                                {user.branch} · {user.year || 'N/A'}
                            </p>
                            {user.bio && <p style={{ margin: 0 }}>{user.bio}</p>}
                            {user.skills && user.skills.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {user.skills.map((s, i) => (
                                        <span key={i} style={{ padding: '2px 10px', background: 'var(--accent-subtle)', borderRadius: '20px', fontSize: '0.8125rem' }}>{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Projects', value: stats.totalProjects, icon: Folder },
                            { label: 'Total Stars', value: stats.totalStars, icon: Star },
                            { label: 'Phases Done', value: stats.completedPhases, icon: CheckCircle },
                            { label: 'Total Phases', value: stats.totalPhases, icon: User },
                        ].map(s => (
                            <div key={s.label} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                                <s.icon size={20} style={{ color: 'var(--accent)', marginBottom: '4px' }} />
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0' }}>{s.label}</p>
                                <strong style={{ fontSize: '1.5rem' }}>{s.value}</strong>
                            </div>
                        ))}
                    </div>

                    {/* Projects */}
                    <h2 style={{ marginBottom: '16px' }}>Projects</h2>
                    {projects.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No public projects to display.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {projects.map(project => {
                                const completedPhases = (project.phases || []).filter(p => p.completed).length
                                const totalPhases = (project.phases || []).length
                                return (
                                    <div key={project.id} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px' }}>{project.title}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 8px' }}>
                                                    {project.uniqueProjectId} · ★ {project.stars || 0} · <span className={`status-chip ${project.status}`}>{project.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <p style={{ margin: '0 0 12px' }}>{project.description?.substring(0, 200)}</p>
                                        {(project.domainTags || []).length > 0 && (
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                {project.domainTags.map((tag, i) => (
                                                    <span key={i} style={{ padding: '2px 10px', background: 'var(--accent-subtle)', borderRadius: '20px', fontSize: '0.8125rem' }}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, background: 'var(--border-primary)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                                                <div style={{ width: `${totalPhases ? (completedPhases / totalPhases) * 100 : 0}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }} />
                                            </div>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{completedPhases}/{totalPhases}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    )
}

export default PortfolioPage
