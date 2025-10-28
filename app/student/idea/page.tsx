import ProjectIdeaForm from '@/app/components/student/ProjectIdeaForm';

export const metadata = {
  title: 'Submit Project Idea | Sup-Connect',
  description: 'Submit your project idea and get supervisor recommendations',
};

export default function StudentIdeaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Submit Your Project Idea
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us about your final-year project and get matched with the perfect supervisor
          </p>

          <ProjectIdeaForm />
        </div>
      </div>
    </main>
  );
}
