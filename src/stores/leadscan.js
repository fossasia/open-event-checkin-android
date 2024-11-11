import { useCameraStore } from '@/stores/camera'
import { useEventyayApi } from '@/stores/eventyayapi'

import { mande } from 'mande'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLeadScanStore = defineStore('processLeadScan', () => {
  const cameraStore = useCameraStore()
  const message = ref('')
  const showSuccess = ref(false)
  const showError = ref(false)
  const currentLeadId = ref('')

  function $reset() {
    message.value = ''
    showSuccess.value = false
    showError.value = false
  }

  function showErrorMsg(msg) {
    message.value = msg
    showSuccess.value = false
    showError.value = true
  }

  function showSuccessMsg(msg) {
    message.value = msg
    showSuccess.value = true
    showError.value = false
  }

  async function scanLead() {
    const qrData = JSON.parse(cameraStore.qrCodeValue)
    const processApi = useEventyayApi()
    const { apitoken, url, organizer, eventSlug, exikey, exhiname, boothid, boothname } = processApi
    const requestBody = {
      lead: qrData.lead,
      scanned: 'null',
      scan_type: 'lead',
      device_name: 'Test'
    }

    try {
      const headers = {
        Authorization: `Device ${apitoken}`,
        Accept: 'application/json',
        Exhibitor: exikey
      }

      const api = mande(`${url}/api/v1/event/${organizer}/${eventSlug}/exhibitors/lead/create`, {
        headers: headers
      })

      const response = await api.post(requestBody)
      console.log('here', response)

      if (response.success) {
        showSuccessMsg({
          message: 'Lead Scanned Successfully!',
          attendee: response.attendee
        })
        currentLeadId.value = qrData.lead
      }
    } catch (err) {
      console.log('Error details:', err.body)

      if (err.response && err.response.status === 409) {
        showErrorMsg({
          message: err.body.error || 'Lead Already Scanned!',
          attendee: err.body.attendee
        })
        currentLeadId.value = qrData.lead
      } else {
        showErrorMsg({
          message: 'Check-in failed: ' + (err.body?.error || err.message || 'Unknown error'),
          attendee: null
        })
      }
    }
  }

  function downloadCSV(leads) {
    console.log('Downloading CSV')
    const csvData = convertToCSV(leads)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url) // Clean up the URL object
  }

  function convertToCSV(leads) {
    console.log('Converting to CSV')
    const formatDate = (date) => new Date(date).toISOString().split('T')[0]
    const formatTime = (date) => new Date(date).toISOString().split('T')[1].split('.')[0]
    const headers = [
      'ID',
      'Exhibitor',
      'Pseudonymization ID',
      'Scanned Date',
      'Scan Time',
      'Scan Type',
      'Device Name',
      'Booth ID',
      'Booth Name',
      'Attendee Name',
      'Email',
      'Note',
      'Tags'
    ]

    // Convert leads to rows
    const rows = leads.map((lead) => [
      lead.id,
      lead.exhibitor_name,
      lead.pseudonymization_id,
      formatDate(lead.scanned),
      formatTime(lead.scanned),
      lead.scan_type,
      lead.device_name,
      lead.booth_id,
      lead.booth_name,
      lead.attendee.name,
      lead.attendee.email || '',
      lead.attendee.note || '',
      lead.attendee.tags.join('; ')
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape commas and quotes in cell content
            const cellContent = String(cell).replace(/"/g, '""')
            return cellContent.includes(',') ? `"${cellContent}"` : cellContent
          })
          .join(',')
      )
    ].join('\n')

    // Add BOM for Excel UTF-8 compatibility
    return '\uFEFF' + csvContent
  }

  async function exportLeads() {
    console.log('Exporting leads')
    const processApi = useEventyayApi()
    const { apitoken, url, organizer, eventSlug, exikey } = processApi

    try {
      const headers = {
        Authorization: `Device ${apitoken}`,
        Accept: 'application/json',
        Exhibitor: exikey
      }
      const api = mande(`${url}/api/v1/event/${organizer}/${eventSlug}/exhibitors/lead/retrieve`, {
        headers: headers
      })
      const response = await api.get()
      if (response.success) {
        downloadCSV(response.leads)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  return {
    message,
    showSuccess,
    showError,
    currentLeadId,
    scanLead,
    exportLeads,
    $reset
  }
})
