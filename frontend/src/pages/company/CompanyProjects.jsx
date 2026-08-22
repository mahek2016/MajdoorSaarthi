import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProjectCard from '../../components/ProjectCard';
import LoadingState from '../../components/LoadingState';
import api from '../../services/api';

export default function CompanyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(setProjects).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>Projects</h1>
      {loading && <LoadingState />}
      {!loading && (
        <div className="grid-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} linkTo={`/company/projects/${p.id}/workforce`} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
