export interface CameroonMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: string;
}

export const cameroonTeamMembers: CameroonMember[] = [
  {
    id: '1',
    name: 'Jean-Paul Mbarga',
    email: 'jp.mbarga@taskflow.cm',
    phone: '+237 6 77 12 34 56',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    role: 'Chef de projet',
    department: 'Management',
  },
  {
    id: '2',
    name: 'Marie-Claire Fotso',
    email: 'mc.fotso@taskflow.cm',
    phone: '+237 6 55 23 45 67',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200',
    role: 'Développeur Senior',
    department: 'Engineering',
  },
  {
    id: '3',
    name: 'Patrick Nganou',
    email: 'p.nganou@taskflow.cm',
    phone: '+237 6 90 34 56 78',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    role: 'Designer UI/UX',
    department: 'Design',
  },
  {
    id: '4',
    name: 'Sandrine Tchamba',
    email: 's.tchamba@taskflow.cm',
    phone: '+237 6 70 45 67 89',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    role: 'Développeur Frontend',
    department: 'Engineering',
  },
  {
    id: '5',
    name: 'Emmanuel Ngono',
    email: 'e.ngono@taskflow.cm',
    phone: '+237 6 99 56 78 90',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    role: 'Développeur Backend',
    department: 'Engineering',
  },
  {
    id: '6',
    name: 'Carine Atangana',
    email: 'c.atangana@taskflow.cm',
    phone: '+237 6 50 67 89 01',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    role: 'Administrateur',
    department: 'Administration',
  },
  {
    id: '7',
    name: 'Hervé Kamga',
    email: 'h.kamga@taskflow.cm',
    phone: '+237 6 78 78 90 12',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    role: 'Analyste QA',
    department: 'Quality',
  },
  {
    id: '8',
    name: 'Nadine Biya',
    email: 'n.biya@taskflow.cm',
    phone: '+237 6 93 89 01 23',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    role: 'Product Owner',
    department: 'Product',
  },
];

export const getRandomCameroonMembers = (count: number): CameroonMember[] => {
  const shuffled = [...cameroonTeamMembers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
