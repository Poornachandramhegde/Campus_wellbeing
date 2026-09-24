import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const { user } = useAuth();

  // Dynamically resolve student profile from authenticated session
  const student = user
    ? {
        id: user.id,
        name: user.name,
        studentId: user.usn || String(user.id),
        email: user.email,
        department: user.department || 'Computer Science and Engineering',
        year: user.semester ? `${Math.ceil(Number(user.semester) / 2)}th Year` : '2nd Year',
        semester: user.semester ? `${user.semester}th Semester` : '3rd Semester',
        mentor: {
          name: user.mentor_name || 'Dr. Archana J R',
          email: user.mentor_email || 'archanajr@rnsitmba.ac.in',
          department: 'MBA'
        }
      }
    : {
        id: 0,
        name: 'Guest Student',
        studentId: '1RN24CS000',
        email: 'student@rnsit.ac.in',
        department: 'Computer Science',
        year: '2nd Year',
        semester: '3rd Semester',
        mentor: {
          name: 'Dr. Archana J R',
          email: 'archanajr@rnsitmba.ac.in',
          department: 'MBA'
        }
      };


  // Mock initial ticket data - simulating tickets submitted by students
  const [tickets, setTickets] = useState([
    {
      ticketId: 'TKT-1703123456789-123',
      studentId: '1RN24CS026',
      studentName: 'Kiran S',
      preferredDate: '2024-01-15',
      preferredTime: '14:00',
      reason: 'Feeling overwhelmed with academic workload and need guidance on time management strategies.',
      priority: 'High',
      status: 'Submitted',
      submittedDate: '2024-01-10'
    },
    {
      ticketId: 'TKT-1703123456789-456',
      studentId: '1RN24CS189',
      studentName: 'Maitri S',
      preferredDate: '2024-01-18',
      preferredTime: '10:30',
      reason: 'Would like to discuss career planning and explore different options for my future.',
      priority: 'Medium',
      status: 'Submitted',
      submittedDate: '2024-01-11'
    },
    {
      ticketId: 'TKT-1703123456789-789',
      studentId: '1RN24CS276',
      studentName: 'Pushkar',
      preferredDate: '2024-01-20',
      preferredTime: '15:00',
      reason: 'General inquiry about available support resources and services.',
      priority: 'Low',
      status: 'Accepted',
      submittedDate: '2024-01-09'
    },
    {
      ticketId: 'TKT-1703123456789-321',
      studentId: '1RX24CS108',
      studentName: 'Nikhil',
      preferredDate: '2024-01-16',
      preferredTime: '11:00',
      reason: 'Need support with stress management techniques and maintaining work-life balance.',
      priority: 'High',
      status: 'Submitted',
      submittedDate: '2024-01-12'
    }
  ]);

  // Load and merge backend appointments at startup
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/counselling/list');
        if (response.ok) {
          const backendApps = await response.json();
          // Map backend appointments into standard ticket format
          const mappedTickets = backendApps.map((app) => ({
            ticketId: app.appointmentId,
            studentId: app.studentId,
            studentName: app.studentName,
            preferredDate: app.preferredDate,
            preferredTime: app.preferredTime,
            reason: app.reason,
            priority: app.priority,
            status: app.status,
            submittedDate: app.createdAt.split('T')[0],
            meetingLink: app.meetingLink,
            mode: app.mode
          }));

          setTickets((prev) => {
            const all = [...mappedTickets];
            prev.forEach((t) => {
              if (!all.some((x) => x.ticketId === t.ticketId)) {
                all.push(t);
              }
            });
            return all;
          });
        }
      } catch (err) {
        console.warn('Backend server is offline or unreachable. Using in-memory simulation only.');
      }
    };

    fetchAppointments();
  }, []);

  const addTicket = (newTicket) => {
    setTickets((prevTickets) => [newTicket, ...prevTickets]);
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.ticketId === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  const updateTicketWithNotes = (ticketId, notes) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.ticketId === ticketId
          ? { ...ticket, status: 'Completed', guidanceNotes: notes }
          : ticket
      )
    );
  };

  return (
    <TicketContext.Provider
      value={{
        student,
        tickets,
        addTicket,
        updateTicketStatus,
        updateTicketWithNotes
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
