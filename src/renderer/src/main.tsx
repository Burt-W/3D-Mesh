import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import App from './App'
import { DataProvider } from './DataContext'
import { RecordProvider } from '@renderer/context/recordDataContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DataProvider>
      <RecordProvider>
        <App />
      </RecordProvider>
    </DataProvider>
  </React.StrictMode>,
)
