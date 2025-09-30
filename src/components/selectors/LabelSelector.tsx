'use client';

import { useMutation } from 'convex/react';
import { CheckIcon, Tag } from 'lucide-react';
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
import type { _ProjectLabelType, TaskId } from '@/types';

interface LabelSelectorProps {
	taskId?: TaskId;
	labelId?: string;
	defaultLabelId?: string;
	onLabelChange?: (labelId: string) => void;
	showLabel?: boolean;
}

export function LabelSelector({
	taskId,
	labelId,
	defaultLabelId,
	onLabelChange,
	showLabel = false
}: LabelSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const project = useCurrentProject();
	const id = useId();
	const [open, setOpen] = useState(false);

	const availableLabels = useMemo(() => {
		return (
			project?.label?.filter((item: _ProjectLabelType) => !item.deleted) || []
		);
	}, [project?.label]);

	const [internalValue, setInternalValue] = useState(
		defaultLabelId ?? labelId ?? ''
	);

	const isControlled = labelId !== undefined;
	const value = isControlled ? (labelId ?? '') : internalValue;

	useEffect(() => {
		if (!isControlled && defaultLabelId) {
			setInternalValue(defaultLabelId);
		}
	}, [defaultLabelId, isControlled]);

	useEffect(() => {
		if (isControlled) return;
		if (!availableLabels.length) return;
		if (
			internalValue &&
			!availableLabels.some((item) => item._id === internalValue)
		) {
			setInternalValue('');
		}
	}, [availableLabels, internalValue, isControlled]);

	const selectedLabel = useMemo(
		() => availableLabels.find((item) => item._id === value),
		[availableLabels, value]
	);

	const handleLabelChange = (_id: string) => {
		if (!isControlled) {
			setInternalValue(_id);
		}

		// If taskId is defined, update the task in the database
		if (taskId) {
			updateTask({
				_id: taskId,
				label: _id
			});
		} else {
			// If no taskId, use the callback for task creation
			onLabelChange?.(_id);
		}

		setOpen(false);
	};

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
						disabled={availableLabels.length === 0}
					>
						<Badge
							variant='outline'
							className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
							title={selectedLabel?.name || 'Label'}
						>
							<Tag
								className='size-3.5 text-muted-foreground'
								style={{ color: selectedLabel?.color }}
							/>
							{showLabel && selectedLabel ? (
								<span className='truncate'>{selectedLabel.name}</span>
							) : null}
						</Badge>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
					align='start'
				>
					<Command>
						<CommandInput placeholder='Set label...' />
						<CommandList>
							<CommandEmpty>No label found.</CommandEmpty>
							<CommandGroup>
								{availableLabels.map((item) => (
									<CommandItem
										key={item._id}
										value={item._id}
										onSelect={handleLabelChange}
										className='flex items-center justify-between'
									>
										<div className='flex items-center gap-2'>
											<Tag className='size-4' style={{ color: item.color }} />
											<span>{item.name}</span>
										</div>
										{value === item._id ? (
											<CheckIcon size={16} className='ml-auto' />
										) : null}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
