'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Film, Plus } from 'lucide-react'
import React, { useState } from 'react'

interface MovieFormProps {
  onInitialize: (data: {
    name: string
    director: string
    hero: string
    releaseYear: number
  }) => void
  isLoading: boolean
}

export function MovieForm({ onInitialize, isLoading }: MovieFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    director: '',
    hero: '',
    releaseYear: new Date().getFullYear(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.director && formData.hero && formData.releaseYear) {
      onInitialize(formData)
      setFormData({
        name: '',
        director: '',
        hero: '',
        releaseYear: new Date().getFullYear(),
      })
      setIsOpen(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Movie
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Add New Movie
          </SheetTitle>
          <SheetDescription>
            Fill in the details to add a new movie to the system.
          </SheetDescription>
        </SheetHeader>
        <div className="px-3">
          <form onSubmit={handleSubmit} className="space-y-3 py-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="movie-name">Movie Name</Label>
                <Input
                  id="movie-name"
                  placeholder="Enter movie name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  placeholder="Enter director name"
                  value={formData.director}
                  onChange={(e) => handleInputChange('director', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero">Hero/Lead Actor</Label>
                <Input
                  id="hero"
                  placeholder="Enter hero/lead actor name"
                  value={formData.hero}
                  onChange={(e) => handleInputChange('hero', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="release-year">Release Year</Label>
                <Input
                  id="release-year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  placeholder="Enter release year"
                  value={formData.releaseYear}
                  onChange={(e) => handleInputChange('releaseYear', parseInt(e.target.value) || new Date().getFullYear())}
                  required
                />
              </div>
            </div>
          </form>
        </div>
        
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.name || !formData.director || !formData.hero}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Adding Movie...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Movie
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
