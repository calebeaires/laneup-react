'use client';

import {
	Folder,
	Forward,
	LayoutGridIcon,
	MoreHorizontal,
	Share,
	Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Id } from '#/_generated/dataModel';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar
} from '@/components/ui/sidebar';
import { useSpaceContext } from '@/contexts/SpaceContext';

type ProjectId = Id<'projects'>;

export function AppSidebarProjects() {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const space = useSpaceContext();

	const handleProjectClick = (projectId: ProjectId | undefined) => {
		const project = space.projectList.find(
			(project) => project._id === projectId
		);

		if (project) space.setCurrentProject(project);
	};

	function navigateToPath(projectId: ProjectId | undefined, path: string) {
		handleProjectClick(projectId);
		navigate(path);
	}

	const projectList = (space.projectList || []).map((project) => ({
		...project,
		actions: [
			{
				name: 'project.tasks',
				icon: Folder,
				translationKey: 'project.tasks',
				path: '/tasks',
				title: 'Tasks'
			},
			{
				name: 'project.cycles',
				icon: Forward,
				translationKey: 'project.cycles',
				path: '/cycles',
				title: 'Cycles'
			},
			{
				name: 'project.modules',
				icon: Trash2,
				translationKey: 'project.modules',
				path: '/modules',
				title: 'Modules'
			},
			{
				name: 'project.views',
				icon: LayoutGridIcon,
				translationKey: 'project.views',
				path: '/views',
				title: 'Views'
			}
		]
	}));

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
			<SidebarGroupLabel>Projects</SidebarGroupLabel>
			<SidebarMenu>
				{projectList.map((item) => (
					<Collapsible key={item.name} asChild defaultOpen>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								tooltip={item.name}
								onClick={(e) => {
									e.stopPropagation();
									handleProjectClick(item._id);
								}}
							>
								<CollapsibleTrigger className='w-full'>
									<div className='flex items-center w-full'>
										<Folder className='size-4' />
										<span className='ml-2 flex-1 text-left'>{item.name}</span>
									</div>
								</CollapsibleTrigger>
							</SidebarMenuButton>
							<SidebarMenuAction>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<div>
											<MoreHorizontal className='size-3.5' />
											<span className='sr-only'>More</span>
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className='w-48'
										side={isMobile ? 'bottom' : 'right'}
										align={isMobile ? 'end' : 'start'}
									>
										<DropdownMenuItem>
											<Folder className='text-muted-foreground' />
											<span>View Project</span>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Share className='text-muted-foreground' />
											<span>Share Project</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem>
											<Trash2 className='text-muted-foreground' />
											<span>Delete Project</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuAction>
							{item.actions?.length ? (
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.actions?.map((action) => (
											<SidebarMenuSubItem key={action.name}>
												<SidebarMenuSubButton
													asChild
													onClick={() => navigateToPath(item._id, action.path)}
												>
													<div>
														<action.icon />
														<span>{action.title}</span>
													</div>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							) : null}
						</SidebarMenuItem>
					</Collapsible>
				))}
				<SidebarMenuItem>
					<SidebarMenuButton>
						<MoreHorizontal />
						<span>More</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
