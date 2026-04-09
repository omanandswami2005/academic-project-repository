/**
 * Format a date string/Date to IST dd/mm/yyyy format.
 * @param {string|Date} date
 * @param {object} opts - { time: boolean } to include time
 * @returns {string}
 */
export function formatDateIST(date, { time = false } = {}) {
    if (!date) return '–'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '–'

    const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(time ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
    }

    return d.toLocaleString('en-IN', options)
}
