import axios from 'axios'

const api = axios.create({
  baseURL: 'https://d5dfdjso9in9g25dtq1d.k1mxzkh0.apigw.yandexcloud.net/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

export const getEvents = async () => {
  try {
    const response = await api.get('/events/')
    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

export const getParinn = async () => {
  try {
    const response = await api.get('/parinn')
    return response.data
  } catch (error) {
    console.error('Error fetching parinn:', error)
    throw error
  }
}

export const saveParinn = async (itemId) => {
  try {
    const response = await api.post('/parinn', { id: itemId })
    return response.data
  } catch (error) {
    console.error('Error saving parinn:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    })
    throw error
  }
}

export const vkPost = async (data) => {
  try {
    const response = await api.post('/vkpost', data)
    return response.data
  } catch (error) {
    console.error('Error posting to vk:', error)
    throw error
  }
}

export const deleteParinn = async (itemId) => {
  try {
    const response = await api.delete(`/parinn/${itemId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting parinn:', error)
    throw error
  }
}

export const defaultTestUser = {
  auth_date: 1744873236,
  first_name: 'Роман',
  hash: 'eaf823942893169c61a90bb3358e8016733b6e85f08fc00f432e0ad196af7956',
  id: 444752595,
  last_name: 'Орловский',
  photo_url: 'https://t.me/i/userpic/320/BA20YRSmulEdSrmVJI-Hkrf0x3hF4utnP-Tb7hlT60s.jpg',
  username: 'orlovskiy_rl',
}

export const saveUser = async (user) => {
  try {
    const response = await api.post('/users/', user)
    return response.data
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

export const getUser = async (id = 'current') => {
  try {
    const response = await api.get(`/users/?id=${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export const updateUser = async (user) => {
  try {
    const response = await api.put('/users/', user)
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export default api
