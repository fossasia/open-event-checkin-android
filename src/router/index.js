import AuthTemplate from '@/AuthTemplate.vue'
import CheckInCamera from '@/components/CheckIn/CheckInCamera.vue'
import CheckInStats from '@/components/CheckIn/CheckInStats.vue'
import EventyayEventCheckIn from '@/components/Eventyay/EventyayEventCheckIn.vue'
import EventyayEvents from '@/components/Eventyay/EventyayEvents.vue'
import EventyayLeedLogin from '@/components/Eventyay/EventyayLeedLogin.vue'
import EventyaySearchCheckIn from '@/components/Eventyay/EventyaySearchCheckIn.vue'
import LeadScanning from '@/components/Eventyay/LeadScanning.vue'
import Device from '@/components/Registration/Device/Device.vue'
import RegistrationKiosk from '@/components/Registration/Kiosk/KioskOverview.vue'
import RegistrationStats from '@/components/Registration/Station/RegistrationStats.vue'
import RegistrationStation from '@/components/Registration/Station/StationOverview.vue'
import { useLoadingStore } from '@/stores/loading'
import CheckInView from '@/views/CheckInView.vue'
import NotFound from '@/views/NotFound.vue'
import RegistrationView from '@/views/RegistrationView.vue'
import SelectStation from '@/views/SelectStation.vue'
import UserAuth from '@/views/UserAuth.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'userAuth',
      component: UserAuth
    },
    {
      path: '/device',
      name: 'device',
      component: Device
    },
    {
      path: '/eventyayevents',
      name: 'eventyayevents',
      component: EventyayEvents
    },
    {
      path: '/eventyaycheckin',
      name: 'eventyaycheckin',
      component: EventyayEventCheckIn
    },
    {
      path: '/eventyaysearchcheckin',
      name: 'eventyaysearchcheckin',
      component: EventyaySearchCheckIn
    },
    {
      path: '/eventyayleedlogin',
      name: 'eventyayleedlogin',
      component: EventyayLeedLogin
    },
    {
      path: '/leadscan',
      name: 'leadscan',
      component: LeadScanning
    },
    {
      path: '/panel',
      name: 'auth',
      component: AuthTemplate,
      children: [
        {
          path: 'select-station',
          name: 'selectStation',
          component: SelectStation
        },
        {
          path: ':eventId/registration/:registrationType/:stationId',
          name: 'registration',
          redirect: { name: 'registerKiosk' },
          component: RegistrationView,
          children: [
            {
              path: 'kiosk',
              name: 'registerKiosk',
              component: RegistrationKiosk
            },
            {
              path: 'station',
              name: 'registerStation',
              component: RegistrationStation
            },
            {
              path: 'stats',
              name: 'registerStats',
              component: RegistrationStats
            }
          ]
        },
        {
          // stationId = microlocation over here
          path: ':eventId/:stationId/:scannerType',
          name: 'checkIn',
          redirect: { name: 'checkInCamera' },
          component: CheckInView,
          children: [
            {
              path: 'station',
              name: 'checkInCamera',
              component: CheckInCamera
            },
            {
              path: 'stats',
              name: 'checkInStats',
              component: CheckInStats
            }
          ]
        }
      ]
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
  ]
})

router.beforeEach((to, from, next) => {
  const loadingStore = useLoadingStore()
  loadingStore.contentLoading()
  next()
})

export default router
