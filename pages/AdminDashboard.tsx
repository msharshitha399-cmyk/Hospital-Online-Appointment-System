import React from 'react';
import { useData } from '../context/DataContext';
import { AppointmentStatus } from '../types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const { appointments, updateAppointmentStatus } = useData();

  // Sort: Pending first, then by date
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === AppointmentStatus.PENDING && b.status !== AppointmentStatus.PENDING) return -1;
    if (a.status !== AppointmentStatus.PENDING && b.status === AppointmentStatus.PENDING) return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all scheduled appointments including patient details, doctor, and current status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
           <div className="bg-white p-2 rounded shadow-sm text-sm text-gray-500">
                Total Appointments: <span className="font-bold text-primary">{appointments.length}</span>
           </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason/Symptoms</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {appt.patientName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                         {appt.doctorName}
                         <div className="text-xs text-gray-400">{appt.specialization}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appt.date} <br/> <span className="text-xs">{appt.time}</span>
                      </td>
                       <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {appt.symptoms || "N/A"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            appt.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                            appt.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {appt.status === AppointmentStatus.PENDING && (
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => updateAppointmentStatus(appt.id, AppointmentStatus.COMPLETED)}
                                    className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded hover:bg-green-100"
                                    title="Mark Completed"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => updateAppointmentStatus(appt.id, AppointmentStatus.CANCELLED)}
                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded hover:bg-red-100"
                                    title="Cancel Appointment"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        {appt.status !== AppointmentStatus.PENDING && (
                            <span className="text-gray-400 text-xs italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedAppointments.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No appointments found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};