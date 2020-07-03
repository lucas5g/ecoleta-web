import axios from 'axios'

const hostname = () => {
  const app = window.location.hostname

  return app === 'ecoleta-regiao.netlify.app' ? 'https://ecoleta-lucas.herokuapp.com/' :  'http://localhost:8000'
}

const api = axios.create({
  baseURL: hostname()
})


console.log(hostname())
export default api