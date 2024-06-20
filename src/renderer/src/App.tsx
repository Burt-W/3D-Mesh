import { BrowserRouter as Router } from 'react-router-dom'

import ViewPanel from '@renderer/pages/home'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'

import CssBaseline from '@mui/material/CssBaseline'

import GlobalStyles from '@mui/material/GlobalStyles'

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme()

import { ConfigProvider } from 'antd'

import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <ThemeProvider theme={defaultTheme}>
          <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
          <CssBaseline />
          <AppBar
            position="static"
            color="default"
            elevation={0}
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <ViewPanel ></ViewPanel>
          </AppBar>
          {/* <Box>
            <RouterConfig></RouterConfig>
          </Box> */}
        </ThemeProvider>
      </Router>
    </ConfigProvider>
  )
}
