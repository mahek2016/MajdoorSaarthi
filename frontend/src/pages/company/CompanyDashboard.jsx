import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardHeader from '../../components/DashboardHeader';
import StatsCard from '../../components/StatsCard';
import ProjectCard from '../../components/ProjectCard';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [workforce, setWorkforce] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/projects/workforce-summary').catch(() => null),
    ]).then(([projectsData, workforceData]) => {
      setProjects(projectsData);
      setWorkforce(workforceData);
    }).finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');

  return (
    <DashboardLayout>
      <DashboardHeader
        name={user?.companyName || user?.user?.name}
        subtitle={user?.industry}
        action={<Link to="/company/create-project"><PrimaryButton>+ CREATE PROJECT</PrimaryButton></Link>}
      />

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatsCard icon="🏗️" label="Active Projects" value={activeProjects.length} color="primary" />
        <StatsCard icon="👥" label="Total Workforce" value={workforce?.totalWorkers || 0} color="secondary" />
        <StatsCard icon="✅" label="Present" value={workforce?.present || 0} color="success" />
        <StatsCard icon="❌" label="Absent" value={workforce?.absent || 0} color="error" />
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Active Projects</h3>
      {loading && <LoadingState />}
      {!loading && projects.length === 0 && (
        <p className="text-muted">No projects yet. <Link to="/company/create-project">Create your first project</Link></p>
      )}
      {!loading && (
        <div className="grid-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              linkTo={`/company/projects/${project.id}/workforce`}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
