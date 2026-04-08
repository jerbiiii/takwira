import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import './DatePicker.css';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DatePicker = ({ terrainId, value, onChange, dark = false, minDate = null }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [occupiedDates, setOccupiedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [direction, setDirection] = useState(0);

  const fetchOccupiedDates = useCallback(async () => {
    if (!terrainId) return;
    setLoading(true);
    try {
      const res = await api.get(`terrains/${terrainId}/occupied-dates/`, {
        params: { year: currentYear, month: currentMonth + 1 }
      });
      const map = {};
      (res.data.occupied_dates || []).forEach(item => {
        map[item.date] = item;
      });
      setOccupiedDates(map);
    } catch (err) {
      console.error('Error fetching occupied dates:', err);
    } finally {
      setLoading(false);
    }
  }, [terrainId, currentMonth, currentYear]);

  useEffect(() => {
    fetchOccupiedDates();
  }, [fetchOccupiedDates]);

  // When value changes externally, update the visible month
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d)) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, []);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday-first
  };

  const prevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const formatDate = (day) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isPast = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  };

  const isOccupied = (day) => {
    const dateStr = formatDate(day);
    return occupiedDates[dateStr];
  };

  const isSelected = (day) => {
    return value === formatDate(day);
  };

  const handleDayClick = (day) => {
    if (isPast(day) || isOccupied(day)) return;
    onChange(formatDate(day));
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  // Build the calendar grid
  const days = [];
  // Empty cells before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const canGoPrev = !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  const getTooltip = (day) => {
    const occ = isOccupied(day);
    if (occ) return occ.reason;
    if (isPast(day)) return 'Date passée';
    return null;
  };

  return (
    <div className={`datepicker ${dark ? 'datepicker--dark' : ''}`}>
      {/* Header */}
      <div className="datepicker__header">
        <button 
          type="button" 
          className="datepicker__nav-btn" 
          onClick={prevMonth}
          disabled={!canGoPrev}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="datepicker__month-label">
          {MONTHS_FR[currentMonth]} {currentYear}
        </span>
        <button type="button" className="datepicker__nav-btn" onClick={nextMonth}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names */}
      <div className="datepicker__weekdays">
        {DAYS_FR.map(d => (
          <div key={d} className="datepicker__weekday">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div 
          key={`${currentYear}-${currentMonth}`}
          className="datepicker__grid"
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {loading && (
            <div className="datepicker__loading">
              <div className="datepicker__spinner" />
            </div>
          )}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="datepicker__cell datepicker__cell--empty" />;
            }

            const occupied = isOccupied(day);
            const past = isPast(day);
            const selected = isSelected(day);
            const todayClass = isToday(day);
            const disabled = past || !!occupied;
            const tooltip = getTooltip(day);

            return (
              <div
                key={day}
                className={[
                  'datepicker__cell',
                  selected && 'datepicker__cell--selected',
                  todayClass && 'datepicker__cell--today',
                  past && 'datepicker__cell--past',
                  occupied && 'datepicker__cell--occupied',
                  occupied?.type === 'tournament' && 'datepicker__cell--tournament',
                  disabled && 'datepicker__cell--disabled',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => !disabled && setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
                title={tooltip || ''}
              >
                <span className="datepicker__day-number">{day}</span>
                {occupied && (
                  <span className="datepicker__occupied-dot" />
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="datepicker__legend">
        <div className="datepicker__legend-item">
          <span className="datepicker__legend-dot datepicker__legend-dot--available" />
          <span>Disponible</span>
        </div>
        <div className="datepicker__legend-item">
          <span className="datepicker__legend-dot datepicker__legend-dot--occupied" />
          <span>Occupé</span>
        </div>
        <div className="datepicker__legend-item">
          <span className="datepicker__legend-dot datepicker__legend-dot--tournament" />
          <span>Tournoi</span>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
