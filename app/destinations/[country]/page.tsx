import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

interface PageProps {
  params: {
    country: string
  }
}

async function getDestinationPage(country: string) {
  try {
    const slug = `destinations/${country}`
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
    console.error('Error fetching destination page:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getDestinationPage(params.country)

  if (!page) {
    return {
      title: 'Destination Not Found',
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

export default async function DestinationPage({ params }: PageProps) {
  const page = await getDestinationPage(params.country)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}