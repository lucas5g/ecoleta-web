import React from 'react'
import {Route, BrowserRouter} from 'react-router-dom'

import Home from './pages/Home'
import PointForm from './pages/PointForm'

const Routes = () => {
  return(
    <BrowserRouter>
      <Route component={Home} path='/' exact />
      <Route component={PointForm} path='/pontos/cadastro' />
    </BrowserRouter>
  )
}

export default Routes