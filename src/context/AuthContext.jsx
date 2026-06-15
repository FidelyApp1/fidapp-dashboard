import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('fidapp_token'))
  const [restaurant, setRestaurant] = useState(
    JSON.parse(localStorage.getItem('fidapp_restaurant') || 'null')
  )

  const loginUser = (token, restaurant) => {
    localStorage.setItem('fidapp_token', token)
    localStorage.setItem('fidapp_restaurant', JSON.stringify(restaurant))
    setToken(token)
    setRestaurant(restaurant)
  }

  const logout = () => {
    localStorage.removeItem('fidapp_token')
    localStorage.removeItem('fidapp_restaurant')
    setToken(null)
    setRestaurant(null)
  }

  return (
    <AuthContext.Provider value={{ token, restaurant, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)