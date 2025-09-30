declare module 'vue-dndrop' {
	import type { DefineComponent } from 'vue'

	export interface DropResult<T = unknown> {
		removedIndex: number | null
		addedIndex: number | null
		payload: T
		element?: HTMLElement
	}

	export interface ContainerOptions {
		orientation?: string
		behaviour?: string
		tag?: string
		groupName?: string
		lockAxis?: string
		dragHandleSelector?: string
		nonDragAreaSelector?: string
		dragBeginDelay?: number
		animationDuration?: number
		autoScrollEnabled?: boolean
		dragClass?: string
		dropClass?: string
		removeOnDropOut?: boolean
	}

	export interface ContainerProps {
		orientation?: 'horizontal' | 'vertical'
		behaviour?: 'move' | 'copy' | 'drop-zone'
		tag?: string
		groupName?: string
		lockAxis?: 'x' | 'y'
		dragHandleSelector?: string
		nonDragAreaSelector?: string
		dragBeginDelay?: number
		animationDuration?: number
		autoScrollEnabled?: boolean
		dragClass?: string
		dropClass?: string
		removeOnDropOut?: boolean
		getChildPayload?: (index: number) => unknown
		shouldAnimateDrop?: (sourceContainerOptions: ContainerOptions, payload: unknown) => boolean
		shouldAcceptDrop?: (sourceContainerOptions: ContainerOptions, payload: unknown) => boolean
		getGhostParent?: () => HTMLElement
		dropPlaceholder?: {
			showOnTop?: boolean
			className?: string
			animationDuration?: number
		}
	}

	export const Container: DefineComponent<ContainerProps>
	export const Draggable: DefineComponent<{
		tag?: string
	}>
}
