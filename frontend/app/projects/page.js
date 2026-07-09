import { fetchProjects } from '../../lib/api';

export default async function ProjectsPage() {
  let projects = [];
  try {
    projects = await fetchProjects();
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tracked Projects</h1>
      
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found. Add a webhook to a GitHub repository to get started.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <a href={project.repository_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">
                  {project.repository_url}
                </a>
              </div>
              <div className="text-gray-500 text-sm">
                Added {new Date(project.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
