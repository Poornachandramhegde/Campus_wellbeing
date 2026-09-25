import React, { useState, useEffect, useRef, useContext } from 'react';
import { TicketContext } from '../context/TicketContext';
import '../styles.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const ChatbotWidget = () => {
  const { student, addTicket } = useContext(TicketContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('GREETING');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState({
    mode: null,
    preferredDate: null,
    preferredTime: null,
    reason: null,
    priority: null
  });

  const messagesEndRef = useRef(null);

  // Initialize greeting on open or mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: "Hi! I'm your student counselling assistant. How can I help you today?",
          options: [
            'Book a counselling session',
            'View counselling information',
            'Check how counselling works',
            'Cancel or reschedule a session',
            'I have another question'
          ]
        }
      ]);
    }
  }, [messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateDateOptions = () => {
    const dates = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate dates for the next 3 days
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${d.getDate()} ${months[d.getMonth()]} (${days[d.getDay()]})`;
      dates.push({ value: dateString, label });
    }
    return dates;
  };

  const addMessage = (sender, text, options = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random().toString(),
        sender,
        text,
        options
      }
    ]);
  };

  const handleOptionSelect = (optionText) => {
    if (isLoading) return;

    // Add student message
    addMessage('student', optionText);

    // Map display options back to state values if necessary
    let value = optionText;
    if (optionText === 'Book a counselling session') value = 'book';
    else if (optionText === 'View counselling information') value = 'info';
    else if (optionText === 'Check how counselling works') value = 'how_works';
    else if (optionText === 'Cancel or reschedule a session') value = 'cancel';
    else if (optionText === 'I have another question') value = 'other_q';

    if (currentStep === 'GREETING') {
      if (value === 'book') {
        setCurrentStep('SELECT_MODE');
        setTimeout(() => {
          addMessage(
            'bot',
            'Sure. I can help you book a counselling session. Would you prefer an online or offline session?',
            ['Offline', 'Online']
          );
        }, 500);
      } else if (value === 'info') {
        setTimeout(() => {
          addMessage(
            'bot',
            'Your assigned counsellor is Dr. Leena C. Her email is leenac@rnsit.ac.in. Her office hours are Monday-Friday, 9:00 AM - 5:00 PM.',
            ['Back to main menu']
          );
        }, 500);
      } else if (value === 'how_works') {
        setTimeout(() => {
          addMessage(
            'bot',
            'You can book a session by selecting a preferred date, time, reason, and priority. High priority requests are addressed within 24 hours, medium within 2-3 days, and low within 7 working days.',
            ['Back to main menu']
          );
        }, 500);
      } else if (value === 'cancel') {
        setTimeout(() => {
          addMessage(
            'bot',
            'To cancel or reschedule a session, please reach out directly to your assigned counsellor (leenac@rnsit.ac.in) or visit the counselling office.',
            ['Back to main menu']
          );
        }, 500);
      } else if (value === 'other_q') {
        setTimeout(() => {
          addMessage(
            'bot',
            'Please visit the Counselling Centre or email our support staff at wellbeing@ac.in for any other inquiries.',
            ['Back to main menu']
          );
        }, 500);
      }
    } else if (currentStep === 'SELECT_MODE') {
      setBooking((prev) => ({ ...prev, mode: optionText }));
      setCurrentStep('SELECT_DATE');
      const dateOpts = generateDateOptions();
      setTimeout(() => {
        addMessage(
          'bot',
          `Great. Let's book an ${optionText.toLowerCase()} counselling session. Please select your preferred counselling date.`,
          dateOpts.map((d) => d.label)
        );
      }, 500);
    } else if (currentStep === 'SELECT_DATE') {
      // Find internal YYYY-MM-DD from the formatted option text label
      const dateOpts = generateDateOptions();
      const matched = dateOpts.find((d) => d.label === optionText);
      const dateVal = matched ? matched.value : optionText;

      setBooking((prev) => ({ ...prev, preferredDate: dateVal }));
      setCurrentStep('SELECT_TIME');
      setTimeout(() => {
        addMessage('bot', 'Please select your preferred time.', [
          '09:30 AM',
          '11:00 AM',
          '02:00 PM',
          '03:30 PM'
        ]);
      }, 500);
    } else if (currentStep === 'SELECT_TIME') {
      setBooking((prev) => ({ ...prev, preferredTime: optionText }));
      setCurrentStep('COLLECT_REASON');
      setTimeout(() => {
        addMessage('bot', 'What would you like support with?', [
          'Academic stress',
          'Personal concerns',
          'Time management',
          'Exam pressure',
          'Career concerns',
          'Other'
        ]);
      }, 500);
    } else if (currentStep === 'COLLECT_REASON') {
      if (optionText === 'Other') {
        setCurrentStep('COLLECT_REASON_OTHER');
        setTimeout(() => {
          addMessage('bot', 'Please enter your reason in the text box below:');
        }, 500);
      } else {
        setBooking((prev) => ({ ...prev, reason: optionText }));
        setCurrentStep('SELECT_PRIORITY');
        setTimeout(() => {
          addMessage('bot', 'How would you describe the urgency of your request?', [
            'Low',
            'Medium',
            'High'
          ]);
        }, 500);
      }
    } else if (currentStep === 'SELECT_PRIORITY') {
      setBooking((prev) => {
        const nextBk = { ...prev, priority: optionText };
        setCurrentStep('CONFIRM_BOOKING');
        setTimeout(() => {
          addMessage(
            'bot',
            `Please confirm your counselling request:\n\n• Mode: ${nextBk.mode}\n• Date: ${nextBk.preferredDate}\n• Time: ${nextBk.preferredTime}\n• Reason: ${nextBk.reason}\n• Priority: ${nextBk.priority}`,
            ['Confirm booking', 'Change details', 'Cancel']
          );
        }, 500);
        return nextBk;
      });
    } else if (currentStep === 'CONFIRM_BOOKING') {
      if (optionText === 'Confirm booking') {
        setIsLoading(true);
        addMessage('bot', `Booking your ${booking.mode.toLowerCase()} counselling session...`);

        const payload = {
          studentId: student.studentId,
          studentName: student.name,
          studentEmail: student.email,
          mentorName: student.mentor?.name || 'Dr. Archana J R',
          mentorEmail: student.mentor?.email || 'archanajr@rnsitmba.ac.in',
          counsellorId: 'leenac',
          counsellorName: 'Dr. Leena C',
          counsellorEmail: 'leenac@rnsit.ac.in',
          mode: booking.mode,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          reason: booking.reason,
          priority: booking.priority
        };

        fetch(`${API_URL}/api/counselling/book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(async (response) => {
            const data = await response.json();
            setIsLoading(false);

            if (response.ok && data.success) {
              const newTicket = {
                ticketId: data.appointmentId,
                studentId: student.studentId,
                studentName: student.name,
                preferredDate: booking.preferredDate,
                preferredTime: booking.preferredTime,
                reason: booking.reason,
                priority: booking.priority,
                status: 'Submitted',
                submittedDate: new Date().toISOString().split('T')[0],
                mode: booking.mode,
                meetingLink: data.meetingLink
              };
              addTicket(newTicket);

              setCurrentStep('BOOKING_SUCCESS');
              if (booking.mode === 'Offline') {
                addMessage(
                  'bot',
                  `Your offline counselling session has been successfully booked.\n\n• Mode: Offline\n• Date: ${booking.preferredDate}\n• Time: ${booking.preferredTime}\n• Counsellor: Dr. Leena C\n• Reason: ${booking.reason}\n• Priority: ${booking.priority}\n\n• Appointment ID: ${data.appointmentId}\n\nConfirmation emails have been sent to you and your counsellor.`,
                  ['Done', 'Book another session']
                );
              } else {
                addMessage(
                  'bot',
                  `Your online counselling session has been successfully booked.\n\n• Mode: Online\n• Date: ${booking.preferredDate}\n• Time: ${booking.preferredTime}\n• Counsellor: Dr. Leena C\n• Reason: ${booking.reason}\n• Priority: ${booking.priority}\n\nGoogle Meet:\n${data.meetingLink}\n\n• Appointment ID: ${data.appointmentId}\n\nConfirmation emails have been sent to you and your counsellor.`,
                  ['Done', 'Book another session']
                );
              }
            } else {
              // Handle credential error specific state
              if (data.errorType === 'GOOGLE_AUTH_REQUIRED') {
                setCurrentStep('BOOKING_ERROR');
                addMessage(
                  'bot',
                  'Google OAuth credentials are required before the real Calendar/Meet integration can be tested.',
                  ['Try Again', 'Cancel']
                );
              } else {
                // Standard failures
                setCurrentStep('BOOKING_ERROR');
                addMessage(
                  'bot',
                  data.message || `I couldn't complete your ${booking.mode.toLowerCase()} counselling booking right now. Please try again.`,
                  ['Try Again', 'Cancel']
                );
              }
            }
          })
          .catch(() => {
            setIsLoading(false);
            setCurrentStep('BOOKING_ERROR');
            addMessage(
              'bot',
              `I couldn't complete your ${booking.mode.toLowerCase()} counselling booking right now. The backend server appears to be offline. Please try again.`,
              ['Try Again', 'Cancel']
            );
          });
      } else if (optionText === 'Change details') {
        setCurrentStep('SELECT_MODE');
        setTimeout(() => {
          addMessage(
            'bot',
            "Let's revise your request. Would you prefer an online or offline session?",
            ['Offline', 'Online']
          );
        }, 500);
      } else {
        // Cancel
        handleReset();
      }
    } else if (currentStep === 'BOOKING_SUCCESS') {
      if (optionText === 'Book another session') {
        setBooking({
          mode: null,
          preferredDate: null,
          preferredTime: null,
          reason: null,
          priority: null
        });
        setCurrentStep('SELECT_MODE');
        setTimeout(() => {
          addMessage(
            'bot',
            "Let's start a new booking. Would you prefer an online or offline session?",
            ['Offline', 'Online']
          );
        }, 500);
      } else {
        handleReset();
      }
    } else if (currentStep === 'BOOKING_ERROR') {
      if (optionText === 'Try Again') {
        setCurrentStep('CONFIRM_BOOKING');
        setTimeout(() => {
          addMessage(
            'bot',
            `Please confirm your counselling request:\n\n• Mode: ${booking.mode}\n• Date: ${booking.preferredDate}\n• Time: ${booking.preferredTime}\n• Reason: ${booking.reason}\n• Priority: ${booking.priority}`,
            ['Confirm booking', 'Change details', 'Cancel']
          );
        }, 500);
      } else {
        handleReset();
      }
    } else if (optionText === 'Back to main menu') {
      handleReset();
    }
  };

  const handleCustomReasonSubmit = (e) => {
    e.preventDefault();
    if (!customReason.trim()) return;

    const reasonVal = customReason.trim();
    addMessage('student', reasonVal);
    setBooking((prev) => ({ ...prev, reason: reasonVal }));
    setCustomReason('');
    setCurrentStep('SELECT_PRIORITY');
    setTimeout(() => {
      addMessage('bot', 'How would you describe the urgency of your request?', [
        'Low',
        'Medium',
        'High'
      ]);
    }, 500);
  };

  const handleReset = () => {
    setCurrentStep('GREETING');
    setBooking({
      mode: null,
      preferredDate: null,
      preferredTime: null,
      reason: null,
      priority: null
    });
    setCustomReason('');
    setIsLoading(false);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: "Hi! I'm your student counselling assistant. How can I help you today?",
        options: [
          'Book a counselling session',
          'View counselling information',
          'Check how counselling works',
          'Cancel or reschedule a session',
          'I have another question'
        ]
      }
    ]);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Action Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Toggle counselling chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Chat Window Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="bot-avatar">🤖</span>
              <div>
                <h3>Counselling Assistant</h3>
                <span className="status-indicator">Online</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-header-btn"
                onClick={handleReset}
                disabled={isLoading}
                title="Restart conversation"
              >
                🔄
              </button>
              <button
                className="chatbot-header-btn close-btn"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                title="Minimize chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Dialogue Log Content */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg-row ${msg.sender}`}>
                {msg.sender === 'bot' && <span className="msg-avatar">🤖</span>}
                <div className={`chatbot-msg-bubble ${msg.sender}`}>
                  <p className="msg-text">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-msg-row bot">
                <span className="msg-avatar">🤖</span>
                <div className="chatbot-msg-bubble bot">
                  <p className="msg-text">Booking your online session. Please wait...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chatbot Options & Input Footer */}
          <div className="chatbot-footer">
            {/* Show Predefined Options */}
            {!isLoading && currentStep !== 'COLLECT_REASON_OTHER' &&
              messages[messages.length - 1]?.options && (
                <div className="chatbot-options-container">
                  {messages[messages.length - 1].options.map((option) => (
                    <button
                      key={option}
                      className="chatbot-option-btn"
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

            {/* Custom Reason Text Input Form */}
            {!isLoading && currentStep === 'COLLECT_REASON_OTHER' && (
              <form onSubmit={handleCustomReasonSubmit} className="chatbot-input-form">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Type your reason here..."
                  className="chatbot-text-input"
                  autoFocus
                  required
                />
                <button type="submit" className="chatbot-send-btn">
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
