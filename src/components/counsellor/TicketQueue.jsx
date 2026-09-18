import React, { useContext } from 'react';
import TicketCard from './TicketCard';
import { TicketContext } from '../../context/TicketContext';
import '../../styles.css';

const TicketQueue = () => {
  const { tickets, updateTicketStatus, updateTicketWithNotes } = useContext(TicketContext);

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

