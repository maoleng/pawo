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
import { axiosInstance } from './utils/axiosInstance'

const WalletContext = createContext()
const materialTheme = materialExtendTheme()

function App({ isSignedIn, contractId, wallet }) {
    const [userId, setUserId] = useState(-1)

    const registerUser = async () => {
        await axiosInstance({
            method: 'POST',
            url: 'authed',
            headers: {
                Authorization: wallet.accountId,
            },
        })
            .then(async (res) => {
                console.log(res)
                if (res.data.status) {
                    localStorage.setItem('userId', JSON.stringify(res.data.data.id))
                    await wallet.callMethod({
                        method: 'Register',
                        contractId,
                    })
                    setUserId(res.data.data.id)
                }
            })
            .catch((res) => {
                console.log(res)
            })
    }

    useEffect(() => {
        if (localStorage.getItem('userId')) {
            setUserId(JSON.parse(localStorage.getItem('userId')))
        } else {
            registerUser()
        }
    }, [])

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
