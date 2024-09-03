

import React from 'react'
import { Header } from './Components/Header/Header'

import { Outlet } from 'react-router'
import { Provider } from 'react-redux'
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/es/integration/react'
import Footer from './Components/Footer/Footer';

export const Layout= () => {
  return (
    <> <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <Header/>
        <Outlet/>
        

      </PersistGate>
      <Footer/>
      
        
        </Provider> 
    </>
  )
}