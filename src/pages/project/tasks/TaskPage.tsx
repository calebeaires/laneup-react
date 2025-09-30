import { useSpaceContext } from '@/contexts/SpaceContext';
import { useView } from '@/contexts/ViewContext';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { TableView } from './components/TableView';
import { TaskHeader } from './components/TaskHeader';
import { TimelineView } from './components/TimelineView';
import { ViewBar } from './components/ViewBar';

export function TaskPage() {
	const view = useView();

	const { filteredTasks } = view;
	const { taskList } = useSpaceContext();

	function TaskViewSwitch() {
		const viewType =
			view.currentView?.content?.settings?.currentViewTab || 'list';

		// add tableview and timeline view too
		const views = {
			list: <ListView />,
			board: <BoardView />,
			table: <TableView />,
			timeline: <TimelineView />
		};

		return <div>{views[viewType]}</div>;
	}

	return (
		<div>
			<TaskHeader />
			<ViewBar />
			<div className='space-y-6 p-6'>
				<TaskViewSwitch />
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-gray-600'>
							Manage and filter your project tasks ({filteredTasks.length} of{' '}
							{taskList?.length || 0} tasks)
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
