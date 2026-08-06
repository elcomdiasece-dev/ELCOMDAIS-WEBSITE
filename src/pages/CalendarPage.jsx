import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/dbService';
import EventCard from '../components/EventCard';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedDay, setSelectedDay] = useState(null); // Selected date day-number

  // Calendar State: Default to August 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Month index 7 is August

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await dbService.getEvents();
        // Only show published events
        const published = data.filter(e => e.isPublished !== false);
        setEvents(published);
        setFilteredEvents(published);
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Filter events based on search, type, calendar month, and selected day
  useEffect(() => {
    let result = [...events];

    if (searchQuery.trim() !== '') {
      result = result.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'All') {
      result = result.filter(e => e.type.toLowerCase() === selectedType.toLowerCase());
    }

    // Filter by calendar month if selected
    if (selectedMonth !== 'All') {
      result = result.filter(e => {
        const d = new Date(e.startDate);
        return d.getMonth().toString() === selectedMonth;
      });
    }

    // Filter by selected day of current calendar month if selected
    if (selectedDay !== null) {
      result = result.filter(e => {
        const d = new Date(e.startDate);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
      });
    }

    setFilteredEvents(result);
  }, [searchQuery, selectedType, selectedMonth, selectedDay, events, year, month]);

  const handlePrevMonth = () => {
    // Academic year bounds check: limit to July 2026
    if (year === 2026 && month === 6) return;
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null); // Reset selection on month slide
  };

  const handleNextMonth = () => {
    // Academic year bounds check: limit to May 2027
    if (year === 2027 && month === 4) return;
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null); // Reset selection on month slide
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Identify dates in current month with events
  const getEventsForDay = (day) => {
    return events.filter(e => {
      const eDate = new Date(e.startDate);
      return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === day;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedMonth('All');
    setSelectedDay(null);
  };

  // Quick select calendar month
  const syncWithCalendarMonth = (mIdx) => {
    setSelectedMonth(mIdx.toString());
    setCurrentDate(new Date(2026 + (mIdx < 6 ? 1 : 0), mIdx, 1));
    setSelectedDay(null);
  };

  return (
    <section className="section" style={{ background: 'var(--grad-dark-hero)', minHeight: '85vh' }}>
      <div className="container">
        {/* Title */}
        <div className="section-title-wrapper">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-cyan)', textTransform: 'uppercase' }}>
            Academic Schedule (2026-27)
          </span>
          <h2 className="section-title">Events Calendar</h2>
          <p className="section-subtitle">Browse, filter, and sign up for workshops, seminars, and other department milestones.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Search Input */}
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '250px' }}>
              <Search size={18} color="var(--dark-text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                placeholder="Search events by keyword..."
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Selects & Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>

              {/* Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color="var(--primary-cyan)" />
                <select
                  className="form-input"
                  style={{ width: '160px', padding: '0.5rem 1rem' }}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">All Event Types</option>
                  <option value="Workshop">Workshops</option>
                  <option value="Guest Lecture">Guest Lectures</option>
                  <option value="Competition">Competitions</option>
                  <option value="Symposium">Symposiums</option>
                  <option value="Inauguration">Inaugurations</option>
                  <option value="Valediction">Valedictions</option>
                </select>
              </div>

              {/* Month Selector */}
              <select
                className="form-input"
                style={{ width: '160px', padding: '0.5rem 1rem' }}
                value={selectedMonth}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMonth(val);
                  if (val !== 'All') {
                    const mIdx = parseInt(val);
                    // Determine correct academic year: July-Dec is 2026, Jan-May is 2027
                    const y = mIdx >= 6 ? 2026 : 2027;
                    setCurrentDate(new Date(y, mIdx, 1));
                    setSelectedDay(null);
                  }
                }}
              >
                <option value="All">All Months</option>
                <option value="6">July 2026</option>
                <option value="7">August 2026</option>
                <option value="8">September 2026</option>
                <option value="9">October 2026</option>
                <option value="10">November 2026</option>
                <option value="11">December 2026</option>
                <option value="0">January 2027</option>
                <option value="1">February 2027</option>
                <option value="2">March 2027</option>
                <option value="3">April 2027</option>
                <option value="4">May 2027</option>
              </select>

              {/* Clear button */}
              {(searchQuery !== '' || selectedType !== 'All' || selectedMonth !== 'All' || selectedDay !== null) && (
                <button onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dual Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'start' }} className="grid-2">

          {/* LEFT COLUMN: Calendar Grid Widget */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                {monthNames[month]} {year}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrevMonth}
                  className="social-icon-btn"
                  style={{ width: '32px', height: '32px' }}
                  disabled={year === 2026 && month === 6}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="social-icon-btn"
                  style={{ width: '32px', height: '32px' }}
                  disabled={year === 2027 && month === 4}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days Of Week Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: 'var(--dark-text-muted)', marginBottom: '10px' }}>
              {daysOfWeek.map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Days Cells Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
              {/* Empty Padding days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ padding: '10px 0', opacity: 0.2, fontSize: '0.85rem' }} />
              ))}

              {/* Real Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    style={{
                      padding: '10px 0',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(2, 132, 199, 0.08)' : isToday ? 'rgba(2, 132, 199, 0.02)' : 'transparent',
                      border: isSelected 
                        ? '1px solid var(--primary-cyan)' 
                        : isToday 
                          ? '1px dashed var(--primary-cyan)' 
                          : '1px solid transparent',
                      position: 'relative',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '42px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ 
                      fontWeight: isSelected || isToday || hasEvents ? '700' : '400', 
                      color: isSelected || isToday ? 'var(--primary-cyan)' : 'var(--text-main)' 
                    }}>
                      {day}
                    </span>

                    {/* Dot indicators */}
                    {hasEvents && (
                      <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                        {dayEvents.slice(0, 3).map((e, eIdx) => {
                          let dotColor = '#06b6d4'; // cyan
                          if (e.type?.toLowerCase() === 'competition') dotColor = '#ef4444'; // red
                          if (e.type?.toLowerCase() === 'guest lecture') dotColor = '#3b82f6'; // blue
                          if (e.type?.toLowerCase() === 'symposium') dotColor = '#a855f7'; // purple
                          if (e.type?.toLowerCase() === 'inauguration') dotColor = '#f97316'; // orange
                          if (e.type?.toLowerCase() === 'valediction') dotColor = '#10b981'; // green

                          return (
                            <span
                              key={e.id || eIdx}
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: dotColor
                              }}
                              title={e.title}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend info */}
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: 'var(--dark-text-muted)', paddingTop: '15px', borderTop: '1px solid var(--dark-border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <span>Workshop</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <span>Guest Lecture</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span>Competition</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                <span>Symposium</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Filtered Events List */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: '#fff' }}>
              Scheduled Events ({filteredEvents.length})
              {selectedDay !== null && ` on Day ${selectedDay}`}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--dark-text-muted)', padding: '40px' }}>
                Fetching schedules...
              </div>
            ) : filteredEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredEvents.map(event => (
                  <div key={event.id} style={{ transition: 'var(--transition-smooth)' }}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--dark-text-muted)', marginBottom: '15px' }}>
                  No events scheduled for the selected filters or date ({selectedDay ? `${monthNames[month]} ${selectedDay}` : `${monthNames[month]}`}).
                </p>
                <button onClick={handleResetFilters} className="btn btn-secondary">
                  Clear Filters & Search
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
