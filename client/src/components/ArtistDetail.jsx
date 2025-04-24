import { useParams } from 'react-router-dom';

export default function ArtistDetail() {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Artist Detail</h2>
      <p>Artist ID: {id}</p>
    </div>
  );
}
