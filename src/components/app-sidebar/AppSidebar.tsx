'use client';

import { Command } from 'lucide-react';
import type * as React from 'react';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from '@/components/ui/sidebar';
import AppSidebarGeneral from './AppSidebarGeneral';
import { AppSidebarProjects } from './AppSidebarProjects';
import { AppSidebarUser } from './AppSidebarUser';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant='inset' collapsible='icon' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' asChild>
							<div>
								<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
									<Command className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>Acme Inc</span>
									<span className='truncate text-xs'>Enterprise</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<AppSidebarGeneral />
				<AppSidebarProjects />
			</SidebarContent>
			<SidebarFooter>
				<AppSidebarUser />
			</SidebarFooter>
		</Sidebar>
	);
}
