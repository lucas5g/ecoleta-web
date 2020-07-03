import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import './PointForm.css'
import logo from '../assets/logo.svg'
import { FiArrowLeft } from 'react-icons/fi'
import { Link,useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'
import axios from '../services/api'
import api from '../services/api'

import Dropzone from '../components/Dropzone'

interface Item{
  id: number;
  title: string;
  image_url: string;
}
interface UF{
  name:string;
}

interface ibgeUfResponse{
  sigla: string;
}
interface ibgeCityResponse{
  nome: string;
}
const PointForm = () => {

  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name:'', email:'', whatssap:''
  })
  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

  const [selectedFile, setSelectedFile] = useState<File>()
  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      //console.log(position)
      const {latitude, longitude} = position.coords
      setInitialPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)

    })
  }, [])

  useEffect(() => {
    axios.get<ibgeUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
  
      const ufInitials = response.data.map( uf => uf.sigla)
      setUfs(ufInitials)
    })
  },[])

  useEffect(() => {
    if(selectedUf === '0')
      return
    axios.get<ibgeCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
     
      const cityName = response.data.map(city => city.nome)
      setCities(cityName)
    })
  }, [selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelectedUf(uf)

  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelectedCity(uf)
  }
  function handleMapClick( event:LeafletMouseEvent){
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
    console.log(event.latlng)
  }
  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id)
    if(alreadySelected >= 0 ){
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    }else{
      setSelectedItems([...selectedItems, id])
    }

  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target
    setFormData({...formData, [name]: value})
  }
  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const {name, email, whatssap} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData()

    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatssap)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))

    if(selectedFile){
      data.append('image', selectedFile)
    }
  
    await api.post('points', data)
    alert('Cadastrado com sucesso')
    history.push('/')



    //const {data} = await teste
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br />ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>
        
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange}/>
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange}/>
            </div>
            <div className="field">
              <label htmlFor="name">Whatsapp</label>
              <input type="text" name="whatssap" id="whatssap" onChange={handleInputChange}/>

            </div>

          </div>

        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select onChange={handleSelectUf}  name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
                {ufs.map( uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={handleSelectCity} name="city" id="city">
                <option value="0">Selecione uma Cidade</option>
                {cities.map( city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id} 
                onClick={() =>handleSelectItem(item.id)}
                className={selectedItems.includes(item.id)? 'selected':''}
                >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}

          </ul>
        </fieldset>
        <button>Cadastrar ponto de Coletar</button>
      </form>
    </div>
  )
}

export default PointForm
