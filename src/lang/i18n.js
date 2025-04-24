import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en/en.json'
import pt from './pt/pt.json'

const resources = {
  en,
  pt
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en'
})

export default { i18n }