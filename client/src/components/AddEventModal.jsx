import { useState } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import AdminModal from './AdminModal';

export default function AddEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DDTHH:mm'),
    location: ''
  });

  const handle = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
	const { data } = await axios.post('/api/admin/events', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    onCreated(data);
    onClose();
	};

  return (
    <AdminModal title="Add Event" onClose={onClose}>
      <form onSubmit={submit}>
        <input name="title"       placeholder="Title"       onChange={handle} required />
        <textarea name="description" placeholder="Description" onChange={handle} />
        <input type="datetime-local" name="date" value={form.date} onChange={handle} required />
        <input name="location"   placeholder="Location"    onChange={handle} required />
        <button type="submit">Save</button>
      </form>
    </AdminModal>
  );
}
