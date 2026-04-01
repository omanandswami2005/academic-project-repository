import './Button.css'

/**
 * Reusable Button component used throughout the app.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {React.ReactNode} icon - optional leading icon
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    className = '',
    type = 'button',
    ...props
}) => {
    const classes = [
        'aprs-btn',
        `aprs-btn--${variant}`,
        `aprs-btn--${size}`,
        fullWidth && 'aprs-btn--full',
        disabled && 'aprs-btn--disabled',
        loading && 'aprs-btn--loading',
        className,
    ].filter(Boolean).join(' ')

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="aprs-btn__spinner" />
            ) : icon ? (
                <span className="aprs-btn__icon">{icon}</span>
            ) : null}
            {children && <span className="aprs-btn__label">{children}</span>}
        </button>
    )
}

export default Button
