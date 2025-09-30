import { Provider } from 'jotai';
import React from 'react';
import { AppSidebar } from '@/components/app-sidebar/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SpaceProvider } from '@/contexts/SpaceContext';
import { ViewProvider } from '@/contexts/ViewContext';

export function Body({ children }: { children: React.ReactNode }) {
	return <main>{children}</main>;
}

export default function SidebarLayout({
	children
}: {
	children: React.ReactNode;
}) {
	let body: React.ReactNode;
	React.Children.forEach(children, (child) => {
		if (React.isValidElement(child)) {
			if (child.type === Body) body = child;
		}
	});

	return (
		<Provider>
			<SpaceProvider>
				<ViewProvider>
					<SidebarProvider>
						<AppSidebar />
						<SidebarInset>{body}</SidebarInset>
					</SidebarProvider>
				</ViewProvider>
			</SpaceProvider>
		</Provider>
	);
}
