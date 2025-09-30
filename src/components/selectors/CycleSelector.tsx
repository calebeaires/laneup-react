'use client';

import { useMutation } from 'convex/react';
import { CheckIcon, RefreshCcw } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { api } from '#/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { useCurrentProject } from '@/contexts/SpaceContext';
import type { _ProjectCycleType, TaskId } from '@/types';

interface CycleSelectorProps {
	taskId?: TaskId;
	cycleId?: string;
	defaultCycleId?: string;
	onCycleChange?: (cycleId: string) => void;
	showLabel?: boolean;
}

function getCycleId(cycle: _ProjectCycleType) {
	return cycle._id ?? '';
}

function isCycleActive(cycle?: _ProjectCycleType) {
	if (!cycle?.startDate || !cycle?.endDate) return false;

	const now = Date.now();
	const start = Date.parse(cycle.startDate);
	const end = Date.parse(cycle.endDate);

	return (
		Number.isFinite(start) && Number.isFinite(end) && start <= now && now <= end
	);
}

export function CycleSelector({
	taskId,
	cycleId,
	defaultCycleId,
	onCycleChange,
	showLabel = false
}: CycleSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const project = useCurrentProject();
	const id = useId();
	const [open, setOpen] = useState(false);

	const availableCycles = useMemo(() => {
		return (
			project?.cycle?.filter(
				(item: _ProjectCycleType) => item.deleted !== true
			) || []
		);
	}, [project?.cycle]);

	const [internalValue, setInternalValue] = useState(
		defaultCycleId ?? cycleId ?? ''
	);

	const isControlled = cycleId !== undefined;
	const value = isControlled ? (cycleId ?? '') : internalValue;

	useEffect(() => {
		if (!isControlled && defaultCycleId) {
			setInternalValue(defaultCycleId);
		}
	}, [defaultCycleId, isControlled]);

	useEffect(() => {
		if (isControlled) return;
		if (!availableCycles.length) return;
		if (
			internalValue &&
			!availableCycles.some((item) => getCycleId(item) === internalValue)
		) {
			setInternalValue('');
		}
	}, [availableCycles, internalValue, isControlled]);

	const selectedCycle = useMemo(
		() => availableCycles.find((item) => getCycleId(item) === value),
		[availableCycles, value]
	);

	const handleCycleChange = (_id: string) => {
		if (!isControlled) {
			setInternalValue(_id);
		}

		// If taskId is defined, update the task in the database
		if (taskId) {
			updateTask({
				_id: taskId,
				cycle: _id
			});
		} else {
			// If no taskId, use the callback for task creation
			onCycleChange?.(_id);
		}

		setOpen(false);
	};

	const isActive = isCycleActive(selectedCycle);
	const badgeLabel = selectedCycle?.name;

	return (
		<div className='flex items-center'>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id={id}
						className='h-7 px-1.5'
						variant='ghost'
						role='combobox'
						aria-expanded={open}
						disabled={availableCycles.length === 0}
					>
						<Badge
							variant='outline'
							className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
							title={badgeLabel || 'Cycle'}
						>
							<RefreshCcw
								className='size-3.5 text-muted-foreground'
								style={{
									color: selectedCycle?.color,
									opacity: isActive ? 1 : 0.6
								}}
							/>
							{showLabel && badgeLabel ? (
								<span className='truncate'>{badgeLabel}</span>
							) : null}
						</Badge>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
					align='start'
				>
					<Command>
						<CommandInput placeholder='Set cycle...' />
						<CommandList>
							<CommandEmpty>No cycle found.</CommandEmpty>
							<CommandGroup>
								{availableCycles.map((item) => {
									const itemId = getCycleId(item);
									const active = isCycleActive(item);

									return (
										<CommandItem
											key={itemId || item.name}
											value={itemId}
											onSelect={handleCycleChange}
											className='flex items-center justify-between'
										>
											<div className='flex items-center gap-2'>
												<RefreshCcw
													className='size-4'
													style={{
														color: item.color,
														opacity: active ? 1 : 0.6
													}}
												/>
												<span>{item.name}</span>
											</div>
											{value === itemId ? (
												<CheckIcon size={16} className='ml-auto' />
											) : null}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
