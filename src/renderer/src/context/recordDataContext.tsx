// DataContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface RecordData {
  id: number
  time: string
  indicator: string
  // altitude: string
  value: string
  result: string
}

interface RecordDataProps {
  recordData: RecordData[]
  setRecordDataContext: (value: RecordData[]) => void
}

const RecordDataContext = createContext<RecordDataProps | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export const RecordProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [recordData, setRecordData] = useState<RecordData[]>([])

  const setRecordDataContext = (value: RecordData[]) => {
    setRecordData(value)
  }

  return (
    <RecordDataContext.Provider value={{ recordData, setRecordDataContext }}>
      {children}
    </RecordDataContext.Provider>
  )
}

export const useRecordDataContext = () => {
  const context = useContext(RecordDataContext)
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}
