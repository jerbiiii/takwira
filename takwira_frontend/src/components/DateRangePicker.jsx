import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import './DateRangePicker.css';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DateRangePicker = ({ terrainId, startDate, endDate, onStartChange, onEndChange }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [occupiedDates, setOccupiedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [direction, setDirection] = useState(0);
  // 'start' = user is picking start date, 'end' = user is picking end date
  const [pickingPhase, setPickingPhase] = useState('start');

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

  // Jump to the month of the startDate when it first loads
  useEffect(() => {
    if (startDate) {
      const d = new Date(startDate + 'T00:00:00');
      if (!isNaN(d)) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, []);

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
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
    const dStr = formatDate(day);
    const d = new Date(dStr + 'T00:00:00');
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < todayMidnight;
  };

  const isOccupied = (day) => {
    const dateStr = formatDate(day);
    const occ = occupiedDates[dateStr];
    if (!occ) return false;
    return occ.type === 'tournament';
  };

  const isStartDate = (day) => startDate && formatDate(day) === startDate;
  const isEndDate = (day) => endDate && formatDate(day) === endDate;

  const isInRange = (day) => {
    if (!startDate) return false;
    const d = formatDate(day);
    const end = endDate || hoveredDate;
    if (!end) return false;
    return d > startDate && d < end;
  };

  const isInHoverRange = (day) => {
    if (!startDate || endDate || !hoveredDate) return false;
    const d = formatDate(day);
    if (hoveredDate >= startDate) {
      return d > startDate && d <= hoveredDate;
    }
    return false;
  };

  const handleDayClick = (day) => {
    const dateStr = formatDate(day);
    if (isPast(day) || isOccupied(day)) return;

    if (pickingPhase === 'start') {
      onStartChange(dateStr);
      onEndChange('');
      setPickingPhase('end');
    } else {
      // picking end
      if (dateStr < startDate) {
        // clicked before start → reset: this becomes new start
        onStartChange(dateStr);
        onEndChange('');
        setPickingPhase('end');
      } else if (dateStr === startDate) {
        // same day → set as single-day range
        onEndChange(dateStr);
        setPickingPhase('start');
      } else {
        onEndChange(dateStr);
        setPickingPhase('start');
      }
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const canGoPrev = !(currentMonth === today.getMonth() && currentYear === today.getFullYear());

  // Status label for user guidance
  const statusLabel = !startDate
    ? 'Sélectionnez la date de début'
    : !endDate
      ? 'Sélectionnez la date de fin'
      : `${startDate} → ${endDate}`;

  return (
    <div className="drp">
      {/* Status bar */}
      <div className="drp__status">
        <div className={`drp__status-dot ${startDate && endDate ? 'done' : 'picking'}`} />
        <span>{statusLabel}</span>
      </div>

      {/* Header */}
      <div className="drp__header">
        <button type="button" className="drp__nav-btn" onClick={prevMonth} disabled={!canGoPrev}>
          <ChevronLeft size={18} />
        </button>
        <span className="drp__month-label">
          {MONTHS_FR[currentMonth]} {currentYear}
        </span>
        <button type="button" className="drp__nav-btn" onClick={nextMonth}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="drp__weekdays">
        {DAYS_FR.map(d => (
          <div key={d} className="drp__weekday">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentYear}-${currentMonth}`}
          className="drp__grid"
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {loading && (
            <div className="drp__loading">
              <div className="drp__spinner" />
            </div>
          )}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="drp__cell drp__cell--empty" />;
            }

            const past = isPast(day);
            const occupied = isOccupied(day);
            const disabled = past || occupied;
            const start = isStartDate(day);
            const end = isEndDate(day);
            const inRange = isInRange(day) || isInHoverRange(day);

            return (
              <div
                key={day}
                className={[
                  'drp__cell',
                  start && 'drp__cell--start',
                  end && 'drp__cell--end',
                  inRange && 'drp__cell--in-range',
                  start && end && 'drp__cell--single',
                  isToday(day) && 'drp__cell--today',
                  past && 'drp__cell--past',
                  occupied && 'drp__cell--occupied',
                  disabled && 'drp__cell--disabled',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => {
                  if (!disabled && pickingPhase === 'end' && startDate) {
                    setHoveredDate(formatDate(day));
                  }
                }}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <span className="drp__day-number">{day}</span>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="drp__legend">
        <div className="drp__legend-item">
          <span className="drp__legend-dot drp__legend-dot--start" />
          <span>Début</span>
        </div>
        <div className="drp__legend-item">
          <span className="drp__legend-dot drp__legend-dot--range" />
          <span>Durée</span>
        </div>
        <div className="drp__legend-item">
          <span className="drp__legend-dot drp__legend-dot--end" />
          <span>Fin</span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
