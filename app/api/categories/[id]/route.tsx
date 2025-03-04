import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../lib/auth';
const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: any 
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params; // Await params before using its properties

    const category = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        questions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
// Update a category
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const data = await request.json();
    const { name } = data;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // First, check if the category exists and belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found or not authorized" },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a category
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // First, check if the category exists and belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Category not found or not authorized" },
        { status: 404 }
      );
    }

    // Delete the category (cascade delete will also remove associated questions)
    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
