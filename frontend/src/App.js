import 'regenerator-runtime/runtime'
import { Fragment, useState, useEffect, createContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
    experimental_extendTheme as materialExtendTheme,
    Experimental_CssVarsProvider as MaterialCssVarsProvider,
    THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles'
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles'
import { publicRoutes } from './routes'

const WalletContext = createContext()
const materialTheme = materialExtendTheme()

function App({ isSignedIn, contractId, wallet }) {
    const [userId, setUserId] = useState(-1)

    useEffect(() => {
        wallet
            .callMethod({ method: 'Register', contractId })
            .then(async (res) => {
                console.log(res)
            })
            .catch((res) => {
                console.log(res)
            })

        getUser()
            .then((res) => {
                const { status, data } = JSON.parse(res)
                if (status) {
                    setUserId(data.id)
                }
            })
            .catch((alert) => {
                console.log(alert)
            })
    }, [])

    const getUser = () => {
        return wallet.viewMethod({ method: 'GetUser', args: { accountId: wallet.accountId }, contractId })
    }

    return (
        <WalletContext.Provider value={{ isSignedIn, contractId, wallet, userId }}>
            <MaterialCssVarsProvider defaultMode="dark" theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
                <JoyCssVarsProvider defaultMode="dark" disableNestedContext>
                    <div className="App">
                        <Routes>
                            {publicRoutes.map((route, index) => {
                                const Page = route.component

                                let Layout

                                if (route.layout) {
                                    Layout = route.layout
                                } else {
                                    Layout = Fragment
                                }

                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        }
                                    />
                                )
                            })}
                        </Routes>
                    </div>
                </JoyCssVarsProvider>
            </MaterialCssVarsProvider>
        </WalletContext.Provider>
    )
}

export default App
export { WalletContext }
