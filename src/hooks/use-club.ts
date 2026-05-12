import { useParams } from 'next/navigation';
import { useClubDetail } from './use-queries';

export function useClub() {
  const params = useParams();
  // clubId can come from various route patterns
  const clubId = (params?.clubId as string) ?? '';

  const { data: club, isLoading } = useClubDetail(clubId);

  return { club, clubId, isLoading };
}
