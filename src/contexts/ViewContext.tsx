import { useMutation } from 'convex/react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { Calendar, Circle, Flag, Hash, MinusCircle, Tag } from 'lucide-react';
import React, { createContext, type ReactNode, useContext } from 'react';
import { api } from '#/_generated/api';
import { useDataTableFilters } from '@/components/data-table-filter';
import { createColumnConfigHelper } from '@/components/data-table-filter/core/filters';

import type {
	DataTableFilterActions,
	FilterStrategy,
	FiltersState
} from '@/components/data-table-filter/core/types';
import { useSpaceContext } from '@/contexts/SpaceContext';
import { defaultPriorityList } from '@/lib/defaults';
import type {
	_ProjectLabelType,
	_ProjectStatusType,
	_TaskPriorityType,
	_TaskType,
	_ViewType
} from '@/types';

// Jotai atoms
const currentViewAtom = atom<_ViewType | null>(null);

// Derived atom for updating view with upsert
const updateViewAtom = atom(null, (get, set, update: Partial<_ViewType>) => {
	const currentView = get(currentViewAtom);
	if (!currentView) return;

	const newValue = {
		...currentView,
		...update,
		// Handle nested content updates properly
		...(update.content && {
			content: {
				...currentView.content,
				...update.content,
				...(update.content.settings && {
					settings: {
						...currentView.content?.settings,
						...update.content.settings
					}
				})
			}
		})
	};

	set(currentViewAtom, newValue);
	return newValue;
});

