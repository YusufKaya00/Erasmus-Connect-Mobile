import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        nameEn: true,
        description: true,
        icon: true,
        order: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return categories;
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return category;
  }

  async createCategory(data: { name: string; nameEn?: string; description?: string; icon?: string; order?: number }) {
    const category = await prisma.category.create({
      data,
    });
    return category;
  }

  async updateCategory(id: string, data: { name?: string; nameEn?: string; description?: string; icon?: string; order?: number }) {
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    return category;
  }

  async deleteCategory(id: string) {
    await prisma.category.delete({
      where: { id },
    });
    return { message: 'Category deleted successfully' };
  }
}

export const categoryService = new CategoryService();

