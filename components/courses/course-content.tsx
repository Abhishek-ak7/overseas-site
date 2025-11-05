"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, PlayCircle, Clock, Star, Lock, Play } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  instructorName: string
  requirements: string[]
  learningObjectives: string[]
  rating: number
  totalRatings: number
  isEnrolled: boolean
  modules: Array<{
    id: string
    title: string
    description?: string
    orderIndex: number
    lessons: Array<{
      id: string
      title: string
      description?: string
      contentUrl?: string
      duration: number
      orderIndex: number
      isFree: boolean
    }>
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string
    createdAt: string
    user: {
      id: string
      firstName: string
      lastName: string
      profile?: {
        avatarUrl?: string
      }
    }
  }>
}

interface CourseContentProps {
  course: Course
}

export function CourseContent({ course }: CourseContentProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>

          {course.learningObjectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {course.learningObjectives.map((objective: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{objective}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {course.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.requirements.map((requirement: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <p className="text-sm text-gray-600">
                {course.modules.length} modules •{" "}
                {course.modules.reduce((acc: number, module) => acc + module.lessons.length, 0)} lessons •{" "}
                {Math.round(course.modules.reduce((acc: number, module) =>
                  acc + module.lessons.reduce((lessonAcc: number, lesson) => lessonAcc + lesson.duration, 0), 0) / 60)}{" "}
                hours total
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module, index: number) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span className="font-semibold">{module.title}</span>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{module.lessons.length} lessons</span>
                          <span>{Math.round(module.lessons.reduce((acc, lesson) => acc + lesson.duration, 0) / 60)}h</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {module.description && (
                          <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                        )}
                        {module.lessons.map((lesson, lessonIndex: number) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-2 border rounded-lg px-3">
                            {lesson.isFree || course.isEnrolled ? (
                              <div className="flex items-center gap-3 flex-1">
                                {lesson.contentUrl ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-0 h-8 w-8"
                                    onClick={() => {
                                      if (course.isEnrolled) {
                                        // Navigate to lesson
                                        window.open(`/learn/courses/${course.id}/lessons/${lesson.id}`, '_blank')
                                      }
                                    }}
                                  >
                                    <Play className="h-4 w-4 text-primary" />
                                  </Button>
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm flex-1">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="outline" className="text-xs">Free</Badge>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{Math.round(lesson.duration / 60)} min</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 flex-1">
                                <Lock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500 flex-1">{lesson.title}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{Math.round(lesson.duration / 60)} min</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructor" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {course.instructorName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{course.instructorName}</h3>
                    <p className="text-gray-600">Course Instructor</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{course.rating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Course Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {course.totalRatings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold">{course.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({course.totalRatings} reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.reviews.length > 0 ? (
                course.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {review.user.profile?.avatarUrl ? (
                          <img
                            src={review.user.profile.avatarUrl}
                            alt={`${review.user.firstName} ${review.user.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {review.user.firstName[0]}{review.user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to review this course!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
