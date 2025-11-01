import PubSub from './pub_sub'

const BUS = PubSub<{
  flashCardFromQuestion: (text: string) => void
  flashCardFromAnswer: (text: string) => void
  flashCardsFromAI: (text: string) => void
}>()

export default BUS
