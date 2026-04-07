'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { checkDatesAvailability, type DateAvailabilityResult } from './actions'

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

function getReasonLabel(reasons: DateAvailabilityResult['reasons']) {
  if (reasons.includes('event') && reasons.includes('lock')) {
    return 'Evento ativo e bloqueio de calendário'
  }

  if (reasons.includes('event')) {
    return 'Evento ativo na data'
  }

  if (reasons.includes('lock')) {
    return 'Data bloqueada no calendário'
  }

  return 'Sem conflitos'
}

function normalizeDate(date: Date) {
  const normalizedDate = new Date(date)
  normalizedDate.setHours(12, 0, 0, 0)
  return normalizedDate
}

export function AvailabilityCheckerDialog() {
  const [open, setOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [results, setResults] = useState<DateAvailabilityResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showCalendars, setShowCalendars] = useState(true)
  const [isChecking, startChecking] = useTransition()

  const handleVerifyDates = () => {
    setError(null)

    if (selectedDates.length === 0) {
      setError('Selecione ao menos uma data para verificar.')
      return
    }

    const dateKeys = selectedDates
      .map((date) => format(date, 'yyyy-MM-dd'))
      .sort((a, b) => a.localeCompare(b))

    startChecking(async () => {
      try {
        const availabilityResults = await checkDatesAvailability(dateKeys)
        setResults(availabilityResults)
        setShowCalendars(false)
      } catch (requestError) {
        console.error(requestError)
        setError('Não foi possível verificar a disponibilidade no momento.')
      }
    })
  }

  const handleVerifyNewDates = () => {
    setShowCalendars(true)
    setResults([])
    setError(null)
    setSelectedDates([])
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true)
          setShowCalendars(true)
          setResults([])
          setError(null)
          setSelectedDates([])
        }}
      >
        Verificar disponibilidade
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verificar disponibilidade</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Selecione uma ou mais datas para verificar se estão disponíveis ou ocupadas.
            </p>

            {showCalendars && (
              <div className="overflow-x-auto rounded-md border p-2">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => {
                    const normalizedDates = (dates || [])
                      .map((date) => normalizeDate(date))
                      .sort((a, b) => a.getTime() - b.getTime())

                    setSelectedDates(normalizedDates)
                  }}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </div>
            )}

            {showCalendars && (
              <span className="block text-sm text-muted-foreground">
                {selectedDates.length} data(s) selecionada(s)
              </span>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end">
              <Button
                onClick={showCalendars ? handleVerifyDates : handleVerifyNewDates}
                disabled={showCalendars && isChecking}
              >
                {showCalendars
                  ? (isChecking ? 'Verificando...' : 'Verificar')
                  : 'Verificar novas datas'}
              </Button>
            </div>

            {!showCalendars && results.length > 0 && (
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-2">
                {results.map((result) => (
                  <div
                    key={result.date}
                    className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{formatDateLabel(result.date)}</p>
                      <p className="text-xs text-muted-foreground">{getReasonLabel(result.reasons)}</p>
                    </div>

                    <Badge variant={result.status === 'occupied' ? 'destructive' : 'secondary'}>
                      {result.status === 'occupied' ? 'Ocupada' : 'Disponível'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
