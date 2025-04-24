import { useParams } from 'react-router-dom';

export default function SongDetail() {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Song Detail</h2>
      <p>Song ID: {id}</p>
    </div>
  );
}