import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Appointment, Doctor, AppointmentStatus, UserRole } from '../types';
import { MOCK_DOCTORS } from '../constants';

interface DataContextType {
  currentUser: User | null;
  users: User[];
  appointments: Appointment[];
  doctors: Doctor[];
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => void;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'patientName' | 'patientId'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const doctors = MOCK_DOCTORS;

  // Initialize data from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('hospital_users');
    const storedAppts = localStorage.getItem('hospital_appointments');
    const storedUser = localStorage.getItem('hospital_current_user');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedAppts) setAppointments(JSON.parse(storedAppts));
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem('hospital_users', JSON.stringify(users));
    localStorage.setItem('hospital_appointments', JSON.stringify(appointments));
    if (currentUser) {
      localStorage.setItem('hospital_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hospital_current_user');
    }
  }, [users, appointments, currentUser]);

  const login = (email: string, password: string, role: UserRole) => {
    // Admin Backdoor
    if (role === UserRole.ADMIN && email === 'admin@hospital.com' && password === 'admin123') {
      const adminUser: User = { id: 'admin', name: 'Administrator', email, role: UserRole.ADMIN };
      setCurrentUser(adminUser);
      return true;
    }

    const foundUser = users.find(u => u.email === email && u.role === role && u.password === password);
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: UserRole.PATIENT
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser); // Auto login
  };

  const bookAppointment = (data: Omit<Appointment, 'id' | 'status' | 'patientName' | 'patientId'>) => {
    if (!currentUser) return;
    
    const newAppt: Appointment = {
      id: Date.now().toString(),
      patientName: currentUser.name,
      patientId: currentUser.id, // Automatically link to current user
      status: AppointmentStatus.PENDING,
      ...data
    };
    
    setAppointments(prev => [...prev, newAppt]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      appointments,
      doctors,
      login,
      logout,
      register,
      bookAppointment,
      updateAppointmentStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};