import { createContext, useContext, useState } from "react";

interface HeaderData {
  nombre: string;
  matricula?: string;
  subtitulo?: string;
  imagen: string | null;
  avatar?: string;
  isEditing?: boolean;
}

interface HeaderContextType {
  headerData: HeaderData | null;
  setHeaderData: React.Dispatch<React.SetStateAction<HeaderData | null>>;
  onImageChange: ((file: File) => void) | null;
  setOnImageChange: (fn: ((file: File) => void) | null) => void;
}

const HeaderContext = createContext<HeaderContextType>({
  headerData: null,
  setHeaderData: () => {},
  onImageChange: null,
  setOnImageChange: () => {},
});

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const [onImageChange, setOnImageChange] = useState<
    ((file: File) => void) | null
  >(null);

  return (
    <HeaderContext.Provider
      value={{ headerData, setHeaderData, onImageChange, setOnImageChange }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export const useHeader = () => useContext(HeaderContext);
