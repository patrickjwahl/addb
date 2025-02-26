import { Category } from "@prisma/client"

export const stateNames = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District Of Columbia", "Dreamland", "Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]

export const taglines: { [state: string]: string } = {
    Texas: "Don't mess with",
    Rhode_Island: "It's famous for you"
}

export const eventOrdering: Category[] = ['math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview']
export const friendlyColumn: { [category: string]: string } = {
    math: 'Mth',
    music: 'Mus',
    econ: 'Ecn',
    science: 'Sci',
    lit: 'Lit',
    art: 'Art',
    socialScience: 'Soc',
    essay: 'Ess',
    speech: 'Spe',
    interview: 'Int',
    objs: 'Objs',
    subs: 'Subs',
    overall: 'Overall'
}
export const objs: Category[] = ['math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience']
export const subs: Category[] = ['essay', 'speech', 'interview']

export const friendlyRound: { [name: string]: string } = {
    roundone: "Round One",
    regionals: "Regionals",
    state: "State",
    nationals: "Nationals"
}

export const roundOrder = ['roundone', 'regionals', 'state', 'nationals']

export const divisions: { [key: string]: string } = {
    'L': 'Large Schools',
    'M': 'Medium Schools',
    'S': 'Small Schools',
    'XS': 'Extra Small Schools',
    'N': 'Novice Schools',
    '1': 'Division I',
    '2': 'Division II',
    '3': 'Division III',
    '4': 'Division IV',
    'I': 'Division I',
    'II': 'Division II',
    'III': 'Division III',
    'IV': 'Division IV',
    'V': 'Division V',
    'Red': 'Red Division',
    'Blue': 'Blue Division',
    'White': 'White Division',
    'Nittany': 'Nittany',
    'Susquehanna': 'Susquehanna',
    'null': "No Division Specified",
    'all': ''
}

export const divisionsOrder: string[] = [
    'L', 'M', 'S', 'XS', 'N', '1', '2', '3', '4', 'I', 'II', 'III', 'IV', 'V', 'Red', 'Blue', 'White', 'Nittany', 'Susquehanna', 'null', 'all'
]