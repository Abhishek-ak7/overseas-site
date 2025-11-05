import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

interface PageProps {
  params: {
    slug: string
  }
}

async function getPage(slug: string) {
  try {
    const page = await prisma.pages.findUnique({
      where: {
        slug: slug,
        is_published: true
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        page_sections: {
          where: { is_active: true },
          orderBy: { order_index: 'asc' },
        },
      },
    })

    return page
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage(params.slug)

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.excerpt,
    keywords: page.meta_keywords,
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || page.excerpt,
      images: page.featured_image ? [page.featured_image] : [],
    },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const page = await getPage(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Featured Image */}
      {page.featured_image && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={page.featured_image}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
              {page.title}
            </h1>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {!page.featured_image && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {page.excerpt}
              </p>
            )}
          </div>
        )}

        {/* Main Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Page Sections */}
        {page.page_sections.length > 0 && (
          <div className="mt-12 space-y-8">
            {page.page_sections.map((section) => (
              <div key={section.id} className="section">
                {section.title && (
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {section.title}
                  </h2>
                )}
                {section.content && (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
                {section.data && (
                  <div className="section-data">
                    {/* Render section data based on section_type */}
                    <SectionRenderer
                      type={section.section_type}
                      data={section.data}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Author and Date */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Author: {page.users.first_name} {page.users.last_name}
            </div>
            <div>
              Last updated: {new Date(page.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to render different types of sections
function SectionRenderer({ type, data }: { type: string; data: any }) {
  switch (type) {
    case 'FEATURES':
      return (
        <div className="grid md:grid-cols-3 gap-8">
          {data.features?.map((feature: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg border">
              {feature.icon && (
                <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      )

    case 'STATISTICS':
      return (
        <div className="grid md:grid-cols-4 gap-6">
          {data.stats?.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      )

    case 'TESTIMONIALS':
      return (
        <div className="grid md:grid-cols-2 gap-8">
          {data.testimonials?.map((testimonial: any, index: number) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
              <div className="flex items-center">
                {testimonial.image && (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                )}
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  {testimonial.position && (
                    <div className="text-sm text-gray-600">{testimonial.position}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )

    default:
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-600">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )
  }
}
