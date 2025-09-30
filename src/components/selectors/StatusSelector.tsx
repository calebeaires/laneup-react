'use client';

import { useMutation } from 'convex/react';
import {
	CheckIcon,
	CircleCheckBig,
	CircleDashed,
	CircleDot,
	CircleDotDashed,
	CircleSlash,
	Circle as DefaultCircle
} from 'lucide-react';
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
import type { _ProjectStatusType, TaskId } from '@/types';

const STATUS_ICON_MAP: Record<string, typeof DefaultCircle> = {
	backlog: CircleDashed,
	todo: CircleDotDashed,
	inProgress: CircleDot,
	done: CircleCheckBig,
	cancelled: CircleSlash
};

interface StatusSelectorProps {
	taskId?: TaskId;
	statusId?: string;
	defaultStatusId?: string;
	onStatusChange?: (statusId: string) => void;
	showLabel?: boolean;
}

export function StatusSelector({
	taskId,
	statusId,
	defaultStatusId,
	onStatusChange,
	showLabel = false
}: StatusSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);

	const project = useCurrentProject();
	const id = useId();
	const [open, setOpen] = useState(false);

	const availableStatuses = useMemo(() => {
		return (
			project?.status?.filter((item: _ProjectStatusType) => !item.deleted) || []
		);
	}, [project?.status]);

	const [internalValue, setInternalValue] = useState(
		defaultStatusId ?? statusId ?? ''
	);

	const isControlled = statusId !== undefined;
	const value = isControlled ? (statusId ?? '') : internalValue;

	useEffect(() => {
		if (!isControlled && defaultStatusId) {
			setInternalValue(defaultStatusId);
		}
	}, [defaultStatusId, isControlled]);

	useEffect(() => {
		if (isControlled) return;
		if (!availableStatuses.length) return;
		if (
			internalValue &&
			!availableStatuses.some((item) => item._id === internalValue)
		) {
			setInternalValue('');
		}
	}, [availableStatuses, internalValue, isControlled]);

	const selectedStatus = useMemo(
		() => availableStatuses.find((item) => item._id === value),
		[availableStatuses, value]
	);

	const SelectedIcon = selectedStatus
		? (STATUS_ICON_MAP[selectedStatus.group ?? ''] ?? DefaultCircle)
		: DefaultCircle;

	const handleStatusChange = (_id: string) => {
		if (!isControlled) {
			setInternalValue(_id);
		}

		// If taskId is defined, update the task in the database
		if (taskId) {
			updateTask({
				_id: taskId,
				status: _id
			});
		} else {
			// If no taskId, use the callback for task creation
			onStatusChange?.(_id);
		}

		setOpen(false);
	};

	const badgeLabel = selectedStatus?.name;

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
						disabled={availableStatuses.length === 0}
					>
						<Badge
							variant='outline'
							className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
							title={badgeLabel || 'Status'}
						>
							<SelectedIcon
								className='size-3.5 text-muted-foreground'
								style={{
									color: selectedStatus?.color
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
						<CommandInput placeholder='Set status...' />
						<CommandList>
							<CommandEmpty>No status found.</CommandEmpty>
							<CommandGroup>
								{availableStatuses.map((item) => {
									const ItemIcon =
										STATUS_ICON_MAP[item.group ?? ''] ?? DefaultCircle;

									return (
										<CommandItem
											key={item._id}
											value={item._id}
											onSelect={handleStatusChange}
											className='flex items-center justify-between'
										>
											<div className='flex items-center gap-2'>
												<ItemIcon
													className='size-4'
													style={{ color: item.color }}
												/>
												<span>{item.name}</span>
											</div>
											{value === item._id ? (
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
