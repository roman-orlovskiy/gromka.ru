import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const getEvents = async () => {
  try {
    const response = await api.get('/events')
    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
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
    const response = await api.post('/users', user)
    return response.data
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}
export default api
