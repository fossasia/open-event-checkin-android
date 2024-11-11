import { defaults, mande } from 'mande'
import { defineStore } from 'pinia'

export const useApiStore = defineStore('api', () => {
  const apiUrl =
    import.meta.env.MODE === 'production'
      ? import.meta.env.VITE_PROD_API_URL
      : import.meta.env.VITE_TEST_API_URL

  let instance = mande(apiUrl)

  function setToken() {
    const token = localStorage.getItem('token')
    instance.options.headers.Authorization = 'JWT ' + token
  }

  function clearToken() {
    instance.options.headers.Authorization = ''
  }

  function newSession(authenticated) {
    // reinit
    instance = mande(apiUrl)
    if (authenticated) {
      setToken()
    } else {
      clearToken()
    }
  }

  async function get(requiresAuth, path, payload) {
    newSession(requiresAuth)
    instance.options.headers['Accept'] = 'application/vnd.api+json'
    try {
      if (payload) {
        return await instance.get(path)
      } else {
        return await instance.get(path, payload)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async function post(requiresAuth, path, payload = false, hasBody = false) {
    newSession(requiresAuth)
    try {
      if (hasBody) {
        delete defaults.headers['Content-Type']
        const options = instance.options
        options['body'] = payload
        const response = await instance.post(path)
        return response
      } else {
        if (payload) {
          instance.options.headers['Accept'] = 'application/vnd.api+json'
          instance.options.headers['Content-Type'] = 'application/vnd.api+json'
          const response = await instance.post(path, payload)
          return response
        } else {
          const response = await instance.post(path)
          return response
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return { instance, setToken, clearToken, newSession, get, post }
})
