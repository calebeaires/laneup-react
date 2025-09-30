import type { Id } from 'convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '#/_generated/api';
import { CycleSelector } from '@/components/selectors/CycleSelector';
import { DateSelector } from '@/components/selectors/DateSelector';
import { LabelSelector } from '@/components/selectors/LabelSelector';
import { MemberSelector } from '@/components/selectors/MemberSelector';
import { ModuleSelector } from '@/components/selectors/ModuleSelector';
import { PrioritySelector } from '@/components/selectors/PrioritySelector';
import { StatusSelector } from '@/components/selectors/StatusSelector';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { useSpaceContext } from '@/contexts/SpaceContext';
import { useView } from '@/contexts/ViewContext';
import type { _TaskDateRangeType } from '@/types';

export function TableView() {
	const view = useView();
	const { taskList } = useSpaceContext();

	// Get data from context
	const { filteredTasks } = view;

	return (
		<div className='border rounded-lg bg-white'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Assignee</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Module</TableHead>
						<TableHead>Cycle</TableHead>
						<TableHead>Labels</TableHead>
						<TableHead>Priority</TableHead>
						<TableHead>Dates</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredTasks.length === 0 ? (
						<TableRow>
							<TableCell colSpan={9} className='text-center py-8 text-gray-500'>
								{taskList?.length === 0
									? 'No tasks found in this project'
									: 'No tasks found matching your filters'}
							</TableCell>
						</TableRow>
					) : (
						filteredTasks
							.map((task) => {
								if (!task._id) return null;

								const taskId = task._id;
								const userIds = Array.isArray(task.userIds)
									? (task.userIds as Id<'users'>[]).map((id) => id as string)
									: [];
								const labelId = Array.isArray(task.label)
									? task.label[0]
									: undefined;
								const dateRange: _TaskDateRangeType | null = (() => {
									const candidate = (task?.dateRange ||
										null) as _TaskDateRangeType | null;
									if (!candidate) return null;
									if (!candidate.start && !candidate.end) return null;
									return candidate;
								})();

								return (
									<TableRow key={taskId}>
										<TableCell className='font-medium'>
											{task.name || 'Untitled Task'}
										</TableCell>
										<TableCell>
											<MemberSelector userIds={userIds} showLabel />
										</TableCell>
										<TableCell>
											<StatusSelector
												taskId={taskId}
												statusId={task.status}
												showLabel
											/>
										</TableCell>
										<TableCell>
											<ModuleSelector
												taskId={taskId}
												moduleId={task.module}
												showLabel
											/>
										</TableCell>
										<TableCell>
											<CycleSelector
												taskId={taskId}
												cycleId={task.cycle}
												showLabel
											/>
										</TableCell>
										<TableCell>
											<LabelSelector
												taskId={taskId}
												labelId={labelId}
												showLabel
											/>
										</TableCell>
										<TableCell>
											<PrioritySelector
												taskId={taskId}
												priorityId={task.priority}
												showLabel
											/>
										</TableCell>
										<TableCell>
											<DateSelector taskId={taskId} dateRange={dateRange} />
										</TableCell>
									</TableRow>
								);
							})
							.filter(Boolean)
					)}
				</TableBody>
			</Table>
		</div>
	);
}
