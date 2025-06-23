import React, { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material"
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { parse, isSameDay, isWithinInterval, isAfter, isBefore } from "date-fns"

const ModuleCalendar = ({ testDates: propTestDates, moduleDuration: propModuleDuration, open, onClose }) => {
  const [testDates, setTestDates] = useState(propTestDates || [])
  const [moduleDuration, setModuleDuration] = useState(propModuleDuration || { startDate: null, endDate: null })

  const colors = {
    primary: "#0284c7",
    text: "#1e293b",
    textLight: "#64748b",
    border: "#e2e8f0",
    borderDark: "#cbd5e1",
    rangeStart: "#0ea5e9",
    rangeEnd: "#0ea5e9",
    rangeMiddle: "#e0f2fe",
    primaryDark: "#0369a1",
    success: "#16a34a",
    danger: "#dc2626",
    background: "#ffffff",
  }

  const styles = {
    dialog: {
      "& .MuiDialog-paper": {
        borderRadius: "24px",
        backgroundColor: colors.background,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
        maxWidth: "340px",
        width: "100%",
      },
    },
    dialogTitle: {
      fontWeight: "700",
      color: "#fff",
      backgroundColor: "#0c83c8",
      textAlign: "center",
      fontSize: "22px",
      padding: "24px 24px 12px 24px",
      letterSpacing: "-0.02em",
      borderBottom: `1px solid ${colors.border}`,
    },
    dialogContent: {
      padding: "16px 24px 24px 24px",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      color: colors.textLight,
      fontSize: "15px",
      fontWeight: "500",
      textAlign: "center",
      gap: "12px",
    },
    calendarLegend: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto auto",
      gap: "12px",
      marginTop: "16px",
      justifyItems: "center",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: colors.textLight,
    },
    legendDot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
    },
    calendarDayWrapper: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "40px",
      height: "40px",
      margin: "2px",
    },
    calendarDay: {
      width: "36px",
      height: "36px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "50%",
      fontSize: "14px",
      fontWeight: "500",
      position: "relative",
      zIndex: 2,
    },
    calendarDayIndicator: {
      position: "absolute",
      bottom: "2px",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      zIndex: 3,
    },
    calendarTooltip: {
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: colors.neutralDark,
      color: colors.background,
      padding: "6px 10px",
      borderRadius: "8px",
      fontSize: "11px",
      fontWeight: "500",
      whiteSpace: "nowrap",
      zIndex: 10,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      pointerEvents: "none",
    },
    rangeStartDay: {
      backgroundColor: colors.rangeStart,
      color: "white",
      fontWeight: "600",
      borderRadius: "50%",
      position: "relative",
      zIndex: 2,
      boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
    },
    rangeEndDay: {
      backgroundColor: colors.rangeEnd,
      color: "white",
      fontWeight: "600",
      borderRadius: "50%",
      position: "relative",
      zIndex: 2,
      boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
    },
    rangeMiddleDay: {
      backgroundColor: colors.rangeMiddle,
      color: colors.primaryDark,
      position: "relative",
      zIndex: 2,
    },
  }

  const customStyles = `
    .MuiPickersDay-root {
      margin: 2px !important;
      height: 36px !important;
      width: 36px !important;
      border-radius: 50% !important;
      font-weight: 500 !important;
      position: relative !important;
      z-index: 2 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }
    
    .MuiPickersCalendarHeader-label {
      font-weight: 600 !important;
      font-size: 16px !important;
      color: ${colors.text} !important;
    }
    
    .MuiPickersCalendarHeader-switchViewButton, .MuiPickersArrowSwitcher-button {
      color: ${colors.textLight} !important;
    }
    
    .MuiDayCalendar-header {
      margin-bottom: 8px !important;
    }
    
    .MuiDayCalendar-weekDayLabel {
      color: ${colors.textLight} !important;
      font-weight: 600 !important;
      font-size: 12px !important;
    }
    
    .MuiPickersDay-root.Mui-disabled {
      color: ${colors.borderDark} !important;
      opacity: 0.5 !important;
    }
    
    .MuiPickersDay-root.MuiPickersDay-today {
      border: 1px solid ${colors.primary} !important;
    }
    
    .range-day-wrapper {
      position: "relative",
      width: "40px",
      height: "40px",
      display: "flex",
      justify-content: "center",
      align-items: "center",
    }
    
    .range-start-day {
      background-color: ${colors.rangeStart} !important;
      color: white !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3) !important;
    }
    
    .range-end-day {
      background-color: ${colors.rangeEnd} !important;
      color: white !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3) !important;
    }
    
    .range-middle-day {
      background-color: ${colors.rangeMiddle} !important;
      color: ${colors.primaryDark} !important;
    }
    
    .test-day-indicator {
      position: absolute;
      bottom: 2px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      z-index: 3;
    }
    
    .test-completed-indicator {
      background-color: ${colors.success};
    }
    
    .test-not-completed-indicator {
      background-color: ${colors.danger};
    }

    .custom-calendar {
      width: 280px !important;
      margin: 0 auto;
    }
  `

  const getTestForDay = (day) => {
    return testDates.find((test) => isSameDay(day, test.date))
  }

  const isInRange = (day) => {
    return (
      moduleDuration.startDate &&
      moduleDuration.endDate &&
      isWithinInterval(day, { start: moduleDuration.startDate, end: moduleDuration.endDate })
    )
  }

  const isRangeStart = (day) => {
    return moduleDuration.startDate && isSameDay(day, moduleDuration.startDate)
  }

  const isRangeEnd = (day) => {
    return moduleDuration.endDate && isSameDay(day, moduleDuration.endDate)
  }

  const isRangeMiddle = (day) => {
    if (!moduleDuration.startDate || !moduleDuration.endDate) return false
    return isAfter(day, moduleDuration.startDate) && isBefore(day, moduleDuration.endDate)
  }

  const DayComponent = (props) => {
    const { day, outsideCurrentMonth, ...other } = props
    const [showTooltip, setShowTooltip] = useState(false)

    if (outsideCurrentMonth) {
      return <Button {...other} disabled />
    }

    const test = getTestForDay(day)
    const rangeStart = isRangeStart(day)
    const rangeEnd = isRangeEnd(day)
    const rangeMiddle = isRangeMiddle(day)

    let tooltipContent = null
    if (test) {
      tooltipContent = `${test.title}: ${test.hasTaken ? "Completed" : "Not Completed"}`
    } else if (rangeStart) {
      tooltipContent = "Module Start Date"
    } else if (rangeEnd) {
      tooltipContent = "Module End Date"
    }

    let dayClass = ""
    if (rangeStart) {
      dayClass = "range-start-day"
    } else if (rangeEnd) {
      dayClass = "range-end-day"
    } else if (rangeMiddle) {
      dayClass = "range-middle-day"
    }

    return (
      <div
        className="range-day-wrapper"
        onMouseEnter={() => tooltipContent && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Button
          {...other}
          className={dayClass}
          style={{
            borderRadius: "50%",
            minWidth: "36px",
            height: "36px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {day.getDate()}
        </Button>

        {test && (
          <div
            className={`test-day-indicator ${
              test.hasTaken ? "test-completed-indicator" : "test-not-completed-indicator"
            }`}
          />
        )}

        {showTooltip && tooltipContent && <div style={styles.calendarTooltip}>{tooltipContent}</div>}
      </div>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <style>{customStyles}</style>
      <Dialog open={open} onClose={onClose} sx={styles.dialog}>
        <DialogTitle sx={styles.dialogTitle}>Module Calendar</DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          {moduleDuration.startDate && moduleDuration.endDate ? (
            <>
              <DateCalendar
                defaultValue={moduleDuration.startDate}
                slots={{ day: DayComponent }}
                readOnly
                shouldDisableDate={(day) =>
                  !isWithinInterval(day, { start: moduleDuration.startDate, end: moduleDuration.endDate })
                }
                sx={{ "& .MuiDayCalendar-root": { width: "280px", margin: "0 auto" } }}
                className="custom-calendar"
              />

              <div style={styles.calendarLegend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: colors.rangeStart }}></div>
                  <span>Start/End Date</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: colors.rangeMiddle }}></div>
                  <span>Module Range</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: colors.success }}></div>
                  <span>Completed Test</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: colors.danger }}></div>
                  <span>Incomplete Test</span>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <CalendarIcon size={32} color={colors.textLight} />
              <div>No module duration available</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  )
}

export default ModuleCalendar