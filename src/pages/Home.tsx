import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
	useCurrentProject,
	useCurrentWorkspace,
	useMemberList,
	useProjectList,
	useSetCurrentProject,
	useSpaceContext,
	useTaskList,
	useWorkspaceList
} from '@/contexts/SpaceContext';

function Jonas() {
	const space = useSpaceContext();
	const renderCount = useRef(0);

	// Direct atom access - these are more efficient!
	const currentProject = useCurrentProject();
	const currentWorkspace = useCurrentWorkspace();
	const workspaceList = useWorkspaceList();
	const projectList = useProjectList();
	const memberList = useMemberList();
	const taskList = useTaskList();
	const setCurrentProject = useSetCurrentProject();

	renderCount.current += 1;

	useEffect(() => {
		console.log(
			'Home component - Current project changed (via Jotai):',
			currentProject?.name
		);
	}, [currentProject]);

	const handleProjectSwitch = () => {
		if (projectList.length > 1) {
			const currentIndex = projectList.findIndex(
				(p) => p._id === currentProject?._id
			);
			const nextIndex = (currentIndex + 1) % projectList.length;
			setCurrentProject(projectList[nextIndex]);
		}
	};

	return (
		<div className='App p-6 space-y-4'>
			<div className='bg-blue-100 p-4 rounded border'>
				<h1 className='font-bold text-blue-800 mb-2'>
					🏠 Home - Jotai Migration Complete!
				</h1>
				<p className='text-sm text-blue-700'>
					All state management converted from React useState to Jotai atoms
				</p>
				<p className='text-xs text-blue-600'>
					Component renders: {renderCount.current}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='bg-green-50 p-4 rounded border'>
					<h2 className='font-semibold text-green-800 mb-3'>
						Context API (Backward Compatible)
					</h2>
					<div className='space-y-1 text-sm'>
						<div>Workspaces: {space.workspaceList?.length || 0}</div>
						<div>Projects: {space.projectList?.length || 0}</div>
						<div>Members: {space.memberList?.length || 0}</div>
						<div>Tasks: {space.taskList?.length || 0}</div>
						<div className='border-t pt-2 mt-2'>
							<div>
								Current project: {space.currentProject?.name || 'No project'}
							</div>
							<div className='text-xs text-gray-600'>
								ID: {space.currentProject?._id || 'No ID'}
							</div>
						</div>
					</div>
				</div>

				<div className='bg-purple-50 p-4 rounded border'>
					<h2 className='font-semibold text-purple-800 mb-3'>
						Direct Atom Access (New & Efficient!)
					</h2>
					<div className='space-y-1 text-sm'>
						<div>Workspaces: {workspaceList?.length || 0}</div>
						<div>Projects: {projectList?.length || 0}</div>
						<div>Members: {memberList?.length || 0}</div>
						<div>Tasks: {taskList?.length || 0}</div>
						<div className='border-t pt-2 mt-2'>
							<div>Current project: {currentProject?.name || 'No project'}</div>
							<div>Current workspace: {currentWorkspace?.name || 'None'}</div>
						</div>
					</div>
				</div>
			</div>

			<div className='bg-yellow-50 p-4 rounded border'>
				<h3 className='font-semibold text-yellow-800 mb-2'>🎛️ Test Actions</h3>
				<button
					type='button'
					onClick={handleProjectSwitch}
					disabled={projectList.length <= 1}
					className='px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Switch Project ({projectList.length} available)
				</button>
			</div>

			<div className='bg-gray-50 p-4 rounded border'>
				<h3 className='font-semibold text-gray-800 mb-2'>Navigation</h3>
				<div className='space-x-2'>
					<Link
						to='/about'
						className='text-blue-600 hover:text-blue-800 underline'
					>
						About Page
					</Link>
					<Link
						to='/tasks'
						className='text-blue-600 hover:text-blue-800 underline'
					>
						Tasks
					</Link>
					<Link
						to='/project'
						className='text-blue-600 hover:text-blue-800 underline'
					>
						Projects
					</Link>
				</div>
			</div>
		</div>
	);
}

function Home() {
	return (
		<div className='flex min-h-svh flex-col items-center justify-center gap-4'>
			<h2 className='text-3xl font-bold'>Home</h2>
			<Link to='/about' className='text-blue-600 hover:text-blue-800 underline'>
				Go to About Page
			</Link>
			<Jonas />
		</div>
	);
}

export default Home;
