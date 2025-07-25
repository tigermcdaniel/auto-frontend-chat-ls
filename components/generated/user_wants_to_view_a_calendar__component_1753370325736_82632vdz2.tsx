import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Event {
  title: string
  time: string
  description: string
}

interface CalendarDay {
  date: string
  events: Event[]
  isToday: boolean
}

interface CalendarProps {
  data: CalendarDay[]
}

export default function Calendar({ data = [] }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = data.find(d => d.date === dateString)
      days.push({
        day,
        dateString,
        data: dayData
      })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDay(null)
  }

  const handleDayClick = (dayInfo: any) => {
    if (dayInfo?.data) {
      setSelectedDay(dayInfo.data)
    }
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => (
          <Card
            key={index}
            className={`min-h-[80px] cursor-pointer transition-colors hover:bg-muted/50 ${
              dayInfo?.data?.isToday ? 'ring-2 ring-primary' : ''
            } ${!dayInfo ? 'invisible' : ''}`}
            onClick={() => handleDayClick(dayInfo)}
          >
            <CardContent className="p-2">
              {dayInfo && (
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${
                    dayInfo.data?.isToday ? 'text-primary' : ''
                  }`}>
                    {dayInfo.day}
                  </div>
                  {dayInfo.data?.events && dayInfo.data.events.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayInfo.data.events.length} event{dayInfo.data.events.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDay && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">
              Events for {new Date(selectedDay.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            {selectedDay.events && selectedDay.events.length > 0 ? (
              <div className="space-y-3">
                {selectedDay.events.map((event, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">{event.time}</div>
                    {event.description && (
                      <div className="text-sm mt-1">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No events scheduled for this day</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}