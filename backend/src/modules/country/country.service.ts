import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CountryService {
  async getAllCountries() {
    const countries = await prisma.country.findMany({
      include: {
        _count: {
          select: {
            profiles: true,
            posts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries.map(country => ({
      id: country.id,
      name: country.name,
      code: country.code,
      flag: country.flag,
      continent: country.continent,
      languages: country.languages,
      currency: country.currency,
      studentCount: country._count.profiles,
      postCount: country._count.posts,
    }));
  }

  async getCountryById(id: string) {
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        profiles: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                email: true,
                isActive: true,
              },
            },
          },
        },
        posts: {
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    photoUrl: true,
                  },
                },
              },
            },
            category: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
        _count: {
          select: {
            profiles: true,
            posts: true,
          },
        },
      },
    });

    if (!country) {
      return null;
    }

    return {
      id: country.id,
      name: country.name,
      code: country.code,
      flag: country.flag,
      continent: country.continent,
      languages: country.languages,
      currency: country.currency,
      studentCount: country._count.profiles,
      postCount: country._count.posts,
      recentProfiles: country.profiles,
      recentPosts: country.posts,
    };
  }

  async searchCountries(query: string) {
    const countries = await prisma.country.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            profiles: true,
            posts: true,
          },
        },
      },
      take: 10,
    });

    return countries.map(country => ({
      id: country.id,
      name: country.name,
      code: country.code,
      flag: country.flag,
      continent: country.continent,
      languages: country.languages,
      studentCount: country._count.profiles,
      postCount: country._count.posts,
    }));
  }

  async createCountry(data: { name: string; code: string; flag?: string; continent?: string; languages?: string[]; currency?: string }) {
    const country = await prisma.country.create({
      data,
    });
    return country;
  }

  async updateCountry(id: string, data: { name?: string; code?: string; flag?: string; continent?: string; languages?: string[]; currency?: string }) {
    const country = await prisma.country.update({
      where: { id },
      data,
    });
    return country;
  }

  async deleteCountry(id: string) {
    await prisma.country.delete({
      where: { id },
    });
    return { message: 'Country deleted successfully' };
  }
}

export const countryService = new CountryService();

