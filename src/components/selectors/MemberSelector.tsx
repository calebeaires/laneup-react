'use client';

import { useAuth } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { CheckIcon, UserRound, UserRoundX } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { api } from '#/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { useCurrentProject, useMemberList } from '@/contexts/SpaceContext';
import type { _MemberType, TaskId } from '@/types';

const CLEAR_VALUE = '__clear__';

function getMemberName(member: _MemberType): string {
	const fullName = member.user?.name?.trim();
	if (fullName) {
		return fullName;
	}

	const firstName = member.user?.firstName?.trim();
	const lastName = member.user?.lastName?.trim();
	const composed = [firstName, lastName].filter(Boolean).join(' ').trim();
	if (composed) {
		return composed;
	}

	const email = member.user?.email?.trim();
	if (email) {
		const [localPart] = email.split('@');
		return localPart || email;
	}

	return 'Unknown user';
}

function getMemberSecondary(member: _MemberType): string {
	const email = member.user?.email?.trim();
	if (email) {
		return email;
	}

	const role = member.role;
	if (role) {
		return role.charAt(0).toUpperCase() + role.slice(1);
	}

	return '';
}

function getMemberInitials(member: _MemberType): string {
	const fullName = member.user?.name?.trim();
	if (fullName) {
		const parts = fullName.split(/\s+/).filter(Boolean);
		if (parts.length === 1) {
			const first = parts[0]?.[0];
			return first ? first.toUpperCase() : '?';
		}
		const first = parts[0]?.[0];
		const last = parts[parts.length - 1]?.[0];
		const initials = `${first ?? ''}${last ?? ''}`.trim();
		return initials ? initials.toUpperCase() : '?';
	}

	const email = member.user?.email;
	const first = email?.[0];
	return first ? first.toUpperCase() : '?';
}

interface MemberSelectorProps {
	taskId?: TaskId;
	userIds?: string[];
	defaultUserIds?: string[];
	onUsersChange?: (userIds: string[]) => void;
	allowUnassigned?: boolean;
}

