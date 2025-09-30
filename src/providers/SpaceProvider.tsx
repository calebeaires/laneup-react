import React from "react";
import {
  useSpaceDataManager,
  useSpaceAutoInit,
} from "@/stores/space.store.optimized";

interface SpaceProviderProps {
  children: React.ReactNode;
}

/**
 * SpaceProvider manages all Convex data fetching and state synchronization.
 * This component should be placed high in your component tree to ensure
 * data is available throughout the app.
 */
export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  // This hook manages all Convex queries and syncs data to the store
  useSpaceDataManager();

  console.log(122);

  // This hook handles auto-initialization logic
  useSpaceAutoInit();

  return <>{children}</>;
};

export default SpaceProvider;
