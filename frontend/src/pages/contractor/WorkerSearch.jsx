import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkerCard from '../../components/WorkerCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import PrimaryButton from '../../components/PrimaryButton';
import { SKILLS } from '../../utils/constants';
import api from '../../services/api';

export default function WorkerSearch() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skill: '',
    minExperience: '',
    location: '',
    availability: '',
    maxWage: '',
    minRating: '',
    verifiedOnly: false,
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.skill) queryParams.append('skill', filters.skill);
      if (filters.minExperience) queryParams.append('minExperience', filters.minExperience);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.availability) queryParams.append('availability', filters.availability);
      if (filters.maxWage) queryParams.append('maxWage', filters.maxWage);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.verifiedOnly) queryParams.append('verifiedOnly', 'true');

      const data = await api.get(`/contractors/workers?${queryParams.toString()}`);
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  const handleApply = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleClear = () => {
    setFilters({
      skill: '',
      minExperience: '',
      location: '',
      availability: '',
      maxWage: '',
      minRating: '',
      verifiedOnly: false,
    });
    // Fetch immediately after clearing
    setTimeout(() => {
      api.get('/contractors/workers').then(setWorkers).finally(() => setLoading(false));
    }, 0);
  };

  return (
    <DashboardLayout>
      <h1 style={{ marginBottom: '1.5rem' }}>Search & Match Workers</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Filters Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Filters
            <button 
              onClick={handleClear} 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Clear All
            </button>
          </h3>
          <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <SelectField 
              label="Skill / Trade" 
              name="skill" 
              value={filters.skill} 
              onChange={handleChange} 
              options={['', ...SKILLS]} 
            />
            
            <InputField 
              label="Min Experience (years)" 
              name="minExperience" 
              type="number" 
              value={filters.minExperience} 
              onChange={handleChange} 
              placeholder="e.g. 3" 
            />

            <InputField 
              label="Location" 
              name="location" 
              value={filters.location} 
              onChange={handleChange} 
              placeholder="e.g. Vasai" 
            />

            <SelectField 
              label="Availability" 
              name="availability" 
              value={filters.availability} 
              onChange={handleChange} 
              options={['', 'Available', 'Busy', 'Not Available']} 
            />

            <InputField 
              label="Max Daily Wage (₹)" 
              name="maxWage" 
              type="number" 
              value={filters.maxWage} 
              onChange={handleChange} 
              placeholder="e.g. 1000" 
            />

            <SelectField 
              label="Min Rating" 
              name="minRating" 
              value={filters.minRating} 
              onChange={handleChange} 
              options={['', '4.0', '4.5']} 
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="verifiedOnly" 
                name="verifiedOnly" 
                checked={filters.verifiedOnly} 
                onChange={handleChange} 
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="verifiedOnly" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                Verified Workers Only
              </label>
            </div>

            <PrimaryButton type="submit" fullWidth disabled={loading}>
              {loading ? 'Searching...' : 'APPLY FILTERS'}
            </PrimaryButton>
          </form>
        </div>

        {/* Results List */}
        <div>
          {loading ? (
            <LoadingState message="Searching database..." />
          ) : workers.length === 0 ? (
            <EmptyState 
              title="No workers match these filters" 
              message="Try broadening your criteria or clear the filters to view all workers." 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Found {workers.length} verified and registered workers matching search.
              </div>
              <div className="grid-2">
                {workers.map((worker) => (
                  <WorkerCard 
                    key={worker.id} 
                    worker={worker} 
                    linkTo={`/contractor/workers/${worker.id}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