export function MemberSelector({
	taskId,
	userIds,
	defaultUserIds,
	onUsersChange,
	allowUnassigned = true
}: MemberSelectorProps) {
	const updateTask = useMutation(api.modules.tasks.update);
	const memberList = useMemberList();

	const currentProject = useCurrentProject();
	const { isLoaded, userId: clerkUserId } = useAuth();
	const id = useId();
	const [open, setOpen] = useState(false);

	const membersForProject = useMemo(() => {
		if (!memberList?.length) {
			return [] as (_MemberType & { _id: string })[];
		}

		return memberList
			.filter((member): member is _MemberType & { _id: string } => {
				if (!member?._id) {
					return false;
				}

				if (!member?.userId) {
					return false;
				}

				if (member.removed) {
					return false;
				}

				if (!currentProject?._id) {
					return true;
				}

				if (!member.projects || member.projects.length === 0) {
					return true;
				}

				return member.projects.some(
					(projectId) => projectId === currentProject._id
				);
			})
			.sort((a, b) => getMemberName(a).localeCompare(getMemberName(b)));
	}, [memberList, currentProject?._id]);

	const normalizeUserIds = (ids?: string[]) =>
		Array.from(new Set((ids ?? []).filter((id): id is string => Boolean(id))));

	const [internalValue, setInternalValue] = useState<string[]>(() =>
		normalizeUserIds(defaultUserIds ?? userIds)
	);

	const isControlled = userIds !== undefined;
	const value = isControlled ? normalizeUserIds(userIds) : internalValue;

	useEffect(() => {
		if (!isControlled && defaultUserIds !== undefined) {
			setInternalValue(normalizeUserIds(defaultUserIds));
		}
	}, [defaultUserIds, isControlled]);

	const selectedMembers = useMemo(() => {
		if (!value.length) {
			return [] as (_MemberType & { _id: string })[];
		}

		const lookup = new Set(value);
		return membersForProject.filter((member) =>
			member.userId ? lookup.has(member.userId as string) : false
		);
	}, [membersForProject, value]);

	const currentUserMember = useMemo(() => {
		if (!isLoaded || !clerkUserId) {
			return null;
		}

		return (
			membersForProject.find(
				(member) => member.user?.clerkId === clerkUserId
			) ?? null
		);
	}, [isLoaded, clerkUserId, membersForProject]);

	const buttonLabel = (() => {
		if (selectedMembers.length === 0) {
			if (value.length === 0) {
				return 'Unassigned';
			}
			return value.length === 1 ? '1 member' : `${value.length} members`;
		}

		if (selectedMembers.length === 1) {
			return getMemberName(selectedMembers[0]);
		}

		return `${getMemberName(selectedMembers[0])} +${selectedMembers.length - 1}`;
	})();

	const handleMemberToggle = (selected: string) => {
		if (selected === CLEAR_VALUE) {
			const newValue: string[] = [];
			if (!isControlled) {
				setInternalValue(newValue);
			}

			// If taskId is defined, update the task in the database
			if (taskId) {
				updateTask({
					_id: taskId,
					userIds: newValue
				});
			} else {
				// If no taskId, use the callback for task creation
				onUsersChange?.(newValue);
			}

			setOpen(false);
			return;
		}

		if (!selected) {
			return;
		}

		if (isControlled) {
			const isSelected = value.includes(selected);
			const next = isSelected
				? value.filter((memberId) => memberId !== selected)
				: [...value, selected];

			// If taskId is defined, update the task in the database
			if (taskId) {
				updateTask({
					_id: taskId,
					userIds: next
				});
			} else {
				// If no taskId, use the callback for task creation
				onUsersChange?.(next);
			}
			return;
		}

		setInternalValue((prev) => {
			const isSelected = prev.includes(selected);
			const next = isSelected
				? prev.filter((memberId) => memberId !== selected)
				: [...prev, selected];

			// If taskId is defined, update the task in the database
			if (taskId) {
				updateTask({
					_id: taskId,
					userIds: next
				});
			} else {
				// If no taskId, use the callback for task creation
				onUsersChange?.(next);
			}

			return next;
		});
	};

	const renderMemberRow = (member: _MemberType & { _id: string }) => {
		const userId = member.userId as string | undefined;
		if (!userId) {
			return null;
		}
		const name = getMemberName(member);
		const secondary = getMemberSecondary(member);
		const isSelected = value.includes(userId);

		return (
			<CommandItem
				key={member._id}
				value={userId}
				onSelect={handleMemberToggle}
				keywords={[name, secondary].filter(Boolean)}
			>
				<div className='flex items-center gap-3'>
					<Avatar className='size-6'>
						<AvatarImage src={member.user?.imageUrl ?? undefined} alt={name} />
						<AvatarFallback>{getMemberInitials(member)}</AvatarFallback>
					</Avatar>
					<div className='flex flex-col text-left'>
						<span className='text-sm font-medium leading-none'>{name}</span>
						{secondary ? (
							<span className='text-xs text-muted-foreground'>{secondary}</span>
						) : null}
					</div>
				</div>
				{isSelected ? (
					<CheckIcon size={16} className='ml-auto text-primary' />
				) : null}
			</CommandItem>
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					className='h-7 px-1.5'
					variant='ghost'
					aria-haspopup='listbox'
					aria-expanded={open}
					aria-label='Select member'
					title={buttonLabel}
					disabled={membersForProject.length === 0 && !allowUnassigned}
				>
					{selectedMembers.length ? (
						<div className='flex items-center gap-2'>
							<div className='flex -space-x-1'>
								{selectedMembers.slice(0, 3).map((member) => (
									<Avatar
										key={member._id}
										className='size-5 border-2 border-background'
									>
										<AvatarImage
											src={member.user?.imageUrl ?? undefined}
											alt={getMemberName(member)}
										/>
										<AvatarFallback className='text-[10px]'>
											{getMemberInitials(member)}
										</AvatarFallback>
									</Avatar>
								))}
								{value.length > 3 ? (
									<div className='flex size-5 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-medium text-muted-foreground'>
										+{value.length - 3}
									</div>
								) : null}
							</div>
						</div>
					) : (
						<div className='flex items-center gap-1.5 text-muted-foreground'>
							<UserRound className='size-4' />
						</div>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0'
				align='start'
			>
				<Command>
					<CommandInput placeholder='Assign to...' />
					<CommandList>
						<CommandEmpty>No members found.</CommandEmpty>
						{currentUserMember || (allowUnassigned && value.length > 0) ? (
							<>
								<CommandGroup heading='Suggestions'>
									{currentUserMember ? (
										<CommandItem
											value={(currentUserMember.userId as string) ?? ''}
											onSelect={handleMemberToggle}
											keywords={[
												'assign',
												'me',
												getMemberName(currentUserMember)
											]}
										>
											<div className='flex items-center gap-3'>
												<Avatar className='size-6'>
													<AvatarImage
														src={currentUserMember.user?.imageUrl ?? undefined}
														alt={getMemberName(currentUserMember)}
													/>
													<AvatarFallback>
														{getMemberInitials(currentUserMember)}
													</AvatarFallback>
												</Avatar>
												<div className='flex flex-col text-left'>
													<span className='text-sm font-medium leading-none'>
														Assign to me
													</span>
													<span className='text-xs text-muted-foreground'>
														{getMemberName(currentUserMember)}
													</span>
												</div>
											</div>
											{currentUserMember.userId &&
											value.includes(currentUserMember.userId as string) ? (
												<CheckIcon size={16} className='ml-auto text-primary' />
											) : null}
										</CommandItem>
									) : null}
									{allowUnassigned ? (
										<CommandItem
											value='clear assignee'
											onSelect={() => handleMemberToggle(CLEAR_VALUE)}
											keywords={['clear', 'remove', 'unassigned', 'none']}
										>
											<div className='flex items-center gap-3'>
												<div className='flex size-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/50'>
													<UserRoundX className='size-4 text-muted-foreground' />
												</div>
												<div className='flex flex-col text-left'>
													<span className='text-sm font-medium leading-none'>
														Clear assignee
													</span>
													<span className='text-xs text-muted-foreground'>
														Set to unassigned
													</span>
												</div>
											</div>
											{value.length === 0 ? (
												<CheckIcon size={16} className='ml-auto text-primary' />
											) : null}
										</CommandItem>
									) : null}
								</CommandGroup>
								{membersForProject.length ? <CommandSeparator /> : null}
							</>
						) : null}
						{membersForProject.length ? (
							<CommandGroup heading='Members'>
								{membersForProject.map((member) => renderMemberRow(member))}
							</CommandGroup>
						) : null}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
