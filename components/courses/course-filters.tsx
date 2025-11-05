"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const categories = [
  { id: "test-prep", label: "Test Preparation", count: 45 },
  { id: "language", label: "Language Courses", count: 32 },
  { id: "academic", label: "Academic Skills", count: 28 },
  { id: "visa-prep", label: "Visa Preparation", count: 15 },
  { id: "career", label: "Career Guidance", count: 22 },
  { id: "university", label: "University Prep", count: 38 },
]

const levels = [
  { id: "beginner", label: "Beginner", count: 67 },
  { id: "intermediate", label: "Intermediate", count: 89 },
  { id: "advanced", label: "Advanced", count: 44 },
]

const durations = [
  { id: "1-4", label: "1-4 weeks", count: 34 },
  { id: "1-3", label: "1-3 months", count: 78 },
  { id: "3-6", label: "3-6 months", count: 45 },
  { id: "6+", label: "6+ months", count: 23 },
]

export function CourseFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const handleLevelChange = (levelId: string, checked: boolean) => {
    if (checked) {
      setSelectedLevels([...selectedLevels, levelId])
    } else {
      setSelectedLevels(selectedLevels.filter((id) => id !== levelId))
    }
  }

  const handleDurationChange = (durationId: string, checked: boolean) => {
    if (checked) {
      setSelectedDurations([...selectedDurations, durationId])
    } else {
      setSelectedDurations(selectedDurations.filter((id) => id !== durationId))
    }
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedLevels([])
    setSelectedDurations([])
    setPriceRange([0, 1000])
  }

  const activeFiltersCount = selectedCategories.length + selectedLevels.length + selectedDurations.length

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters ({activeFiltersCount})</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                return (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                    {category?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(categoryId, false)} />
                  </Badge>
                )
              })}
              {selectedLevels.map((levelId) => {
                const level = levels.find((l) => l.id === levelId)
                return (
                  <Badge key={levelId} variant="secondary" className="flex items-center gap-1">
                    {level?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleLevelChange(levelId, false)} />
                  </Badge>
                )
              })}
              {selectedDurations.map((durationId) => {
                const duration = durations.find((d) => d.id === durationId)
                return (
                  <Badge key={durationId} variant="secondary" className="flex items-center gap-1">
                    {duration?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleDurationChange(durationId, false)} />
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  />
                  <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                    {category.label}
                  </label>
                </div>
                <span className="text-xs text-gray-500">({category.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level */}
      <Card>
        <CardHeader>
          <CardTitle>Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {levels.map((level) => (
              <div key={level.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={level.id}
                    checked={selectedLevels.includes(level.id)}
                    onCheckedChange={(checked) => handleLevelChange(level.id, checked as boolean)}
                  />
                  <label htmlFor={level.id} className="text-sm font-medium cursor-pointer">
                    {level.label}
                  </label>
                </div>
                <span className="text-xs text-gray-500">({level.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {durations.map((duration) => (
              <div key={duration.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={duration.id}
                    checked={selectedDurations.includes(duration.id)}
                    onCheckedChange={(checked) => handleDurationChange(duration.id, checked as boolean)}
                  />
                  <label htmlFor={duration.id} className="text-sm font-medium cursor-pointer">
                    {duration.label}
                  </label>
                </div>
                <span className="text-xs text-gray-500">({duration.count})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider value={priceRange} onValueChange={setPriceRange} max={1000} min={0} step={50} className="w-full" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
