import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const getCategory = async (categoryId: string) => {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
    },
    select: { id: true },
  });
};

const getAuthenticatedUserId = async (session: any) => {
  if (session?.user?.id) {
    return session.user.id;
  }

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    return user?.id || null;
  }

  return null;
};

export async function GET(request: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getAuthenticatedUserId(session);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const category = await getCategory(id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const progress = await prisma.categoryProgress.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: id,
        },
      },
    });

    return NextResponse.json({
      completedQuestionIds: Array.isArray(progress?.completedQuestionIds)
        ? progress.completedQuestionIds
        : [],
      currentQuestionId: progress?.currentQuestionId || null,
    });
  } catch (error) {
    console.error("Error fetching category progress:", error);
    return NextResponse.json({ message: "Unable to load question progress" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getAuthenticatedUserId(session);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const category = await getCategory(id);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const data = await request.json();
    const completedQuestionIds = Array.isArray(data.completedQuestionIds)
      ? data.completedQuestionIds.filter((questionId: unknown): questionId is string => typeof questionId === "string")
      : [];
    const currentQuestionId = typeof data.currentQuestionId === "string" ? data.currentQuestionId : null;

    const progress = await prisma.categoryProgress.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId: id,
        },
      },
      create: {
        userId,
        categoryId: id,
        completedQuestionIds,
        currentQuestionId,
      },
      update: {
        completedQuestionIds,
        currentQuestionId,
      },
    });

    return NextResponse.json({
      completedQuestionIds: progress.completedQuestionIds,
      currentQuestionId: progress.currentQuestionId,
    });
  } catch (error) {
    console.error("Error saving category progress:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ message: "Unable to save question progress" }, { status: 500 });
  }
}