import { useParams } from 'react-router-dom';

export default function AlbumDetail() {
  const { id } = useParams();
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Album Detail</h2>
      <p>Album ID: {id}</p>
    </div>
  );
}
