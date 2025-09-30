import {
	ChevronDown,
	Circle,
	CircleCheckBig,
	CircleDashed,
	CircleDot,
	CircleDotDashed,
	CircleSlash,
	Flag,
	type LucideIcon,
	MinusCircle,
	Plus
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible';
import { defaultPriorityList, defaultStatusGroupList } from '@/lib';
import { cn } from '@/lib/utils';
import type {
	_ProjectCycleType,
	_ProjectLabelType,
	_ProjectModuleType,
	_ProjectStatusType
} from '@/types';

type Feature =
	| _ProjectStatusType
	| _ProjectModuleType
	| _ProjectLabelType
	| _ProjectCycleType;

type GroupLineHeaderProps = {
	feature?: Feature | null;
	qtd?: number;
	addTitle?: string;
	showQtd?: boolean;
	showAddButton?: boolean;
	onAdd?: () => void;
	actions?: ReactNode;
	className?: string;
	children?: ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

const ICON_MAP: Record<string, LucideIcon> = {
	circle: Circle,
	circleDashed: CircleDashed,
	circleDotDashed: CircleDotDashed,
	circleDot: CircleDot,
	circleCheckBig: CircleCheckBig,
	circleSlash: CircleSlash,
	flag: Flag,
	minusCircle: MinusCircle
};

function hasGroup(feature: Feature): feature is Feature & { group: string } {
	return (
		typeof feature === 'object' &&
		feature !== null &&
		'group' in feature &&
		typeof (feature as { group?: unknown }).group === 'string' &&
		!!(feature as { group?: string }).group
	);
}

function resolveFeatureIcon(feature: Feature): string {
	if (hasGroup(feature)) {
		const statusGroup = defaultStatusGroupList.find(
			(group) => group._id === (feature as { group: string }).group
		);

		if (statusGroup?.icon) {
			return statusGroup.icon;
		}
	}

	const priority = defaultPriorityList.find((item) => item._id === feature._id);
	if (priority?.icon) {
		return priority.icon;
	}

	return 'circle';
}

export function GroupLineHeader({
	feature,
	qtd,
	addTitle,
	showQtd = false,
	showAddButton = false,
	onAdd,
	actions,
	className,
	children,
	open,
	defaultOpen,
	onOpenChange
}: GroupLineHeaderProps) {
	const headerRef = useRef<HTMLDivElement | null>(null);
	const [isSticky, setIsSticky] = useState(false);
	const [internalOpen, setInternalOpen] = useState<boolean>(
		defaultOpen ?? false
	);

	const isControlled = typeof open === 'boolean';
	const currentOpen = isControlled ? (open ?? false) : internalOpen;

	// Keep uncontrolled state in sync if defaultOpen changes later.
	useEffect(() => {
		if (!isControlled && typeof defaultOpen === 'boolean') {
			setInternalOpen(defaultOpen);
		}
	}, [defaultOpen, isControlled]);

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;

		const sentinel = document.createElement('div');
		sentinel.style.height = '1px';

		const parent = header.parentElement;
		parent?.insertBefore(sentinel, header);

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsSticky(!entry.isIntersecting);
			},
			{ threshold: 0, rootMargin: '-1px 0px 0px 0px' }
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
			sentinel.remove();
		};
	}, []);

	const IconComponent = useMemo(() => {
		if (!feature) return Circle;
		const iconName = resolveFeatureIcon(feature);
		return ICON_MAP[iconName] ?? Circle;
	}, [feature]);

	if (!feature) return null;

	const handleOpenChange = (nextOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(nextOpen);
		}

		onOpenChange?.(nextOpen);
	};

	const featureColor = feature.color || undefined;

	return (
		<Collapsible
			data-component='collapse-line'
			className={cn('!text-xs', className)}
			open={currentOpen}
			onOpenChange={handleOpenChange}
		>
			<div
				ref={headerRef}
				className={cn(
					'flex items-center space-x-1 rounded-md border border-muted/100 bg-muted/20 p-0.5 dark:border-muted/100 dark:bg-muted/20',
					isSticky && 'sticky top-0 z-50 !bg-background border-b'
				)}
			>
				<CollapsibleTrigger asChild>
					<Button variant='ghost' size='sm'>
						<ChevronDown
							className={cn(
								'h-4 w-4 transition-transform duration-200',
								currentOpen && 'rotate-180'
							)}
						/>
						<span className='sr-only'>Toggle</span>
					</Button>
				</CollapsibleTrigger>
				<div className='flex grow items-center justify-between'>
					<div className='flex items-center gap-1'>
						<h4
							className='flex items-center gap-1 rounded-md px-2 py-1'
							style={{
								backgroundColor: featureColor ? `${featureColor}20` : undefined,
								color: featureColor
							}}
						>
							{IconComponent ? (
								<IconComponent
									className='size-4'
									style={{ color: featureColor }}
								/>
							) : null}
							{feature.name}
						</h4>
						{(showQtd || showAddButton) && (
							<div className='flex items-center gap-1 px-2 text-neutral-500 dark:text-neutral-400'>
								{showQtd && <span className='text-xs'>{qtd}</span>}
								{showAddButton && (
									<Button
										variant='ghost'
										size='sm'
										className='h-6'
										onClick={() => onAdd?.()}
									>
										<Plus className='size-3' />
										<span className='text-xs'>{addTitle ?? 'Add'}</span>
									</Button>
								)}
							</div>
						)}
					</div>
					{actions ? <div>{actions}</div> : null}
				</div>
			</div>
			<CollapsibleContent className='space-y-2'>{children}</CollapsibleContent>
		</Collapsible>
	);
}
