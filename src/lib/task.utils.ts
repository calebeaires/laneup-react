import type { _TaskType } from '@/types';

/**
 * Get the status label for a task status
 */
function getStatusLabel(status: string): string {
	const statusMap: Record<string, string> = {
		todo: 'To Do',
		'in-progress': 'In Progress',
		review: 'Review',
		done: 'Done'
	};

	return statusMap[status] || 'Unknown';
}

/**
 * Get the priority label for a task priority
 */
function getPriorityLabel(priority: string): string {
	const priorityMap: Record<string, string> = {
		low: 'Low',
		medium: 'Medium',
		high: 'High',
		urgent: 'Urgent'
	};

	return priorityMap[priority] || 'Unknown';
}

/**
 * Get the CSS class for a task status
 */
function getStatusClass(status: string): string {
	const statusClassMap: Record<string, string> = {
		todo: 'status-todo',
		'in-progress': 'status-progress',
		review: 'status-review',
		done: 'status-done'
	};

	return statusClassMap[status] || '';
}

/**
 * Get the CSS class for a task priority
 */
function getPriorityClass(priority: string): string {
	const priorityClassMap: Record<string, string> = {
		low: 'priority-low',
		medium: 'priority-medium',
		high: 'priority-high',
		urgent: 'priority-urgent'
	};

	return priorityClassMap[priority] || '';
}

/**
 * Get initials from a string (e.g., "Task Name" -> "TN")
 */
function getInitials(text: string): string {
	if (!text) return '?';

	return text
		.split(' ')
		.map((word) => word.charAt(0))
		.join('')
		.toUpperCase()
		.substring(0, 2);
}

/**
 * Filter tasks by status
 */
function filterTasksByStatus(tasks: _TaskType[], status: string): _TaskType[] {
	return tasks.filter((task) => task.status === status);
}

/**
 * Filter tasks by priority
 */
function filterTasksByPriority(
	tasks: _TaskType[],
	priority: string
): _TaskType[] {
	return tasks.filter((task) => task.priority === priority);
}

/**
 * Count tasks by status
 */
function countTasksByStatus(tasks: _TaskType[]): Record<string, number> {
	const counts: Record<string, number> = {
		todo: 0,
		'in-progress': 0,
		review: 0,
		done: 0
	};

	tasks.forEach((task) => {
		if (counts[task.status] !== undefined) {
			counts[task.status]++;
		}
	});

	return counts;
}

/**
 * Count tasks by priority
 */
function countTasksByPriority(tasks: _TaskType[]): Record<string, number> {
	const counts: Record<string, number> = {
		low: 0,
		medium: 0,
		high: 0,
		urgent: 0
	};

	tasks.forEach((task) => {
		if (counts[task.priority] !== undefined) {
			counts[task.priority]++;
		}
	});

	return counts;
}

export {
	getStatusLabel,
	getPriorityLabel,
	getStatusClass,
	getPriorityClass,
	getInitials,
	filterTasksByStatus,
	filterTasksByPriority,
	countTasksByStatus,
	countTasksByPriority
};
