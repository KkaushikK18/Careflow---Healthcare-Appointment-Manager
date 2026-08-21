export type Role = 'patient' | 'doctor' | 'admin'

export type Appointment = {
  id: string
  patient: string
  doctor: string
  specialty: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed'
  mode: 'Video visit' | 'In clinic'
}

export const appointments: Appointment[] = [
  { id: 'cf-1042', patient: 'Maya Chen', doctor: 'Dr. Ananya Rao', specialty: 'Cardiology', date: 'Tomorrow', time: '10:30 AM', status: 'confirmed', mode: 'Video visit' },
  { id: 'cf-1038', patient: 'Jordan Lee', doctor: 'Dr. Ananya Rao', specialty: 'Cardiology', date: 'Thu, Jun 20', time: '2:00 PM', status: 'pending', mode: 'In clinic' },
  { id: 'cf-1035', patient: 'Maya Chen', doctor: 'Dr. Tomas Varga', specialty: 'Dermatology', date: 'May 28', time: '9:15 AM', status: 'completed', mode: 'In clinic' },
]

export const doctors = [
  { name: 'Dr. Ananya Rao', specialty: 'Cardiology', initials: 'AR', tone: 'teal', rating: '4.9', next: 'Today, 4:30 PM' },
  { name: 'Dr. Tomas Varga', specialty: 'Dermatology', initials: 'TV', tone: 'navy', rating: '4.8', next: 'Tomorrow, 9:15 AM' },
  { name: 'Dr. Eliana Park', specialty: 'General medicine', initials: 'EP', tone: 'mint', rating: '4.9', next: 'Fri, Jun 21' },
]

export const medications = [
  { name: 'Atorvastatin', dose: '20 mg · once daily', time: '8:00 AM', state: 'Taken' },
  { name: 'Lisinopril', dose: '10 mg · once daily', time: '8:00 PM', state: 'Due tonight' },
]

export async function getDashboardData() {
  return { appointments, doctors, medications }
}

export async function getAdminMetrics() {
  return { appointments: '1,284', completion: '94.8%', response: '12 min', activeDoctors: '48' }
}

export async function getAiSummary() {
  return { status: 'ready' as const, text: 'Maya reports intermittent palpitations over the last two weeks, more noticeable after caffeine. No syncope or chest pain reported.' }
}
