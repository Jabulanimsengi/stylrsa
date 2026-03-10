import TeamMembers from '@/components/TeamMembers/TeamMembers';
import styles from '../Dashboard.module.css';

interface DashboardTeamSectionProps {
  salonId: string;
}

export default function DashboardTeamSection({ salonId }: DashboardTeamSectionProps) {
  return (
    <div className={styles.contentCard}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Team</h3>
          <p className={styles.settingsDescription}>
            Keep your stylists, specialists, and service roles current so customers can see who they are booking with.
          </p>
        </div>
      </div>
      <TeamMembers salonId={salonId} isEditable={true} />
    </div>
  );
}
