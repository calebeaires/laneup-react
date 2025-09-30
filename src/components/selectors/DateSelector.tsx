'use client';

import { useMutation } from 'convex/react';
import { Calendar as CalendarIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { api } from '#/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { _TaskDateRangeType, TaskId } from '@/types';

interface DateSelectorProps {
	taskId?: TaskId;
	dateRange?: _TaskDateRangeType | null;
	defaultDateRange?: _TaskDateRangeType | null;
	onDateRangeChange?: (dateRange: _TaskDateRangeType | null) => void;
	className?: string;
	placeholder?: string;
}

function parseDate(value?: string) {
	if (!value) return undefined;
	const timestamp = Date.parse(value);
	if (Number.isNaN(timestamp)) return undefined;
	return new Date(timestamp);
}

function toISODate(value?: Date) {
	if (!value) return undefined;
	return value.toISOString();
}

function toCalendarRange(
	value?: _TaskDateRangeType | null
): DateRange | undefined {
	if (!value) return undefined;
	const from = parseDate(value.start);
	const to = parseDate(value.end);
	if (!from && !to) return undefined;
	return { from, to };
}

function normalizeRange(
	value?: _TaskDateRangeType | null
): _TaskDateRangeType | null {
	if (!value) return null;
	const start = value.start ?? undefined;
	const end = value.end ?? undefined;
	if (!start && !end) return null;
	const normalized: _TaskDateRangeType = {};
	if (start) normalized.start = start;
	if (end) normalized.end = end;
	return normalized;
}

function areRangesEqual(
	left?: _TaskDateRangeType | null,
	right?: _TaskDateRangeType | null
) {
	const normalizedLeft = normalizeRange(left);
	const normalizedRight = normalizeRange(right);
	return (
		(normalizedLeft?.start ?? null) === (normalizedRight?.start ?? null) &&
		(normalizedLeft?.end ?? null) === (normalizedRight?.end ?? null)
	);
}

function formatRangeLabel(value?: _TaskDateRangeType | null) {
	const startDate = parseDate(value?.start);
	const endDate = parseDate(value?.end);

	if (startDate && endDate) {
		const sameYear = startDate.getFullYear() === endDate.getFullYear();
		const startFormat = sameYear
			? startDate.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric'
				})
			: startDate.toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric'
					// year: 'numeric'
				});
		const endFormat = endDate.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
			// year: 'numeric'
		});
		return `${startFormat} - ${endFormat}`;
	}

	if (startDate) {
		return `Starts ${startDate.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
			// year: 'numeric'
		})}`;
	}

	if (endDate) {
		return `Due ${endDate.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
			// year: 'numeric'
		})}`;
	}

	return 'No dates';
}

export function DateSelector({
	taskId,
	dateRange,
	defaultDateRange,
	onDateRangeChange,
	className,
	placeholder = ''
}: DateSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const id = useId();
	const [open, setOpen] = useState(false);

	const [internalValue, setInternalValue] = useState<_TaskDateRangeType | null>(
		defaultDateRange ?? dateRange ?? null
	);
	const [draftRange, setDraftRange] = useState<
		_TaskDateRangeType | null | undefined
	>(undefined);

	const isControlled = dateRange !== undefined;
	const value = isControlled ? (dateRange ?? null) : internalValue;

	useEffect(() => {
		if (!isControlled && defaultDateRange) {
			setInternalValue(defaultDateRange);
		}
	}, [defaultDateRange, isControlled]);

	useEffect(() => {
		if (!isControlled) return;
		if (dateRange === undefined) return;
		setInternalValue(dateRange);
	}, [dateRange, isControlled]);

	const displayedCalendarValue = useMemo(() => {
		const source = open && draftRange !== undefined ? draftRange : value;
		return toCalendarRange(source ?? null);
	}, [draftRange, open, value]);

	const label = useMemo(() => {
		if (!value || (!value.start && !value.end)) {
			return placeholder;
		}
		return formatRangeLabel(value);
	}, [placeholder, value]);

	const commitRange = useCallback(
		(nextRange: _TaskDateRangeType | null) => {
			if (areRangesEqual(nextRange, value ?? null)) {
				return;
			}

			const normalizedNext = normalizeRange(nextRange);
			if (!isControlled) {
				setInternalValue(normalizedNext);
			}

			// If taskId is defined, update the task in the database
			if (taskId) {
				updateTask({
					_id: taskId,
					dateRange: normalizedNext || {}
				});
			} else {
				// If no taskId, use the callback for task creation
				onDateRangeChange?.(normalizedNext);
			}
		},
		[isControlled, onDateRangeChange, value, taskId, updateTask]
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			setDraftRange(normalizeRange(value));
			setOpen(true);
			return;
		}

		const rangeToCommit =
			draftRange === undefined ? normalizeRange(value) : draftRange;
		commitRange(rangeToCommit ?? null);
		setDraftRange(undefined);
		setOpen(false);
	};

	const handleSelect = (next?: DateRange) => {
		if (!next || (!next.from && !next.to)) {
			setDraftRange(null);
			return;
		}

		const normalizedSelection = normalizeRange({
			start: toISODate(next.from),
			end: toISODate(next.to)
		});
		setDraftRange(normalizedSelection);
	};

	const handleClear = () => {
		setDraftRange(null);
		commitRange(null);
	};

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						variant='ghost'
						className='h-7 px-1.5'
						aria-label='Select date range'
					>
						<Badge
							variant='outline'
							className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
							title={label}
						>
							<CalendarIcon className='size-3.5 text-muted-foreground' />
							{label ? <span className='truncate'>{label}</span> : null}
						</Badge>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='end'>
					<Calendar
						mode='range'
						selected={displayedCalendarValue}
						onSelect={handleSelect}
						initialFocus
					/>
					<div className='flex items-center justify-between border-t px-2 py-2'>
						<span className='text-xs text-muted-foreground'>
							Select start and end dates
						</span>
						<Button
							variant='ghost'
							size='sm'
							onClick={handleClear}
							className='h-7'
						>
							<XIcon className='mr-1 size-3.5' />
							Clear
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
