import { createFileRoute } from "@tanstack/react-router";
import { CourseLanding } from "@/components/learn/CourseLanding";

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Course — ${params.slug}` },
      { name: "description", content: "AI course by CoachRony — enroll now and start learning." },
    ],
  }),
  component: CourseSalesPage,
});

function CourseSalesPage() {
  const { slug } = Route.useParams();
  return <CourseLanding slug={slug} />;
}