import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../lib/auth';
const prisma = new PrismaClient();

// Create a new question
export async function POST(request: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

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

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Verify the category belongs to the user
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found or not authorized" },
        { status: 404 }
      );
    }

    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        answer: answer.trim(),
        categoryId,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}