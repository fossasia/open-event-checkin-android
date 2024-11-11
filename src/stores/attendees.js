import { useApiStore } from '@/stores/api'
import { useSessionsStore } from '@/stores/sessions'
import { useStationsStore } from '@/stores/stations'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAttendeesStore = defineStore('attendees', () => {
  const apiStore = useApiStore()
  const stations = useStationsStore()
  const sessions = useSessionsStore()
  const attendees = ref([])

  function $reset() {
    attendees.value = []
  }

  async function fetchAttendees(eventId, fieldType, value) {
    let route = `events/${eventId}/attendees/search?`
    if (fieldType === 'name') {
      route += `name=${value}`
    }

    if (fieldType === 'email') {
      route += `email=${value}`
    }
    try {
      const res = await apiStore.get(
        true,
        `events/${eventId}/attendees/search?sort=firstname&${route}`
      )
      attendees.value = res.attendees.map((attendee) => ({
        id: attendee.id,
        name: attendee.firstname + ' ' + attendee.lastname,
        email: attendee.email,
        ticketId: attendee.ticket_id,
        checkedIn: ref(attendee.is_registered),
        info: {
          attendee
        }
      }))
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async function registerAttendee(attendeeId, stationId) {
    const payload = {
      data: {
        relationships: {
          station: {
            data: {
              type: 'station',
              id: String(stationId)
            }
          },
          ticket_holder: {
            data: {
              type: 'attendee',
              id: String(attendeeId)
            }
          }
        },
        type: 'user_check_in'
      }
    }
    try {
      const res = await apiStore.post(true, 'user-check-in', payload, false)
      return res.data.attributes.success
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async function checkInAttendee(attendeeId, stationId, scannerType) {
    try {
      const actualStationId = await stations.getActualStationId(stationId, scannerType)
      if (!actualStationId) {
        return Promise.reject('No station found.')
      }
      let payload = {
        data: {
          relationships: {
            station: {
              data: {
                type: 'station',
                id: String(actualStationId)
              }
            },
            ticket_holder: {
              data: {
                type: 'attendee',
                id: String(attendeeId)
              }
            }
          },
          type: 'user_check_in'
        }
      }

      if (scannerType !== 'daily') {
        const session = await sessions.getCurrentSession(stationId)
        const sessionId = session ? String(session.id) : null
        payload.data.relationships.session = {
          data: {
            type: 'session',
            id: String(sessionId)
          }
        }
      }
      return await apiStore.post(true, 'user-check-in', payload)
    } catch (error) {
      if (error.response?.status === 422) {
        return Promise.reject('already done')
      }
      return Promise.reject('Error processing.')
    }
  }

  async function getAttendeeName(attendeeId) {
    try {
      const attendee = await apiStore.get(true, `attendees/${attendeeId}`)
      return attendee.data.attributes['firstname'] + ' ' + attendee.data.attributes['lastname']
    } catch (error) {
      return Promise.reject(error)
    }
  }

  return {
    attendees,
    $reset,
    fetchAttendees,
    registerAttendee,
    checkInAttendee,
    getAttendeeName
  }
})
