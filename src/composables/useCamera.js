import { ref } from 'vue'

export const useCamera = () => {
  const camera = ref(null)
  const devices = ref([])

  const getDevices = async () => {
    devices.value = await navigator.mediaDevices.enumerateDevices()
  }

  return {
    camera,
    devices,
    getDevices,
  }
}
