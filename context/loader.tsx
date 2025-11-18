"use client";

import { createContext, useContext, useState } from "react";

const loaderContext = createContext({
  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <loaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </loaderContext.Provider>
  );
};

export const useLoaderContext = () => {
  return useContext(loaderContext);
};
