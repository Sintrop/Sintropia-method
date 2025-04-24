import React, { createContext } from 'react'

interface MainContextProviderProps {
  children: React.ReactNode
}

export interface MainContextProps {
  language: string
}

export const MainContext = createContext({} as MainContextProps)

export function MainContextProvider({ children }: MainContextProviderProps): React.JSX.Element {
  return (
    <MainContext.Provider
      value={{
        language: 'en'
      }}
    >
      {children}
    </MainContext.Provider>
  )
}
