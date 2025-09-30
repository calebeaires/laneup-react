import { Icon } from '@iconify-icon/react';
import { IconBrandTrello } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useView } from '@/contexts/ViewContext';

export function TaskHeader() {
	const view = useView();

	// Debug: Track signal changes
	useEffect(() => {
		console.log(
			'TaskHeader: currentView changed',
			view.currentView?.content?.settings?.currentViewTab
		);
	}, [view.currentView?.content?.settings?.currentViewTab]);

	function updateCurrentTab(tab: string) {
		if (!view.currentView) return;

		view.updateCurrentView({
			content: {
				...view.currentView.content,
				settings: {
					...view.currentView.content?.settings,
					currentViewTab: tab as 'list' | 'board' | 'table' | 'timeline'
				}
			}
		});

		// Debug: Check if signal updated immediately
		setTimeout(() => {
			console.log(
				'TaskHeader: After update',
				view.currentView?.content?.settings?.currentViewTab
			);
		}, 0);
	}

	return (
		<header className='flex h-[50px] shrink-0 items-center gap-2 border-b'>
			<div className='flex items-center gap-2 px-4 w-full'>
				<div className='flex items-center gap-2 grow'>
					<SidebarTrigger className='-ml-1' />
					<Separator
						orientation='vertical'
						className='mr-2 data-[orientation=vertical]:h-4'
					/>
					<IconBrandTrello stroke={1.5} />
					<span className='text-sm font-medium'>
						{view.currentView?.content?.settings?.currentViewTab}
					</span>
				</div>
				<div className='flex items-center justify-end gap-2'>
					<Tabs
						value={
							view.currentView?.content?.settings?.currentViewTab || 'list'
						}
						onValueChange={updateCurrentTab}
					>
						<TabsList>
							<TabsTrigger value='list'>
								<Icon icon='lucide:list' width={18} />
							</TabsTrigger>
							<TabsTrigger value='board'>
								<Icon icon='tabler:brand-trello' width={20} />
							</TabsTrigger>
							<TabsTrigger value='table'>
								<Icon icon='lucide:table' width={18} />
							</TabsTrigger>
							<TabsTrigger value='timeline'>
								<Icon icon='lucide:square-chart-gantt' width={18} />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>
		</header>
	);
}
