import React, { useState } from 'react';
import TicketCard from './TicketCard';
import '../../styles.css';

const TicketQueue = () => {
  // Mock ticket data - simulating tickets submitted by students
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

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.ticketId === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  };

  const updateTicketWithNotes = (ticketId, notes) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.ticketId === ticketId
          ? { ...ticket, status: 'Completed', guidanceNotes: notes }
          : ticket
      )
    );
  };

  // Sort tickets: Submitted first, then by priority (High > Medium > Low)
  const sortedTickets = [...tickets].sort((a, b) => {
    if (a.status === 'Submitted' && b.status !== 'Submitted') return -1;
    if (a.status !== 'Submitted' && b.status === 'Submitted') return 1;
    
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="ticket-queue">
      {sortedTickets.length === 0 ? (
        <p className="empty-queue">No counselling requests at this time.</p>
      ) : (
        <div className="ticket-list">
          {sortedTickets.map(ticket => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onStatusUpdate={updateTicketStatus}
              onCloseTicket={updateTicketWithNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketQueue;

