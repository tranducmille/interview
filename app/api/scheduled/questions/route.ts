import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const secret = process.env.AUTO_QUESTION_SECRET;
    const providedKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

    if (!secret || !providedKey || providedKey !== secret) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, answer, categoryId } = data || {};

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

    if (!categoryId || typeof categoryId !== "string" || categoryId.trim() === "") {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
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

    return NextResponse.json(
      { success: true, question },
      { status: 201 }
    );
  } catch (error) {
    console.error("Scheduled question creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
