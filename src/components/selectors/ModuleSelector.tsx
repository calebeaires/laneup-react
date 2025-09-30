'use client';

import { useMutation } from 'convex/react';
import { Boxes, CheckIcon } from 'lucide-react';
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
import type { _ProjectModuleType, TaskId } from '@/types';

interface ModuleSelectorProps {
	taskId?: TaskId;
	moduleId?: string;
	defaultModuleId?: string;
	onModuleChange?: (moduleId: string) => void;
	showLabel?: boolean;
}

export function ModuleSelector({
	taskId,
	moduleId,
	defaultModuleId,
	onModuleChange,
	showLabel = false
}: ModuleSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const project = useCurrentProject();
	const id = useId();
	const [open, setOpen] = useState(false);

	const availableModules = useMemo(() => {
		return (
			project?.module?.filter((item: _ProjectModuleType) => !item.deleted) || []
		);
	}, [project?.module]);

	const [internalValue, setInternalValue] = useState(
		defaultModuleId ?? moduleId ?? ''
	);

	const isControlled = moduleId !== undefined;
	const value = isControlled ? (moduleId ?? '') : internalValue;

	useEffect(() => {
		if (!isControlled && defaultModuleId) {
			setInternalValue(defaultModuleId);
		}
	}, [defaultModuleId, isControlled]);

	useEffect(() => {
		if (isControlled) return;
		if (!availableModules.length) return;
		if (
			internalValue &&
			!availableModules.some((item) => item._id === internalValue)
		) {
			setInternalValue('');
		}
	}, [availableModules, internalValue, isControlled]);

	const selectedModule = useMemo(
		() => availableModules.find((item) => item._id === value),
		[availableModules, value]
	);

	const handleModuleChange = (_id: string) => {
		if (!isControlled) {
			setInternalValue(_id);
		}

		// If taskId is defined, update the task in the database
		if (taskId) {
			updateTask({
				_id: taskId,
				module: _id
			});
		} else {
			// If no taskId, use the callback for task creation
			onModuleChange?.(_id);
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
						disabled={availableModules.length === 0}
					>
						<Badge
							variant='outline'
							className='h-5 min-w-5 rounded-sm px-1 justify-start gap-1'
							title={selectedModule?.name || 'Module'}
						>
							<Boxes
								className='size-3.5 text-muted-foreground'
								style={{ color: selectedModule?.color }}
							/>
							{showLabel && selectedModule ? (
								<span className='truncate'>{selectedModule.name}</span>
							) : null}
						</Badge>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
					align='start'
				>
					<Command>
						<CommandInput placeholder='Set module...' />
						<CommandList>
							<CommandEmpty>No module found.</CommandEmpty>
							<CommandGroup>
								{availableModules.map((item) => (
									<CommandItem
										key={item._id}
										value={item._id}
										onSelect={handleModuleChange}
										className='flex items-center justify-between'
									>
										<div className='flex items-center gap-2'>
											<Boxes className='size-4' style={{ color: item.color }} />
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
