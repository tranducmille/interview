import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../lib/auth';
const prisma = new PrismaClient();
// Get a specific question
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Check if the question belongs to a category owned by the user
    if (question.category.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to access this question" },
        { status: 403 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a question
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
    const { title, answer, categoryId } = data;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { message: "Question title is required" },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== "string" || answer.trim() === "") {
      return NextResponse.json(
        { message: "Question answer is required" },
        { status: 400 }
      );
    }

    // Verify the question exists and belongs to a category owned by the user
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    if (existingQuestion.category.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to update this question" },
        { status: 403 }
      );
    }

    // If categoryId is provided, verify it belongs to the user
    if (categoryId && categoryId !== existingQuestion.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      });

      if (!categoryExists) {
        return NextResponse.json(
          { message: "Category not found or not authorized" },
          { status: 404 }
        );
      }
    }

    const updatedQuestion = await prisma.question.update({
      where: {
        id,
      },
      data: {
        title: title.trim(),
        answer: answer.trim(),
        categoryId: categoryId || existingQuestion.categoryId,
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a question
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

    // Verify the question exists and belongs to a category owned by the user
    const existingQuestion = await prisma.question.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    if (existingQuestion.category.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Not authorized to delete this question" },
        { status: 403 }
      );
    }

    await prisma.question.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}