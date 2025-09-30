import type { ReactNode } from "react";

export interface OutletContextType {
  setHeaderContent: (content: ReactNode) => void;
}
