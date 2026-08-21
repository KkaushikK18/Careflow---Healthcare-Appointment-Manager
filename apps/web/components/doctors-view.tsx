'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDoctors, fetchDoctorSlots, bookHold } from '@/lib/api'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from './auth-provider'
import { useToast } from '@/hooks/use-toast'

function Status({ children, tone = '' }: any) { return <span className={`status status-${tone}`}><span className="status-dot" />{children}</span> }
function Avatar({ initials, tone = 'teal' }: any) { return <div className={`avatar avatar-${tone}`}>{initials}</div> }
function Card({ children, className = '' }: any) { return <section className={`surface ${className}`}>{children}</section> }

export function DoctorsView({ active }: { active: string }) {
  const { data: doctors, isLoading, error } = useQuery({ queryKey: ['doctors'], queryFn: fetchDoctors })
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  
  if (isLoading) return <div>Loading doctors...</div>
  if (error) return <div>Failed to load doctors: {error.message}</div>
  
  if (selectedDoc) {
    return <BookingView doctor={selectedDoc} onBack={() => setSelectedDoc(null)} />
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>{active === 'Doctors' ? 'Doctors' : 'Find a doctor'}</h1><p className="muted">Browse care teams, specialties, and availability.</p></div>
      </div>
      <div className="doctor-list-grid">
        {doctors?.map((d: any) => {
          const name = `Dr. ${d.firstName} ${d.lastName}`
          const initials = `${d.firstName[0]}${d.lastName[0]}`
          return (
            <Card key={d.id}>
              <div className="card-heading">
                <Avatar initials={initials} tone="teal"/>
                <Status tone="success">Available</Status>
              </div>
              <h3>{name}</h3>
              <p className="muted">{d.specialisation}</p>
              <button className="outline-button" style={{marginTop: 16}} onClick={() => setSelectedDoc(d)}>
                Book Slot <ChevronRight size={15}/>
              </button>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function BookingView({ doctor, onBack }: { doctor: any, onBack: () => void }) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const today = new Date().toISOString().split('T')[0]
  const { data: slots, isLoading } = useQuery({ 
    queryKey: ['slots', doctor.id, today], 
    queryFn: () => fetchDoctorSlots(doctor.id, today) 
  })
  
  const [symptoms, setSymptoms] = useState('')
  const [booking, setBooking] = useState(false)
  
  const handleBook = async (slot: any) => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login first to book an appointment',
        variant: 'destructive'
      })
      return
    }
    
    setBooking(true)
    try {
      await bookHold(token, {
        doctorId: doctor.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        symptoms
      })
      
      // Invalidate queries to refresh dashboard and records
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      await queryClient.invalidateQueries({ queryKey: ['slots'] })
      await queryClient.invalidateQueries({ queryKey: ['adminMetrics'] })
      
      toast({
        title: 'Success!',
        description: 'Slot booked successfully! Gemini AI is now processing your summary.'
      })
      onBack()
    } catch (e: any) {
      toast({
        title: 'Booking Failed',
        description: e.message || 'Failed to book appointment',
        variant: 'destructive'
      })
    } finally {
      setBooking(false)
    }
  }

  return (
    <Card>
      <button onClick={onBack} className="text-button" style={{marginBottom: 20}}>← Back to doctors</button>
      <h2>Book with Dr. {doctor.firstName} {doctor.lastName}</h2>
      <p className="muted">{doctor.specialisation}</p>
      
      <div style={{marginTop: 20, marginBottom: 20}}>
        <label style={{display: 'block', marginBottom: 8, fontWeight: 600}}>Chief Complaint / Symptoms</label>
        <textarea 
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Describe your symptoms so our AI can prepare a clinical summary for the doctor..."
          style={{width: '100%', height: 80, padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)'}}
        />
      </div>

      <h3>Available Slots Today ({today})</h3>
      {isLoading ? <p>Loading slots...</p> : (
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10}}>
          {slots?.length === 0 && <p className="muted">No slots available today.</p>}
          {slots?.map((slot: any) => (
            <button 
              key={slot.startTime} 
              onClick={() => handleBook(slot)}
              disabled={booking}
              className="outline-button"
            >
              {new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
