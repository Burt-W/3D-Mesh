// export function importData() {
//   window.electron.ipcRenderer.invoke('import-file', 'air-environment')
// }

// export function getAirLocationStatistics() {
//   return window.electron.ipcRenderer.invoke('get-air-location-statistics')
// }

// export function getAirLocationInfo() {
//   return window.electron.ipcRenderer.invoke('get-air-location-info')
// }

// export function getAirInspectDetail({ id, startTime, endTime }: { id: string; startTime: string; endTime: string }) {
//   return window.electron.ipcRenderer.invoke('get-air-inspect-detail', {
//     id,
//     startTime,
//     endTime,
//   })
// }

// export function getAirEnvironmentDataByLocation({ id }: { id: string }) {
//   return window.electron.ipcRenderer.invoke('get-air-environment-data-by-location', { id })
// }

// // 趋势分析，输入点位与字段名，返回趋势分析结果
// export function getAirTrendAnalysis({ location, field }: { location: string; field: string }) {
//   return window.electron.ipcRenderer.invoke('get-air-trend-analysis', { location, field })
// }