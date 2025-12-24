export type Bubble =
  | {
      id: number
      type: 'image'
      src: string
      size: number
      top: string
      left: string
      float: number
    }
  | {
      id: number
      type: 'text'
      label: string
      value?: string
      bgColor: string
      textColor?: string
      size: number
      top: string
      left: string
      float: number
    }

export const bubbles: Bubble[] = [
  {
    id: 1,
    type: 'text',
    label: '150',
    value: 'Guides\ndisponibles',
    bgColor: '#1F8A70',
    textColor: '#ffffff',
    size: 120,
    top: '5%',
    left: '80%',
    float: 10,
  },
  {
    id: 2,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 180,
    top: '10%',
    left: '55%',
    float: 15,
  },
  {
    id: 3,
    type: 'text',
    label: '657',
    value: 'Voyageurs\nclients',
    bgColor: '#F28C38',
    textColor: '#ffffff',
    size: 140,
    top: '65%',
    left: '75%',
    float: 14,
  },
  {
    id: 4,
    type: 'text',
    label: '2',
    value: 'Pays',
    bgColor: '#FFD966',
    textColor: '#000000',
    size: 100,
    top: '30%',
    left: '15%',
    float: 8,
  },
  {
    id: 5,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 240,
    top: '40%',
    left: '45%',
    float: 18,
  },
  {
    id: 6,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 120,
    top: '15%',
    left: '25%',
    float: 12,
  },
  {
    id: 7,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 160,
    top: '70%',
    left: '50%',
    float: 16,
  },
  {
    id: 8,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 100,
    top: '55%',
    left: '20%',
    float: 10,
  },
  {
    id: 9,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 140,
    top: '25%',
    left: '70%',
    float: 14,
  },
  {
    id: 10,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 90,
    top: '80%',
    left: '30%',
    float: 8,
  },
  {
    id: 11,
    type: 'image',
    src: '/assets/guide-pp-default.avif',
    size: 110,
    top: '50%',
    left: '85%',
    float: 11,
  },
]
