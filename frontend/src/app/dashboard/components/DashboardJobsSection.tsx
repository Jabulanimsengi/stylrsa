import JobPostingForm from '@/components/JobPostingForm/JobPostingForm';
import styles from '../Dashboard.module.css';

interface DashboardJobsSectionProps {
  salonId: string;
  salonName: string;
  salonLocation: string;
}

export default function DashboardJobsSection({
  salonId,
  salonName,
  salonLocation,
}: DashboardJobsSectionProps) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Hiring</h3>
          <p className={styles.settingsDescription}>
            Publish open roles, manage visibility, and keep your hiring pipeline in one place.
          </p>
        </div>
      </div>
      <JobPostingForm salonId={salonId} salonName={salonName} salonLocation={salonLocation} />
    </div>
  );
}
