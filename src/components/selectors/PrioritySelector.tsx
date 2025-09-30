'use client';

import { useMutation } from 'convex/react';
import { CheckIcon, Circle, Flag, MinusCircle } from 'lucide-react';
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
import { defaultPriorityList } from '@/lib';
import type { TaskId } from '@/types';

const ICON_MAP = {
	flag: Flag,
	minusCircle: MinusCircle
} as const;

interface PrioritySelectorProps {
	taskId?: TaskId;
	priorityId?: string;
	defaultPriorityId?: string;
	onPriorityChange?: (priorityId: string) => void;
	showLabel?: boolean;
}

export function PrioritySelector({
	taskId,
	priorityId,
	defaultPriorityId,
	onPriorityChange,
	showLabel = false
}: PrioritySelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [internalValue, setInternalValue] = useState<string>(
		defaultPriorityId ?? priorityId ?? defaultPriorityList[0]?._id ?? ''
	);

	const isControlled = priorityId !== undefined;
	const value = isControlled ? (priorityId ?? '') : internalValue;

	useEffect(() => {
		if (!isControlled && defaultPriorityId) {
			setInternalValue(defaultPriorityId);
		}
	}, [defaultPriorityId, isControlled]);

	const selectedPriority = useMemo(
		() => defaultPriorityList.find((item) => item._id === value),
		[value]
	);

	const handlePriorityChange = (_id: string) => {
		if (!isControlled) {
			setInternalValue(_id);
		}

		// If taskId is defined, update the task in the database
		if (taskId) {
			updateTask({
				_id: taskId,
				priority: _id as 'low' | 'medium' | 'high' | 'urgent' | 'none' | null
			});
		} else {
			// If no taskId, use the callback for task creation
			onPriorityChange?.(_id);
		}

		setOpen(false);
	};

	const SelectedIcon = selectedPriority
		? (ICON_MAP[selectedPriority.icon as keyof typeof ICON_MAP] ?? Circle)
		: null;

	const labelText = selectedPriority?.name
		? selectedPriority.name.replace('priority.', '')
		: '';

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
					>
						{SelectedIcon ? (
							<Badge
								variant='outline'
								className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
								title={labelText || 'Priority'}
							>
								<SelectedIcon
									className='size-3.5 text-muted-foreground'
									style={{ color: selectedPriority?.color }}
								/>
								{showLabel && labelText ? (
									<span className='truncate'>{labelText}</span>
								) : null}
							</Badge>
						) : null}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
					align='start'
				>
					<Command>
						<CommandInput placeholder='Set priority...' />
						<CommandList>
							<CommandEmpty>No priority found.</CommandEmpty>
							<CommandGroup>
								{defaultPriorityList.map((item) => {
									const ItemIcon =
										ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? Circle;
									const itemLabel = (item.name || '').replace('priority.', '');

									return (
										<CommandItem
											key={item._id}
											value={item._id as string | undefined}
											onSelect={handlePriorityChange}
											className='flex items-center justify-between'
										>
											<div className='flex items-center gap-2'>
												<ItemIcon
													className='size-4 text-muted-foreground'
													style={{ color: item.color }}
												/>
												<span>{itemLabel}</span>
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
