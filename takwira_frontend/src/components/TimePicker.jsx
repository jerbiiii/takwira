import { useState, useMemo } from 'react';
import { Clock, Sun, Sunrise, Moon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './TimePicker.css';

const TimePicker = ({ value, onChange, occupiedSlots = [], selectedDate = '', dark = false }) => {
  const [activeTab, setActiveTab] = useState('afternoon'); // sunrise, sun, moon

  // Helper to check if a specific time choice (e.g. "18:00") overlaps with existing bookings
  // We assume every match lasts 2 hours
  const isSlotOccupied = (slot) => {
    if (!occupiedSlots || !occupiedSlots.length) return false;
    
    // Convert choice to numeric minutes for comparison
    const [h, m] = slot.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + 120; // 2 hour duration
    
    return occupiedSlots.some(occ => {
      const [sh, sm] = occ.start.split(':').map(Number);
      const [eh, em] = occ.end.split(':').map(Number);
      const occStart = sh * 60 + sm;
      const occEnd = eh * 60 + em;
      
      // Typical overlap: (start1 < end2) AND (end1 > start2)
      return (startMins < occEnd) && (endMins > occStart);
    });
  };

  // Check if the slot is in the past (only when selectedDate is today)
  const isSlotPast = (slot) => {
    if (!selectedDate) return false;
    const today = new Date();
    const selected = new Date(selectedDate + 'T00:00:00');
    // Only filter if the selected date is today
    if (selected.toDateString() !== today.toDateString()) return false;
    const [h, m] = slot.split(':').map(Number);
    const now = today.getHours() * 60 + today.getMinutes();
    const slotMins = h * 60 + m;
    return slotMins <= now;
  };

  const slots = useMemo(() => {
    const all = [];
    // Standard Day Hours (06:00 - 23:30)
    for (let h = 6; h <= 23; h++) {
      const hh = String(h).padStart(2, '0');
      all.push(`${hh}:00`);
      all.push(`${hh}:30`);
    }
    // Late Night Hours (00:00 - 01:00)
    for (let h = 0; h <= 1; h++) {
      const hh = String(h).padStart(2, '0');
      all.push(`${hh}:00`);
      if (h === 0) all.push(`${hh}:30`); // Only 00:30, since 01:30 is too late if 01:00 is last
    }
    return all;
  }, []);

  const categorizedSlots = useMemo(() => {
    return {
      morning: slots.filter(s => parseInt(s) >= 6 && parseInt(s) < 12),
      afternoon: slots.filter(s => parseInt(s) >= 12 && parseInt(s) < 18),
      evening: slots.filter(s => parseInt(s) >= 18),
      night: slots.filter(s => parseInt(s) >= 0 && parseInt(s) < 6),
    };
  }, [slots]);

  const tabs = [
    { id: 'morning', label: 'Matin', icon: <Sunrise size={16} />, range: '06:00 - 12:00' },
    { id: 'afternoon', label: 'Après', icon: <Sun size={16} />, range: '12:00 - 18:00' },
    { id: 'evening', label: 'Soir', icon: <Moon size={16} />, range: '18:00 - 00:00' },
    { id: 'night', label: 'Nuit', icon: <Clock size={16} />, range: '00:00 - 01:00' },
  ];

  return (
    <div className={`time-picker ${dark ? 'time-picker--dark' : ''}`}>
      {/* Tabs / Categories */}
      <div className="time-picker__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`time-picker__tab ${activeTab === tab.id ? 'time-picker__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      <div className="time-picker__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="time-picker__grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {categorizedSlots[activeTab]
              .filter(slot => !isSlotOccupied(slot) && !isSlotPast(slot))
              .map(slot => (
                <button
                  key={slot}
                  type="button"
                  className={`time-picker__slot ${value === slot ? 'time-picker__slot--active' : ''}`}
                  onClick={() => onChange(slot)}
                >
                  {slot}
                </button>
              ))
            }
            {categorizedSlots[activeTab].filter(slot => !isSlotOccupied(slot) && !isSlotPast(slot)).length === 0 && (
              <div className="time-picker__empty-state">
                Aucun créneau disponible pour cette période.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selected Indicator */}
      {value && (
        <motion.div 
          className="time-picker__selected"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Clock size={14} />
          <span>Heure sélectionnée : <strong>{value}</strong></span>
          <ChevronRight size={14} className="ml-auto" />
        </motion.div>
      )}
    </div>
  );
};

export default TimePicker;
