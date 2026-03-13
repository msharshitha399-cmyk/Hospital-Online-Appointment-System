import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { SPECIALIZATIONS } from '../constants';
import { AppointmentStatus } from '../types';
import { Calendar, Clock, Stethoscope, Search, Sparkles, AlertCircle } from 'lucide-react';
import { analyzeSymptoms } from '../services/geminiService';

export const PatientDashboard = () => {
  const { doctors, bookAppointment, appointments, currentUser } = useData();
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activeTab, setActiveTab] = useState<'book' | 'history'>('book');
  
  // AI Logic State
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{spec: string, reason: string} | null>(null);

  const myAppointments = appointments.filter(a => a.patientId === currentUser?.id);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => !selectedSpec || d.specialization === selectedSpec);
  }, [doctors, selectedSpec]);

  const handleAiAnalysis = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    setAiRecommendation(null);
    
    try {
      const result = await analyzeSymptoms(symptoms);
      setAiRecommendation({
        spec: result.recommendedSpecialist,
        reason: result.reasoning
      });
      // Auto-select the recommendation
      if (SPECIALIZATIONS.includes(result.recommendedSpecialist)) {
        setSelectedSpec(result.recommendedSpecialist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedDoctor);
    if (doc && date && time) {
      bookAppointment({
        doctorId: doc.id,
        doctorName: doc.name,
        specialization: doc.specialization,
        date,
        time,
        symptoms: symptoms || 'Routine Checkup'
      });
      
      alert('Appointment booked successfully!');
      
      // Reset Form fully
      setDate('');
      setTime('');
      setSymptoms('');
      setAiRecommendation(null);
      setSelectedDoctor('');
      setSelectedSpec('');
      
      // Switch to history tab to show the new appointment
      setActiveTab('history');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Portal</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('book')}
              className={`${
                activeTab === 'book'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition`}
            >
              Book New Appointment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition`}
            >
              My Appointments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'book' ? (
            <div className="space-y-8">
              {/* AI Section */}
              <div className="bg-teal-50 border border-teal-100 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-teal-900">AI Health Assistant</h3>
                    <p className="mt-1 text-sm text-teal-700">
                      Describe your symptoms, and our AI will recommend the right specialist for you.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        className="flex-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        placeholder="e.g., severe headache and sensitivity to light"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                      />
                      <button
                        onClick={handleAiAnalysis}
                        disabled={isAnalyzing || !symptoms}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                    {aiRecommendation && (
                      <div className="mt-4 p-4 bg-white rounded-md border border-teal-200 shadow-sm animate-fade-in">
                        <p className="text-sm font-medium text-gray-900">
                          Recommended: <span className="text-primary">{aiRecommendation.spec}</span>
                        </p>
                        <p className="text-sm text-gray-600 italic mt-1">"{aiRecommendation.reason}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Filter by Specialization</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      value={selectedSpec}
                      onChange={(e) => setSelectedSpec(e.target.value)}
                    >
                      <option value="">All Specializations</option>
                      {SPECIALIZATIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
                  <select
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Choose a doctor...</option>
                    {filteredDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      required
                      className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      disabled={!selectedDoctor}
                    >
                       <option value="">Select Time</option>
                       {selectedDoctor && doctors.find(d => d.id === selectedDoctor)?.availability.map(t => (
                         <option key={t} value={t}>{t}</option>
                       ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {myAppointments.length === 0 ? (
                    <div className="py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by booking a new appointment.</p>
                    </div>
                ) : (
                    myAppointments.map((appt) => (
                    <li key={appt.id} className="py-5">
                        <div className="relative focus-within:ring-2 focus-within:ring-primary">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Dr. {appt.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {appt.specialization}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" /> {appt.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {appt.time}
                            </span>
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                appt.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                                appt.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {appt.status}
                            </span>
                        </div>
                         {appt.symptoms && (
                             <p className="mt-2 text-xs text-gray-400">Reason: {appt.symptoms}</p>
                         )}
                        </div>
                    </li>
                    ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};