interface ViewContextType {
	currentView: _ViewType | null;
	updateCurrentView: (updates: Partial<_ViewType>) => void;
	upsertView: (view: _ViewType) => void;
	filteredTasks: _TaskType[];
	// Filtering related
	filters: FiltersState;
	columns: any[];
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	columnsConfig: any[];
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const useView = () => {
	const context = useContext(ViewContext);
	if (context === undefined) {
		throw new Error('useView must be used within a ViewProvider');
	}
	return context;
};

interface ViewProviderProps {
	children: ReactNode;
}

export const ViewProvider: React.FC<ViewProviderProps> = ({ children }) => {
	const { viewList, taskList, currentProject } = useSpaceContext();
	const [currentView, setCurrentView] = useAtom(currentViewAtom);
	const [, updateView] = useAtom(updateViewAtom);

	// Mutation for updating views
	const upsertViewMutation = useMutation(api.modules.views.upsertView);

	// Set current view when viewList changes
	React.useEffect(() => {
		if (viewList && Array.isArray(viewList) && viewList.length > 0) {
			setCurrentView({ ...viewList[0] });
		}
	}, [viewList, setCurrentView]);

	// Function to update current view for optimistic updates
	const updateCurrentView = (updates: Partial<_ViewType>) => {
		const updatedView = updateView(updates);
		if (updatedView) {
			upsertViewMutation({ ...updatedView });
		}
	};

	// Get project statuses or use defaults
	const projectStatuses =
		currentProject?.status?.filter(
			(status: _ProjectStatusType) => !status.deleted
		) || [];

	// Get project labels or use defaults
	const projectLabels =
		currentProject?.label?.filter(
			(label: _ProjectLabelType) => !label.deleted
		) || [];

	// Use taskList directly without transformation
	const tasks = taskList || [];

	// Create column helper for _TaskType
	const dtf = createColumnConfigHelper<_TaskType>();

	// Define columns configuration using _TaskType fields directly
	const columnsConfig = [
		dtf
			.text()
			.id('name')
			.accessor((row: _TaskType) => row.name || 'Untitled Task')
			.displayName('Title')
			.icon(Hash)
			.build(),
		dtf
			.option()
			.id('status')
			.accessor((row: _TaskType) => row.status || '')
			.displayName('Status')
			.icon(Circle)
			.options(
				projectStatuses.map((status: _ProjectStatusType) => ({
					value: status._id || '',
					label: status.name || 'Unknown',
					icon: <Circle className='w-4 h-4' style={{ color: status.color }} />
				}))
			)
			.build(),
		dtf
			.multiOption()
			.id('label')
			.accessor((row: _TaskType) => (Array.isArray(row.label) ? row.label : []))
			.displayName('Labels')
			.icon(Tag)
			.options(
				projectLabels.map((label: _ProjectLabelType) => ({
					value: label._id || '',
					label: label.name || 'Unknown',
					icon: <Tag className='w-4 h-4' style={{ color: label.color }} />
				}))
			)
			.build(),
		dtf
			.option()
			.id('priority')
			.accessor((row: _TaskType) => row.priority || 'none')
			.displayName('Priority')
			.icon(Flag)
			.options(
				defaultPriorityList.map((priority: _TaskPriorityType) => ({
					value: priority._id || '',
					label: (priority.name || '').replace('priority.', ''),
					icon:
						priority.icon === 'flag' ? (
							<Flag className='w-4 h-4' style={{ color: priority.color }} />
						) : (
							<MinusCircle
								className='w-4 h-4'
								style={{ color: priority.color }}
							/>
						)
				}))
			)
			.build(),
		dtf
			.date()
			.id('createdAt')
			.accessor((row: _TaskType) =>
				row.createdAt ? new Date(row.createdAt) : new Date()
			)
			.displayName('Created')
			.icon(Calendar)
			.build()
	];

	// Create data table filters instance
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: 'client',
		data: tasks,
		columnsConfig
	});

	// Filter data based on current filters
	const getFilteredTasks = () => {
		if (filters.length === 0) return tasks;

		return tasks.filter((task) => {
			return filters.every((filter) => {
				const column = columnsConfig.find((col) => col.id === filter.columnId);
				if (!column) return true;

				const value = column.accessor(task);

				switch (filter.type) {
					case 'text': {
						const textValue = String(value).toLowerCase();
						const searchValue = String(filter.values[0] || '').toLowerCase();
						return filter.operator === 'contains'
							? textValue.includes(searchValue)
							: filter.operator === 'not_contains'
								? !textValue.includes(searchValue)
								: filter.operator === 'is'
									? textValue === searchValue
									: filter.operator === 'is_not'
										? textValue !== searchValue
										: true;
					}

					case 'option': {
						return filter.operator === 'is'
							? filter.values.includes(String(value))
							: filter.operator === 'is_not'
								? !filter.values.includes(String(value))
								: true;
					}

					case 'multiOption': {
						const arrayValue = Array.isArray(value) ? value : [];
						return filter.operator === 'is_any_of'
							? arrayValue.some((v) => filter.values.includes(v))
							: filter.operator === 'is_not_any_of'
								? !arrayValue.some((v) => filter.values.includes(v))
								: true;
					}

					case 'date': {
						const dateValue =
							value instanceof Date
								? value
								: new Date(value as string | number | Date);
						const filterDateValue = filter.values[0];
						if (typeof filterDateValue !== 'string') return true;
						const filterDate = new Date(filterDateValue);
						return filter.operator === 'is'
							? dateValue.toDateString() === filterDate.toDateString()
							: filter.operator === 'is_before'
								? dateValue < filterDate
								: filter.operator === 'is_after'
									? dateValue > filterDate
									: true;
					}

					default:
						return true;
				}
			});
		});
	};

	const filteredTasks = getFilteredTasks();

	const value: ViewContextType = {
		currentView,
		updateCurrentView,
		filteredTasks,
		filters,
		columns,
		actions,
		strategy,
		columnsConfig,
		upsertView: upsertViewMutation
	};

	return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
};

// Convenient hooks for using atoms directly
export const useCurrentView = () => useAtomValue(currentViewAtom);
export const useUpdateView = () => {
	const [, updateView] = useAtom(updateViewAtom);
	const upsertViewMutation = useMutation(api.modules.views.upsertView);

	return (updates: Partial<_ViewType>) => {
		const updatedView = updateView(updates);
		if (updatedView) {
			upsertViewMutation({ ...updatedView });
		}
	};
};

// Export atoms for direct access if needed
export { currentViewAtom };
