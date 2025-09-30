/**
 * Format a date to a relative string (Today, Tomorrow, Yesterday, or MM/DD)
 */
function formatRelativeDate(date: Date | string): string {
	if (!date) return ''

	const dueDate = new Date(date)
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)

	if (dueDate.toDateString() === today.toDateString()) {
		return 'Today'
	}

	if (dueDate.toDateString() === tomorrow.toDateString()) {
		return 'Tomorrow'
	}

	if (dueDate.toDateString() === yesterday.toDateString()) {
		return 'Yesterday'
	}

	return dueDate.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	})
}

/**
 * Check if a date is overdue (before today)
 */
function isDateOverdue(date: Date | string): boolean {
	if (!date) return false

	const checkDate = new Date(date)
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return checkDate < today
}

/**
 * Format a date to ISO string date (YYYY-MM-DD)
 */
function formatISODate(date: Date = new Date()): string {
	return date.toISOString().split('T')[0]
}

export const formatDate = (date: Date | number): string => {
	const d = new Date(date)
	return d.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
}

export const formatDateTime = (date: Date | number): string => {
	// return YYYY-MM-DD hh:mm:ss
	const d = new Date(date)
	return d.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

export { formatRelativeDate, isDateOverdue, formatISODate }
