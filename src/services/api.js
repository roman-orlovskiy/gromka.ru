import axios from 'axios'

const api = axios.create({
  baseURL: 'https://d5d6vjgv1m7q1tbch3d2.apigw.yandexcloud.net/api/v1/',
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

export default api
