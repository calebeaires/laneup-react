import { useRef } from 'react';
import { Link } from 'react-router';
import {
	useCurrentProject,
	useCurrentWorkspace,
	useProjectList,
	useSpaceContext,
	useWorkspaceList
} from '@/contexts/SpaceContext';

export default function About() {
	const space = useSpaceContext();

	// Direct atom access for demonstration
	const currentWorkspace = useCurrentWorkspace();
	const workspaceList = useWorkspaceList();
	const projectList = useProjectList();
	const currentProject = useCurrentProject();

	const renderCount = useRef(0);

	renderCount.current += 1;
	console.log(
		`About component rendered ${renderCount.current} times with Jotai!`
	);

	return (
		<div className='App p-6 space-y-4'>
			<div className='mb-4'>
				<Link to='/' className='text-blue-600 hover:text-blue-800 underline'>
					Go to Home Page
				</Link>
			</div>

			<div className='bg-green-100 p-4 rounded border'>
				<h2 className='font-bold text-green-800 mb-2'>
					✅ Jotai Migration Complete!
				</h2>
				<p className='text-sm text-green-700'>
					SpaceContext now uses Jotai atoms instead of useState
				</p>
				<p className='text-xs text-green-600'>Renders: {renderCount.current}</p>
			</div>

			<div className='space-y-3'>
				<div className='bg-blue-50 p-3 rounded'>
					<h3 className='font-semibold text-blue-800'>
						Context API (Compatible)
					</h3>
					<p className='text-sm'>
						Workspaces: {space.workspaceList?.length || 0}
					</p>
					<p className='text-sm'>Projects: {space.projectList?.length || 0}</p>
					<p className='text-sm'>
						Current Project: {space.currentProject?.name || 'None'}
					</p>
				</div>

				<div className='bg-purple-50 p-3 rounded'>
					<h3 className='font-semibold text-purple-800'>
						Direct Atom Access (New)
					</h3>
					<p className='text-sm'>
						Current Workspace: {currentWorkspace?.name || 'None'}
					</p>
					<p className='text-sm'>
						Workspaces via atom: {workspaceList?.length || 0}
					</p>
					<p className='text-sm'>
						Projects via atom: {projectList?.length || 0}
					</p>
					<p className='text-sm'>
						Current Project via atom: {currentProject?.name || 'None'}
					</p>
				</div>

				<div className='bg-gray-50 p-3 rounded'>
					<h3 className='font-semibold text-gray-800'>Workspaces</h3>
					<div className='space-y-1'>
						{space.workspaceList?.map(({ _id, name }) => (
							<div key={_id} className='text-sm bg-white p-2 rounded border'>
								{name}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
