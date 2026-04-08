import { useState } from 'react'
import { Sidebar, Menu, MenuItem, sidebarClasses } from 'react-pro-sidebar'
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react'
import './AppSidebar.css'

/**
 * AppSidebar — reusable collapsible sidebar built on react-pro-sidebar.
 *
 * Props:
 *   items          — array of { id, label, icon: LucideIcon, separator? }
 *   activeSection  — currently active section id
 *   onSectionChange(id) — called when user clicks an item
 *   username       — display name shown in the footer
 *   role           — role label shown in header and footer
 *   onLogout       — called when the user clicks Logout
 */
const AppSidebar = ({ items = [], activeSection, onSectionChange, username, role, onLogout }) => {
    const [collapsed, setCollapsed] = useState(false)

    const initials = (name = '') =>
        (name || '')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?'

    return (
        <Sidebar
            collapsed={collapsed}
            width="260px"
            collapsedWidth="68px"
            rootStyles={{
                position: 'sticky',
                top: '56px',
                height: 'calc(100dvh - 56px)',
                flexShrink: 0,
                zIndex: 10,
                [`.${sidebarClasses.container}`]: {
                    backgroundColor: 'var(--bg-primary)',
                    borderRight: '1px solid var(--border-primary)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                },
            }}
        >
            {/* ── Header ── */}
            <div className={`ps-header ${collapsed ? 'ps-header--collapsed' : ''}`}>
                {!collapsed && (
                    <div className="ps-header-title">
                        <span className="ps-header-app">RSCOE</span>
                        <span className="ps-header-role">{role}</span>
                    </div>
                )}
                <button
                    type="button"
                    className="ps-toggle"
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
                </button>
            </div>

            {/* ── Navigation items ── */}
            <Menu
                menuItemStyles={{
                    button: ({ active }) => ({
                        margin: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontFamily: 'inherit',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--accent-text)' : 'var(--text-muted)',
                        backgroundColor: active ? 'var(--accent)' : 'transparent',
                        '&:hover': {
                            backgroundColor: active ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: active ? 'var(--accent-text)' : 'var(--text-primary)',
                        },
                    }),
                    icon: {
                        color: 'inherit',
                    },
                }}
            >
                {items.map((item) => {
                    if (item.separator) {
                        return <div key={item.id} className="ps-separator" />
                    }
                    const Icon = item.icon
                    return (
                        <MenuItem
                            key={item.id}
                            icon={<Icon size={18} />}
                            active={activeSection === item.id}
                            onClick={() => onSectionChange(item.id)}
                            suffix={item.badge > 0 ? <span className="sidebar-badge">{item.badge}</span> : null}
                        >
                            {item.label}
                        </MenuItem>
                    )
                })}
            </Menu>

            {/* ── Push footer to bottom ── */}
            <div className="ps-spacer" />

            {/* ── Footer: avatar + user info + logout ── */}
            <div className={`ps-footer ${collapsed ? 'ps-footer--collapsed' : ''}`}>
                {collapsed ? (
                    <div className="ps-avatar ps-avatar--center">{initials(username)}</div>
                ) : (
                    <div className="ps-user">
                        <div className="ps-avatar">{initials(username)}</div>
                        <div className="ps-user-info">
                            <strong>{username || 'User'}</strong>
                            <span>{role}</span>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    className={`ps-logout ${collapsed ? 'ps-logout--icon' : ''}`}
                    onClick={onLogout}
                    aria-label="Logout"
                >
                    <LogOut size={15} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </Sidebar>
    )
}

export default AppSidebar
