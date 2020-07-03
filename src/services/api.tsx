import axios from 'axios'

const hostname = () => {
  const app = window.location.hostname

  if(app === 'ecoleta-regiao.netlify.app')
    return 'https://ecoleta-lucas.herokuapp.com/' 
    
  if(app === '3000-da4b0255-4628-4ede-b0ee-195adb6056af.ws-us02.gitpod.io')
    return   'https://8000-e24c602e-3c8c-4623-85da-037d9e290814.ws-us02.gitpod.io/'

  return 'http://localhost:8000'
}

const api = axios.create({
  baseURL: hostname()
})

console.log(window.location.hostname)
console.log(hostname())
export default api