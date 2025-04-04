import { createContext, useContext, useState, ReactNode } from "react";

interface AirdropContextType {
  isCreateAirdropModalOpen: boolean;
  setIsCreateAirdropModalOpen: (open: boolean) => void;
  selectedAirdropId: number | null;
  setSelectedAirdropId: (id: number | null) => void;
}

const AirdropContext = createContext<AirdropContextType | undefined>(undefined);

export function useAirdropContext() {
  const context = useContext(AirdropContext);
  if (context === undefined) {
    throw new Error("useAirdropContext must be used within an AirdropProvider");
  }
  return context;
}

interface AirdropProviderProps {
  children: ReactNode;
}

export function AirdropProvider({ children }: AirdropProviderProps) {
  const [isCreateAirdropModalOpen, setIsCreateAirdropModalOpen] = useState(false);
  const [selectedAirdropId, setSelectedAirdropId] = useState<number | null>(null);

  const value = {
    isCreateAirdropModalOpen,
    setIsCreateAirdropModalOpen,
    selectedAirdropId,
    setSelectedAirdropId,
  };

  return (
    <AirdropContext.Provider value={value}>
      {children}
    </AirdropContext.Provider>
  );
}
